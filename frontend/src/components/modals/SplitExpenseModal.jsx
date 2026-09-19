'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseAPI } from '../../services/api';

export default function SplitExpenseModal() {
  const {
    isSplitExpenseModalOpen,
    setIsSplitExpenseModalOpen,
    showToast
  } = useApp();

  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('Electricity');
  const [submitting, setSubmitting] = useState(false);

  if (!isSplitExpenseModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !totalAmount) return;

    setSubmitting(true);
    try {
      const res = await ExpenseAPI.createSplitExpense({
        title,
        totalAmount: Number(totalAmount),
        category,
        splitWith: ['Rahul Verma']
      });
      showToast(res.message || 'Split expense created!');
      setIsSplitExpenseModalOpen(false);
      setTitle('');
      setTotalAmount('');
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const amountNum = Number(totalAmount) || 0;
  const perPerson = Math.round(amountNum / 2);

  return (
    <div className="modal-overlay open" onClick={() => setIsSplitExpenseModalOpen(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Split Shared Household Expense</h3>
          <button className="modal-close-btn" onClick={() => setIsSplitExpenseModalOpen(false)}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Expense Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Torrent Power Electricity Bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Total Bill Amount (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 2400"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Electricity">⚡ Electricity / Power</option>
              <option value="Internet">🌐 High-Speed Wi-Fi</option>
              <option value="Groceries">🛒 Groceries & Kitchen Supplies</option>
              <option value="Water">💧 Drinking Water Cans</option>
              <option value="Maid">🧹 Housekeeping / Cook</option>
              <option value="Other">📦 Other Miscellaneous</option>
            </select>
          </div>

          {/* Equal Split Preview */}
          <div style={{ background: 'var(--bg-body)', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Equal 50/50 Split Calculation:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span>Your Share: <strong>₹{perPerson.toLocaleString('en-IN')}</strong></span>
              <span>Rahul Verma owes: <strong>₹{perPerson.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add & Send UPI Payment Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
