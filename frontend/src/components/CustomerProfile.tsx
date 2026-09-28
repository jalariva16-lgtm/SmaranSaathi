import React from 'react';
import { Building, Mail, Monitor, Shield, CreditCard, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { Customer } from '../types';

interface CustomerProfileProps {
  customer: Customer;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer }) => {
  const formattedDate = new Date(customer.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="panel-content-scroll">
      {/* Visual Separation Callout Banner */}
      <div
        style={{
          padding: '10px 14px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: '#c7d2fe' }}>
          <Info size={14} color="#818cf8" />
          <span>Customer Profile vs Hindsight Memory</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
          <strong>Customer Profile</strong> contains stable customer identity, subscription, and environment data.
          <br />
          <strong>Hindsight Memory</strong> contains what the AI learned from past conversations (solutions, recurring issues, preferences).
        </p>
      </div>

      {/* Primary Customer Profile Card */}
      <div className="ticket-card" style={{ gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="customer-avatar" style={{ width: 42, height: 42, fontSize: '1rem' }}>
              {customer.name[0]}
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{customer.name}</div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                ID: {customer.id}
              </div>
            </div>
          </div>
          <span className={`tier-badge ${customer.accountTier}`}>{customer.accountTier}</span>
        </div>

        {/* Identity & Company Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 8,
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} color="#818cf8" />
              Email
            </span>
            <span style={{ color: '#f8fafc', fontWeight: 500 }}>{customer.email}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building size={13} color="#818cf8" />
              Company
            </span>
            <span style={{ color: '#f8fafc', fontWeight: 600 }}>{customer.company}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13} color="#818cf8" />
              Customer Since
            </span>
            <span style={{ color: '#e2e8f0' }}>{formattedDate}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="#34d399" />
              Account Status
            </span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>Active / Verified</span>
          </div>
        </div>
      </div>

      {/* Environment & Configuration Information */}
      <div className="ticket-card" style={{ gap: 10 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Environment & System Configuration
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Monitor size={13} />
              Operating System
            </span>
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{customer.environment.os}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Monitor size={13} />
              Browser Version
            </span>
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{customer.environment.browser}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={13} />
              Authentication Method
            </span>
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{customer.environment.authMethod}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={13} />
              Payment Method
            </span>
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{customer.environment.paymentMethod}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
