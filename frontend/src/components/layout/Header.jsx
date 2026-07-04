import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Menu, X } from 'lucide-react';
import CustomDropdown from '../ui/DropdownMenu.jsx';

export default function Header({ 
  activeTab, 
  selectedBranch, 
  setSelectedBranch, 
  branches = [], 
  isSidebarOpen, 
  setIsSidebarOpen 
}) {
  const { user } = useAuth();

  if (!user) return null;

  const tabTitles = {
    dashboard: 'Dashboard',
    delivery: 'Delivery Master List',
    audit: 'Audit History Logs',
    users: 'Users List',
    settings: 'System Settings'
  };

  const displayTitle = tabTitles[activeTab] || 'Dashboard';

  const dropdownOptions = [
    { value: '', label: 'All Branches' },
    ...branches.map(branch => ({ value: branch, label: branch }))
  ];

  return (
    <header className="role-simulator-bar" id="app-header">
      <div className="role-title">
        <button 
          className="header-menu-btn" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle Menu"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="role-logo">{displayTitle}</span>
      </div>
      
      <div className="header-branch-select-wrapper">
        <span className="header-branch-label">Branch:</span>
        <CustomDropdown 
          value={selectedBranch || ''} 
          onChange={(e) => setSelectedBranch(e.target.value)} 
          options={dropdownOptions} 
        />
      </div>
    </header>
  );
}
