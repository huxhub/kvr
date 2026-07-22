import React from 'react';

export default function KPIStatsCards({ kpis }) {
  return (
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
  );
}
