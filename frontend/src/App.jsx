import React, { useState, useEffect, useMemo } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import LoginOverlay from './components/auth/LoginOverlay.jsx';
import Header from './components/layout/Header.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import DashboardKPIs from './components/dashboard/DashboardKPIs.jsx';
import DeliveryTable from './components/delivery/DeliveryTable.jsx';
import AuditHistory from './components/audit/AuditHistory.jsx';
import UserAdmin from './components/admin/UserAdmin.jsx';
import VehicleDrawer from './components/delivery/VehicleDrawer.jsx';
import Settings from './components/settings/Settings.jsx';
import { useVehicles } from './hooks/useVehicles.js';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { vehicles, fetchVehicles } = useVehicles();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState('KVR TATA');
  const [settings, setSettings] = useState({
    companyName: 'KVR TATA',
    companyPhone: '+91 98470 12345',
    companyEmail: 'support@kvrgroup.com',
    companyAddress: 'KVR Group, NH 66, Perinthalmanna, Kerala',
    branches: ['Perinthalmanna'],
    theme: 'light',
    enableAlerts: true
  });

  // Load Settings from Backend DB once user session is confirmed
  useEffect(() => {
    if (!user) return;
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          setCompanyName(data.companyName || 'KVR TATA');
          // Apply theme to document.body
          document.body.className = `theme-${data.theme || 'light'}`;
        }
      } catch (error) {
        console.error("Failed to load settings from server:", error);
      }
    }
    loadSettings();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchVehicles();
      // Default to 'All Branches' ('') instead of user.branch on load
      setSelectedBranch('');
    }
  }, [user, fetchVehicles]);

  const branches = useMemo(() => {
    const branchesSet = new Set(['Perinthalmanna', ...(settings.branches || [])]);
    if (user && user.branch) branchesSet.add(user.branch);
    vehicles.forEach(v => { if (v.branch) branchesSet.add(v.branch); });
    return Array.from(branchesSet).sort();
  }, [vehicles, user, settings.branches]);

  // While session restore is in progress, show a minimal spinner
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', fontFamily: "'Poppins', sans-serif", color: '#475569', fontSize: '0.9rem', gap: '10px' }}>
        <div style={{ width: '20px', height: '20px', border: '2px solid #cbd5e1', borderTop: '2px solid #003b71', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <LoginOverlay companyName={companyName} />;
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
    <div className="app-container" style={{ flexDirection: 'row' }}>
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        companyName={companyName}
      />
      
      <div className="main-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <Header 
          activeTab={activeTab} 
          selectedBranch={selectedBranch} 
          setSelectedBranch={setSelectedBranch} 
          branches={branches} 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        
        <main className="content-wrapper" id="app-main">
          {activeTab === 'dashboard' && (
            <DashboardKPIs 
              vehicles={vehicles} 
              activeBranch={selectedBranch} 
              setSelectedBranch={setSelectedBranch}
              branches={branches}
            />
          )}
          {activeTab === 'delivery' && <DeliveryTable vehicles={vehicles} branches={branches} openDrawer={handleOpenDrawer} />}
          {activeTab === 'audit' && <AuditHistory />}
          {activeTab === 'users' && user.role === 'ADMIN' && <UserAdmin branches={branches} />}
          {activeTab === 'settings' && <Settings branches={branches} settings={settings} setSettings={setSettings} companyName={companyName} setCompanyName={setCompanyName} />}
        </main>
      </div>

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
