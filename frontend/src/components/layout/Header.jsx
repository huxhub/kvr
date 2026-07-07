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

  const isBranchRestricted = (user?.role === 'BRANCH_MANAGER' || user?.role === 'FINANCE') && user?.branch;

  // Restricted roles see only their branch; other roles see 'All Branches' + full list
  const dropdownOptions = isBranchRestricted
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
      
      {isBranchRestricted ? (
        <div className="header-branch-select-wrapper">
          <span className="header-branch-label">Branch:</span>
          <span className="static-branch-badge" style={{ 
            fontWeight: 600, 
            color: 'var(--primary-blue)', 
            fontSize: '0.75rem', 
            background: 'rgba(37, 99, 235, 0.08)', 
            padding: '6px 12px', 
            borderRadius: '6px', 
            border: '1px solid rgba(37, 99, 235, 0.15)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {user.branch}
          </span>
        </div>
      ) : (
        <div className="header-branch-select-wrapper">
          <span className="header-branch-label">Branch:</span>
          <CustomDropdown 
            value={selectedBranch || ''} 
            onChange={(e) => setSelectedBranch(e.target.value)} 
            options={dropdownOptions}
          />
        </div>
      )}
    </header>
  );
}
