import React, { useMemo } from 'react';
import { DEPARTMENT_KEYS, SECTIONS } from '../../models/constants.js';

export default function DeliveryFilters({ filters, setFilters, branches, vehicles }) {
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id.replace('filter-', '')]: value }));
  };

  const handleClear = () => {
    setFilters({ 
      global: '', branch: '', status: '', pending: '',
      ca: '', tl: '', expDate: '', actDate: '',
      finStatus: '', tmaStatus: '', accStatus: '', regStatus: '', pdiStatus: ''
    });
  };

  const cas = useMemo(() => Array.from(new Set(vehicles.map(v => v.ca).filter(Boolean))).sort(), [vehicles]);
  const tls = useMemo(() => Array.from(new Set(vehicles.map(v => v.tl).filter(Boolean))).sort(), [vehicles]);

  return (
    <div className="filter-panel" id="delivery-filters">
      <div className="section-title-bar">
        <h3>Filters & Searching</h3>
        <button onClick={handleClear} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Clear Filters</button>
      </div>
      <div className="filter-grid">
        <div className="search-wrapper">
          <svg className="search-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="filter-global" className="global-search-input" placeholder="Search by customer name, mobile, order number, or chassis number..." value={filters.global} onChange={handleChange} />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-branch">BRANCH</label>
          <select id="filter-branch" className="filter-select" value={filters.branch} onChange={handleChange}>
            <option value="">All Branches</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-status">VEHICLE STATUS</label>
          <select id="filter-status" className="filter-select" value={filters.status} onChange={handleChange}>
            <option value="">All Statuses</option>
            <option value="Booked">Booked</option>
            <option value="Allotted">Allotted</option>
            <option value="In-Transit">In-Transit</option>
            <option value="PDI Hold">PDI Hold</option>
            <option value="Ready for Delivery">Ready for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-ca">CUSTOMER ADVISOR (CA)</label>
          <select id="filter-ca" className="filter-select" value={filters.ca} onChange={handleChange}>
            <option value="">All CAs</option>
            {cas.map(ca => <option key={ca} value={ca}>{ca}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-tl">TEAM LEADER (TL)</label>
          <select id="filter-tl" className="filter-select" value={filters.tl} onChange={handleChange}>
            <option value="">All TLs</option>
            {tls.map(tl => <option key={tl} value={tl}>{tl}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-expDate">EXPECTED DELIVERY</label>
          <input type="date" id="filter-expDate" className="filter-date" value={filters.expDate} onChange={handleChange} />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-actDate">ACTUAL DELIVERY</label>
          <input type="date" id="filter-actDate" className="filter-date" value={filters.actDate} onChange={handleChange} />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-finStatus">FINANCE STATUS</label>
          <select id="filter-finStatus" className="filter-select filter-dept-status" value={filters.finStatus} onChange={handleChange}>
            <option value="">Any</option>
            <option value="Not Attended">Not Attended</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-tmaStatus">TMA STATUS</label>
          <select id="filter-tmaStatus" className="filter-select filter-dept-status" value={filters.tmaStatus} onChange={handleChange}>
            <option value="">Any</option>
            <option value="Not Attended">Not Attended</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-accStatus">ACCOUNTS STATUS</label>
          <select id="filter-accStatus" className="filter-select filter-dept-status" value={filters.accStatus} onChange={handleChange}>
            <option value="">Any</option>
            <option value="Not Attended">Not Attended</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-regStatus">REGISTRATION STATUS</label>
          <select id="filter-regStatus" className="filter-select filter-dept-status" value={filters.regStatus} onChange={handleChange}>
            <option value="">Any</option>
            <option value="Not Attended">Not Attended</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-pdiStatus">PDI STATUS</label>
          <select id="filter-pdiStatus" className="filter-select filter-dept-status" value={filters.pdiStatus} onChange={handleChange}>
            <option value="">Any</option>
            <option value="Not Attended">Not Attended</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

      </div>
    </div>
  );
}
