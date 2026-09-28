import React from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTest: (testId: string) => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ isOpen, onClose, onRunTest }) => {
  if (!isOpen) return null;

  const testCases = [
    {
      id: 'test-1',
      title: 'Test 1: New customer with no memory',
      description: 'Select an onboarding customer with zero memory. AI responds courteously as a new agent without hallucinations.',
      actionLabel: 'Select Vikram Singh',
    },
    {
      id: 'test-2',
      title: 'Test 2: Returning customer with relevant memory',
      description: 'Rahul Sharma asks "My payment is failing again." AI recalls that the previous payment failure was solved by updating the billing address.',
      actionLabel: 'Run Rahul Payment Test',
    },
    {
      id: 'test-3',
      title: 'Test 3: Returning customer with an unrelated issue',
      description: 'Rahul asks about dashboard latency. AI must NOT incorrectly inject the billing address memory.',
      actionLabel: 'Ask Unrelated Dashboard Query',
    },
    {
      id: 'test-4',
      title: 'Test 4: Repeated issue with previous successful solution',
      description: 'Demonstrates Hindsight multi-signal recall surfacing the high-relevance successful solution card.',
      actionLabel: 'Demonstrate Solution Card',
    },
    {
      id: 'test-5',
      title: 'Test 5: Customer preference retained and used later',
      description: 'Rahul says "Please give me instructions one step at a time." AI retains preference in Hindsight, then subsequent queries adapt into sequential 1-step guides.',
      actionLabel: 'Test Preference Learning',
    },
    {
      id: 'test-6',
      title: 'Test 6: Customer switching & memory isolation',
      description: 'Switch from Rahul Sharma to Priya Mehta. Ensure memories never cross between bank customer_cust_1 and customer_cust_2.',
      actionLabel: 'Switch to Priya Mehta',
    },
    {
      id: 'test-7',
      title: 'Test 7: Before vs After demonstration toggle',
      description: 'Toggle between "WITH HINDSIGHT" and "WITHOUT MEMORY" on the exact same customer query to see the dramatic difference.',
      actionLabel: 'Toggle Memory Demo',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={18} color="#818cf8" />
            <span className="modal-title">Interactive Walkthrough & 7 Test Cases</span>
          </div>
          <button className="btn-header" style={{ padding: 4 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Core Philosophy Banner */}
          <div style={{ padding: 14, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--border-accent)', borderRadius: 10 }}>
            <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={15} color="#c084fc" />
              <span>Core Value Demonstrated</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              "The AI remembers a customer's previous support history, problems, successful solutions, and preferences so the customer does not have to repeat themselves."
            </p>
          </div>

          {/* Test Cases List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {testCases.map((tc) => (
              <div
                key={tc.id}
                style={{
                  padding: 12,
                  background: 'var(--bg-surface)',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{tc.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{tc.description}</div>
                </div>
                <button
                  className="btn-header btn-primary"
                  style={{ flexShrink: 0, fontSize: '0.75rem', padding: '6px 10px' }}
                  onClick={() => {
                    onRunTest(tc.id);
                    onClose();
                  }}
                >
                  {tc.actionLabel}
                </button>
              </div>
            ))}
          </div>
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
