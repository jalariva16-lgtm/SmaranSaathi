import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Brain,
  Sparkles,
  AlertCircle,
  User,
  Bot,
  HelpCircle,
  AlertTriangle,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { Customer, Message, HindsightMemory, Ticket, SupportRecommendation } from '../types';
import { HeroDemoBanner } from './HeroDemoBanner';
import { MemoryLifecycleIndicator, LifecycleStage } from './MemoryLifecycleIndicator';

interface ChatAreaProps {
  customer: Customer;
  currentTicket: Ticket | null;
  messages: Message[];
  recalledMemories: HindsightMemory[];
  newlyRetainedCount?: number;
  useMemory: boolean;
  onToggleMemory: (val: boolean) => void;
  onSendMessage: (text: string, overrideUseMemory?: boolean) => void;
  isLoading: boolean;
  suggestedAction?: string;
  recommendation?: SupportRecommendation;
  memoryStatus: 'active' | 'empty' | 'unavailable' | 'bypassed_without_memory';
  executionTimeMs?: number;
  errorMessage?: string | null;
  onDismissError?: () => void;
  onStartNewConversation?: () => void;
  onOpenBeforeAfterModal?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  customer,
  currentTicket,
  messages,
  recalledMemories,
  newlyRetainedCount = 0,
  useMemory,
  onToggleMemory,
  onSendMessage,
  isLoading,
  suggestedAction,
  recommendation,
  memoryStatus,
  executionTimeMs,
  errorMessage,
  onDismissError,
  onStartNewConversation,
  onOpenBeforeAfterModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecExpanded, setIsRecExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText, useMemory);
    setInputText('');
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  // Derive active stage for MemoryLifecycleIndicator
  let lifecycleStage: LifecycleStage = 'idle';
  if (!useMemory) {
    lifecycleStage = 'bypassed';
  } else if (isLoading) {
    lifecycleStage = 'recall';
  } else if (newlyRetainedCount && newlyRetainedCount > 0) {
    lifecycleStage = 'retain';
  } else if (recalledMemories.length > 0) {
    lifecycleStage = 'personalize';
  }

  return (
    <main className="chat-main-area">
      {/* Top Header: Customer Info & Action Tools */}
      <div className="conversation-header">
        <div className="active-customer-headline">
          <div className="customer-avatar" style={{ width: 38, height: 38, fontSize: '0.9rem' }}>
            {customer.name[0]}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="active-customer-name">{customer.name}</span>
              {currentTicket && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  #{currentTicket.id} • {currentTicket.issueType}
                </span>
              )}
            </div>
            <div className="active-customer-meta">
              {customer.company} • {customer.environment.os} • {customer.environment.browser}
            </div>
          </div>
        </div>

        {/* Demo Controls: New Conversation & Before vs After Toggle */}
        <div className="memory-toggle-container">

          {onStartNewConversation && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              onClick={onStartNewConversation}
              title="Start a fresh conversation to test memory recall from scratch"
            >
              <PlusCircle size={13} />
              <span>New Conversation</span>
            </button>
          )}

          {/* Before vs After Memory Demonstration Toggle Switch */}
          <div className="mode-toggle-switch">
            <button
              type="button"
              className={`mode-btn ${!useMemory ? 'active without-memory' : ''}`}
              onClick={() => onToggleMemory(false)}
              title="Without Hindsight: Baseline agent asks standard diagnostic questions with zero past context"
            >
              <AlertCircle size={13} />
              <span>Memory OFF</span>
            </button>
            <button
              type="button"
              className={`mode-btn ${useMemory ? 'active with-memory' : ''}`}
              onClick={() => onToggleMemory(true)}
              title="With Hindsight: Agent recalls previous solutions and preferences from customer memory bank"
            >
              <Brain size={13} />
              <span>Memory ON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Demo Scenario Banner with 15-Second Judge Hook (Requirements 1, 2, 17) */}
      <HeroDemoBanner
        customer={customer}
        useMemory={useMemory}
        onToggleMemory={onToggleMemory}
        onSendMessage={onSendMessage}
        onOpenBeforeAfterModal={onOpenBeforeAfterModal || (() => {})}
        isLoading={isLoading}
      />

      {/* Prominent Memory Lifecycle Flow (Requirement 3: RETAIN -> REMEMBER -> RECALL -> PERSONALIZE -> RETAIN) */}
      <MemoryLifecycleIndicator
        currentStage={lifecycleStage}
        recalledCount={recalledMemories.length}
        newlyRetainedCount={newlyRetainedCount || 0}
        customerName={customer.name}
        useMemory={useMemory}
      />



      {/* Memory Status Indicator Banner */}
      {useMemory ? (
        memoryStatus === 'unavailable' ? (
          <div className="memory-indicator-banner unavailable">
            <div className="memory-banner-content">
              <AlertCircle size={15} />
              <span>
                <strong>Memory unavailable:</strong> Hindsight service offline or unreachable. (Graceful fallback active)
              </span>
            </div>
          </div>
        ) : recalledMemories.length > 0 ? (
          <div className="memory-indicator-banner active">
            <div className="memory-banner-content">
              <Brain size={15} color="#38bdf8" />
              <span>
                <strong>Using customer memory:</strong> {recalledMemories.length} relevant Hindsight memories recalled
                for this interaction
              </span>
            </div>
            {executionTimeMs !== undefined && <span>{executionTimeMs}ms latency</span>}
          </div>
        ) : (
          <div className="memory-indicator-banner" style={{ background: 'rgba(30, 41, 59, 0.5)', color: '#94a3b8' }}>
            <div className="memory-banner-content">
              <HelpCircle size={15} />
              <span>
                <strong>No relevant previous memory found.</strong> (AI will respond using current conversation context)
              </span>
            </div>
          </div>
        )
      ) : (
        <div className="memory-indicator-banner bypassed">
          <div className="memory-banner-content">
            <AlertCircle size={15} />
            <span>
              <strong>WITHOUT MEMORY:</strong> Customer long-term memory is bypassed. AI behaves as a new agent without past context.
            </span>
          </div>
        </div>
      )}

      {/* Error State Banner */}
      {errorMessage && (
        <div
          style={{
            margin: '10px 20px 0 20px',
            padding: '10px 14px',
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fca5a5',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span>{errorMessage}</span>
          </div>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* AI Support Recommendation Section */}
      {recommendation ? (
        <div className="recommendation-card">
          <div className="recommendation-header" onClick={() => setIsRecExpanded(!isRecExpanded)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Sparkles size={14} color="#818cf8" />
              <span className="recommendation-title">AI Support Recommendation</span>
              <span className="recommendation-badge">Grounded in Memory & DB</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                {isRecExpanded ? 'Collapse' : 'Expand'}
              </span>
              {isRecExpanded ? <ChevronUp size={13} color="#94a3b8" /> : <ChevronDown size={13} color="#94a3b8" />}
            </div>
          </div>

          {isRecExpanded && (
            <div className="recommendation-body">
              {/* Row 1: Detected Issue */}
              <div className="recommendation-row">
                <span className="rec-label">Detected Issue:</span>
                <span className="rec-value-issue">{recommendation.detectedIssue}</span>
              </div>

              {/* Row 2: Relevant Previous Experience */}
              <div className="recommendation-row">
                <span className="rec-label">Relevant Previous Experience:</span>
                {recommendation.relevantPreviousExperience ? (
                  <span className="rec-value-exp verified">
                    <CheckCircle2 size={12} color="#34d399" />
                    <span>{recommendation.relevantPreviousExperience}</span>
                  </span>
                ) : (
                  <span className="rec-value-exp none">
                    <span>None on record (New investigation — no previous solution invented)</span>
                  </span>
                )}
              </div>

              {/* Row 3: Suggested Action */}
              <div className="recommendation-row">
                <span className="rec-label">Suggested Action:</span>
                <span className="rec-value-action">
                  <span>{recommendation.suggestedAction}</span>
                </span>
              </div>

              {/* Row 4: Escalation (ONLY when available information indicates escalation is appropriate) */}
              {recommendation.escalation && recommendation.escalation.recommended && (
                <div className="recommendation-escalation-alert">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#f87171' }}>
                    <AlertTriangle size={13} />
                    <span>Escalation Recommended ({recommendation.escalation.urgency?.toUpperCase()} Urgency)</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#fca5a5', marginTop: 2 }}>
                    {recommendation.escalation.reason}
                  </div>
                  {recommendation.escalation.targetTeam && (
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: 2 }}>
                      Route to: <strong>{recommendation.escalation.targetTeam}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : suggestedAction ? (
        <div className="suggested-action-box">
          <Sparkles size={16} className="action-icon" />
          <div>
            <div className="action-label">Suggested Resolution / Action</div>
            <div className="action-text">{suggestedAction}</div>
          </div>
        </div>
      ) : null}

      {/* Messages Feed */}
      <div className="messages-container">
        {messages.map((m) => {
          const isCustomer = m.sender === 'customer';
          if (isCustomer) {
            return (
              <div key={m.id} className="message-row customer">
                <div className="message-avatar">
                  <User size={16} />
                </div>
                <div className="message-bubble-wrapper">
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#cbd5e1', paddingLeft: 4 }}>
                    {customer.name}
                  </div>
                  <div className="message-bubble">{m.message}</div>
                  <div className="message-meta">
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          }

          // AI Support Message: Render with Recalled Memory beside the response!
          const hasRecalledMemories = m.recalledMemoriesUsed && m.recalledMemoriesUsed.length > 0;
          const isBypassed = m.memoryOperationStatus === 'bypassed';

          return (
            <div key={m.id} className="message-row ai">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-bubble-wrapper" style={{ width: '100%' }}>
                {/* AI Response Header Bar */}
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#c7d2fe',
                    paddingLeft: 4,
                    paddingRight: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span>SmaranSaathi</span>
                  {hasRecalledMemories ? (
                    <span
                      style={{
                        fontSize: '0.66rem',
                        color: '#38bdf8',
                        background: 'rgba(56, 189, 248, 0.15)',
                        padding: '1px 6px',
                        borderRadius: 4,
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Brain size={10} />
                      <span>With Hindsight (Memory Active)</span>
                    </span>
                  ) : isBypassed ? (
                    <span
                      style={{
                        fontSize: '0.66rem',
                        color: '#f87171',
                        background: 'rgba(248, 113, 113, 0.15)',
                        padding: '1px 6px',
                        borderRadius: 4,
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <AlertCircle size={10} />
                      <span>Without Hindsight (Memory OFF)</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.66rem',
                        color: '#94a3b8',
                        background: 'rgba(148, 163, 184, 0.12)',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}
                    >
                      Standard Context
                    </span>
                  )}
                </div>

                {/* Side-by-Side: Response Bubble on Left, Recalled Memory beside it on Right */}
                <div className="ai-message-side-container">
                  <div className="message-bubble ai-bubble">{m.message}</div>

                  {/* Recalled Memory beside the response */}
                  <div className="memory-beside-card">
                    {hasRecalledMemories ? (
                      <div className="memory-beside-inner with-memory">
                        <div className="memory-beside-header">
                          <div className="memory-beside-title">
                            <Brain size={13} color="#38bdf8" />
                            <span>Recalled from Hindsight</span>
                          </div>
                          <span className="memory-status-pill success">✓ Active Context</span>
                        </div>
                        <div className="memory-beside-list">
                          {m.recalledMemoriesUsed!.map((mem, idx) => (
                            <div key={mem.id || idx} className="memory-beside-item">
                              <div className="memory-beside-item-top">
                                <span className="memory-category-tag">
                                  {mem.category?.replace('_', ' ') || 'Memory'}
                                </span>
                                <span className="memory-score-tag">
                                  Relevant memory retrieved
                                </span>
                              </div>
                              <div className="memory-beside-text">"{mem.content}"</div>
                            </div>
                          ))}
                        </div>
                        <div className="memory-beside-impact">
                          💡 <strong>Grounded Response:</strong> AI proactively used previous fix and customer preference without asking them to repeat themselves.
                        </div>
                        {m.message.includes("don't appear relevant to your current login issue") && (
                          <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ShieldCheck size={13} color="#38bdf8" />
                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                              RELEVANCE FILTER: Only memories relevant to the current request are used.
                            </span>
                          </div>
                        )}
                      </div>
                    ) : isBypassed ? (
                      <div className="memory-beside-inner without-memory">
                        <div className="memory-beside-header">
                          <div className="memory-beside-title">
                            <AlertCircle size={13} color="#f87171" />
                            <span>Without Hindsight (Memory OFF)</span>
                          </div>
                          <span className="memory-status-pill bypassed">Cold Start</span>
                        </div>
                        <div className="memory-beside-desc">
                          AI received <strong>0 long-term memories</strong>. Behaving as a new support agent asking basic diagnostic questions.
                        </div>
                        <div style={{ fontSize: '0.69rem', color: '#fca5a5', marginTop: 'auto' }}>
                          ⚠️ Customer must repeat prior problem history.
                        </div>
                      </div>
                    ) : (
                      <div className="memory-beside-inner empty-memory">
                        <div className="memory-beside-header">
                          <div className="memory-beside-title">
                            <HelpCircle size={13} color="#94a3b8" />
                            <span>Memory Recall Checked</span>
                          </div>
                          <span className="memory-status-pill neutral">0 Matches</span>
                        </div>
                        <div className="memory-beside-desc">
                          No prior relevant memories found in bank for this query. AI generated response from current conversation context.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Meta Footer */}
                <div className="message-meta" style={{ marginTop: 4 }}>
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {hasRecalledMemories && (
                    <span className="memory-tag-chip">
                      <Brain size={10} />
                      <span>{m.recalledMemoriesUsed!.length} memories applied</span>
                    </span>
                  )}
                  {isBypassed && (
                    <span
                      className="memory-tag-chip"
                      style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)', background: 'transparent' }}
                    >
                      no memory
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading State Indicator */}
        {isLoading && (
          <div className="message-row ai">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-bubble-wrapper">
              <div className="message-bubble" style={{ color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="status-indicator-dot" style={{ background: '#38bdf8' }} />
                <span>Recalling Hindsight memories & generating response...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="quick-prompts-bar">
        <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>Quick Prompts:</span>
        <button
          type="button"
          className="quick-prompt-btn"
          onClick={() => handleQuickPrompt('My payment is failing again.')}
        >
          💳 "My payment is failing again."
        </button>
        <button
          type="button"
          className="quick-prompt-btn"
          onClick={() => handleQuickPrompt("I'm having trouble logging in.")}
          title="Demonstrates relevance safety filter — agent does NOT blindly apply payment memories to login issues"
        >
          🔒 "I'm having trouble logging in." (Safety Filter)
        </button>
        <button
          type="button"
          className="quick-prompt-btn"
          onClick={() => handleQuickPrompt('Please give me instructions one step at a time.')}
          title="Demonstrates customer preference learning"
        >
          🪜 "Please give me instructions one step at a time."
        </button>
        <button
          type="button"
          className="quick-prompt-btn"
          onClick={() => handleQuickPrompt('I updated the billing address and it went through!')}
          title="Demonstrates newly retained outcome"
        >
          ✅ "I updated the billing address and it went through!"
        </button>
      </div>

      {/* Chat Input Bar */}
      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input-field"
          placeholder={`Type a support message as ${customer.name}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="btn-send" disabled={isLoading || !inputText.trim()} title="Send message">
          <Send size={16} />
        </button>
      </form>
    </main>
  );
};
