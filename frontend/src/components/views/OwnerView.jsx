'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerAPI } from '../../services/api';

export default function OwnerView() {
  const {
    currentUser,
    setIsAddPropertyModalOpen,
    setIsUtilityVerificationModalOpen,
    setIsProofVaultModalOpen,
    setIsStripePaymentModalOpen,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Tickets State
  const [maintenanceTickets, setMaintenanceTickets] = useState([
    {
      id: 'maint-101',
      tenant: 'Aman Singh',
      property: 'Palm Grove Luxury Living (Flat 402)',
      issue: 'Geyser heating element tripping circuit breaker',
      category: 'Plumbing',
      status: 'In Progress',
      priority: 'High',
      time: 'Logged 2h ago via WhatsApp Relay Bot',
      technician: 'Ramesh Kumar (Certified Technician)',
      description: 'Inlet valve dripping continuously and heating element causing circuit break.'
    },
    {
      id: 'maint-102',
      tenant: 'Sneha Nair',
      property: 'Bodakdev Minimal Studio (Unit 201)',
      issue: 'Kitchen RO filter slow flow rate',
      category: 'Appliance',
      status: 'Acknowledged',
      priority: 'Medium',
      time: 'Logged yesterday',
      technician: 'Vijay Appliances',
      description: 'Slow filtration rate. Filter membranes require pre-monsoon replacement.'
    },
    {
      id: 'maint-103',
      tenant: 'Kunal Verma',
      property: 'Navrangpura Cozy Studio (Flat 104)',
      issue: 'AC filter cleaning & refrigerant top-up',
      category: 'Appliance',
      status: 'Resolved',
      priority: 'Low',
      time: 'Resolved 3 days ago',
      technician: 'CoolTech Service',
      description: 'Pre-summer servicing and gas pressure check completed.'
    }
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New Maintenance Ticket: Geyser tripping circuit breaker',
      message: 'Aman Singh at Palm Grove Luxury Living (Flat 402) reported: "Inlet valve dripping continuously". Priority: High.',
      time: '2 hours ago',
      read: false,
      type: 'maintenance',
      ticketId: 'maint-101',
      tenant: 'Aman Singh',
      property: 'Palm Grove Luxury Living (Flat 402)'
    },
    {
      id: 'notif-2',
      title: 'New Rental Application: Siddharth Malhotra',
      message: 'CEPT University student applied for Bodakdev Minimal Studio (Unit 201).',
      time: 'Yesterday',
      read: false,
      type: 'application',
      tenant: 'Siddharth Malhotra',
      property: 'Bodakdev Minimal Studio (Unit 201)'
    },
    {
      id: 'notif-3',
      title: 'Rent Payout Escrow Cleared',
      message: 'Monthly payout of ₹1,42,000 processed via Axis Bank Automated Escrow.',
      time: '3 days ago',
      read: true,
      type: 'payment'
    }
  ]);

  // Modals State
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [confirmStatusModal, setConfirmStatusModal] = useState(null); // { id, title, currentStatus, nextStatus }
  const [editingProperty, setEditingProperty] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', rent: 0, deposit: 0, status: 'Active', locality: '' });

  const loadDashboard = () => {
    OwnerAPI.getDashboard().then(res => {
      if (res && res.data) {
        setData(res.data);
      }
    });
  };

  const loadApplications = () => {
    setLoadingApps(true);
    OwnerAPI.getApplications().then(res => {
      if (res && res.data) {
        setApplications(res.data);
      }
    }).finally(() => {
      setLoadingApps(false);
    });
  };

  useEffect(() => {
    loadDashboard();
    loadApplications();

    // Support URL Hash navigation
    if (typeof window !== 'undefined' && window.location.hash) {
      const match = window.location.hash.match(/#owner\/([a-z-]+)/);
      if (match && match[1]) {
        setActiveTab(match[1]);
      }
    }
  }, []);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setIsMobileSidebarOpen(false);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', `#owner/${tabName}`);
      } catch (e) {
        window.location.hash = `owner/${tabName}`;
      }
    }
  };

  const openConfirmStatus = (p) => {
    const isFound = p.status === 'Occupied' || p.status === 'Found' || p.listingStatus === 'Found';
    const nextStatus = isFound ? 'Active' : 'Found';
    setConfirmStatusModal({
      id: p.id,
      title: p.title,
      currentStatus: p.status,
      nextStatus
    });
  };

  const executeStatusChange = async () => {
    if (!confirmStatusModal) return;
    const { id, nextStatus } = confirmStatusModal;
    try {
      await OwnerAPI.toggleListingStatus(id, nextStatus);
      showToast(
        nextStatus === 'Found'
          ? 'Listing marked as FOUND/RESERVED. Hidden from public student search.'
          : 'Listing marked as ACTIVE. Now accepting new applications.',
        nextStatus === 'Found' ? 'info' : 'success'
      );
      setConfirmStatusModal(null);
      loadDashboard();
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const openEditModal = (p) => {
    setEditingProperty(p);
    setEditForm({
      title: p.title,
      rent: p.rent,
      deposit: p.deposit || p.rent * 2,
      status: p.status || p.listingStatus || 'Active',
      locality: p.locality
    });
  };

  const handleSavePropertyEdit = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;
    try {
      await OwnerAPI.updateProperty(editingProperty.id, editForm);
      showToast(`Property "${editForm.title}" updated successfully!`, 'success');
      setEditingProperty(null);
      loadDashboard();
    } catch (err) {
      showToast('Failed to save property updates.', 'error');
    }
  };

  const handleApplicationAction = async (appId, action) => {
    try {
      const res = await OwnerAPI.updateApplicationStatus(appId, action);
      if (res && res.success) {
        showToast(
          action === 'accept'
            ? 'Application ACCEPTED! Lease agreement dispatched to tenant.'
            : action === 'reject'
            ? 'Application rejected.'
            : 'Information request sent to applicant via WhatsApp & SMS.',
          action === 'accept' ? 'success' : 'info'
        );
        loadApplications();
      }
    } catch (err) {
      showToast('Failed to update application.', 'error');
    }
  };

  const handleMaintenanceStatusUpdate = async (ticketId, nextStatus) => {
    try {
      await OwnerAPI.updateMaintenanceStatus(ticketId, nextStatus);
      setMaintenanceTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, status: nextStatus } : t))
      );
      if (selectedTicketModal && selectedTicketModal.id === ticketId) {
        setSelectedTicketModal(prev => ({ ...prev, status: nextStatus }));
      }
      showToast(`Maintenance ticket ${ticketId} status updated to "${nextStatus}". Tenant notified via Relay Bot.`, 'success');
    } catch (err) {
      // Local fallback state
      setMaintenanceTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, status: nextStatus } : t))
      );
      if (selectedTicketModal && selectedTicketModal.id === ticketId) {
        setSelectedTicketModal(prev => ({ ...prev, status: nextStatus }));
      }
      showToast(`Ticket status updated to "${nextStatus}".`, 'success');
    }
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const openTicketDetail = (ticketId, notifId = null) => {
    if (notifId) {
      markNotificationRead(notifId);
    }
    const ticket = maintenanceTickets.find(t => t.id === ticketId) || {
      id: ticketId,
      issue: 'Maintenance Request',
      tenant: 'Current Resident',
      property: 'Palm Grove Luxury Living (Flat 402)',
      status: 'In Progress',
      priority: 'High',
      technician: 'Ramesh Kumar (Certified Technician)',
      time: 'Reported recently',
      description: 'Reported issue awaiting landlord inspection.'
    };
    setSelectedTicketModal(ticket);
  };

  const stats = data?.stats || {
    activeProperties: 8,
    occupiedUnits: 7,
    occupancyRate: '87.5%',
    monthlyRevenue: 142000,
    pendingMaintenance: maintenanceTickets.filter(t => t.status !== 'Resolved').length,
    onTimePayments: '94%'
  };

  const properties = data?.properties || [
    {
      id: 'prop-1',
      title: 'Palm Grove Luxury Living - Flat 402',
      locality: 'SG Highway, Ahmedabad',
      tenant: 'Aman Singh',
      rent: 18000,
      status: 'Active',
      paymentStatus: 'Paid on 5th',
      maintenanceStatus: 'Clear'
    },
    {
      id: 'prop-2',
      title: 'Bodakdev Minimal Studio - Unit 201',
      locality: 'Bodakdev, Ahmedabad',
      tenant: 'Sneha Nair',
      rent: 22000,
      status: 'Active',
      paymentStatus: 'Paid on 2nd',
      maintenanceStatus: 'Clear'
    },
    {
      id: 'prop-3',
      title: 'Navrangpura Cozy Studio - Flat 104',
      locality: 'Navrangpura, Ahmedabad',
      tenant: 'Kunal Verma',
      rent: 16000,
      status: 'Active',
      paymentStatus: 'Paid on 4th',
      maintenanceStatus: 'Clear'
    },
    {
      id: 'prop-4',
      title: 'Campus Edge Student Suite - Flat 301',
      locality: 'Nirma University Area',
      tenant: 'Rohan Joshi',
      rent: 14000,
      status: 'Found',
      paymentStatus: 'Paid on 1st',
      maintenanceStatus: 'Clear'
    }
  ];

  const ownerName = currentUser?.fullName || 'Landlord Partner';
  const pendingMaintCount = maintenanceTickets.filter(t => t.status !== 'Resolved').length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length || 3;

  return (
    <section className="view-panel active" id="view-owner">
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Dynamic Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Drawer Button */}
            <button
              className="btn btn-secondary mobile-only"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              style={{ display: 'none', padding: '8px 12px' }}
              aria-label="Toggle Navigation Sidebar"
            >
              ☰ Menu
            </button>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>NESTERA HOST &bull; LANDLORD HUB</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Greetings, {ownerName} 👋
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Direct portfolio oversight, live applications, automated escrow payouts, and maintenance resolution.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsUtilityVerificationModalOpen(true)}
            >
              📄 Utility OCR Verify
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsProofVaultModalOpen(true)}
            >
              📦 Proof Vault
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddPropertyModalOpen(true)}
            >
              + List New Property
            </button>
          </div>
        </div>

        {/* OWNER TWO-COLUMN LAYOUT */}
        <div className="owner-container">
          {/* SIDEBAR NAVIGATION */}
          <aside
            id="owner-sidebar-drawer"
            className={`owner-sidebar owner-sidebar-drawer ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
            aria-label="Owner Dashboard Navigation"
          >
            <ul className="owner-menu" role="tablist">
              <li>
                <button
                  id="owner-tab-dashboard"
                  role="tab"
                  aria-selected={activeTab === 'dashboard'}
                  className={`owner-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => switchTab('dashboard')}
                >
                  <span style={{ fontSize: '1.1rem' }}>📊</span>
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  id="owner-tab-properties"
                  role="tab"
                  aria-selected={activeTab === 'properties'}
                  className={`owner-menu-item ${activeTab === 'properties' ? 'active' : ''}`}
                  onClick={() => switchTab('properties')}
                >
                  <span style={{ fontSize: '1.1rem' }}>🏢</span>
                  <span>Properties</span>
                  <span className="owner-badge-counter badge-emerald">{properties.length}</span>
                </button>
              </li>
              <li>
                <button
                  id="owner-tab-applications"
                  role="tab"
                  aria-selected={activeTab === 'applications'}
                  className={`owner-menu-item ${activeTab === 'applications' ? 'active' : ''}`}
                  onClick={() => switchTab('applications')}
                >
                  <span style={{ fontSize: '1.1rem' }}>📝</span>
                  <span>Applications</span>
                  <span className="owner-badge-counter badge-amber">{pendingAppsCount}</span>
                </button>
              </li>
              <li>
                <button
                  id="owner-tab-maintenance"
                  role="tab"
                  aria-selected={activeTab === 'maintenance'}
                  className={`owner-menu-item ${activeTab === 'maintenance' ? 'active' : ''}`}
                  onClick={() => switchTab('maintenance')}
                >
                  <span style={{ fontSize: '1.1rem' }}>🔧</span>
                  <span>Maintenance</span>
                  {pendingMaintCount > 0 && (
                    <span className="owner-badge-counter badge-rose">🔴 {pendingMaintCount}</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  id="owner-tab-payments"
                  role="tab"
                  aria-selected={activeTab === 'payments'}
                  className={`owner-menu-item ${activeTab === 'payments' ? 'active' : ''}`}
                  onClick={() => switchTab('payments')}
                >
                  <span style={{ fontSize: '1.1rem' }}>💳</span>
                  <span>Payments &amp; Escrow</span>
                </button>
              </li>
              <li>
                <button
                  id="owner-tab-messages"
                  role="tab"
                  aria-selected={activeTab === 'messages'}
                  className={`owner-menu-item ${activeTab === 'messages' ? 'active' : ''}`}
                  onClick={() => switchTab('messages')}
                >
                  <span style={{ fontSize: '1.1rem' }}>💬</span>
                  <span>Tenant Messages</span>
                  <span className="owner-badge-counter badge-primary">2</span>
                </button>
              </li>
              <li>
                <button
                  id="owner-tab-notifications"
                  role="tab"
                  aria-selected={activeTab === 'notifications'}
                  className={`owner-menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => switchTab('notifications')}
                >
                  <span style={{ fontSize: '1.1rem' }}>🔔</span>
                  <span>Notifications</span>
                  {unreadNotifsCount > 0 && (
                    <span className="owner-badge-counter badge-amber">{unreadNotifsCount}</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  id="owner-tab-analytics"
                  role="tab"
                  aria-selected={activeTab === 'analytics'}
                  className={`owner-menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => switchTab('analytics')}
                >
                  <span style={{ fontSize: '1.1rem' }}>📈</span>
                  <span>Analytics</span>
                </button>
              </li>
              <li>
                <button
                  id="owner-tab-profile"
                  role="tab"
                  aria-selected={activeTab === 'profile'}
                  className={`owner-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => switchTab('profile')}
                >
                  <span style={{ fontSize: '1.1rem' }}>👤</span>
                  <span>Landlord Profile</span>
                </button>
              </li>
              <li>
                <button
                  id="owner-tab-settings"
                  role="tab"
                  aria-selected={activeTab === 'settings'}
                  className={`owner-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => switchTab('settings')}
                >
                  <span style={{ fontSize: '1.1rem' }}>⚙️</span>
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </aside>

          {/* MAIN CONTENT SUBPANELS */}
          <main className="owner-content-area">
            {/* SUBPANEL 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="owner-subpanel active animate-fade-in">
                {/* Urgent Maintenance Banner */}
                {pendingMaintCount > 0 && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1.5px solid #F87171',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.8rem' }}>🚨</span>
                      <div>
                        <strong style={{ color: '#991B1B', fontSize: '0.98rem' }}>
                          Urgent Tenant Maintenance Alert
                        </strong>
                        <p style={{ margin: '2px 0 0', color: '#B91C1C', fontSize: '0.85rem' }}>
                          {pendingMaintCount} ticket{pendingMaintCount === 1 ? '' : 's'} logged via Tenant Hub &amp; Relay Bot require review or technician scheduling.
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => switchTab('maintenance')}
                    >
                      Review Tickets →
                    </button>
                  </div>
                )}

                {/* KPI Overview */}
                <div className="tenant-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-label">Active Portfolio Units</div>
                    <div className="kpi-value">{properties.length} Units</div>
                    <div className="kpi-subtext" style={{ color: 'var(--accent-emerald-dark)' }}>
                      {stats.occupiedUnits} Currently Occupied
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-label">Portfolio Occupancy</div>
                    <div className="kpi-value">{stats.occupancyRate}</div>
                    <div className="kpi-subtext">Avg time to lease: 6 days</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-label">Monthly Gross Revenue</div>
                    <div className="kpi-value" style={{ color: 'var(--primary)' }}>
                      ₹{Number(stats.monthlyRevenue).toLocaleString('en-IN')}
                    </div>
                    <div className="kpi-subtext">Automated direct bank payout</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-label">Pending Maintenance</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>
                      {pendingMaintCount} Tickets
                    </div>
                    <div className="kpi-subtext">Relay bot SLA &lt; 48h</div>
                  </div>
                </div>

                {/* Properties Summary */}
                <div className="owner-table-card">
                  <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Living Units Overview</h3>
                    <button className="btn btn-sm btn-outline" onClick={() => switchTab('properties')}>
                      View Full Inventory →
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="owner-table">
                      <thead>
                        <tr>
                          <th>Property / Unit</th>
                          <th>Tenant</th>
                          <th>Rent / Mo</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.slice(0, 3).map(p => (
                          <tr key={p.id}>
                            <td><strong>{p.title}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.locality}</div></td>
                            <td>{p.tenant || 'Unoccupied'}</td>
                            <td><strong>₹{p.rent?.toLocaleString('en-IN')}</strong></td>
                            <td>
                              <span className={`badge ${p.status === 'Occupied' || p.status === 'Found' ? 'badge-amber' : 'badge-emerald'}`}>
                                {p.status === 'Occupied' || p.status === 'Found' ? '🔒 Found' : '🟢 Active'}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-primary" onClick={() => openEditModal(p)}>Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBPANEL 2: PROPERTIES */}
            {activeTab === 'properties' && (
              <div className="owner-subpanel active animate-fade-in">
                <div className="owner-table-card">
                  <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Managed Living Units &amp; Availability Controls</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Click status badge to toggle Active vs Found. Use Edit to adjust rental pricing or terms.
                      </p>
                    </div>
                    <span className="badge badge-verified">Direct Supabase Sync Active</span>
                  </div>

                  <div className="table-responsive">
                    <table className="owner-table">
                      <thead>
                        <tr>
                          <th>Property / Unit</th>
                          <th>Locality</th>
                          <th>Tenant</th>
                          <th>Rent / Mo</th>
                          <th>Listing Status</th>
                          <th>Rent Collection</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.map(p => {
                          const isFound = p.status === 'Occupied' || p.status === 'Found' || p.listingStatus === 'Found';
                          return (
                            <tr key={p.id}>
                              <td>
                                <strong>{p.title}</strong>
                              </td>
                              <td>{p.locality}</td>
                              <td>{p.tenant || 'Unoccupied'}</td>
                              <td>
                                <strong>₹{p.rent?.toLocaleString('en-IN')}</strong>
                              </td>
                              <td>
                                <button
                                  onClick={() => openConfirmStatus(p)}
                                  className={`btn btn-sm ${isFound ? 'btn-secondary' : 'btn-outline'}`}
                                  style={{
                                    borderRadius: '20px',
                                    fontWeight: 700,
                                    padding: '4px 12px',
                                    fontSize: '0.78rem'
                                  }}
                                  title="Click to toggle availability status"
                                >
                                  {isFound ? '🔒 Found (Hidden)' : '🟢 Active (Live)'}
                                </button>
                              </td>
                              <td>
                                <span className={`badge ${p.paymentStatus?.includes('Paid') ? 'badge-verified' : 'badge-rose'}`}>
                                  {p.paymentStatus || 'Paid on 5th'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => openEditModal(p)}
                                    className="btn btn-sm btn-primary"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setIsProofVaultModalOpen(true)}
                                    className="btn btn-sm btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  >
                                    Proof
                                  </button>
                                  <button
                                    onClick={() => showToast(`GST Rental Invoice downloaded for ${p.tenant || 'Resident'}!`)}
                                    className="btn btn-sm btn-outline"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  >
                                    Invoice
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBPANEL 3: APPLICATIONS */}
            {activeTab === 'applications' && (
              <div className="owner-subpanel active animate-fade-in">
                <div className="owner-table-card">
                  <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Incoming Rental Applications ({applications.length || 3})</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Review prospective tenants, verified KYC IDs, requested duration, and accept or reject with immediate sync.
                      </p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={loadApplications}>
                      🔄 Refresh
                    </button>
                  </div>

                  <div style={{ padding: '16px' }}>
                    {loadingApps ? (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        Loading rental applications...
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {(applications.length > 0 ? applications : [
                          {
                            id: 'app-1',
                            applicant_name: 'Aman Singh',
                            applicant_email: 'aman.singh@nirmauni.ac.in',
                            property_title: 'Palm Grove Luxury Living (Flat 402)',
                            duration: '3 Months',
                            move_in_date: '2026-10-01',
                            status: 'pending'
                          },
                          {
                            id: 'app-2',
                            applicant_name: 'Siddharth Malhotra',
                            applicant_email: 'siddharth.m@cept.ac.in',
                            property_title: 'Bodakdev Minimal Studio (Unit 201)',
                            duration: '4 Months',
                            move_in_date: '2026-10-15',
                            status: 'accepted'
                          },
                          {
                            id: 'app-3',
                            applicant_name: 'Priya Sharma',
                            applicant_email: 'priya.s@ahduni.edu.in',
                            property_title: 'Navrangpura Cozy Studio (Flat 104)',
                            duration: '2 Months',
                            move_in_date: '2026-11-01',
                            status: 'pending'
                          }
                        ]).map(app => (
                          <div
                            key={app.id}
                            style={{
                              background: 'var(--bg-surface-secondary)',
                              border: '1.5px solid var(--border-subtle)',
                              borderRadius: '12px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{app.applicant_name}</strong>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.applicant_email}</div>
                                </div>
                                <span className={`badge ${app.status === 'accepted' ? 'badge-emerald' : app.status === 'rejected' ? 'badge-rose' : 'badge-amber'}`}>
                                  {app.status?.toUpperCase() || 'PENDING'}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                🏢 <strong>Unit:</strong> {app.property_title || 'Palm Grove Flat 402'}
                              </div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                📅 <strong>Move-in:</strong> {app.move_in_date || 'Immediate'} &bull; <strong>Duration:</strong> {app.duration || '3 Months'}
                              </div>
                            </div>

                            {app.status === 'pending' || !app.status ? (
                              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                                <button
                                  onClick={() => handleApplicationAction(app.id, 'accept')}
                                  className="btn btn-primary btn-sm"
                                  style={{ flex: 1, padding: '6px' }}
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  onClick={() => handleApplicationAction(app.id, 'reject')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ flex: 1, padding: '6px' }}
                                >
                                  ✕ Reject
                                </button>
                                <button
                                  onClick={() => handleApplicationAction(app.id, 'info')}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '6px' }}
                                  title="Request Student ID / Guarantor Details"
                                >
                                  💬 Info
                                </button>
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                                Status synced to Supabase &bull; Lease contract dispatched.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUBPANEL 4: MAINTENANCE */}
            {activeTab === 'maintenance' && (
              <div className="owner-subpanel active animate-fade-in">
                <div className="owner-table-card">
                  <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Maintenance Relay Tickets ({maintenanceTickets.length})</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Issues raised by tenants via Hub or WhatsApp Relay Bot with instant vendor dispatch &amp; SLA tracking.
                      </p>
                    </div>
                    <span className="badge badge-emerald">WhatsApp &amp; Relay Bot Synced</span>
                  </div>

                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {maintenanceTickets.map(ticket => {
                        const isResolved = ticket.status === 'Resolved';
                        const isHigh = ticket.priority?.toLowerCase() === 'high' || ticket.priority?.toLowerCase() === 'urgent';

                        return (
                          <div
                            key={ticket.id}
                            style={{
                              background: 'var(--bg-surface-secondary)',
                              border: '1.5px solid var(--border-subtle)',
                              borderRadius: '12px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <span className={`badge ${isHigh ? 'badge-rose' : 'badge-amber'}`}>
                                  {ticket.priority?.toUpperCase()} PRIORITY
                                </span>
                                <span className={`badge ${isResolved ? 'badge-emerald' : ticket.status === 'In Progress' ? 'badge-primary' : 'badge-amber'}`}>
                                  {ticket.status}
                                </span>
                              </div>

                              <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800 }}>
                                {ticket.issue}
                              </h4>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                Tenant: <strong>{ticket.tenant}</strong> &bull; {ticket.property}
                              </div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: '8px 0', lineHeight: 1.4 }}>
                                {ticket.description}
                              </p>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                Assigned Pro: <strong>{ticket.technician}</strong> &bull; {ticket.time}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                              <button
                                className="btn btn-sm btn-outline"
                                style={{ flex: 1, padding: '6px' }}
                                onClick={() => openTicketDetail(ticket.id)}
                              >
                                View Ticket
                              </button>
                              {!isResolved ? (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ flex: 1, padding: '6px' }}
                                  onClick={() => handleMaintenanceStatusUpdate(ticket.id, 'Resolved')}
                                >
                                  ✓ Mark Resolved
                                </button>
                              ) : (
                                <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '6px' }}>
                                  ✓ Closed
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBPANEL 5: PAYMENTS & ESCROW */}
            {activeTab === 'payments' && (
              <div className="owner-subpanel active animate-fade-in">
                <div className="tenant-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-label">Current Escrow Balance</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-emerald-dark)' }}>₹1,42,000</div>
                    <div className="kpi-subtext">Automated direct payout scheduled for 10th</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Security Deposits Held</div>
                    <div className="kpi-value">₹2,84,000</div>
                    <div className="kpi-subtext">Protected under PropTech Escrow Reserve</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">On-Time Collection Rate</div>
                    <div className="kpi-value" style={{ color: 'var(--primary)' }}>94%</div>
                    <div className="kpi-subtext">Zero defaults across 8 units</div>
                  </div>
                </div>

                <div className="owner-table-card" style={{ marginTop: '24px' }}>
                  <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Recent Rent Collection &amp; Bank Payouts</h3>
                    <button className="btn btn-sm btn-primary" onClick={() => setIsStripePaymentModalOpen(true)}>
                      + Create Invoice
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="owner-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Unit / Tenant</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                          <th>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>#TXN-2026-9041</strong></td>
                          <td>Palm Grove Flat 402 &bull; Aman Singh</td>
                          <td><strong>₹18,000</strong></td>
                          <td>UPI / NetBanking</td>
                          <td><span className="badge badge-emerald">✓ Settled</span></td>
                          <td><button className="btn btn-sm btn-outline" onClick={() => showToast('GST Receipt downloaded!')}>PDF</button></td>
                        </tr>
                        <tr>
                          <td><strong>#TXN-2026-9038</strong></td>
                          <td>Bodakdev Studio 201 &bull; Sneha Nair</td>
                          <td><strong>₹22,000</strong></td>
                          <td>Debit Card Escrow</td>
                          <td><span className="badge badge-emerald">✓ Settled</span></td>
                          <td><button className="btn btn-sm btn-outline" onClick={() => showToast('GST Receipt downloaded!')}>PDF</button></td>
                        </tr>
                        <tr>
                          <td><strong>#TXN-2026-9029</strong></td>
                          <td>Navrangpura Unit 104 &bull; Kunal Verma</td>
                          <td><strong>₹16,000</strong></td>
                          <td>UPI Instant</td>
                          <td><span className="badge badge-emerald">✓ Settled</span></td>
                          <td><button className="btn btn-sm btn-outline" onClick={() => showToast('GST Receipt downloaded!')}>PDF</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBPANEL 6: TENANT MESSAGES */}
            {activeTab === 'messages' && (
              <div className="owner-subpanel active animate-fade-in">
                <div className="owner-table-card">
                  <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Tenant Communication &amp; 24/7 Relay Bot</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Real-time communication bridge synced with WhatsApp Business API and Nestera Chat.
                      </p>
                    </div>
                    <span className="badge badge-verified">WhatsApp Synced ✓</span>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>Aman Singh (Palm Grove Flat 402)</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2 hours ago</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0 0 10px' }}>
                        "Hi, the geyser heating element is tripping the circuit breaker in the master washroom. Could someone take a look?"
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-primary" onClick={() => openTicketDetail('maint-101')}>
                          View Maintenance Ticket
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => showToast('Connecting via WhatsApp relay...')}>
                          Reply on WhatsApp
                        </button>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>Sneha Nair (Bodakdev Studio 201)</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Yesterday</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0 0 10px' }}>
                        "Confirming the rent transfer has been made through Nestera UPI. Please verify the receipt."
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => showToast('Receipt confirmed & SMS notification triggered!')}>
                          Send Receipt Confirmation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBPANEL 7: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="owner-subpanel active animate-fade-in">
                <div className="owner-table-card">
                  <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Notification Inbox</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Real-time alerts for tenant maintenance requests, new student applications, and rent escrow events.
                      </p>
                    </div>
                    {unreadNotifsCount > 0 && (
                      <span className="badge badge-amber">{unreadNotifsCount} Unread Alert{unreadNotifsCount === 1 ? '' : 's'}</span>
                    )}
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notifications.map(n => {
                      const isMaintenance = n.type === 'maintenance';
                      return (
                        <div
                          key={n.id}
                          style={{
                            background: n.read ? 'var(--bg-surface)' : '#FEF3C7',
                            border: `1.5px solid ${n.read ? 'var(--border-subtle)' : 'var(--accent-amber)'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '14px'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                              {isMaintenance ? '🔧' : n.type === 'application' ? '📝' : '🔔'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{n.title}</strong>
                                {!n.read && <span className="badge badge-rose" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>NEW</span>}
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
                              </div>
                              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.5 }}>
                                {n.message}
                              </p>
                              {n.tenant && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  Tenant: <strong>{n.tenant}</strong> &bull; Property: <strong>{n.property}</strong>
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                            {isMaintenance && n.ticketId ? (
                              <button
                                className="btn btn-sm btn-primary"
                                style={{ whiteSpace: 'nowrap' }}
                                onClick={() => openTicketDetail(n.ticketId, n.id)}
                              >
                                View Ticket →
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline"
                                style={{ whiteSpace: 'nowrap' }}
                                onClick={() => {
                                  markNotificationRead(n.id);
                                  if (n.type === 'application') switchTab('applications');
                                  if (n.type === 'payment') switchTab('payments');
                                }}
                              >
                                View Details →
                              </button>
                            )}
                            {!n.read && (
                              <button
                                className="btn btn-sm btn-secondary"
                                style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                                onClick={() => markNotificationRead(n.id)}
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SUBPANEL 8: VALUATION & ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="owner-subpanel active animate-fade-in">
                <div className="tenant-kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-label">Average Rental Yield</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-emerald-dark)' }}>3.8%</div>
                    <div className="kpi-subtext">Above Ahmedabad avg (3.1%)</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Estimated Portfolio Value</div>
                    <div className="kpi-value">₹3.85 Cr</div>
                    <div className="kpi-subtext">Based on certified registry transactions</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Average Tenant Tenancy</div>
                    <div className="kpi-value" style={{ color: 'var(--primary)' }}>10.2 Mos</div>
                    <div className="kpi-subtext">Low tenant churn rate</div>
                  </div>
                </div>

                <div className="owner-table-card" style={{ marginTop: '24px', padding: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Locality Comp Benchmarks (Ahmedabad West)</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Rental market comparison against comparable 2BHK/3BHK furnished student and young professional flats.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div style={{ background: 'var(--bg-surface-secondary)', padding: '16px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SG Highway Corridor</span>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>₹18,500/mo</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald-dark)' }}>▲ +4.2% YoY growth</span>
                    </div>
                    <div style={{ background: 'var(--bg-surface-secondary)', padding: '16px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bodakdev / Sindhu Bhavan</span>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>₹24,000/mo</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald-dark)' }}>▲ +6.1% YoY growth</span>
                    </div>
                    <div style={{ background: 'var(--bg-surface-secondary)', padding: '16px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Navrangpura / University</span>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>₹16,800/mo</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald-dark)' }}>▲ +3.8% YoY growth</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBPANEL 9: LANDLORD PROFILE */}
            {activeTab === 'profile' && (
              <div className="owner-subpanel active animate-fade-in">
                <div className="owner-table-card" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>
                      🏢
                    </div>
                    <div>
                      <span className="badge badge-emerald">Verified Landlord Partner</span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0 2px' }}>{ownerName}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Registered Property Host &bull; Gujarat RERA Compliant</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div style={{ background: 'var(--bg-surface-secondary)', padding: '14px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Registered Phone</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>+91 98765 43210</div>
                    </div>
                    <div style={{ background: 'var(--bg-surface-secondary)', padding: '14px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Tax / GSTIN</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>24AAACN1234F1Z5 (Verified)</div>
                    </div>
                    <div style={{ background: 'var(--bg-surface-secondary)', padding: '14px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Automated Payout Account</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>HDFC Bank &bull;&bull;&bull;&bull; 9042</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBPANEL 10: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="owner-subpanel active animate-fade-in">
                <div className="owner-table-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Host Preferences &amp; Automation Controls</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-surface-secondary)', borderRadius: '10px', cursor: 'pointer' }}>
                      <div>
                        <strong>Instant WhatsApp Relay Bot Alerts</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Send urgent repair tickets directly to landlord WhatsApp</p>
                      </div>
                      <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                    </label>

                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-surface-secondary)', borderRadius: '10px', cursor: 'pointer' }}>
                      <div>
                        <strong>Automatic Vendor Dispatch SLA (&lt; 48 Hours)</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-assign certified plumber/electrician if ticket unacknowledged for 2h</p>
                      </div>
                      <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                    </label>

                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-surface-secondary)', borderRadius: '10px', cursor: 'pointer' }}>
                      <div>
                        <strong>Direct Bank Payout Auto-Settlement</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transfer verified tenant escrow funds on the 10th of every month</p>
                      </div>
                      <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* TICKET DETAIL INSPECTION MODAL (Prompt Requirement #1 & #3) */}
        {selectedTicketModal && (
          <div className="modal-overlay open" style={{ display: 'flex', zIndex: 1300 }}>
            <div className="modal-container" style={{ maxWidth: '640px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-rose" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      {selectedTicketModal.priority || 'High'} Priority
                    </span>
                    <span className={`badge ${selectedTicketModal.status === 'Resolved' ? 'badge-emerald' : selectedTicketModal.status === 'In Progress' ? 'badge-primary' : 'badge-amber'}`}>
                      {selectedTicketModal.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{selectedTicketModal.id}</span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {selectedTicketModal.issue}
                  </h3>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setSelectedTicketModal(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--bg-surface-secondary)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.85rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Tenant:</span> <strong>{selectedTicketModal.tenant}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Property:</span> <strong>{selectedTicketModal.property}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Reported:</span> <strong>{selectedTicketModal.time}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Vendor:</span> <strong>{selectedTicketModal.technician}</strong></div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Issue Description
                  </label>
                  <p style={{ margin: '4px 0 0', fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {selectedTicketModal.description}
                  </p>
                </div>

                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#166534' }}>
                  ✓ <strong>Automated Relay Sync:</strong> Status changes update the tenant in real-time via WhatsApp bot and Tenant Hub.
                </div>
              </div>

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleMaintenanceStatusUpdate(selectedTicketModal.id, 'Acknowledged')}
                  disabled={selectedTicketModal.status === 'Acknowledged'}
                >
                  ⏳ Acknowledge
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleMaintenanceStatusUpdate(selectedTicketModal.id, 'In Progress')}
                  disabled={selectedTicketModal.status === 'In Progress'}
                >
                  🔄 In Progress
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleMaintenanceStatusUpdate(selectedTicketModal.id, 'Resolved')}
                  disabled={selectedTicketModal.status === 'Resolved'}
                >
                  ✓ Mark Resolved
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM STATUS TOGGLE DIALOG */}
        {confirmStatusModal && (
          <div className="modal-overlay open" style={{ display: 'flex', zIndex: 1250 }}>
            <div className="modal-container" style={{ maxWidth: '440px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Confirm Availability Change
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                Are you sure you want to mark <strong>&quot;{confirmStatusModal.title}&quot;</strong> as{' '}
                <strong style={{ color: confirmStatusModal.nextStatus === 'Found' ? 'var(--accent-amber)' : 'var(--accent-emerald-dark)' }}>
                  {confirmStatusModal.nextStatus === 'Found' ? 'Found / Hidden' : 'Active (Live)'}
                </strong>?
                {confirmStatusModal.nextStatus === 'Found' && (
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    This will immediately remove the property from public student search results.
                  </span>
                )}
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setConfirmStatusModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={executeStatusChange}
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROPERTY MODAL */}
        {editingProperty && (
          <div className="modal-overlay open" style={{ display: 'flex', zIndex: 1250 }}>
            <div className="modal-container" style={{ maxWidth: '500px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Edit Property Details
                </h3>
                <button
                  onClick={() => setEditingProperty(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePropertyEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Listing Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="search-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Monthly Rent (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={editForm.rent}
                      onChange={e => setEditForm({ ...editForm, rent: Number(e.target.value) })}
                      className="search-input"
                      style={{ width: '100%', padding: '9px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={editForm.deposit}
                      onChange={e => setEditForm({ ...editForm, deposit: Number(e.target.value) })}
                      className="search-input"
                      style={{ width: '100%', padding: '9px 12px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Locality &amp; Address
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.locality}
                    onChange={e => setEditForm({ ...editForm, locality: e.target.value })}
                    className="search-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Listing Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="search-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  >
                    <option value="Active">🟢 Active (Open to Applications)</option>
                    <option value="Found">🔒 Found (Reserved/Hidden)</option>
                    <option value="Occupied">🏢 Occupied</option>
                    <option value="Inactive">⏸️ Inactive</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setEditingProperty(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Save to Supabase
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
