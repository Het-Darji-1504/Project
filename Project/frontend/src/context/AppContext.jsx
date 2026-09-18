'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationAPI } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentView, setCurrentView] = useState('landing');
  const [userRole, setUserRole] = useState('Tenant'); // 'Tenant' | 'Owner'
  const [searchPayload, setSearchPayload] = useState(null);

  // Modals & Drawers
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [matchedRoommate, setMatchedRoommate] = useState(null);

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isRoommateModalOpen, setIsRoommateModalOpen] = useState(false);
  const [isSplitExpenseModalOpen, setIsSplitExpenseModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPayRentModalOpen, setIsPayRentModalOpen] = useState(false);
  const [isMatchCelebrationOpen, setIsMatchCelebrationOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Saved Properties
  const [savedProperties, setSavedProperties] = useState(new Set(['prop-1']));

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch initial notifications
  const refreshNotifications = async () => {
    try {
      const res = await NotificationAPI.getNotifications();
      if (res && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, []);

  const navigateTo = (viewId, payload = null) => {
    setCurrentView(viewId);
    if (payload) setSearchPayload(payload);
    if (viewId === 'owner') setUserRole('Owner');
    if (viewId === 'dashboard') setUserRole('Tenant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveProperty = (propId) => {
    setSavedProperties(prev => {
      const next = new Set(prev);
      if (next.has(propId)) {
        next.delete(propId);
        showToast('Removed from saved properties');
      } else {
        next.add(propId);
        showToast('Property saved to your shortlist!');
      }
      return next;
    });
  };

  const openPropertyDetails = (prop) => {
    setSelectedProperty(prop);
    setIsPropertyModalOpen(true);
  };

  const closePropertyDetails = () => {
    setIsPropertyModalOpen(false);
  };

  const openRoommateProfile = (roommate) => {
    setSelectedRoommate(roommate);
    setIsRoommateModalOpen(true);
  };

  const closeRoommateProfile = () => {
    setIsRoommateModalOpen(false);
  };

  const triggerMatchCelebration = (roommate) => {
    setMatchedRoommate(roommate);
    setIsMatchCelebrationOpen(true);
  };

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      navigateTo,
      userRole,
      setUserRole,
      searchPayload,
      setSearchPayload,

      // Modals
      selectedProperty,
      setSelectedProperty,
      openPropertyDetails,
      closePropertyDetails,
      isPropertyModalOpen,

      selectedRoommate,
      openRoommateProfile,
      closeRoommateProfile,
      isRoommateModalOpen,

      matchedRoommate,
      triggerMatchCelebration,
      isMatchCelebrationOpen,
      setIsMatchCelebrationOpen,

      isSplitExpenseModalOpen,
      setIsSplitExpenseModalOpen,
      isReportIssueModalOpen,
      setIsReportIssueModalOpen,
      isAddPropertyModalOpen,
      setIsAddPropertyModalOpen,
      isNotificationDrawerOpen,
      setIsNotificationDrawerOpen,
      isProfileModalOpen,
      setIsProfileModalOpen,
      isPayRentModalOpen,
      setIsPayRentModalOpen,

      // Saved properties
      savedProperties,
      toggleSaveProperty,

      // Notifications
      notifications,
      unreadCount,
      refreshNotifications,

      // Toasts
      toasts,
      showToast,
      removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
