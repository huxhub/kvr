import React from 'react';

export default function UserFormDialog({
  originalUsername,
  setIsDrawerOpen,
  handleSubmit,
  formData,
  setFormData,
  handleChange,
  branches
}) {
  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setIsDrawerOpen(false); }}>
      <form className="modal-drawer" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h3>{originalUsername ? 'Edit Employee Account' : 'Register Employee Account'}</h3>
          </div>
          <button type="button" className="close-btn" onClick={() => setIsDrawerOpen(false)}>×</button>
        </div>
        
        <div className="modal-body" style={{ padding: '24px' }}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="form-field">
              <label>Employee Full Name *</label>
              <input type="text" name="name" placeholder="e.g. Anand Kumar" required value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="form-field">
              <label>Username *</label>
              <input type="text" name="username" placeholder="e.g. finance_clerk" required value={formData.username} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="e.g. employee@kvrgroup.com" value={formData.email} onChange={handleChange} />
            </div>
            
            <div className="form-field">
              <label>Assigned Role *</label>
              <select name="role" required value={formData.role} onChange={handleChange}>
                <option value="">Select Role...</option>
                <option value="ADMIN">ADMIN (Full Access)</option>
                <option value="CRM">CRM (Bookings/Offers)</option>
                <option value="FINANCE">FINANCE (Finance Dept)</option>
                <option value="TMA">TMA (Exchange Dept)</option>
                <option value="ACCOUNTS">ACCOUNTS (Accounts & Files)</option>
                <option value="INSURANCE">INSURANCE (Insurance Dept)</option>
                <option value="REGISTRATION">REGISTRATION (Registration Dept)</option>
                <option value="TMGA">TMGA (Genuine Accessories)</option>
                <option value="PDI">PDI (Pre-Delivery Inspection)</option>
                <option value="DELIVERY">DELIVERY (Delivery Dept)</option>
                <option value="BOOKING IN-CHARGE">BOOKING (Booking In-Charge)</option>
                <option value="BRANCH_MANAGER">BRANCH MANAGER (Branch Level)</option>
                <option value="MANAGEMENT">MANAGEMENT (View-Only)</option>
              </select>
            </div>
            
            <div className="form-field">
              <label>Branch *</label>
              <select name="branch" required value={formData.branch} onChange={handleChange}>
                <option value="">Select Branch...</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            <div className="form-field">
              <label>Password / Credentials *</label>
              <input type="password" name="password" placeholder="Set account password..." value={formData.password} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-light)' }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setFormData({ name: '', username: '', role: '', branch: '', email: '', password: '' })}>Clear</button>
          <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Save Account</button>
        </div>
      </form>
    </div>
  );
}
