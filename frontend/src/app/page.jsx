'use client';

import React from 'react';
import { useApp } from '../context/AppContext';

// Layout
import Navbar from '../components/layout/Navbar';
import BottomNav from '../components/layout/BottomNav';
import ToastContainer from '../components/common/Toast';

// Views
import LandingView from '../components/views/LandingView';
import DiscoveryView from '../components/views/DiscoveryView';
import RoommatesView from '../components/views/RoommatesView';
import DashboardView from '../components/views/DashboardView';
import MaintenanceView from '../components/views/MaintenanceView';
import ValuationView from '../components/views/ValuationView';
import AgreementView from '../components/views/AgreementView';
import OwnerView from '../components/views/OwnerView';

// Modals & Drawers
import PropertyDetailsModal from '../components/modals/PropertyDetailsModal';
import RoommateModal from '../components/modals/RoommateModal';
import SplitExpenseModal from '../components/modals/SplitExpenseModal';
import ReportIssueModal from '../components/modals/ReportIssueModal';
import AddPropertyModal from '../components/modals/AddPropertyModal';
import NotificationDrawer from '../components/modals/NotificationDrawer';
import ProfileModal from '../components/modals/ProfileModal';
import PayRentModal from '../components/modals/PayRentModal';
import MatchCelebrationModal from '../components/modals/MatchCelebrationModal';

// Extended Modals & Widgets for addme.md Specifications
import RoleSelectModal from '../components/modals/RoleSelectModal';
import AuthModal from '../components/modals/AuthModal';
import ProofVaultModal from '../components/modals/ProofVaultModal';
import RoommateContractModal from '../components/modals/RoommateContractModal';
import UtilityVerificationModal from '../components/modals/UtilityVerificationModal';
import StripePaymentModal from '../components/modals/StripePaymentModal';
import CheckoutModal from '../components/modals/CheckoutModal';
import ProfileCompletionModal from '../components/modals/ProfileCompletionModal';
import MaintenanceChatWidget from '../components/common/MaintenanceChatWidget';

export default function Home() {
  const { currentView } = useApp();

  return (
    <div className="nestora-app-shell">
      {/* Navigation */}
      <Navbar />

      {/* Main View Router */}
      <main id="main-content" style={{ minHeight: 'calc(100vh - 72px)' }}>
        {currentView === 'landing' && <LandingView />}
        {currentView === 'discovery' && <DiscoveryView />}
        {currentView === 'roommates' && <RoommatesView />}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'maintenance' && <MaintenanceView />}
        {currentView === 'valuation' && <ValuationView />}
        {currentView === 'agreement' && <AgreementView />}
        {currentView === 'owner' && <OwnerView />}
      </main>

      {/* Mobile Tab Bar */}
      <BottomNav />

      {/* Global Modals & Drawers */}
      <PropertyDetailsModal />
      <RoommateModal />
      <SplitExpenseModal />
      <ReportIssueModal />
      <AddPropertyModal />
      <NotificationDrawer />
      <ProfileModal />
      <PayRentModal />
      <MatchCelebrationModal />

      {/* Extended Specification Modals */}
      <RoleSelectModal />
      <AuthModal />
      <ProofVaultModal />
      <RoommateContractModal />
      <UtilityVerificationModal />
      <StripePaymentModal />
      <CheckoutModal />
      <ProfileCompletionModal />

      {/* WhatsApp / Chat-Native Maintenance Relay Assistant */}
      <MaintenanceChatWidget />

      {/* Toast Feedback */}
      <ToastContainer />
    </div>
  );
}
