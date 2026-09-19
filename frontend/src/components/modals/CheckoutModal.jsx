'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentAPI } from '../../services/api';

export default function CheckoutModal() {
  const {
    isCheckoutModalOpen,
    closeAccommodationCheckout,
    checkoutProperty,
    currentUser,
    showToast
  } = useApp();

  const [step, setStep] = useState(1); // 1: Accommodation, 2: Rental Details, 3: Breakdown, 4: Tenant Details, 5: Payment, 6: Confirmed
  const [durationMonths, setDurationMonths] = useState(3);
  const [moveInDate, setMoveInDate] = useState('2026-10-01');
  const [tenantName, setTenantName] = useState(currentUser?.fullName || '');
  const [tenantEmail, setTenantEmail] = useState(currentUser?.email || '');
  const [tenantPhone, setTenantPhone] = useState(currentUser?.phone || '+91 98250 12345');
  const [aadhaarNumber, setAadhaarNumber] = useState('•••• •••• 8841');
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  if (!isCheckoutModalOpen || !checkoutProperty) return null;

  const prop = checkoutProperty;
  const baseRent = Number(prop.rent) || 18000;
  const deposit = Number(prop.deposit) || baseRent * 2;
  const maintenance = prop.costBreakdown?.find(c => c.label.toLowerCase().includes('maintenance'))?.amount || 1200;
  const utilities = prop.costBreakdown?.find(c => c.label.toLowerCase().includes('power') || c.label.toLowerCase().includes('electricity'))?.amount || 2500;
  const commuteCost = prop.trueCostDetails?.commuteEstimate || 1200;
  const otherLivingCost = prop.trueCostDetails?.groceryEstimate || 2500;

  const totalMonthlyCost = baseRent + maintenance + utilities;
  const trueMonthlyLivingCost = baseRent + commuteCost + otherLivingCost + maintenance;
  const initialDueToday = baseRent + deposit;

  // Calculate move-out date
  const calculateMoveOut = (inDate, months) => {
    try {
      const d = new Date(inDate);
      d.setMonth(d.getMonth() + parseInt(months));
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '2026-12-31';
    }
  };

  const moveOutDate = calculateMoveOut(moveInDate, durationMonths);

  const handleExecutePayment = async () => {
    setLoading(true);
    try {
      const payload = {
        propertyId: prop.id,
        propertyName: prop.title,
        tenantName: tenantName || currentUser?.fullName || 'Resident',
        tenantEmail: tenantEmail || currentUser?.email || '',
        tenantPhone,
        duration: `${durationMonths} Months`,
        moveInDate,
        moveOutDate,
        monthlyRent: baseRent,
        refundableDeposit: deposit,
        maintenanceFee: maintenance,
        estimatedUtilities: utilities,
        serviceFee: 0,
        totalInitialDue: initialDueToday
      };

      const res = await PaymentAPI.accommodationCheckout(payload);
      if (res && res.success) {
        setReceiptData({
          receiptNumber: res.receiptNumber,
          transactionId: res.transactionId,
          amountPaid: initialDueToday,
          paidAt: new Date().toLocaleString('en-IN')
        });
        setStep(6);
        showToast('Accommodation reservation confirmed! Initial payment held securely in Stripe Escrow.', 'success');
      } else {
        showToast(res.message || 'Payment processing failed.', 'error');
      }
    } catch (err) {
      showToast('Payment gateway error. Please retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 1200, padding: '16px' }}>
      <div className="modal-container" style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', padding: '28px' }}>
        {/* Step Indicator Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Accommodation Booking • Step {step} of 6
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--slate-900)', margin: '4px 0 0' }}>
              {step === 1 && '1. Space Summary'}
              {step === 2 && '2. Rental Duration & Dates'}
              {step === 3 && '3. Transparent Price Breakdown'}
              {step === 4 && '4. True Cost of Living'}
              {step === 5 && '5. Resident KYC Details'}
              {step === 6 && '6. Booking Confirmed 🎉'}
            </h2>
          </div>
          <button
            onClick={() => {
              closeAccommodationCheckout();
              setStep(1);
            }}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: 'var(--slate-200)', borderRadius: '2px', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / 6) * 100}%`, background: 'var(--primary-600)', transition: 'width 0.3s ease' }} />
        </div>

        {/* STEP 1: PROPERTY SUMMARY */}
        {step === 1 && (
          <div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', height: '180px', marginBottom: '16px' }}>
              <img src={prop.image || prop.images?.[0]} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-verified" style={{ marginBottom: '6px' }}>✓ Verified Space &amp; Ownership</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>{prop.title}</h3>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', margin: '4px 0 0' }}>{prop.locality}, {prop.city}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-600)' }}>₹{baseRent.toLocaleString('en-IN')}<span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>/mo</span></div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Zero Brokerage</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>Type</span>
                <strong style={{ fontSize: '0.88rem' }}>{prop.type}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>Area</span>
                <strong style={{ fontSize: '0.88rem' }}>{prop.sqft || '950'} sq.ft</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>Furnishing</span>
                <strong style={{ fontSize: '0.88rem' }}>{prop.furnished || 'Furnished'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                Continue to Rental Dates →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RENTAL DETAILS (2-4 MONTH SHORT STAY SUPPORT) */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '18px' }}>
              Nestera supports flexible short-term youth accommodation with short-stay rental windows.
            </p>

            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '8px' }}>
              Select Rental Duration (2–4 Months Supported)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[2, 3, 4].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: durationMonths === m ? '2px solid var(--primary-600)' : '1.5px solid var(--slate-200)',
                    background: durationMonths === m ? '#EEF2FF' : 'var(--white)',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: durationMonths === m ? 'var(--primary-800)' : 'var(--slate-800)' }}>
                    {m} Months
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Short Stay</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Move-In Date
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={e => setMoveInDate(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Calculated Move-Out
                </label>
                <input
                  type="date"
                  value={moveOutDate}
                  readOnly
                  className="search-input"
                  style={{ width: '100%', padding: '10px', background: '#F1F5F9', color: 'var(--slate-600)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>
                Review Price Breakdown →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSPARENT PRICE BREAKDOWN */}
        {step === 3 && (
          <div>
            <div style={{ background: '#F8FAFC', border: '1.5px solid var(--slate-200)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '12px', textTransform: 'uppercase' }}>
                Monthly Recurring Expenses
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-600)' }}>Monthly Base Rent</span>
                <strong>₹{baseRent.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-600)' }}>Society Maintenance</span>
                <strong>₹{maintenance.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-600)' }}>Estimated Utilities (Electricity &amp; Water)</span>
                <strong>₹{utilities.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '10px', color: 'var(--emerald-600)' }}>
                <span>Nestera Platform Fee</span>
                <strong>₹0 (Zero Brokerage)</strong>
              </div>
              <div style={{ borderTop: '1px solid var(--slate-300)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800 }}>
                <span>Total Monthly Cost</span>
                <span style={{ color: 'var(--primary-600)' }}>₹{totalMonthlyCost.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>

            {/* Refundable Security Deposit Clearly Separated */}
            <div style={{ background: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: '#065F46', fontSize: '0.95rem' }}>
                  🔒 Refundable Security Deposit
                </span>
                <span style={{ fontWeight: 800, color: '#065F46', fontSize: '1.1rem' }}>
                  ₹{deposit.toLocaleString('en-IN')}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#047857', margin: 0, lineHeight: 1.4 }}>
                <strong>Important:</strong> This deposit is 100% refundable within 7 business days of checkout. It is held securely in escrow and is NOT a monthly fee.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#EEF2FF', borderRadius: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-900)' }}>Total Due Today (1st Mo + Deposit):</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary-700)' }}>₹{initialDueToday.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(4)}>
                Inspect True Cost of Living →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TRUE COST OF LIVING */}
        {step === 4 && (
          <div>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginBottom: '16px' }}>
              Unlike traditional portals that hide living expenses, Nestera estimates your complete lifestyle budget:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--slate-200)' }}>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--slate-800)' }}>Monthly Rent + Maintenance</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Fixed accommodation base</div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>₹{(baseRent + maintenance).toLocaleString('en-IN')}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--slate-200)' }}>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--slate-800)' }}>Estimated Commute (BRTS / Metro / Shared Auto)</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Average transit to Nirma/CEPT/GIFT City</div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>₹{commuteCost.toLocaleString('en-IN')}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--slate-200)' }}>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--slate-800)' }}>Estimated Living &amp; Cook/Groceries</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Average student/young professional share</div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>₹{otherLivingCost.toLocaleString('en-IN')}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: '#F0FDF4', borderRadius: '10px', border: '1.5px solid #86EFAC' }}>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#166534' }}>Estimated True Monthly Cost</strong>
                  <div style={{ fontSize: '0.75rem', color: '#15803D' }}>Total realistic out-of-pocket projection</div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#166534' }}>₹{trueMonthlyLivingCost.toLocaleString('en-IN')}<span style={{ fontSize: '0.8rem' }}>/mo</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(5)}>
                Proceed to Tenant Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: TENANT DETAILS & STRIKE ESCROW PAYMENT */}
        {step === 5 && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={tenantName}
                  onChange={e => setTenantName(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={tenantEmail}
                  onChange={e => setTenantEmail(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={tenantPhone}
                    onChange={e => setTenantPhone(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', padding: '10px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Aadhaar / KYC ID
                  </label>
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={e => setAadhaarNumber(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', padding: '10px' }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div style={{ background: '#F8FAFC', border: '1.5px solid var(--slate-200)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--slate-600)', fontSize: '0.88rem' }}>1st Month Rent:</span>
                <span style={{ fontWeight: 700 }}>₹{baseRent.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-600)', fontSize: '0.88rem' }}>Refundable Security Deposit:</span>
                <span style={{ fontWeight: 700 }}>₹{deposit.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--slate-300)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>Amount Charged to Stripe Escrow:</strong>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary-600)' }}>₹{initialDueToday.toLocaleString('en-IN')}</strong>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '8px', marginBottom: 0 }}>
                🔒 Card/UPI details are processed directly by Stripe AES-256 compliant servers. Nestera never stores your card credentials.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setStep(4)}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
                disabled={loading}
                onClick={handleExecutePayment}
              >
                {loading ? 'Processing via Stripe Escrow...' : `Pay ₹${initialDueToday.toLocaleString('en-IN')} with Stripe Checkout →`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: CONFIRMATION & RECEIPT */}
        {step === 6 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
              Accommodation Booked!
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Your reservation has been locked with Zero Brokerage guarantee and confirmed on Supabase.
            </p>

            <div style={{ background: '#F8FAFC', border: '1.5px dashed var(--slate-300)', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.82rem' }}>Receipt Number:</span>
                <span style={{ fontWeight: 800, color: 'var(--slate-800)', fontSize: '0.88rem' }}>{receiptData?.receiptNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.82rem' }}>Stripe Transaction ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--primary-700)' }}>{receiptData?.transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.82rem' }}>Tenant Name:</span>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{tenantName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.82rem' }}>Property:</span>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{prop.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--slate-500)', fontSize: '0.82rem' }}>Rental Window:</span>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{moveInDate} to {moveOutDate} ({durationMonths} Mo)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--slate-200)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--slate-800)', fontWeight: 800 }}>Amount Deposited in Escrow:</span>
                <span style={{ fontWeight: 900, color: 'var(--emerald-600)', fontSize: '1.05rem' }}>₹{receiptData?.amountPaid?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  window.print();
                }}
              >
                🖨️ Print Receipt
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  closeAccommodationCheckout();
                  setStep(1);
                }}
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
