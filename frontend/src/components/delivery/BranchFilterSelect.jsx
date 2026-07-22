import React from 'react';
import CustomDropdown from '../ui/DropdownMenu.jsx';

export default function BranchFilterSelect({
  isBranchRestricted,
  filters,
  handleChange,
  branchOptions
}) {
  if (isBranchRestricted) return null;

  return (
    <div className="filter-group">
      <label htmlFor="filter-branch">BRANCH</label>
      <CustomDropdown 
        id="filter-branch" 
        value={filters.branch} 
        onChange={handleChange} 
        options={branchOptions} 
      />
    </div>
  );
}
