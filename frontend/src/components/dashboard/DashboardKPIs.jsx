import React, { useMemo } from 'react';
import { DEPARTMENT_KEYS, SECTIONS, STATUS_VALUES } from '../../models/apiModel.js';
import CustomDropdown from '../ui/DropdownMenu.jsx';

const SIMULATED_TODAY = '2026-06-22'; // Keep simulation date consistent with original

export default function DashboardKPIs({ vehicles, activeBranch, setSelectedBranch, branches = [] }) {
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const vBranch = v.branch || 'Perinthalmanna';
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

  const dropdownOptions = [
    { value: '', label: 'All Branches' },
    ...branches.map(branch => ({ value: branch, label: branch }))
  ];

  return (
    <div id="dashboard-view" className="tab-content active">
      <div className="mobile-branch-selector-container">
        <span className="mobile-branch-label">Branch:</span>
        <CustomDropdown 
          value={activeBranch || ''}
          onChange={(e) => setSelectedBranch(e.target.value)}
          options={dropdownOptions}
        />
      </div>

      <div className="kpi-container">
        <div className="kpi-card">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="11" y2="17"></line></svg>
          </div>
          <div className="kpi-info">
            <div className="kpi-value">{kpis.total}</div>
            <div className="kpi-label">Total Bookings</div>
          </div>
        </div>
        <div className="kpi-card green-theme">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="kpi-info">
            <div className="kpi-value">{kpis.deliveredToday}</div>
            <div className="kpi-label">Delivered Today</div>
          </div>
        </div>
        <div className="kpi-card green-theme">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div className="kpi-info">
            <div className="kpi-value">{kpis.deliveredThisMonth}</div>
            <div className="kpi-label">Delivered This Month</div>
          </div>
        </div>
        <div className="kpi-card yellow-theme">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div className="kpi-info">
            <div className="kpi-value">{kpis.readyForDelivery}</div>
            <div className="kpi-label">Ready for Delivery</div>
          </div>
        </div>
      </div>

      <div className="dept-bottleneck-section">
        <div className="section-title-bar">
          <h3>Department Bottlenecks & Tasks</h3>
          <span className="list-info-text">Pending attention or approvals in {activeBranch || 'Perinthalmanna'}</span>
        </div>
        <div className="dept-kpi-grid">
          {DEPARTMENT_KEYS.map(key => (
            <div key={key} className="dept-kpi-pill">
              <div className="dept-kpi-name">{kpis.stats[key].title}</div>
              <div className="dept-kpi-stats">
                <span className="badge-mini pending" title="Pending">P: {kpis.stats[key].pending}</span>
                <span className="badge-mini not-attended" title="Not Attended">N: {kpis.stats[key].notAttended}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
