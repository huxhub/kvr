import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useVehicles } from './hooks/useVehicles.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function useAppState() {
  const { user, loading: authLoading } = useAuth();
  const { vehicles, totalVehicles, currentPage, fetchVehicles } = useVehicles();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState('KVR TATA');
  const [settings, setSettings] = useState({
    companyName: 'KVR TATA',
    companyPhone: '+91 98470 12345',
    companyEmail: 'support@kvrgroup.com',
    companyAddress: '',
    branches: [],
    theme: 'light',
    enableAlerts: true
  });

  // Fire both data fetches in parallel
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
    const isBranchRestricted = user?.role !== 'ADMIN' && user?.branch;
    setSelectedBranch(isBranchRestricted ? user.branch : '');
  }, [user, fetchVehicles]);

  const branches = useMemo(() => {
    const isBranchRestricted = user?.role !== 'ADMIN' && user?.branch;
    if (isBranchRestricted) {
      return [user.branch];
    }
    const branchesSet = new Set([...(settings.branches || [])]);
    if (user && user.role !== 'ADMIN' && user.branch && user.branch !== 'All Branches') branchesSet.add(user.branch);
    vehicles.forEach(v => { if (v.branch && v.branch !== 'All Branches') branchesSet.add(v.branch); });
    return Array.from(branchesSet).sort();
  }, [vehicles, user, settings.branches]);

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

  return {
    user,
    authLoading,
    vehicles,
    totalVehicles,
    currentPage,
    fetchVehicles,
    activeTab,
    setActiveTab,
    selectedVehicle,
    isDrawerOpen,
    isNewBookingOpen,
    selectedBranch,
    setSelectedBranch,
    isSidebarOpen,
    setIsSidebarOpen,
    companyName,
    setCompanyName,
    settings,
    setSettings,
    branches,
    handleOpenDrawer,
    handleCloseDrawer,
    handleOpenNewBooking,
    handleCloseNewBooking
  };
}
