import React from 'react';
import { Brain, Cpu, Database, RotateCcw, BookOpen, Terminal, MessageSquare, BarChart3 } from 'lucide-react';
import { SystemStatus } from '../types';

interface HeaderProps {
  status: SystemStatus | null;
  onReset: () => void;
  onOpenGuide: () => void;
  onOpenObservability: () => void;
  isResetting: boolean;
  activeView: 'workspace' | 'dashboard';
  onViewChange: (view: 'workspace' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onReset,
  onOpenGuide,
  onOpenObservability,
  isResetting,
  activeView,
  onViewChange,
}) => {
  const hindsightConnected = status?.hindsight?.status === 'connected';

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Brain size={22} color="#ffffff" />
        </div>
        <div>
          <h1 className="brand-title">SmaranSaathi</h1>
          <p className="brand-tagline">Persistent Long-Term Memory for AI Customer Support</p>
        </div>
      </div>

      {/* Primary View Switcher: Support Workspace vs Support Dashboard */}
      <div className="header-view-segmented">
        <button
          type="button"
          className={`view-tab-btn ${activeView === 'workspace' ? 'active' : ''}`}
          onClick={() => onViewChange('workspace')}
        >
          <MessageSquare size={14} />
          <span>Support Workspace</span>
        </button>
        <button
          type="button"
          className={`view-tab-btn ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          <BarChart3 size={14} />
          <span>Support Dashboard</span>
        </button>
      </div>

      <div className="header-actions">
        {/* Hindsight Status Badge */}
        <div
          className={`status-badge ${hindsightConnected ? 'connected' : 'disconnected'}`}
          title={status?.hindsight?.details || 'Hindsight Status'}
        >
          <span className="status-indicator-dot" />
          <span>Hindsight: {hindsightConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {/* LLM Status Badge */}
        <div className="status-badge" style={{ color: '#c7d2fe', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <Cpu size={13} style={{ marginRight: 2 }} />
          <span>Model: {status?.llm?.model || 'openai/gpt-oss-120b'}</span>
        </div>

        {/* Database Status Badge */}
        <div className="status-badge" style={{ color: '#94a3b8' }}>
          <Database size={13} style={{ marginRight: 2 }} />
          <span>{status?.database?.ticketsCount || 100} Tickets</span>
        </div>

        {/* Observability Button */}
        <button
          className="btn-header"
          onClick={onOpenObservability}
          title="Inspect Context and Prompts passed to LLM"
        >
          <Terminal size={14} />
          <span>AI Inspector</span>
        </button>

        {/* Guide / Walkthrough Button */}
        <button className="btn-header" onClick={onOpenGuide} title="Interactive Demo & Test Guide">
          <BookOpen size={14} />
          <span>Demo Guide</span>
        </button>

        {/* Reset Button */}
        <button
          className="btn-header"
          onClick={onReset}
          disabled={isResetting}
          title="Reset database and memory banks to initial seed state"
        >
          <RotateCcw size={14} className={isResetting ? 'animate-spin' : ''} />
          <span>{isResetting ? 'Resetting...' : 'Reset Data'}</span>
        </button>
      </div>
    </header>
  );
};
