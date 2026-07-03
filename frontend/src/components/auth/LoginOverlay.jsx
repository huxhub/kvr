import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function LoginOverlay() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    
    if (success) {
      showToast('Login Successful', 'Welcome back to Delivery Workflow Manager');
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-navy) 0%, #001a3a 100%)' }}>
      <div className="modal-drawer" style={{ maxWidth: '420px', height: 'auto', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="modal-header" style={{ backgroundColor: 'transparent', borderBottom: 'none', flexDirection: 'column', alignItems: 'center', padding: '30px 24px 10px 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '1px' }}>KVR TATA</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px', letterSpacing: '1px' }}>Workflow Tracker Login</p>
        </div>
        <form className="modal-body" style={{ padding: '24px', gap: '16px' }} onSubmit={handleLogin}>
          <div className="form-field">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter username..." 
              required 
              style={{ padding: '10px 14px', fontSize: '0.95rem' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter password..." 
              required 
              style={{ padding: '10px 14px', fontSize: '0.95rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', padding: '4px 0' }}>{error}</div>}
          <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '0.95rem', fontWeight: 700, width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', padding: '0 24px 30px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Perinthalmanna Showroom Control Panel<br />For authorized dealer employees only.
        </div>
      </div>
    </div>
  );
}
