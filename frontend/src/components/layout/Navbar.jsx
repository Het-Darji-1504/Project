'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const {
    currentView,
    navigateTo,
    userRole,
    currentUser,
    isLoggedIn,
    unreadCount,
    setIsNotificationDrawerOpen,
    setIsProfileModalOpen,
    setIsProofVaultModalOpen,
    setIsRoommateContractModalOpen,
    setIsAuthModalOpen,
    setAuthMode,
    startOnboarding,
    showToast,
    getProfileAvatar
  } = useApp();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <div className="brand" onClick={() => navigateTo('landing')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div className="brand-name">
            Nestera
            <span className="brand-tag">Transparent</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          <li>
            <a
              className={`nav-link ${currentView === 'landing' ? 'active' : ''}`}
              onClick={() => navigateTo('landing')}
            >
              Home
            </a>
          </li>
          <li>
            <a
              className={`nav-link ${currentView === 'discovery' ? 'active' : ''}`}
              onClick={() => navigateTo('discovery')}
            >
              Find a Space
            </a>
          </li>
          <li>
            <a
              className={`nav-link ${currentView === 'roommates' ? 'active' : ''}`}
              onClick={() => navigateTo('roommates')}
            >
              Roommates
            </a>
          </li>
          <li>
            <a
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('dashboard')}
            >
              Tenant Hub
            </a>
          </li>
          <li>
            <a
              className={`nav-link ${currentView === 'maintenance' ? 'active' : ''}`}
              onClick={() => navigateTo('maintenance')}
            >
              Maintenance
            </a>
          </li>
          <li>
            <a
              className="nav-link"
              onClick={() => setIsProofVaultModalOpen(true)}
              title="Inspect move-in/move-out condition evidence"
            >
              Proof Vault
            </a>
          </li>
          <li>
            <a
              className="nav-link"
              onClick={() => setIsRoommateContractModalOpen(true)}
              title="Generate roommate house constitution"
            >
              House Constitution
            </a>
          </li>
          {userRole === 'Owner' && (
            <li>
              <a
                className={`nav-link ${currentView === 'owner' ? 'active' : ''}`}
                onClick={() => navigateTo('owner')}
              >
                Owner Hub
              </a>
            </li>
          )}
        </ul>

        {/* Actions & User Profile */}
        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              {/* Permanent Role Indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EEF2FF',
                  border: '1px solid var(--primary-200)',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: 'var(--primary-700)'
                }}
                title="Permanent role assigned at registration (Authority: Supabase Auth/DB)"
              >
                <span>{userRole === 'Owner' ? '🏢 Owner' : '🏠 Tenant'}</span>
                <span style={{ fontSize: '0.68rem', background: 'var(--white)', padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--primary-200)' }}>
                  🔒 Fixed
                </span>
              </div>

              {/* Notification Bell */}
              <button
                className="notif-bell-btn"
                onClick={() => setIsNotificationDrawerOpen(prev => !prev)}
                title="View notifications"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge-count">{unreadCount}</span>
                )}
              </button>

              {/* User Quick Profile */}
              <div
                className="user-nav-profile"
                onClick={() => setIsProfileModalOpen(true)}
                title="View account & verification"
                style={{ cursor: 'pointer' }}
              >
                <img src={getProfileAvatar(currentUser)} alt="User" className="user-avatar" />
                <span className="user-nav-name">{currentUser?.fullName || 'Resident'}</span>
                <span className="badge badge-verified" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                  ✓ KYC
                </span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
              >
                Sign In
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={startOnboarding}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
