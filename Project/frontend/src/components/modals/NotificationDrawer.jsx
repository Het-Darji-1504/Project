'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationAPI } from '../../services/api';

export default function NotificationDrawer() {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    refreshNotifications,
    navigateTo,
    showToast
  } = useApp();

  if (!isNotificationDrawerOpen) return null;

  const handleNotificationClick = async (notif) => {
    try {
      await NotificationAPI.markAsRead(notif.id);
      refreshNotifications();
    } catch (e) {
      console.error(e);
    }
    setIsNotificationDrawerOpen(false);
    if (notif.actionTarget) {
      navigateTo(notif.actionTarget);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationAPI.markAllRead();
      refreshNotifications();
      showToast('All notifications marked as read');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="drawer-overlay open" onClick={() => setIsNotificationDrawerOpen(false)}>
      <div className="notification-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Notification Center</h3>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
                {notifications.filter(n => !n.read).length} New
              </span>
            )}
          </div>
          <button className="modal-close-btn" onClick={() => setIsNotificationDrawerOpen(false)}>✕</button>
        </div>

        {/* Quick action strip */}
        <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </button>
        </div>

        {/* Drawer Items */}
        <div className="drawer-body-scroll">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notif-item-card ${n.read ? '' : 'unread'}`}
              onClick={() => handleNotificationClick(n)}
              style={{ cursor: 'pointer' }}
            >
              <div className="notif-top">
                <span className={`badge ${n.priority === 'urgent' ? 'badge-rose' : (n.priority === 'important' ? 'badge-amber' : 'badge-primary')}`}>
                  {n.priority?.toUpperCase()}
                </span>
                <span className="notif-time">{n.time}</span>
              </div>
              <h4 className="notif-title">{n.title}</h4>
              <p className="notif-msg">{n.message}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {n.actionText} →
                </span>
                {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
