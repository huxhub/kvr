import React, { useEffect, useState } from 'react';
import { useUsers } from '../../hooks/useUsers.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function UserAdmin({ branches }) {
  const { users, fetchUsers, createUser, updateUser, deleteUser, loading } = useUsers();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', username: '', role: '', branch: '', password: '' });
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = users.some(u => u.username === formData.username);
    
    const result = isEdit ? await updateUser(formData.username, formData) : await createUser(formData);
    
    if (result.success) {
      showToast('Success', isEdit ? 'User updated successfully' : 'User created successfully');
      setFormData({ name: '', username: '', role: '', branch: '', password: '' });
    } else {
      showToast('Error', result.error, 'error');
    }
  };

  const handleDelete = async (username) => {
    if (window.confirm(`Delete user ${username}?`)) {
      const result = await deleteUser(username);
      if (result.success) showToast('Success', 'User deleted');
      else showToast('Error', result.error, 'error');
    }
  };

  const handleEdit = (user) => {
    setFormData({ ...user, password: '' });
  };

  return (
    <div id="users-view" className="tab-content active">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        <div className="audit-log-container">
          <div className="main-header" style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--border-light)', padding: '16px 20px' }}>
            <h3>Registered Employees</h3>
          </div>
          <div className="audit-table-wrapper">
            <table className="audit-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6">Loading...</td></tr> : users.map(u => (
                <tr key={u.username}>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.branch}</td>
                  <td>{u.password ? '******' : ''}</td>
                  <td className="user-admin-actions">
                    <button className="btn-edit-mini" onClick={() => handleEdit(u)}>Edit</button>
                    {u.username !== 'admin' && <button className="btn-danger-mini" onClick={() => handleDelete(u.username)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        <div className="form-section-block editable" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
          <div className="form-section-header">
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>{formData.username && users.some(u => u.username === formData.username) ? 'Edit Employee Account' : 'Register Employee Account'}</h4>
          </div>
          <form className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '14px', marginTop: '10px' }} onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Employee Full Name *</label>
              <input type="text" name="name" placeholder="e.g. Anand Kumar" required style={{ padding: '8px 12px', fontSize: '0.85rem' }} value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="form-field">
              <label>Username *</label>
              <input type="text" name="username" placeholder="e.g. finance_clerk" required style={{ padding: '8px 12px', fontSize: '0.85rem' }} value={formData.username} onChange={handleChange} />
            </div>
            
            <div className="form-field">
              <label>Assigned Role *</label>
              <select name="role" required style={{ padding: '8px 12px', fontSize: '0.85rem' }} value={formData.role} onChange={handleChange}>
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
                <option value="BRANCH_MANAGER">BRANCH_MANAGER (Branch Level)</option>
                <option value="MANAGEMENT">MANAGEMENT (View-Only)</option>
              </select>
            </div>
            
            <div className="form-field">
              <label>Branch *</label>
              <select name="branch" required style={{ padding: '8px 12px', fontSize: '0.85rem' }} value={formData.branch} onChange={handleChange}>
                <option value="">Select Branch...</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            <div className="form-field">
              <label>Password / Credentials *</label>
              <input type="password" name="password" placeholder="Set account password..." style={{ padding: '8px 12px', fontSize: '0.85rem' }} value={formData.password} onChange={handleChange} />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="button" className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }} onClick={() => setFormData({ name: '', username: '', role: '', branch: '', password: '' })}>Clear</button>
              <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', fontSize: '0.8rem', padding: '8px' }}>Save Account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
