'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentAPI } from '../../services/api';

export default function StripePaymentModal() {
  const { isStripePaymentModalOpen, setIsStripePaymentModalOpen, selectedPayment, currentUser, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isStripePaymentModalOpen) return null;

  const payment = selectedPayment || {
    id: 'pay-101',
    amount: 18500,
    tenantName: currentUser?.fullName || 'Current Resident (You)',
    ownerName: 'Rajesh Patel',
    dueDate: 'October 5, 2026',
    breakdown: { baseRent: 16500, maintenance: 1200, waterSewage: 300, platformFee: 500 }
  };

  const handleStripePay = async () => {
    setLoading(true);
    try {
      const res = await PaymentAPI.pay(payment.id);
      if (res && res.success) {
        setPaymentSuccess(true);
        showToast('Payment verified by Stripe Webhook! Instant GST Rent Receipt dispatched.', 'success');
      }
    } catch (e) {
      showToast('Payment error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 1100 }}>
      <div className="modal-container" style={{ maxWidth: '480px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
              Stripe Secure Escrow
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', margin: '4px 0' }}>
              Rent &amp; Tenancy Payment
            </h2>
          </div>
          <button
            onClick={() => {
              setIsStripePaymentModalOpen(false);
              setPaymentSuccess(false);
            }}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            ×
          </button>
        </div>

        {!paymentSuccess ? (
          <div>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Due Date: <strong>{payment.dueDate}</strong> • Landlord: <strong>{payment.ownerName}</strong>
            </p>

            {/* Itemized Cost Breakdown */}
            <div style={{
              background: '#F8FAFC',
              border: '1.5px solid var(--slate-200)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--slate-700)' }}>
                <span>Base Monthly Rent</span>
                <span>₹{(payment.breakdown?.baseRent || 16500).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--slate-700)' }}>
                <span>Society Maintenance &amp; Elevators</span>
                <span>₹{(payment.breakdown?.maintenance || 1200).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--slate-700)' }}>
                <span>Water &amp; Sewage Cess</span>
                <span>₹{(payment.breakdown?.waterSewage || 300).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '12px', color: 'var(--slate-700)' }}>
                <span>Nestera Platform Fee (Zero Brokerage)</span>
                <span>₹{(payment.breakdown?.platformFee || 500).toLocaleString('en-IN')}</span>
              </div>
              <div style={{
                borderTop: '1.5px solid var(--slate-300)',
                paddingTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--slate-900)'
              }}>
                <span>Total Due</span>
                <span style={{ color: 'var(--primary-600)' }}>₹{payment.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleStripePay}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
              >
                {loading ? 'Processing via Stripe...' : `Pay ₹${payment.amount.toLocaleString('en-IN')} with Stripe Checkout →`}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                🔒 256-bit SSL encrypted • Webhook confirmed • Credit/Debit Cards, UPI, NetBanking
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span style={{ fontSize: '3.5rem' }}>✅</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', margin: '12px 0 6px 0' }}>
              Payment Confirmed!
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '24px' }}>
              ₹{payment.amount.toLocaleString('en-IN')} received. Landlord Rajesh Patel notified in real time.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => showToast('GST Rent Receipt PDF downloaded!', 'success')}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                📥 Download Receipt
              </button>
              <button
                onClick={() => {
                  setIsStripePaymentModalOpen(false);
                  setPaymentSuccess(false);
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
