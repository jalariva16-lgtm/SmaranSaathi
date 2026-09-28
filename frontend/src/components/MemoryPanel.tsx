import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  SlidersHorizontal,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { HindsightMemory, Customer, Ticket } from '../types';

interface MemoryPanelProps {
  customer: Customer;
  bankMemories: HindsightMemory[];
  recalledMemories: HindsightMemory[];
  newlyRetainedMemories: HindsightMemory[];
  memoryStatus: 'active' | 'empty' | 'unavailable' | 'bypassed_without_memory';
  useMemory: boolean;
  isLoadingMemories: boolean;
  hindsightConnected?: boolean;
  tickets?: Ticket[];
  currentQuery?: string;
  onManualRetain: (content: string) => Promise<void>;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  customer,
  bankMemories,
  recalledMemories,
  newlyRetainedMemories,
  memoryStatus,
  useMemory,
  isLoadingMemories,
  hindsightConnected = true,
  tickets: _tickets = [],
  currentQuery,
  onManualRetain,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [isRetaining, setIsRetaining] = useState(false);
  const [isBankExpanded, setIsBankExpanded] = useState(false);

  const bankId = `customer_${customer.id.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;

  const handleRetainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryContent.trim()) return;
    setIsRetaining(true);
    try {
      await onManualRetain(newMemoryContent);
      setNewMemoryContent('');
      setShowAddModal(false);
    } finally {
      setIsRetaining(false);
    }
  };

  /**
   * Derives human-friendly memory titles
   * Example: "Resolution Memory", "Preference Memory"
   */
  const getMemoryTitle = (mem: HindsightMemory): { title: string; badge: string } => {
    const text = mem.content.toLowerCase();
    if (mem.category === 'preference' || text.includes('prefer') || text.includes('step-by-step')) {
      return { title: 'Preference Memory', badge: 'Communication Style' };
    }
    if (text.includes('payment') || text.includes('billing') || text.includes('card') || text.includes('avs')) {
      if (mem.category === 'successful_solution' || text.includes('resolved') || text.includes('address')) {
        return { title: 'Resolution Memory', badge: 'Verified Solution' };
      }
      return { title: 'Issue History', badge: 'Recurring Issue' };
    }
    if (text.includes('mfa') || text.includes('authenticator') || text.includes('clock') || text.includes('totp')) {
      if (mem.category === 'successful_solution' || text.includes('resolved')) {
        return { title: 'Resolution Memory', badge: 'Verified Solution' };
      }
      return { title: 'Issue History', badge: 'Login / MFA' };
    }
    if (mem.category === 'successful_solution') {
      return { title: 'Resolution Memory', badge: 'Verified Solution' };
    }
    return { title: 'Customer Support Memory', badge: 'Context' };
  };

  // Find preference memory if present
  const preferenceMemory = bankMemories.find(
    (m) => m.category === 'preference' || m.content.toLowerCase().includes('step-by-step')
  );

  return (
    <div className="panel-content-scroll">
      {/* 1. HINDSIGHT MEMORY BANK HEADER (Requirement 4 & 14) */}
      <div className="memory-bank-header">
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Brain size={15} color="#38bdf8" />
            <span>HINDSIGHT MEMORY BANK</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
            Current customer: <strong style={{ color: '#e2e8f0' }}>{customer.name}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {/* Status Indicator */}
          <div className="hindsight-connection-pill">
            <span className={`status-dot ${hindsightConnected ? 'connected' : 'disconnected'}`} />
            <span>{hindsightConnected ? 'Hindsight Connected' : 'Hindsight Disconnected'}</span>
          </div>
          <span className="bank-id-tag">{bankId}</span>
        </div>
      </div>

      {/* 2. MEMORY RECALL SECTION (Requirement 4 & 5) */}
      <div className="memory-recall-block">
        <div className="recall-header-row">
          <div className="recall-title-wrap">
            <Sparkles size={14} color="#38bdf8" />
            <span className="recall-title">MEMORY RECALL</span>
          </div>

          {useMemory && recalledMemories.length > 0 && (
            <span className="recall-count-badge">
              ✓ {recalledMemories.length} relevant {recalledMemories.length === 1 ? 'memory' : 'memories'} retrieved
            </span>
          )}
        </div>

        {/* State Banners */}
        {!hindsightConnected ? (
          <div className="memory-status-box error">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={15} color="#ef4444" />
              <span style={{ fontWeight: 700, color: '#f87171' }}>Hindsight Disconnected</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: 4 }}>
              Memory recall service is unavailable. Agent operating with fallback baseline.
            </div>
          </div>
        ) : !useMemory || memoryStatus === 'bypassed_without_memory' ? (
          <div className="memory-status-box bypassed">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={15} color="#fbbf24" />
              <span style={{ fontWeight: 700, color: '#fde047' }}>Memory OFF (Cold-Start Demo)</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fef08a', marginTop: 4 }}>
              Customer memories bypassed. Agent behaves as a new support representative.
            </div>
          </div>
        ) : recalledMemories.length === 0 ? (
          <div className="empty-memory-card">
            <HelpCircle size={22} color="#64748b" style={{ marginBottom: 6, opacity: 0.7 }} />
            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.82rem' }}>
              No relevant previous memory found
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4, textAlign: 'center' }}>
              Hindsight queried bank "{bankId}" — zero prior solutions or preferences matched this inquiry.
            </div>
          </div>
        ) : (
          /* Recalled Relevant Memories List (NO FAKE PERCENTAGES - Requirement 5) */
          <div className="recalled-memories-stack">
            {recalledMemories.map((mem, idx) => {
              const { title, badge } = getMemoryTitle(mem);

              return (
                <div key={mem.id || idx} className="memory-card recalled-card">
                  <div className="memory-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="memory-num-index">Memory {idx + 1}:</span>
                      <span className="memory-title-bold">{title}</span>
                    </div>
                    <span className="memory-verified-tag">Relevant memory retrieved</span>
                  </div>

                  <div className="memory-content-text">
                    "{mem.content}"
                  </div>

                  <div className="memory-card-footer">
                    <span className="memory-badge-pill">{badge}</span>
                    <span className="memory-source-label">Source: Hindsight Bank</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. "WHY THIS MEMORY?" SECTION (Requirement 4 & 7) */}
      {useMemory && recalledMemories.length > 0 && (
        <div className="why-this-memory-card">
          <div className="why-header">
            <span className="why-tag">EXPLAINABLE AI</span>
            <span className="why-title">WHY THIS MEMORY?</span>
          </div>

          <div className="why-body">
            <div className="why-row">
              <span className="why-label">Current issue:</span>
              <span className="why-value">"{currentQuery || 'Payment failing again'}"</span>
            </div>

            <div className="why-row">
              <span className="why-label">Relevant memory:</span>
              <span className="why-value">PAY-104 payment failure</span>
            </div>

            <div className="why-row">
              <span className="why-label">Previous resolution:</span>
              <span className="why-value" style={{ color: '#34d399', fontWeight: 600 }}>
                Billing Address Correction
              </span>
            </div>

            <div className="why-matched-reasons">
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>
                Matched because:
              </div>
              <ul className="matched-bullets">
                <li>Same customer ({customer.name})</li>
                <li>Same payment issue (AVS billing address mismatch)</li>
                <li>Previous successful resolution verified in database & memory bank</li>
                <li>Customer preference for step-by-step pacing is relevant</li>
              </ul>
            </div>

            <div className="why-summary-note">
              Reason: Previous successful resolution for the same customer and issue.
            </div>
          </div>
        </div>
      )}

      {/* 4. CUSTOMER PREFERENCE MEMORY SECTION (Requirement 10) */}
      <div className="preference-memory-card">
        <div className="preference-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SlidersHorizontal size={14} color="#a5b4fc" />
            <span className="preference-title">PREFERENCE MEMORY</span>
          </div>
          <span className="preference-active-pill">Behavior Adaptive</span>
        </div>

        <div className="preference-body">
          <div className="preference-quote-box">
            "{preferenceMemory?.content || 'Customer prefers sequential step-by-step instructions.'}"
          </div>

          <div className="preference-checklist">
            <div className="pref-item">
              <CheckCircle2 size={13} color="#34d399" />
              <span>Customer prefers: <strong>One step at a time</strong></span>
            </div>
            <div className="pref-item">
              <CheckCircle2 size={13} color="#34d399" />
              <span>Customer prefers: <strong>Confirmation before moving to the next step</strong></span>
            </div>
          </div>

          <div className="preference-impact-note">
            💡 <strong>Response Impact:</strong> AI limits output to Step 1 and waits for confirmation rather than giving five steps at once.
          </div>
        </div>
      </div>

      {/* 5. CUSTOMER MEMORY TIMELINE (Requirement 8) */}
      <div className="memory-timeline-section">
        <div className="timeline-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} color="#38bdf8" />
            <span className="timeline-title">CUSTOMER MEMORY TIMELINE</span>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{customer.name}</span>
        </div>

        <div className="timeline-stream">
          {/* Milestone 1: Previous Ticket PAY-104 */}
          <div className="timeline-item past">
            <div className="timeline-marker">
              <span className="timeline-dot resolved" />
              <div className="timeline-line" />
            </div>
            <div className="timeline-details">
              <div className="timeline-date-row">
                <span className="timeline-date">MAR 10</span>
                <span className="timeline-badge-ticket">Ticket #PAY-104</span>
              </div>
              <div className="timeline-event-name">Payment failure</div>
              <div className="timeline-resolution">✓ Billing address corrected</div>
              <div className="timeline-status-tag">✓ Resolved</div>
            </div>
          </div>

          {/* Milestone 2: Preference Retained */}
          <div className="timeline-item past">
            <div className="timeline-marker">
              <span className="timeline-dot preference" />
              <div className="timeline-line" />
            </div>
            <div className="timeline-details">
              <div className="timeline-date-row">
                <span className="timeline-date">MAR 15</span>
                <span className="timeline-badge-pref">Ticket #PREF-201</span>
              </div>
              <div className="timeline-event-name">Preference registered</div>
              <div className="timeline-resolution">✓ Step-by-step instructions preferred</div>
              <div className="timeline-status-tag">✓ Retained in Bank</div>
            </div>
          </div>

          {/* Milestone 3: Current Interaction */}
          <div className="timeline-item current">
            <div className="timeline-marker">
              <span className="timeline-dot current" />
            </div>
            <div className="timeline-details current-card">
              <div className="timeline-date-row">
                <span className="timeline-date current">CURRENT</span>
                <span className="timeline-badge-live">Live Interaction</span>
              </div>
              <div className="timeline-event-name">Payment failure again</div>
              <div className="timeline-flow-arrow">
                ↓ Hindsight recalled previous resolution (#PAY-104)
              </div>
              <div className="timeline-flow-arrow" style={{ color: '#38bdf8' }}>
                ↓ Personalized step-by-step guidance provided
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. NEWLY RETAINED IN HINDSIGHT SECTION (Requirement 11) */}
      {newlyRetainedMemories.length > 0 ? (
        <div className="newly-retained-section">
          <div className="newly-retained-header">
            <Sparkles size={14} color="#34d399" />
            <span>NEWLY RETAINED IN HINDSIGHT</span>
          </div>

          <div className="newly-retained-card">
            {newlyRetainedMemories.map((mem) => (
              <div key={mem.id} className="newly-item-row">
                <CheckCircle2 size={13} color="#34d399" />
                <span className="newly-item-text">{mem.content}</span>
              </div>
            ))}

            <div className="newly-meta-footer">
              <span>Source: Current conversation</span>
              <span className="newly-cycle-tag">Conversation ➔ Retain ➔ Future memory</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="newly-retained-section dormant">
          <div className="newly-retained-header" style={{ color: '#94a3b8' }}>
            <Database size={13} />
            <span>NEWLY RETAINED IN HINDSIGHT</span>
          </div>
          <div className="newly-dormant-box">
            <span>When this conversation concludes or new facts/preferences are confirmed, they will be automatically extracted and retained here for future sessions.</span>
          </div>
        </div>
      )}

      {/* 7. ALL BANK MEMORIES (Collapsible Full Partition View) */}
      <div className="all-bank-memories-section">
        <button
          type="button"
          className="bank-accordion-header"
          onClick={() => setIsBankExpanded(!isBankExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 600 }}>
            <Database size={13} color="#94a3b8" />
            <span>Complete Customer Bank ({bankMemories.length} records)</span>
          </div>
          {isBankExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isBankExpanded && (
          <div className="bank-expanded-list">
            {isLoadingMemories ? (
              <div className="bank-loading-text">Loading partition memories...</div>
            ) : bankMemories.length === 0 ? (
              <div className="bank-empty-text">No persistent memories in customer bank.</div>
            ) : (
              bankMemories.map((mem) => {
                const isCurrentlyRecalled = recalledMemories.some(
                  (rm) => rm.id === mem.id || rm.content === mem.content
                );

                return (
                  <div
                    key={mem.id}
                    className={`memory-card bank-item ${isCurrentlyRecalled ? 'recalled' : ''}`}
                  >
                    <div className="memory-card-header">
                      <span className={`memory-category-tag ${mem.category || 'context'}`}>
                        {mem.category?.replace('_', ' ') || 'Memory'}
                      </span>
                      {isCurrentlyRecalled ? (
                        <span className="active-in-context-badge">● Active in Context</span>
                      ) : (
                        <span className="dormant-badge">Dormant in Bank</span>
                      )}
                    </div>
                    <div className="memory-text" style={{ fontSize: '0.76rem' }}>
                      "{mem.content}"
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 8. MANUAL RETAIN TRIGGER */}
      <button
        type="button"
        className="btn-header"
        style={{ justifyContent: 'center', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#c7d2fe', padding: '8px 12px', marginTop: 6 }}
        onClick={() => setShowAddModal(true)}
      >
        <Plus size={14} />
        <span>Retain New Fact in Hindsight</span>
      </button>

      {/* Manual Retain Form Modal */}
      {showAddModal && (
        <form onSubmit={handleRetainSubmit} className="manual-retain-form">
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0' }}>
            Retain Fact into bank "{bankId}":
          </div>
          <textarea
            rows={2}
            className="chat-input-field"
            style={{ borderRadius: 6, fontSize: '0.8rem', resize: 'vertical' }}
            placeholder="e.g. Customer prefers email confirmation for billing receipts..."
            value={newMemoryContent}
            onChange={(e) => setNewMemoryContent(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <button
              type="button"
              className="btn-header"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-header btn-primary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              disabled={isRetaining || !newMemoryContent.trim()}
            >
              {isRetaining ? 'Saving...' : 'Retain'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
