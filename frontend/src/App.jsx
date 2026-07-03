import React, { useState, useEffect, useMemo } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import LoginOverlay from './components/auth/LoginOverlay.jsx';
import Header from './components/layout/Header.jsx';
import NavigationTabs from './components/layout/NavigationTabs.jsx';
import DashboardKPIs from './components/dashboard/DashboardKPIs.jsx';
import DeliveryTable from './components/delivery/DeliveryTable.jsx';
import AuditHistory from './components/audit/AuditHistory.jsx';
import UserAdmin from './components/admin/UserAdmin.jsx';
import VehicleDrawer from './components/delivery/VehicleDrawer.jsx';
import { useVehicles } from './hooks/useVehicles.js';

function AppContent() {
  const { user } = useAuth();
  const { vehicles, fetchVehicles } = useVehicles();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user, fetchVehicles]);

  const branches = useMemo(() => {
    const customBranches = JSON.parse(localStorage.getItem('kvr_custom_branches')) || [];
    const branchesSet = new Set(['Perinthalmanna', ...customBranches]);
    if (user && user.branch) branchesSet.add(user.branch);
    vehicles.forEach(v => { if (v.branch) branchesSet.add(v.branch); });
    return Array.from(branchesSet).sort();
  }, [vehicles, user]);

  if (!user) {
    return <LoginOverlay />;
  }

  const handleOpenDrawer = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedVehicle(null);
  };

  return (
    <div className="app-container">
      <Header />
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="content-wrapper" id="app-main">
        {activeTab === 'dashboard' && <DashboardKPIs vehicles={vehicles} activeBranch={user.branch} />}
        {activeTab === 'delivery' && <DeliveryTable vehicles={vehicles} branches={branches} openDrawer={handleOpenDrawer} />}
        {activeTab === 'audit' && <AuditHistory />}
        {activeTab === 'users' && user.role === 'ADMIN' && <UserAdmin branches={branches} />}
      </main>

      {isDrawerOpen && (
        <VehicleDrawer vehicle={selectedVehicle} branches={branches} onClose={handleCloseDrawer} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
