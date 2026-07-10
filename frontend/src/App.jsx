import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import LoginOverlay from './components/auth/LoginOverlay.jsx';
import Header from './components/layout/Header.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import { useVehicles } from './hooks/useVehicles.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Lazy-load all heavy route-level components — they are not needed until the user
// is authenticated and actively navigates to that tab. This removes recharts (4.8MB)
// and other large chunks from the initial JS bundle entirely.
const DashboardKPIs   = lazy(() => import('./components/dashboard/DashboardKPIs.jsx'));
const DeliveryTable   = lazy(() => import('./components/delivery/DeliveryTable.jsx'));
const AuditHistory    = lazy(() => import('./components/audit/AuditHistory.jsx'));
const UserAdmin       = lazy(() => import('./components/admin/UserAdmin.jsx'));
const VehicleDrawer   = lazy(() => import('./components/delivery/VehicleDrawer.jsx'));
const NewBookingDrawer = lazy(() => import('./components/delivery/NewBookingDrawer.jsx'));
const CrmDrawer       = lazy(() => import('./components/delivery/CrmDrawer.jsx'));
const Settings        = lazy(() => import('./components/settings/Settings.jsx'));

// Minimal inline fallback — a spinner that uses only inline styles (zero extra CSS needed)
function TabLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '10px', color: '#64748b', fontSize: '0.9rem' }}>
      <div style={{ width: '18px', height: '18px', border: '2px solid #cbd5e1', borderTop: '2px solid #003b71', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Loading...
    </div>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { vehicles, totalVehicles, currentPage, fetchVehicles } = useVehicles();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isCrmOpen, setIsCrmOpen] = useState(false);
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

  // Fire both data fetches in parallel with Promise.all so neither waits on the other
  useEffect(() => {
    if (!user) return;

    async function loadInitialData() {
      try {
        const [, settingsData] = await Promise.all([
          fetchVehicles(1, 25),
          fetch(`${API_BASE_URL}/api/settings`, { credentials: 'include' }).then(r => r.ok ? r.json() : null)
        ]);

        if (settingsData) {
          setSettings(settingsData);
          setCompanyName(settingsData.companyName || 'KVR TATA');
          document.body.className = `theme-${settingsData.theme || 'light'}`;
        }
      } catch (error) {
        console.error('Failed to load initial app data:', error);
      }
    }

    loadInitialData();
    // Non-Admin: lock to their own branch; ADMIN defaults to 'All Branches'
    const isBranchRestricted = user?.role !== 'ADMIN' && user?.branch && user?.branch !== 'All Branches';
    setSelectedBranch(isBranchRestricted ? user.branch : '');
  }, [user, fetchVehicles]);

  const branches = useMemo(() => {
    // Non-Admin: only show their own branch in the dropdown
    const isBranchRestricted = user?.role !== 'ADMIN' && user?.branch && user?.branch !== 'All Branches';
    if (isBranchRestricted) {
      return [user.branch];
    }
    const branchesSet = new Set(['Perinthalmanna', ...(settings.branches || [])]);
    if (user && user.branch && user.branch !== 'All Branches') branchesSet.add(user.branch);
    vehicles.forEach(v => { if (v.branch && v.branch !== 'All Branches') branchesSet.add(v.branch); });
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

  const handleOpenNewBooking = () => {
    setIsNewBookingOpen(true);
  };

  const handleCloseNewBooking = () => {
    setIsNewBookingOpen(false);
  };

  const handleOpenCrm = () => {
    setIsCrmOpen(true);
  };

  const handleCloseCrm = () => {
    setIsCrmOpen(false);
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
        onNewBooking={() => { setActiveTab('bookings'); handleOpenNewBooking(); }}
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
          <Suspense fallback={<TabLoader />}>
            {activeTab === 'dashboard' && (
              <DashboardKPIs 
                vehicles={vehicles} 
                activeBranch={selectedBranch} 
                setSelectedBranch={setSelectedBranch}
                branches={branches}
              />
            )}
            {activeTab === 'bookings' && (
              <DeliveryTable 
                vehicles={vehicles} 
                branches={branches} 
                openDrawer={handleOpenDrawer}
                openNewBooking={handleOpenNewBooking}
                openCrm={handleOpenCrm}
                totalVehicles={totalVehicles}
                currentPage={currentPage}
                fetchVehicles={fetchVehicles}
                isBookingPage={true}
              />
            )}
            {activeTab === 'delivery' && (
              <DeliveryTable 
                vehicles={vehicles} 
                branches={branches} 
                openDrawer={handleOpenDrawer}
                openNewBooking={handleOpenNewBooking}
                openCrm={handleOpenCrm}
                totalVehicles={totalVehicles}
                currentPage={currentPage}
                fetchVehicles={fetchVehicles}
                isBookingPage={false}
              />
            )}
            {activeTab === 'audit' && <AuditHistory />}
            {activeTab === 'users' && (user.role === 'ADMIN' || user.role === 'BRANCH_MANAGER') && <UserAdmin branches={branches} />}
            {activeTab === 'settings' && <Settings branches={branches} settings={settings} setSettings={setSettings} companyName={companyName} setCompanyName={setCompanyName} vehicles={vehicles} />}
          </Suspense>
        </main>
      </div>

      {isDrawerOpen && (
        <Suspense fallback={null}>
          <VehicleDrawer vehicle={selectedVehicle} branches={branches} onClose={handleCloseDrawer} onSaved={() => fetchVehicles(currentPage)} isBookingPage={activeTab === 'bookings'} />
        </Suspense>
      )}

      {isNewBookingOpen && (
        <Suspense fallback={null}>
          <NewBookingDrawer branches={branches} onClose={handleCloseNewBooking} onSaved={() => fetchVehicles(1)} />
        </Suspense>
      )}

      {isCrmOpen && (
        <Suspense fallback={null}>
          <CrmDrawer branches={branches} onClose={handleCloseCrm} onSaved={() => fetchVehicles(currentPage)} />
        </Suspense>
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
