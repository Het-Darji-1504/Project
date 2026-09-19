'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function RoleSelectModal() {
  const { isRoleSelectModalOpen, setIsRoleSelectModalOpen, setIsAuthModalOpen, setAuthMode, setSelectedPreRole } = useApp();
  const [selectedRole, setSelectedRole] = useState(null);

  if (!isRoleSelectModalOpen) return null;

  const handleContinue = () => {
    if (!selectedRole) return;
    setSelectedPreRole(selectedRole);
    setAuthMode('signup');
    setIsRoleSelectModalOpen(false);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 1100 }}>
      <div className="modal-container" style={{ maxWidth: '560px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Permanent Account Setup
          </span>
          <button
            onClick={() => setIsRoleSelectModalOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            ×
          </button>
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '8px' }}>
          How will you use Nestera?
        </h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginBottom: '24px' }}>
          Select your primary role. This choice is <strong>permanent</strong> and ensures your profile, security permissions, and tools are custom-tailored.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          {/* Tenant Card */}
          <div
            onClick={() => setSelectedRole('tenant')}
            style={{
              padding: '24px 20px',
              borderRadius: '16px',
              border: selectedRole === 'tenant' ? '2.5px solid var(--primary-600)' : '2px solid var(--slate-200)',
              background: selectedRole === 'tenant' ? '#EEF2FF' : 'var(--white)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative'
            }}
          >
            {selectedRole === 'tenant' && (
              <span style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary-600)', fontWeight: 800 }}>
                ✓ Selected
              </span>
            )}
            <span style={{ fontSize: '2.5rem' }}>🏠</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
              I&apos;m a Tenant
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', margin: 0, lineHeight: 1.45 }}>
              Find short-term student housing & roommates. Manage rent, 24/7 maintenance, and Move-In/Move-Out condition vault.
            </p>
          </div>

          {/* Owner Card */}
          <div
            onClick={() => setSelectedRole('owner')}
            style={{
              padding: '24px 20px',
              borderRadius: '16px',
              border: selectedRole === 'owner' ? '2.5px solid var(--primary-600)' : '2px solid var(--slate-200)',
              background: selectedRole === 'owner' ? '#EEF2FF' : 'var(--white)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative'
            }}
          >
            {selectedRole === 'owner' && (
              <span style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary-600)', fontWeight: 800 }}>
                ✓ Selected
              </span>
            )}
            <span style={{ fontSize: '2.5rem' }}>🏢</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
              I&apos;m a Property Owner
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', margin: 0, lineHeight: 1.45 }}>
              List verified spaces, manage active/found statuses, collect Stripe rent, and review utility OCR documents.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setIsRoleSelectModalOpen(false)}
            className="btn btn-secondary"
            style={{ padding: '10px 20px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="btn btn-primary"
            style={{
              padding: '10px 28px',
              opacity: selectedRole ? 1 : 0.5,
              cursor: selectedRole ? 'pointer' : 'not-allowed'
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
