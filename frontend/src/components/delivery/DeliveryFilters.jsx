import React, { useMemo } from 'react';
import { DEPARTMENT_KEYS, SECTIONS } from '../../models/constants.js';
import CustomDropdown from '../ui/DropdownMenu.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

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

  const { user } = useAuth();
  const isBranchManager = user?.role === 'BRANCH_MANAGER';

  // BRANCH_MANAGER: only show their own branch
  const branchOptions = isBranchManager
    ? branches.map(b => ({ value: b, label: b }))
    : [
        { value: '', label: 'All Branches' },
        ...branches.map(b => ({ value: b, label: b }))
      ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Booked', label: 'Booked' },
    { value: 'Allotted', label: 'Allotted' },
    { value: 'In-Transit', label: 'In-Transit' },
    { value: 'PDI Hold', label: 'PDI Hold' },
    { value: 'Ready for Delivery', label: 'Ready for Delivery' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const caOptions = [
    { value: '', label: 'All CAs' },
    ...cas.map(ca => ({ value: ca, label: ca }))
  ];

  const tlOptions = [
    { value: '', label: 'All TLs' },
    ...tls.map(tl => ({ value: tl, label: tl }))
  ];

  const deptOptions = [
    { value: '', label: 'Any' },
    { value: 'Not Attended', label: 'Not Attended' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' }
  ];

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
          <CustomDropdown 
            id="filter-branch" 
            value={filters.branch} 
            onChange={handleChange} 
            options={branchOptions} 
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-status">VEHICLE STATUS</label>
          <CustomDropdown 
            id="filter-status" 
            value={filters.status} 
            onChange={handleChange} 
            options={statusOptions} 
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-ca">CUSTOMER ADVISOR (CA)</label>
          <CustomDropdown 
            id="filter-ca" 
            value={filters.ca} 
            onChange={handleChange} 
            options={caOptions} 
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-tl">TEAM LEADER (TL)</label>
          <CustomDropdown 
            id="filter-tl" 
            value={filters.tl} 
            onChange={handleChange} 
            options={tlOptions} 
          />
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
          <CustomDropdown 
            id="filter-finStatus" 
            value={filters.finStatus} 
            onChange={handleChange} 
            options={deptOptions} 
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-tmaStatus">TMA STATUS</label>
          <CustomDropdown 
            id="filter-tmaStatus" 
            value={filters.tmaStatus} 
            onChange={handleChange} 
            options={deptOptions} 
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-accStatus">ACCOUNTS STATUS</label>
          <CustomDropdown 
            id="filter-accStatus" 
            value={filters.accStatus} 
            onChange={handleChange} 
            options={deptOptions} 
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-regStatus">REGISTRATION STATUS</label>
          <CustomDropdown 
            id="filter-regStatus" 
            value={filters.regStatus} 
            onChange={handleChange} 
            options={deptOptions} 
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-pdiStatus">PDI STATUS</label>
          <CustomDropdown 
            id="filter-pdiStatus" 
            value={filters.pdiStatus} 
            onChange={handleChange} 
            options={deptOptions} 
          />
        </div>

      </div>
    </div>
  );
}
