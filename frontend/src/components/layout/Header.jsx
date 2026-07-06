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

  const tabSubtitles = {
    dashboard: 'System Overview & Department Bottlenecks',
    delivery: 'Complete vehicle records and delivery tracking',
    audit: 'Review and track system changes',
    users: 'Registered employees and permissions',
    settings: 'Global configuration and database tools'
  };

  const displayTitle = tabTitles[activeTab] || 'Dashboard';
  const displaySubtitle = tabSubtitles[activeTab] || 'System Overview & Department Bottlenecks';

  const isBranchManager = user?.role === 'BRANCH_MANAGER';

  // BRANCH_MANAGER sees only their branch; other roles see 'All Branches' + full list
  const dropdownOptions = isBranchManager
    ? branches.map(branch => ({ value: branch, label: branch }))
    : [
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="role-logo">{displayTitle}</span>
          <span className="role-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px', textTransform: 'none', letterSpacing: 'normal' }}>
            {displaySubtitle}
          </span>
        </div>
      </div>
      
      <div className="header-branch-select-wrapper">
        <span className="header-branch-label">Branch:</span>
        <CustomDropdown 
          value={selectedBranch || ''} 
          onChange={(e) => !isBranchManager && setSelectedBranch(e.target.value)} 
          options={dropdownOptions}
          disabled={isBranchManager}
        />
      </div>
    </header>
  );
}
