import React, { useState } from 'react';
import { Brain, AlertCircle, Zap, Play, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Customer } from '../types';

interface HeroDemoBannerProps {
  customer: Customer;
  useMemory: boolean;
  onToggleMemory: (val: boolean) => void;
  onSendMessage: (text: string, overrideUseMemory?: boolean) => void;
  onOpenBeforeAfterModal: () => void;
  isLoading: boolean;
}

export const HeroDemoBanner: React.FC<HeroDemoBannerProps> = ({
  customer,
  useMemory,
  onToggleMemory,
  onSendMessage,
  onOpenBeforeAfterModal,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);

  // Automated 1-Click Demo Runner (Requirement 15)
  const handleRunDemo = async () => {
    if (isLoading || isAutoRunning) return;
    setIsAutoRunning(true);

    try {
      // Step 1: Memory OFF (Cold-Start Baseline)
      onToggleMemory(false);
      await onSendMessage('My payment is failing again.', false);

      // Step 2: Pause briefly so judge absorbs the cold-start response
      await new Promise((r) => setTimeout(r, 2200));

      // Step 3: Switch Memory ON & Send same prompt with Hindsight memory active
      onToggleMemory(true);
      await onSendMessage('My payment is failing again.', true);
    } finally {
      setIsAutoRunning(false);
    }
  };

  return (
    <div className="hero-demo-section" aria-label="Hindsight Before vs After Demonstration">
      {/* 1. Judge 15-Second Value Hook Header */}
      <div className="hero-top-bar">
        <div className="hero-title-col">
          <div className="hero-badge-row">
            <span className="hero-pill-primary">
              <Brain size={12} color="#38bdf8" />
              <span>PERSISTENT MEMORY</span>
            </span>
            <span className="hero-pill-secondary">Hindsight: Before vs After</span>
          </div>

          <div className="hero-main-title">
            Learns from every interaction across support sessions
          </div>
        </div>

        {/* Demo Controls: Run Demo, Memory ON/OFF, Compare Modal, Scenario Toggle */}
        <div className="hero-controls-group">
          {/* 1-Click Automated Demo Runner */}
          <button
            type="button"
            className="btn-hero-run"
            onClick={handleRunDemo}
            disabled={isLoading || isAutoRunning}
            title="Automatically run cold-start (Memory OFF) then memory-grounded (Memory ON) comparison"
          >
            <Play size={12} fill="currentColor" />
            <span>{isAutoRunning ? 'Running Demo...' : 'Run 1-Click Demo'}</span>
          </button>

          {/* Side-by-side Modal */}
          <button
            type="button"
            className="btn-hero-secondary"
            onClick={onOpenBeforeAfterModal}
            title="Open side-by-side comparison modal"
          >
            <Zap size={12} color="#818cf8" />
            <span>Compare Modal</span>
          </button>

          {/* Toggle Expand/Collapse */}
          <button
            type="button"
            className="btn-hero-icon"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Hide Scenario Details' : 'Show Scenario Details & Contrast Cards'}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', fontSize: '0.72rem' }}
          >
            <span>{isExpanded ? 'Hide Details' : 'Scenario Details'}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 2. Primary Demo Scenario & Side-by-Side Quick Contrast */}
      {isExpanded && (
        <div className="hero-scenario-container">
          {/* Scenario Context Bar */}
          <div className="hero-scenario-headline">
            <div className="scenario-customer-tag">
              <strong>Demo Customer:</strong> {customer.name} ({customer.company} • {customer.accountTier})
            </div>
            <div className="scenario-issue-tag">
              <strong>Scenario:</strong> "Rahul is experiencing a recurring payment issue."
            </div>
            <div className="scenario-details-tag">
              <span>Prior Ticket: <strong>#PAY-104</strong> (Billing Address Correction)</span>
              <span>•</span>
              <span>Preference: <strong>Step-by-step sequential instructions</strong></span>
            </div>
          </div>

          {/* Side-by-Side Quick Cards */}
          <div className="hero-contrast-grid">
            {/* LEFT: WITHOUT HINDSIGHT */}
            <div className={`contrast-box without ${!useMemory ? 'highlighted' : ''}`}>
              <div className="contrast-box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} color="#f87171" />
                  <span className="contrast-title without">WITHOUT HINDSIGHT (Memory OFF)</span>
                </div>
                <span className="contrast-tag baseline">COLD-START BASELINE</span>
              </div>

              <div className="contrast-context-list">
                <div className="context-list-title">Context passed to AI:</div>
                <ul>
                  <li>Current customer identity ({customer.name})</li>
                  <li>Current message only ("My payment is failing again.")</li>
                  <li className="dim">No previous billing history</li>
                  <li className="dim">No previous solution</li>
                  <li className="dim">No customer preference</li>
                </ul>
              </div>

              <div className="contrast-response-preview">
                <div className="response-label">AI response example:</div>
                <div className="response-quote">
                  "Hello {customer.name}, I'm sorry to hear that your payment is failing. Could you provide more details about the error you're seeing?"
                </div>
              </div>

              <button
                type="button"
                className="btn-contrast-trigger without"
                onClick={() => {
                  onToggleMemory(false);
                  onSendMessage('My payment is failing again.', false);
                }}
                disabled={isLoading}
              >
                <span>Trigger Memory OFF Test</span>
              </button>
            </div>

            {/* RIGHT: WITH HINDSIGHT */}
            <div className={`contrast-box with ${useMemory ? 'highlighted' : ''}`}>
              <div className="contrast-box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Brain size={14} color="#38bdf8" />
                  <span className="contrast-title with">WITH HINDSIGHT (Memory ON)</span>
                </div>
                <span className="contrast-tag active">PERSISTENT MEMORY RECALLED</span>
              </div>

              <div className="contrast-context-list">
                <div className="context-list-title" style={{ color: '#38bdf8' }}>Hindsight recalled:</div>
                <ul>
                  <li><strong>Previous payment failure</strong> (#PAY-104)</li>
                  <li><strong>Billing Address Correction</strong> (resolved previous hold)</li>
                  <li><strong>Step-by-step support preference</strong> (one step at a time)</li>
                </ul>
              </div>

              <div className="contrast-response-preview with">
                <div className="response-label" style={{ color: '#38bdf8' }}>AI response:</div>
                <div className="response-quote">
                  "Hello {customer.name}, I see your payment is failing again. I found a previous PAY-104 payment issue that was resolved after correcting your billing address. I'll guide you through the same process step by step."
                </div>
              </div>

              <button
                type="button"
                className="btn-contrast-trigger with"
                onClick={() => {
                  onToggleMemory(true);
                  onSendMessage('My payment is failing again.', true);
                }}
                disabled={isLoading}
              >
                <Sparkles size={13} />
                <span>Trigger Memory ON Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
