import React from 'react';
import { X, Brain, ArrowRight, Sparkles, MessageSquare, Zap } from 'lucide-react';
import { Customer } from '../types';

interface BeforeAfterModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onRunTest: (useMemory: boolean, message: string) => void;
}

export const BeforeAfterModal: React.FC<BeforeAfterModalProps> = ({
  isOpen,
  onClose,
  customer,
  onRunTest,
}) => {
  if (!isOpen) return null;

  const customerName = customer?.name || 'Rahul Sharma';
  const companyName = customer?.company || 'Apex FinTech';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container before-after-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 960, width: '92%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                Hindsight: Before vs After Demonstration
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Side-by-side contrast of AI Support Agent behavior with persistent memory vs cold-start behavior.
              </div>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Demo Scenario Overview Banner */}
        <div
          style={{
            margin: '16px 24px 0',
            padding: '12px 18px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Primary Demo Customer:</span>
              <span style={{ color: '#38bdf8' }}>{customerName} ({companyName} • Enterprise)</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 3 }}>
              Previous issue: <strong>Payment failure (#PAY-104)</strong> ➔ Resolution:{' '}
              <span style={{ color: '#34d399', fontWeight: 600 }}>Billing Address Correction</span>. Preference:{' '}
              <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Step-by-step sequential instructions</span>.
            </div>
          </div>

          <div
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.76rem',
              fontWeight: 600,
            }}
          >
            Trigger Prompt: "My payment is failing again."
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 20,
            padding: '20px 24px',
            overflowY: 'auto',
            maxHeight: '62vh',
          }}
        >
          {/* LEFT: WITHOUT HINDSIGHT / Memory OFF */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 12,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                  }}
                >
                  WITHOUT HINDSIGHT
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Memory OFF</span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                }}
              >
                COLD-START BASELINE
              </span>
            </div>

            {/* Context Passed to AI */}
            <div style={{ fontSize: '0.76rem', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
              <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 5 }}>Context passed to AI:</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.75rem' }}>
                <li>Current customer identity ({customerName})</li>
                <li>Current message only ("My payment is failing again.")</li>
                <li style={{ color: '#f87171' }}>No previous billing history</li>
                <li style={{ color: '#f87171' }}>No previous solution</li>
                <li style={{ color: '#f87171' }}>No customer preference</li>
              </ul>
            </div>

            {/* Expected AI Response */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MessageSquare size={13} />
                <span>AI response example:</span>
              </div>
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  borderRadius: 8,
                  padding: 14,
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: '#e2e8f0',
                }}
              >
                "Hello {customerName}, I'm sorry to hear that your payment is failing.
                <br /><br />
                Could you provide more details about the error you're seeing?"
              </div>
            </div>

            {/* Cold Start Assessment */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: '0.74rem',
                color: '#fca5a5',
              }}
            >
              ⚠️ <strong>Customer Frustration:</strong> Customer must repeat the entire background and re-explain error details that were already solved in past tickets.
            </div>

            {/* Live Run Action Button */}
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: '100%',
                justifyContent: 'center',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '8px 12px',
              }}
              onClick={() => {
                onClose();
                onRunTest(false, 'My payment is failing again.');
              }}
            >
              <span>Test Memory OFF in Chat</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* RIGHT: WITH HINDSIGHT / Memory ON */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              borderRadius: 12,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 0 25px rgba(14, 165, 233, 0.15)',
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(56, 189, 248, 0.25)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)',
                    color: '#38bdf8',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                  }}
                >
                  WITH HINDSIGHT
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Memory ON</span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Brain size={11} />
                <span>PERSISTENT MEMORY ACTIVE</span>
              </span>
            </div>

            {/* Context Recalled from Hindsight */}
            <div style={{ fontSize: '0.76rem', background: 'rgba(15, 23, 42, 0.8)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: 5 }}>Hindsight recalled:</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#e2e8f0', lineHeight: 1.6, fontSize: '0.75rem' }}>
                <li>
                  <strong style={{ color: '#38bdf8' }}>Previous payment failure</strong> (Ticket #PAY-104)
                </li>
                <li>
                  <strong style={{ color: '#34d399' }}>Billing Address Correction</strong> (resolved previous AVS hold)
                </li>
                <li>
                  <strong style={{ color: '#a5b4fc' }}>Step-by-step support preference</strong> (sequential single-action steps)
                </li>
              </ul>
            </div>

            {/* Expected AI Response */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={13} />
                <span>AI response:</span>
              </div>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: 8,
                  padding: 14,
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: '#f8fafc',
                }}
              >
                "Hello {customerName}, I see your payment is failing again.
                <br /><br />
                I found a previous PAY-104 payment issue that was resolved after correcting your billing address. I'll guide you through the same process step by step.
                <br /><br />
                Step 1: Please check if your corporate billing address in Billing Settings matches your bank statement."
              </div>
            </div>

            {/* Memory Impact Assessment */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: '0.74rem',
                color: '#6ee7b7',
              }}
            >
              ✓ <strong>Zero Repetition:</strong> AI targets the historical solution immediately while adhering to Rahul's single-step instruction preference.
            </div>

            {/* Live Run Action Button */}
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '8px 12px',
              }}
              onClick={() => {
                onClose();
                onRunTest(true, 'My payment is failing again.');
              }}
            >
              <Sparkles size={14} />
              <span>Test Memory ON in Chat</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
