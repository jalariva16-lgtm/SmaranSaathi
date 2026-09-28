import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CustomerSidebar } from './components/CustomerSidebar';
import { ChatArea } from './components/ChatArea';
import { MemoryPanel } from './components/MemoryPanel';
import { TicketHistory } from './components/TicketHistory';
import { CustomerProfile } from './components/CustomerProfile';
import { ObservabilityModal } from './components/ObservabilityModal';
import { DemoGuideModal } from './components/DemoGuideModal';
import { BeforeAfterModal } from './components/BeforeAfterModal';
import { SupportDashboard } from './components/SupportDashboard';
import { Customer, Ticket, Message, HindsightMemory, ChatResponse, SystemStatus, SupportRecommendation } from './types';
import { Brain, Database, User } from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'workspace' | 'dashboard'>('workspace');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bankMemories, setBankMemories] = useState<HindsightMemory[]>([]);
  const [recalledMemories, setRecalledMemories] = useState<HindsightMemory[]>([]);
  const [newlyRetainedMemories, setNewlyRetainedMemories] = useState<HindsightMemory[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const [useMemory, setUseMemory] = useState<boolean>(true);
  const [memoryStatus, setMemoryStatus] = useState<'active' | 'empty' | 'unavailable' | 'bypassed_without_memory'>('active');
  const [suggestedAction, setSuggestedAction] = useState<string | undefined>();
  const [recommendation, setRecommendation] = useState<SupportRecommendation | undefined>();
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMemories, setIsLoadingMemories] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>('scenario-2');

  const [activeTab, setActiveTab] = useState<'memories' | 'tickets' | 'profile'>('memories');
  const [isObservabilityOpen, setIsObservabilityOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isBeforeAfterOpen, setIsBeforeAfterOpen] = useState<boolean>(false);

  const [chatError, setChatError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadCustomers();
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (err) {
      console.warn('Failed to load status:', err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.customers && data.customers.length > 0) {
          // Default to Rahul Sharma (cust_1) for primary demo
          handleSelectCustomer(data.customers[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  const handleSelectCustomer = async (customer: Customer): Promise<Ticket | null> => {
    setSelectedCustomer(customer);
    setActiveTicket(null); // Clear stale ticket immediately so another customer's ticket is never used
    setMessages([]); // Clear stale messages immediately
    setRecalledMemories([]);
    setNewlyRetainedMemories([]);
    setSuggestedAction(undefined);
    setRecommendation(undefined);
    setLastResponse(null);
    setChatError(null);

    let active: Ticket | null = null;
    // Load tickets for customer
    try {
      const res = await fetch(`/api/customers/${customer.id}/tickets`);
      if (res.ok) {
        const data = await res.json();
        const custTickets: Ticket[] = data.tickets || [];
        setTickets(custTickets);

        // Find active ticket or pick first
        active = custTickets.find((t) => t.status === 'in_progress' || t.status === 'open') || custTickets[0] || null;
        setActiveTicket(active);

        if (active) {
          loadTicketMessages(active.id);
        } else {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets for customer:', err);
    }

    // Load customer memories from Hindsight bank
    await loadCustomerMemories(customer.id);

    // Auto-recall relevant memories and recommendation for customer's active issue
    if (active && useMemory) {
      recallMemoriesForCustomer(customer.id, active.subject);
      fetchRecommendationForCustomer(customer.id, active.id, active.subject);
    }
    return active;
  };

  const fetchRecommendationForCustomer = async (customerId: string, ticketId?: string, query?: string) => {
    try {
      const res = await fetch(`/api/customers/${customerId}/recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, message: query, useMemory }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error('Failed to load recommendation for customer:', err);
    }
  };

  const recallMemoriesForCustomer = async (customerId: string, query: string) => {
    if (!useMemory) {
      setMemoryStatus('bypassed_without_memory');
      setRecalledMemories([]);
      return;
    }
    try {
      const res = await fetch(`/api/customers/${customerId}/memories/recall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 5 }),
      });
      if (res.ok) {
        const data = await res.json();
        const mems: HindsightMemory[] = data.memories || [];
        setRecalledMemories(mems);
        if (mems.length > 0) {
          setMemoryStatus('active');
        } else {
          setMemoryStatus('empty');
        }
      } else {
        setMemoryStatus('unavailable');
      }
    } catch (err) {
      console.error('Failed to recall memories for customer:', err);
      setMemoryStatus('unavailable');
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages for ticket:', err);
    }
  };

  const loadCustomerMemories = async (customerId: string) => {
    setIsLoadingMemories(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/memories`);
      if (res.ok) {
        const data = await res.json();
        const mems: HindsightMemory[] = data.memories || [];
        setBankMemories(mems);
        if (mems.length > 0) {
          setMemoryStatus('active');
        } else {
          setMemoryStatus('empty');
        }
      }
    } catch (err) {
      console.error('Failed to load memories:', err);
      setMemoryStatus('unavailable');
    } finally {
      setIsLoadingMemories(false);
    }
  };

  const handleToggleMemory = (val: boolean) => {
    setUseMemory(val);
    if (!val) {
      setMemoryStatus('bypassed_without_memory');
      setRecalledMemories([]);
    } else {
      if (selectedCustomer && activeTicket) {
        recallMemoriesForCustomer(selectedCustomer.id, activeTicket.subject);
        fetchRecommendationForCustomer(selectedCustomer.id, activeTicket.id, activeTicket.subject);
      }
    }
  };

  const handleSendMessage = async (
    text: string,
    overrideUseMemoryOrCustomer?: boolean | Customer,
    targetTicketId?: string,
    overrideUseMemoryExplicit?: boolean
  ) => {
    let overrideUseMemory: boolean | undefined;
    let targetCustomer: Customer | undefined;

    if (typeof overrideUseMemoryOrCustomer === 'boolean') {
      overrideUseMemory = overrideUseMemoryOrCustomer;
    } else if (overrideUseMemoryOrCustomer) {
      targetCustomer = overrideUseMemoryOrCustomer;
      overrideUseMemory = overrideUseMemoryExplicit;
    }

    const currentCustomer = targetCustomer || selectedCustomer;
    if (!currentCustomer) return;
    setIsLoading(true);
    setChatError(null);

    const memoryToggleToUse = overrideUseMemory !== undefined ? overrideUseMemory : useMemory;
    if (overrideUseMemory !== undefined) {
      setUseMemory(overrideUseMemory);
      if (!overrideUseMemory) {
        setMemoryStatus('bypassed_without_memory');
      }
    }

    const ticketIdToUse = targetTicketId !== undefined ? targetTicketId : activeTicket?.id;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentCustomer.id,
          ticketId: ticketIdToUse,
          message: text,
          useMemory: memoryToggleToUse,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Chat request failed' }));
        throw new Error(err.error || 'Chat request failed');
      }

      const data: ChatResponse = await res.json();
      setLastResponse(data);
      setRecalledMemories(data.recalledMemories || []);
      setNewlyRetainedMemories(data.newlyRetainedMemories || []);
      setSuggestedAction(data.suggestedAction);
      setRecommendation(data.recommendation);
      setMemoryStatus(data.memoryStatus);
      setExecutionTimeMs(data.executionTimeMs);

      // Reload ticket messages
      if (data.ticketId) {
        loadTicketMessages(data.ticketId);
      }

      // Reload Hindsight memories if newly retained
      if (data.newlyRetainedMemories && data.newlyRetainedMemories.length > 0) {
        loadCustomerMemories(currentCustomer.id);
      }

      // Refresh system status
      loadStatus();
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          issueType: 'Payment',
          subject: 'Payment failing repeatedly on checkout attempt',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newTicket: Ticket = data.ticket;
        setActiveTicket(newTicket);
        setMessages([]);
        setRecalledMemories([]);
        setNewlyRetainedMemories([]);
        setSuggestedAction(undefined);
        setRecommendation(undefined);
        setLastResponse(null);
        setChatError(null);

        // Refresh ticket list for customer
        const ticketsRes = await fetch(`/api/customers/${selectedCustomer.id}/tickets`);
        if (ticketsRes.ok) {
          const tData = await ticketsRes.json();
          setTickets(tData.tickets || []);
        }

        // Auto-recall memories for new ticket
        if (useMemory) {
          recallMemoriesForCustomer(selectedCustomer.id, newTicket.subject);
          fetchRecommendationForCustomer(selectedCustomer.id, newTicket.id, newTicket.subject);
        }
      }
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleManualRetain = async (content: string) => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/memories/retain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.memory) {
          setNewlyRetainedMemories([data.memory]);
        }
        loadCustomerMemories(selectedCustomer.id);
      }
    } catch (err) {
      console.error('Failed to retain memory:', err);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset all customer tickets, conversations, and Hindsight memory banks to initial seed state?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await loadCustomers();
        await loadStatus();
        alert('Reset complete! Database and Hindsight memory banks restored to initial state.');
      }
    } catch (err) {
      console.error('Failed to reset:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSelectScenario = async (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    if (!customers || customers.length === 0) return;

    if (scenarioId === 'scenario-1' || scenarioId === 'scenario-2' || scenarioId === 'scenario-3' || scenarioId === 'scenario-4') {
      const rahul = customers.find((c) => c.id === 'cust_1') || customers[0];
      const active = await handleSelectCustomer(rahul);

      if (scenarioId === 'scenario-1') {
        // Rahul payment initial
        setUseMemory(true);
        await handleSendMessage('My payment is failing when trying to renew our subscription.', rahul, active?.id);
      } else if (scenarioId === 'scenario-2') {
        // Rahul returns (payment failing again)
        setUseMemory(true);
        await handleSendMessage('My payment is failing again.', rahul, active?.id);
      } else if (scenarioId === 'scenario-3') {
        // Preference learning
        setUseMemory(true);
        await handleSendMessage('Please give me instructions one step at a time.', rahul, active?.id);
      } else if (scenarioId === 'scenario-4') {
        // Upgrade with adapted style
        setUseMemory(true);
        await handleSendMessage('How do I upgrade my plan?', rahul, active?.id);
      }
    } else if (scenarioId === 'scenario-5') {
      // Priya Mehta SSO issue (memory isolation test)
      const priya = customers.find((c) => c.id === 'cust_2') || customers[1];
      const active = await handleSelectCustomer(priya);
      setUseMemory(true);
      await handleSendMessage('Our team is getting an Okta SAML error saying invalid assertion signature.', priya, active?.id);
    }
  };

  const handleRunTestCase = async (testId: string) => {
    if (testId === 'test-1') {
      // New customer with no memory (Vikram Singh cust_5)
      const vikram = customers.find((c) => c.id === 'cust_5');
      if (vikram) {
        const active = await handleSelectCustomer(vikram);
        await handleSendMessage('Hello, how do I configure user roles for our logistics team?', vikram, active?.id);
      }
    } else if (testId === 'test-2') {
      await handleSelectScenario('scenario-2');
    } else if (testId === 'test-3') {
      const rahul = customers.find((c) => c.id === 'cust_1') || customers[0];
      const active = await handleSelectCustomer(rahul);
      await handleSendMessage('Why is the real-time analytics graph freezing on my dashboard?', rahul, active?.id);
    } else if (testId === 'test-4') {
      await handleSelectScenario('scenario-2');
    } else if (testId === 'test-5') {
      await handleSelectScenario('scenario-3');
    } else if (testId === 'test-6') {
      await handleSelectScenario('scenario-5');
    } else if (testId === 'test-7') {
      setUseMemory(!useMemory);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Header
        status={systemStatus}
        onReset={handleResetData}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenObservability={() => setIsObservabilityOpen(true)}
        isResetting={isResetting}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main View: Support Dashboard OR 3-Column Support Workspace */}
      {activeView === 'dashboard' ? (
        <SupportDashboard
          onBackToWorkspace={() => setActiveView('workspace')}
          customers={customers}
          onSelectCustomer={handleSelectCustomer}
        />
      ) : (
        <div className="main-layout">
        {/* Left: Customer Selector */}
        <CustomerSidebar
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={handleSelectCustomer}
          onSelectScenario={handleSelectScenario}
          activeScenarioId={activeScenarioId}
        />

        {/* Center: Active Conversation & Chat */}
        {selectedCustomer ? (
          <ChatArea
            customer={selectedCustomer}
            currentTicket={activeTicket}
            messages={messages}
            recalledMemories={recalledMemories}
            newlyRetainedCount={newlyRetainedMemories.length}
            useMemory={useMemory}
            onToggleMemory={handleToggleMemory}
            onSendMessage={(text, override) => handleSendMessage(text, override)}
            isLoading={isLoading}
            suggestedAction={suggestedAction}
            recommendation={recommendation}
            memoryStatus={memoryStatus}
            executionTimeMs={executionTimeMs}
            errorMessage={chatError}
            onDismissError={() => setChatError(null)}
            onStartNewConversation={handleStartNewConversation}
            onOpenBeforeAfterModal={() => setIsBeforeAfterOpen(true)}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Select a customer to start support conversation
          </div>
        )}

        {/* Right: Memory Bank / Ticket History / Profile */}
        <aside className="panel-right">
          {/* Compact Customer Profile Header Card (Always Visible) */}
          {selectedCustomer && (
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(15, 23, 42, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div className="customer-avatar" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
                  {selectedCustomer.name[0]}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedCustomer.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedCustomer.company} • #{selectedCustomer.id}
                  </div>
                </div>
              </div>
              <span className={`tier-badge ${selectedCustomer.accountTier}`}>{selectedCustomer.accountTier}</span>
            </div>
          )}

          {/* Panel Tabs */}
          <div className="panel-tabs-bar">
            <button
              type="button"
              className={`panel-tab ${activeTab === 'memories' ? 'active' : ''}`}
              onClick={() => setActiveTab('memories')}
            >
              <Brain size={14} />
              <span>Hindsight Memory</span>
            </button>
            <button
              type="button"
              className={`panel-tab ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              <Database size={14} />
              <span>Tickets ({tickets.length})</span>
            </button>
            <button
              type="button"
              className={`panel-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={14} />
              <span>Customer Profile</span>
            </button>
          </div>

          {/* Panel Tab Content */}
          {selectedCustomer && (
            <>
              {activeTab === 'memories' && (
                <MemoryPanel
                  customer={selectedCustomer}
                  bankMemories={bankMemories}
                  recalledMemories={recalledMemories}
                  newlyRetainedMemories={newlyRetainedMemories}
                  memoryStatus={memoryStatus}
                  useMemory={useMemory}
                  onManualRetain={handleManualRetain}
                  isLoadingMemories={isLoadingMemories}
                  hindsightConnected={systemStatus?.hindsight?.status === 'connected'}
                  tickets={tickets}
                  currentQuery={activeTicket?.subject}
                />
              )}

              {activeTab === 'tickets' && (
                <TicketHistory
                  customer={selectedCustomer}
                  tickets={tickets}
                  activeTicketId={activeTicket?.id}
                  onSelectTicket={(ticket) => {
                    setActiveTicket(ticket);
                    loadTicketMessages(ticket.id);
                    if (selectedCustomer && useMemory) {
                      recallMemoriesForCustomer(selectedCustomer.id, ticket.subject);
                    }
                  }}
                />
              )}

              {activeTab === 'profile' && <CustomerProfile customer={selectedCustomer} />}
            </>
          )}
        </aside>
      </div>
      )}

      {/* Observability / AI Inspector Modal */}
      <ObservabilityModal
        isOpen={isObservabilityOpen}
        onClose={() => setIsObservabilityOpen(false)}
        customer={selectedCustomer}
        lastResponse={lastResponse}
      />

      {/* Judge Walkthrough / Demo Guide Modal */}
      <DemoGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onRunTest={handleRunTestCase}
      />

      {/* Before vs After Hindsight Demonstration Modal */}
      <BeforeAfterModal
        isOpen={isBeforeAfterOpen}
        onClose={() => setIsBeforeAfterOpen(false)}
        customer={selectedCustomer}
        onRunTest={(useMem, msg) => {
          setUseMemory(useMem);
          handleSendMessage(msg, undefined, undefined, useMem);
        }}
      />
    </div>
  );
};
