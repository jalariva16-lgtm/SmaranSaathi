import React from 'react';
import { X, Terminal } from 'lucide-react';
import { ChatResponse, Customer } from '../types';

interface ObservabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  lastResponse: ChatResponse | null;
}

export const ObservabilityModal: React.FC<ObservabilityModalProps> = ({
  isOpen,
  onClose,
  lastResponse,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Terminal size={18} color="#818cf8" />
            <span className="modal-title">AI Context & Memory Inspector</span>
          </div>
          <button className="btn-header" style={{ padding: 4 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {lastResponse ? (
            <>
              {/* Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Hindsight Bank ID</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {lastResponse.observability.hindsightBankId}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Configured LLM Model</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c7d2fe' }}>
                    {lastResponse.llmModel}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Execution Latency</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                    {lastResponse.executionTimeMs} ms
                  </div>
                </div>
              </div>

              {/* Memory Retention Decision */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                  Hindsight Long-Term Memory Decision
                </div>
                <div style={{ padding: 10, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {lastResponse.observability.retentionDecision}
                </div>
              </div>

              {/* Recalled Memories Breakdown */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                  Memories Recalled ({lastResponse.recalledMemories.length})
                </div>
                {lastResponse.recalledMemories.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {lastResponse.recalledMemories.map((m, idx) => (
                      <div key={idx} style={{ padding: 8, background: 'rgba(14, 165, 233, 0.08)', borderRadius: 6, border: '1px solid rgba(14, 165, 233, 0.25)', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 600, color: '#38bdf8' }}>[{m.category || 'Context'}]</span> {m.content}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>No memories recalled for this query.</div>
                )}
              </div>

              {/* Raw Prompt Context Passed to LLM */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                  Full Prompt Context Provided to LLM (Separation of DB vs Memory)
                </div>
                <div className="code-box">{lastResponse.observability.promptContext}</div>
              </div>
            </>
          ) : (
            <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>
              Send a message in the chat to inspect the live prompt context, Hindsight bank recall signals, and retention decisions.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-header" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
