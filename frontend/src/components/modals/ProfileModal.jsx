'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_DATA } from '../../services/mockData';

export default function ProfileModal() {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    showToast,
    currentUser,
    getProfileAvatar,
    userRole,
    setIsProfileCompletionOpen
  } = useApp();

  if (!isProfileModalOpen) return null;

  const displayName = currentUser?.fullName || currentUser?.name || 'Resident';
  const displayEmail = currentUser?.email || 'resident@example.com';
  const displayPhone = currentUser?.phone || '+91 98250 12345';
  const displayAvatar = getProfileAvatar(currentUser);
  const user = MOCK_DATA.currentUser;

  return (
    <div className="modal-overlay open" onClick={() => setIsProfileModalOpen(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Account & Identity Verification</h3>
          <button className="modal-close-btn" onClick={() => setIsProfileModalOpen(false)}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* User Profile Header */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <img
              src={displayAvatar}
              alt={displayName}
              style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{displayName}</h3>
                <span className="badge badge-verified">✓ 100% Verified</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                {displayEmail} • {displayPhone}
              </p>
              <div style={{ marginTop: '4px' }}>
                <span className="badge badge-primary">Active {userRole || 'Tenant'}</span>
              </div>
            </div>
          </div>

          {/* DigiLocker KYC Verified Card */}
          <div style={{ background: 'var(--accent-emerald-light)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--accent-emerald-dark)', fontSize: '0.9rem' }}>
                🛡️ Government DigiLocker Aadhaar KYC
              </span>
              <span className="badge badge-emerald">AUTHENTICATED</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <div>Aadhaar Card: <strong>{user.verified.aadhaar}</strong></div>
              <div>Student / Academic Proof: <strong>Nirma University Student ID ✓</strong></div>
              <div>Zero Police Clearance Flag: <strong>Verified Clear ✓</strong></div>
            </div>
          </div>

          {/* Profile Details: Gender & DOB */}
          <div style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Personal Profile</h4>
              <button
                className="btn btn-sm btn-ghost"
                style={{ fontSize: '0.75rem', padding: '2px 8px', color: 'var(--primary)' }}
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsProfileCompletionOpen(true);
                }}
              >
                ✏️ Edit Details
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Gender: </span>
                <strong>{currentUser?.gender || 'Not specified'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>DOB: </span>
                <strong>{currentUser?.dateOfBirth || currentUser?.date_of_birth || 'Not specified'}</strong>
              </div>
            </div>
          </div>

          {/* Current Lease Summary */}
          <div style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>Active Lease Deed</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div><strong>Property:</strong> {user.currentLease.propertyName}</div>
              <div><strong>Address:</strong> {user.currentLease.locality}</div>
              <div><strong>Monthly Rent:</strong> ₹{user.currentLease.monthlyRent.toLocaleString('en-IN')}/mo</div>
              <div><strong>Roommates:</strong> {user.currentLease.roommates.join(', ')}</div>
            </div>
          </div>

          <button
            className="btn btn-outline"
            style={{ width: '100%' }}
            onClick={() => {
              setIsProfileModalOpen(false);
              showToast('Verification credentials refreshed with DigiLocker');
            }}
          >
            Refresh KYC Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
