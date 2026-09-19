'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseAPI } from '../../services/api';
import { MOCK_DATA } from '../../services/mockData';

export default function DashboardView() {
  const {
    currentUser,
    setIsPayRentModalOpen,
    setIsStripePaymentModalOpen,
    setIsProofVaultModalOpen,
    setIsRoommateContractModalOpen,
    setIsSplitExpenseModalOpen,
    showToast
  } = useApp();

  const [expenses, setExpenses] = useState([]);
  const lease = MOCK_DATA.currentUser.currentLease;

  const loadExpenses = () => {
    ExpenseAPI.getExpenses().then(res => {
      if (res && res.data) {
        setExpenses(res.data);
      }
    });
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const residentName = currentUser?.fullName || 'Resident';

  const handleSettleBalances = async () => {
    try {
      const res = await ExpenseAPI.settleBalances();
      showToast(res.message || 'Balances settled!');
      loadExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  const totalOwedByYou = expenses
    .filter(e => e.isOwedByYou && !e.isSettled)
    .reduce((sum, e) => sum + e.yourShare, 0);

  const totalOwedToYou = expenses
    .filter(e => !e.isOwedByYou && !e.isSettled)
    .reduce((sum, e) => sum + (e.totalAmount - e.yourShare), 0);

  return (
    <section className="view-panel active" id="view-dashboard">
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>ACTIVE TENANCY HUB</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Greetings, {residentName} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Live rental dashboard for {lease.propertyName} • {lease.locality}
          </p>
        </div>

        {/* Rent Payment Urgent Banner */}
        <div className="rent-due-banner">
          <div className="rent-banner-left">
            <div className="rent-due-clock">
              <span className="clock-num">{lease.daysLeft}</span>
              <span className="clock-label">Days Left</span>
            </div>
            <div>
              <div className="rent-status-title">Upcoming Rent Payment: ₹{lease.monthlyRent.toLocaleString('en-IN')}</div>
              <p className="rent-status-subtitle">
                Due on {lease.nextDueDate} • Escrow Protected Zero-Penalty Guarantee
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ backgroundColor: '#FFFFFF', color: 'var(--primary)', fontWeight: 800, whiteSpace: 'nowrap' }}
              onClick={() => setIsStripePaymentModalOpen(true)}
            >
              Pay Rent with Stripe →
            </button>
            <button
              className="btn"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#FFFFFF', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}
              onClick={() => setIsPayRentModalOpen(true)}
            >
              UPI Fast Pay
            </button>
          </div>
        </div>

        {/* Legal & Condition Security Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', margin: '20px 0 28px' }}>
          <div 
            className="kpi-card" 
            style={{ cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => setIsProofVaultModalOpen(true)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>📸</span>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Proof Vault (Move-in / Out)</div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Verify photographic condition evidence, electricity/water meters, and signed condition checklists to protect 100% of your deposit.
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
              Open Proof Vault →
            </div>
          </div>

          <div 
            className="kpi-card" 
            style={{ cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => setIsRoommateContractModalOpen(true)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>📜</span>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Roommate Constitution</div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Review your signed flatmate agreement, quiet hours (11 PM), chore rotations, guest limits, and mutual dispute resolution clauses.
            </p>
            <div style={{ marginTop: '10px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
              Review Constitution →
            </div>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="tenant-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Security Deposit Held</div>
            <div className="kpi-value">₹{lease.deposit.toLocaleString('en-IN')}</div>
            <div className="kpi-subtext" style={{ color: 'var(--accent-emerald-dark)' }}>
              ✓ 100% Escrow Monitored
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">You Owe Roommates</div>
            <div className="kpi-value" style={{ color: totalOwedByYou > 0 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
              ₹{totalOwedByYou.toLocaleString('en-IN')}
            </div>
            <div className="kpi-subtext">Split across pending utilities</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Roommates Owe You</div>
            <div className="kpi-value" style={{ color: 'var(--accent-emerald-dark)' }}>
              ₹{totalOwedToYou.toLocaleString('en-IN')}
            </div>
            <div className="kpi-subtext">Reimbursements pending</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Current Roommates</div>
            <div className="kpi-value" style={{ fontSize: '1.25rem' }}>{lease.roommates.join(', ')}</div>
            <div className="kpi-subtext">Flat 402 co-residents</div>
          </div>
        </div>

        {/* Shared Household Expense Split Section */}
        <div className="expenses-section-card" style={{ marginTop: '36px' }}>
          <div className="expenses-header">
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Shared Household Expenses</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                Split electricity, high-speed Wi-Fi, drinking water cans, and grocery bills with 1-click UPI.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-sm btn-outline"
                onClick={handleSettleBalances}
              >
                Settle All Balances
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setIsSplitExpenseModalOpen(true)}
              >
                + Split New Expense
              </button>
            </div>
          </div>

          {/* Expenses Table / List */}
          <div className="expenses-list">
            {expenses.map(exp => (
              <div key={exp.id} className="expense-item-row">
                <div className="expense-cat-icon">
                  {exp.category === 'Electricity' ? '⚡' : (exp.category === 'Internet' ? '🌐' : (exp.category === 'Water' ? '💧' : '🛒'))}
                </div>
                <div className="expense-details">
                  <h4 className="expense-title">{exp.title}</h4>
                  <p className="expense-meta">
                    Paid by {exp.paidBy} • {exp.date} • Due: {exp.dueDate}
                  </p>
                </div>
                <div className="expense-amount-col">
                  <div className="expense-total">Total: ₹{exp.totalAmount.toLocaleString('en-IN')}</div>
                  <div className={`expense-share ${exp.isSettled ? 'settled' : (exp.isOwedByYou ? 'owed-by-you' : 'owed-to-you')}`}>
                    {exp.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
