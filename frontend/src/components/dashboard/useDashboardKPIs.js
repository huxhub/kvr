import { useMemo } from 'react';
import { DEPARTMENT_KEYS, SECTIONS, STATUS_VALUES } from '../../models/apiModel.js';
import { useAuth } from '../../context/AuthContext.jsx';

const SIMULATED_TODAY = '2026-06-22';

export function useDashboardKPIs({ vehicles, activeBranch, setSelectedBranch, branches = [] }) {
  const { user } = useAuth();
  
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const vBranch = v.branch || '';
      return !activeBranch || vBranch === activeBranch;
    });
  }, [vehicles, activeBranch]);

  const kpis = useMemo(() => {
    const deliveredToday = filteredVehicles.filter(v => v.actualDeliveryDate === SIMULATED_TODAY).length;
    const deliveredThisMonth = filteredVehicles.filter(v => v.actualDeliveryDate?.startsWith('2026-06')).length;
    const readyForDelivery = filteredVehicles.filter(v => v.vehicleStatus === 'Ready for Delivery').length;

    const stats = {};
    DEPARTMENT_KEYS.forEach(key => {
      stats[key] = { pending: 0, notAttended: 0, title: SECTIONS[key].title };
    });

    filteredVehicles.forEach(v => {
      DEPARTMENT_KEYS.forEach(key => {
        const statusField = SECTIONS[key].statusField;
        const statusVal = v[statusField] || STATUS_VALUES.NOT_ATTENDED;
        if (statusVal === STATUS_VALUES.PENDING) stats[key].pending++;
        else if (statusVal === STATUS_VALUES.NOT_ATTENDED) stats[key].notAttended++;
      });
    });

    return {
      total: filteredVehicles.length,
      deliveredToday,
      deliveredThisMonth,
      readyForDelivery,
      stats
    };
  }, [filteredVehicles]);

  const analyticsData = useMemo(() => {
    const plCounts = {};
    filteredVehicles.forEach(v => {
      const pl = v.pl || 'Other';
      plCounts[pl] = (plCounts[pl] || 0) + 1;
    });
    const salesByProductLine = Object.keys(plCounts).map(key => ({
      name: key,
      bookings: plCounts[key]
    })).sort((a, b) => b.bookings - a.bookings);

    const recentBookings = [...filteredVehicles]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);

    return { salesByProductLine, recentBookings };
  }, [filteredVehicles]);

  const isBranchRestricted = user?.role !== 'ADMIN' && user?.branch;

  const dropdownOptions = isBranchRestricted
    ? branches.map(branch => ({ value: branch, label: branch }))
    : [
        { value: '', label: 'All Branches' },
        ...branches.map(branch => ({ value: branch, label: branch }))
      ];

  const COLORS = ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return {
    kpis,
    analyticsData,
    isBranchRestricted,
    dropdownOptions,
    COLORS
  };
}
