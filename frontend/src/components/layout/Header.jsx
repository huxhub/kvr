import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="role-simulator-bar" id="app-header">
      <div className="role-title">
        <span className="role-logo">KVR TATA</span>
        <span className="role-badge">Delivery Workflow Manager</span>
      </div>
      <div className="role-selector-wrapper" id="header-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
          Welcome, <span id="lbl-user-name" style={{ color: 'white', fontWeight: 700 }}>{user.name}</span> 
          (<span id="lbl-user-role" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{user.role}</span>)
        </span>
        <button 
          id="btn-logout" 
          className="btn-secondary" 
          onClick={logout}
          style={{ padding: '4px 12px', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
