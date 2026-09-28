import React from 'react';
import { Database, Brain, Search, Sparkles, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export type LifecycleStage = 'idle' | 'recall' | 'personalize' | 'retain' | 'bypassed';

interface MemoryLifecycleIndicatorProps {
  currentStage: LifecycleStage;
  recalledCount: number;
  newlyRetainedCount: number;
  customerName: string;
  useMemory: boolean;
}

export const MemoryLifecycleIndicator: React.FC<MemoryLifecycleIndicatorProps> = ({
  currentStage,
  recalledCount,
  newlyRetainedCount,
  customerName,
  useMemory,
}) => {
  const shortName = customerName.split(' ')[0] || 'customer';

  const steps = [
    {
      id: 'retain-prior',
      stepNum: 1,
      name: 'RETAIN',
      sublabel: 'Previous interaction stored',
      icon: <Database size={14} />,
      isActive: useMemory,
      isCompleted: useMemory,
      badgeText: 'PAY-104 & Prefs',
    },
    {
      id: 'remember',
      stepNum: 2,
      name: 'REMEMBER',
      sublabel: 'Hindsight persistent bank',
      icon: <Brain size={14} />,
      isActive: useMemory,
      isCompleted: useMemory,
      badgeText: 'Partition Active',
    },
    {
      id: 'recall',
      stepNum: 3,
      name: 'RECALL',
      sublabel:
        !useMemory
          ? 'Bypassed (Memory OFF)'
          : recalledCount > 0
          ? `${recalledCount} relevant memories retrieved`
          : currentStage === 'recall'
          ? 'Searching Hindsight...'
          : 'Query semantic match',
      icon: <Search size={14} />,
      isActive: useMemory && (currentStage === 'recall' || recalledCount > 0),
      isCompleted: useMemory && recalledCount > 0,
      badgeText: useMemory && recalledCount > 0 ? `${recalledCount} Recalled` : undefined,
    },
    {
      id: 'personalize',
      stepNum: 4,
      name: 'PERSONALIZE',
      sublabel:
        !useMemory
          ? 'Generic diagnostic questions'
          : currentStage === 'personalize' || recalledCount > 0
          ? `Response adapted to ${shortName}`
          : 'Adapts format & fix',
      icon: <Sparkles size={14} />,
      isActive: useMemory && (currentStage === 'personalize' || recalledCount > 0),
      isCompleted: useMemory && currentStage === 'personalize',
      badgeText: useMemory && (currentStage === 'personalize' || recalledCount > 0) ? 'Step-by-Step' : undefined,
    },
    {
      id: 'retain-new',
      stepNum: 5,
      name: 'RETAIN',
      sublabel:
        !useMemory
          ? 'Retention bypassed'
          : newlyRetainedCount > 0
          ? `${newlyRetainedCount} new outcome stored`
          : currentStage === 'retain'
          ? 'Persisting new outcome...'
          : 'Ready for resolution',
      icon: <CheckCircle2 size={14} />,
      isActive: useMemory && (currentStage === 'retain' || newlyRetainedCount > 0),
      isCompleted: useMemory && newlyRetainedCount > 0,
      badgeText: newlyRetainedCount > 0 ? '✓ Saved' : undefined,
    },
  ];

  return (
    <div className="lifecycle-container" aria-label="Hindsight Memory Lifecycle">
      <div className="lifecycle-compact-row">
        <div className="lifecycle-lead">
          <span className="lifecycle-badge">LIFECYCLE</span>
        </div>

        <div className="lifecycle-steps-flow">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                className={`lifecycle-step-chip ${step.isActive ? 'active' : ''} ${
                  step.isCompleted ? 'completed' : ''
                } ${!useMemory && idx >= 2 ? 'disabled' : ''}`}
                title={`${step.name}: ${step.sublabel}`}
              >
                <span className="step-icon-wrap">{step.icon}</span>
                <span className="step-name">{step.name}</span>
                {step.badgeText && <span className="step-badge">{step.badgeText}</span>}
              </div>

              {idx < steps.length - 1 && (
                <div className={`lifecycle-arrow ${step.isActive && useMemory ? 'active' : ''}`}>
                  <ArrowRight size={11} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {!useMemory ? (
          <div className="lifecycle-bypassed-pill" title="Memory bypassed: Agent has 0 past context">
            <AlertCircle size={11} />
            <span>Memory OFF</span>
          </div>
        ) : recalledCount > 0 ? (
          <div className="lifecycle-active-pill" title="Hindsight memory active">
            <CheckCircle2 size={11} color="#38bdf8" />
            <span>{recalledCount} Recalled</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
