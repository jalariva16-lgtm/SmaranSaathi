import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Customer } from '../types';

interface CustomerSidebarProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onSelectScenario: (scenarioId: string) => void;
  activeScenarioId?: string;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onSelectScenario,
  activeScenarioId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="sidebar-customers">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <span className="sidebar-title">Customers ({customers.length})</span>
          <span className="tier-badge Enterprise" style={{ fontSize: '0.65rem' }}>
            Isolated Banks
          </span>
        </div>
        <div className="search-input-box">
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Key Scenarios */}
      <div className="scenario-presets-bar">
        <div className="scenario-presets-title">
          <Sparkles size={12} />
          <span>Key Scenarios</span>
        </div>
        <div className="scenario-chips">
          <button
            className={`scenario-chip ${activeScenarioId === 'scenario-1' ? 'active' : ''}`}
            onClick={() => onSelectScenario('scenario-1')}
          >
            <span>1. Rahul: Payment Failing (Initial)</span>
          </button>
          <button
            className={`scenario-chip ${activeScenarioId === 'scenario-2' ? 'active' : ''}`}
            onClick={() => onSelectScenario('scenario-2')}
          >
            <span>2. Rahul: Payment Failing Again (Recall)</span>
          </button>
          <button
            className={`scenario-chip ${activeScenarioId === 'scenario-3' ? 'active' : ''}`}
            onClick={() => onSelectScenario('scenario-3')}
          >
            <span>3. Rahul: Learn Preference (1-Step)</span>
          </button>
          <button
            className={`scenario-chip ${activeScenarioId === 'scenario-4' ? 'active' : ''}`}
            onClick={() => onSelectScenario('scenario-4')}
          >
            <span>4. Rahul: Upgrade Plan (Adapted)</span>
          </button>
          <button
            className={`scenario-chip ${activeScenarioId === 'scenario-5' ? 'active' : ''}`}
            onClick={() => onSelectScenario('scenario-5')}
          >
            <span>5. Priya: SSO Issue (Memory Isolation)</span>
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="customer-list">
        {filtered.map((customer) => {
          const isSelected = selectedCustomer?.id === customer.id;
          const initials = customer.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2);

          return (
            <div
              key={customer.id}
              className={`customer-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCustomer(customer)}
            >
              <div className="customer-avatar">{initials}</div>
              <div className="customer-info-preview">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="customer-name">{customer.name}</span>
                  <span className={`tier-badge ${customer.accountTier}`}>{customer.accountTier}</span>
                </div>
                <div className="customer-company">{customer.company}</div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: '20px 10px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
            No customers match "{searchTerm}"
          </div>
        )}
      </div>
    </aside>
  );
};
