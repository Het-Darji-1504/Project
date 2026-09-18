'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function PayRentModal() {
  const { isPayRentModalOpen, setIsPayRentModalOpen, showToast } = useApp();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paying, setPaying] = useState(false);

  if (!isPayRentModalOpen) return null;

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setIsPayRentModalOpen(false);
      showToast('₹18,000 Rent payment successful! GST rent receipt generated for tax exemption.');
    }, 1200);
  };

  return (
    <div className="modal-overlay open" onClick={() => setIsPayRentModalOpen(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pay Monthly Rent</h3>
          <button className="modal-close-btn" onClick={() => setIsPayRentModalOpen(false)}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Rent Breakdown */}
          <div style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span>Flat 402 Base Rent:</span>
              <strong>₹18,000</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--accent-emerald-dark)' }}>
              <span>Nestora Escrow Protection Fee:</span>
              <strong>₹0 (Free)</strong>
            </div>
            <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
              <span>Total Payable:</span>
              <span style={{ color: 'var(--primary)' }}>₹18,000</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Select Payment Method</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `2px solid ${paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: paymentMethod === 'upi' ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                />
                <div>
                  <strong>UPI (Google Pay / PhonePe / Paytm)</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Zero transaction surcharge • Instant GST receipt</div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `2px solid ${paymentMethod === 'netbanking' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: paymentMethod === 'netbanking' ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === 'netbanking'}
                  onChange={() => setPaymentMethod('netbanking')}
                />
                <div>
                  <strong>Net Banking (HDFC, ICICI, SBI, Axis)</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct NEFT / RTGS Escrow routing</div>
                </div>
              </label>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handlePay}
            disabled={paying}
          >
            {paying ? 'Processing Escrow Deposit...' : 'Authorize ₹18,000 Payment →'}
          </button>
        </div>
      </div>
    </div>
  );
}
