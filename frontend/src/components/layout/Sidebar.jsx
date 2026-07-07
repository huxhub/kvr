import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogOut, X, Settings, Plus } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, companyName = 'KVR TATA', onNewBooking }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', gap: '4px', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h2 style={{ margin: 0 }}>{companyName}</h2>
          <button 
            className="sidebar-close-btn" 
            onClick={() => setIsSidebarOpen(false)}
            title="Close Menu"
          >
            <X size={20} />
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', fontWeight: '500', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
          Vehicle Delivery Tracker
        </p>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
          onClick={() => handleNavClick('dashboard')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
          Dashboard
        </button>
        <button 
          className={`sidebar-btn ${activeTab === 'delivery' ? 'active' : ''}`} 
          onClick={() => handleNavClick('delivery')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Delivery Master List
        </button>

        {/* New Booking quick-action button */}
        {user.role !== 'TMGA' && user.role !== 'PDI' && user.role !== 'FINANCE' && (
          <button
            className="sidebar-new-booking-btn"
            onClick={() => { if (onNewBooking) { onNewBooking(); } if (setIsSidebarOpen) setIsSidebarOpen(false); }}
            title="Register a new vehicle booking"
          >
            <Plus size={15} strokeWidth={2.5} />
            New Booking
          </button>
        )}
        <button 
          className={`sidebar-btn ${activeTab === 'audit' ? 'active' : ''}`} 
          onClick={() => handleNavClick('audit')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Audit History Logs
        </button>
        {(user.role === 'ADMIN' || user.role === 'BRANCH_MANAGER') && (
          <button 
            className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => handleNavClick('users')}
          >
            <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Users List
          </button>
        )}
        <button 
          className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => handleNavClick('settings')}
        >
          <Settings className="tab-icon" size={18} />
          Settings
        </button>
      </nav>

      {/* Modern Profile and Logout Section */}
      <div className="sidebar-profile-container">
        <div className="sidebar-avatar" title={user.name}>
          {getInitials(user.name)}
        </div>
        <div className="sidebar-profile-info">
          <span className="sidebar-profile-name" title={user.name}>{user.name}</span>
          <span className="sidebar-profile-role">{user.role}</span>
        </div>
        <button 
          className="sidebar-logout-btn" 
          onClick={logout} 
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
