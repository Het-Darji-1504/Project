'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const {
    currentView,
    navigateTo,
    userRole,
    setUserRole,
    unreadCount,
    setIsNotificationDrawerOpen,
    setIsProfileModalOpen,
    showToast
  } = useApp();

  const handleRoleToggle = (role) => {
    setUserRole(role);
    if (role === 'Owner') {
      navigateTo('owner');
      showToast('Switched to Owner/Host View (8 Properties)');
    } else {
      navigateTo('dashboard');
      showToast('Switched to Tenant View (Het Darji)');
    }
  };

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
            Nestora
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
              className={`nav-link ${currentView === 'valuation' ? 'active' : ''}`}
              onClick={() => navigateTo('valuation')}
            >
              Valuation
            </a>
          </li>
          <li>
            <a
              className={`nav-link ${currentView === 'agreement' ? 'active' : ''}`}
              onClick={() => navigateTo('agreement')}
            >
              Agreement
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
          {/* Role Toggle */}
          <div className="role-badge-toggle" title="Switch between Tenant and Landlord mode">
            <button
              className={`role-btn ${userRole === 'Tenant' ? 'active' : ''}`}
              onClick={() => handleRoleToggle('Tenant')}
            >
              Tenant
            </button>
            <button
              className={`role-btn ${userRole === 'Owner' ? 'active' : ''}`}
              onClick={() => handleRoleToggle('Owner')}
            >
              Owner
            </button>
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
            <img src="/avatar.png" alt="Het Darji" className="user-avatar" />
            <span className="user-nav-name">Het Darji</span>
            <span className="badge badge-verified" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
              ✓ Verified
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
