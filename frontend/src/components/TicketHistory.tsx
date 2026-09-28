import React, { useState } from 'react';
import { Database, MessageSquare, Calendar, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, ArrowRight, Brain, Search, User, Bot } from 'lucide-react';
import { Ticket, Customer, Message } from '../types';

interface TicketHistoryProps {
  customer?: Customer;
  tickets: Ticket[];
  activeTicketId?: string;
  onSelectTicket?: (ticket: Ticket) => void;
}

export const TicketHistory: React.FC<TicketHistoryProps> = ({
  customer,
  tickets,
  activeTicketId,
  onSelectTicket,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'open'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [ticketMessagesCache, setTicketMessagesCache] = useState<Record<string, Message[]>>({});
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null);

  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;
  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'resolved' && t.status !== 'resolved') return false;
    if (filterStatus === 'open' && t.status === 'resolved') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.issueType.toLowerCase().includes(q) ||
        (t.resolutionSummary && t.resolutionSummary.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleToggleExpand = async (ticket: Ticket, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (expandedTicketId === ticket.id) {
      setExpandedTicketId(null);
      return;
    }

    setExpandedTicketId(ticket.id);

    // Fetch messages if not in cache
    if (!ticketMessagesCache[ticket.id]) {
      setLoadingTicketId(ticket.id);
      try {
        const res = await fetch(`/api/tickets/${ticket.id}`);
        if (res.ok) {
          const data = await res.json();
          setTicketMessagesCache((prev) => ({
            ...prev,
            [ticket.id]: data.messages || [],
          }));
        }
      } catch (err) {
        console.error('Failed to load messages for ticket:', ticket.id, err);
      } finally {
        setLoadingTicketId(null);
      }
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="panel-content-scroll">
      {/* 1. Explicit Architecture Distinction Callout */}
      <div className="ticket-distinction-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Database size={15} color="#818cf8" />
            <span>Relational Ticket History vs. Hindsight Memory</span>
          </div>
          <span style={{ fontSize: '0.66rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
            Postgres / Relational DB
          </span>
        </div>

        <div className="distinction-grid">
          <div className="distinction-column db">
            <div className="distinction-title">
              <Database size={12} color="#818cf8" />
              <span>Ticket History</span>
            </div>
            <div className="distinction-desc">
              <strong>Complete record of previous support interactions</strong>: raw tickets, dates, statuses, resolutions, and exact message transcripts.
            </div>
          </div>

          <div className="distinction-column memory">
            <div className="distinction-title">
              <Brain size={12} color="#38bdf8" />
              <span>Hindsight Memory</span>
            </div>
            <div className="distinction-desc">
              <strong>Important information remembered for future conversations</strong>: distilled solutions and preferences that automatically personalize subsequent AI responses.
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.69rem', color: '#94a3b8', marginTop: 8, fontStyle: 'italic', borderTop: '1px solid rgba(99, 102, 241, 0.2)', paddingTop: 6 }}>
          * Architectural Note: SmaranSaathi does NOT duplicate the entire ticket history into Hindsight. Only high-value insights and preferences are extracted and retained.
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="chat-input-field"
              style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: '0.78rem', height: 32, borderRadius: 6 }}
              placeholder="Search tickets by ID, subject, resolution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({tickets.length})
            </button>
            <button
              type="button"
              className={`filter-chip ${filterStatus === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('resolved')}
            >
              Resolved ({resolvedCount})
            </button>
            <button
              type="button"
              className={`filter-chip ${filterStatus === 'open' ? 'active' : ''}`}
              onClick={() => setFilterStatus('open')}
            >
              Active ({openCount})
            </button>
          </div>
        </div>
      </div>

      {/* 3. Ticket Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredTickets.map((t) => {
          const isActive = t.id === activeTicketId;
          const isExpanded = expandedTicketId === t.id;
          const messages = ticketMessagesCache[t.id] || [];
          const isLoadingMessages = loadingTicketId === t.id;

          return (
            <div
              key={t.id}
              className={`ticket-card ${isActive ? 'active-ticket' : ''} ${isExpanded ? 'expanded' : ''}`}
              style={{
                borderColor: isActive ? 'var(--accent-primary)' : isExpanded ? 'rgba(99, 102, 241, 0.5)' : undefined,
                background: isActive ? 'rgba(99, 102, 241, 0.08)' : undefined,
              }}
            >
              {/* Card Header: Ticket ID, Issue Type, Status */}
              <div className="ticket-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="ticket-id-tag">#{t.id}</span>
                  <span className="ticket-issue-type-badge">{t.issueType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`ticket-status-badge ${t.status}`}>
                    {t.status === 'resolved' && <CheckCircle2 size={11} />}
                    {t.status === 'in_progress' && <Clock size={11} />}
                    {t.status === 'open' && <AlertCircle size={11} />}
                    <span>Status: {t.status === 'resolved' ? 'Resolved' : t.status === 'in_progress' ? 'In Progress' : 'Open'}</span>
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div className="ticket-subject" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                {t.subject}
              </div>

              {/* Resolution Summary (If applicable) */}
              {t.resolutionSummary && (
                <div className="ticket-resolution-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399', fontWeight: 700, fontSize: '0.72rem', marginBottom: 2 }}>
                    <CheckCircle2 size={12} />
                    <span>Resolution:</span>
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    {t.resolutionSummary}
                  </div>
                </div>
              )}

              {/* Dates Row: Created date & Resolved date */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 6, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} color="#64748b" />
                  <span>Created: {formatDate(t.createdAt)}</span>
                </div>
                {t.resolvedAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} color="#34d399" />
                    <span>Resolved: {formatDate(t.resolvedAt)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: View Messages & Open in Main Chat */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 6 }}>
                <button
                  type="button"
                  className="ticket-action-btn"
                  onClick={(e) => handleToggleExpand(t, e)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#c7d2fe', background: 'transparent', border: 'none', cursor: 'pointer', padding: '3px 6px', borderRadius: 4 }}
                >
                  <MessageSquare size={13} color="#818cf8" />
                  <span>{isExpanded ? 'Hide Conversation' : 'View Conversation Messages'}</span>
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {onSelectTicket && (
                  <button
                    type="button"
                    className="ticket-open-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTicket(t);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: isActive ? '#34d399' : '#38bdf8',
                      background: isActive ? 'rgba(52, 211, 153, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                      border: `1px solid ${isActive ? 'rgba(52, 211, 153, 0.3)' : 'rgba(56, 189, 248, 0.25)'}`,
                      padding: '3px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <span>{isActive ? '● Active in Chat' : 'Open in Main Chat'}</span>
                    {!isActive && <ArrowRight size={11} />}
                  </button>
                )}
              </div>

              {/* 4. Ticket Detail: Expanded Conversation Messages */}
              {isExpanded && (
                <div className="ticket-expanded-detail">
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MessageSquare size={13} color="#818cf8" />
                      <span>Support Conversation Transcript (#{t.id})</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {messages.length} messages
                    </span>
                  </div>

                  {isLoadingMessages ? (
                    <div style={{ textAlign: 'center', padding: 14, color: '#94a3b8', fontSize: '0.75rem' }}>
                      Loading conversation messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 12, color: '#64748b', fontSize: '0.75rem', border: '1px dashed var(--border-subtle)', borderRadius: 6 }}>
                      No messages recorded for this ticket.
                    </div>
                  ) : (
                    <div className="ticket-messages-list">
                      {messages.map((m) => {
                        const isCustomer = m.sender === 'customer';
                        const senderName = isCustomer ? (customer?.name || 'Customer') : 'Support Agent';

                        return (
                          <div
                            key={m.id}
                            className={`ticket-detail-message-row ${isCustomer ? 'customer' : 'agent'}`}
                          >
                            <div className="ticket-detail-avatar">
                              {isCustomer ? <User size={12} /> : <Bot size={12} />}
                            </div>
                            <div className="ticket-detail-bubble-wrap">
                              <div className="ticket-detail-sender-row">
                                <span className="ticket-detail-sender-name">{senderName}</span>
                                <span className="ticket-detail-timestamp">{formatDate(m.timestamp)}</span>
                              </div>
                              <div className="ticket-detail-bubble">
                                {m.message}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {t.resolutionSummary && (
                    <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 6 }}>
                      <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.72rem' }}>Ticket Resolution: </span>
                      <span style={{ color: '#e2e8f0', fontSize: '0.74rem' }}>{t.resolutionSummary}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: 24, border: '1px dashed var(--border-subtle)', borderRadius: 8 }}>
            No tickets found matching your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
