import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function NavigationTabs({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section className="main-header" id="app-nav">
      <div className="brand-details">
        <h2>Delivery Master Control</h2>
        <p>Real-time vehicle tracking from booking to home visit - <b>{user.branch || 'Perinthalmanna'} Branch</b></p>
      </div>
      <nav className="nav-tabs" id="main-navigation">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveTab('dashboard')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
          Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`} 
          onClick={() => setActiveTab('delivery')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Delivery Master List
        </button>
        <button 
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} 
          onClick={() => setActiveTab('audit')}
        >
          <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Audit History Logs
        </button>
        {(user.role === 'ADMIN' || user.role === 'BRANCH_MANAGER') && (
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => setActiveTab('users')}
          >
            <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Users List
          </button>
        )}
      </nav>
    </section>
  );
}
