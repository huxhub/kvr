import React from 'react';
import CustomDropdown from '../ui/DropdownMenu.jsx';

export default function FilterInputs({
  filters,
  handleChange,
  statusOptions,
  caOptions,
  tlOptions,
  deptOptions
}) {
  return (
    <>
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
    </>
  );
}
