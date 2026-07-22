import React from 'react';

export default function ProfileSettings({
  profileUsername,
  setProfileUsername,
  email,
  setEmail,
  user,
  displayName,
  setDisplayName,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleUpdateProfile
}) {
  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>My Profile Settings</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Manage your account settings, username, email, and password.</p>
      
      <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Username</label>
          <input type="text" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} required style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} />
        </div>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} />
        </div>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Role</label>
          <input type="text" value={user?.role?.replace('_', ' ') || ''} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px' }} />
        </div>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Display Name</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} />
        </div>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>New Password (Leave blank to keep current)</label>
          <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} />
        </div>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Confirm New Password</label>
          <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} />
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Save Profile Details</button>
      </form>
    </div>
  );
}
