import React, { useEffect, useState } from 'react';
import { useUsers } from '../../hooks/useUsers.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function UserAdmin({ branches }) {
  const { users, fetchUsers, createUser, updateUser, deleteUser, loading } = useUsers();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', username: '', role: '', branch: '', password: '' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
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
      setIsDrawerOpen(false);
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
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ name: '', username: '', role: '', branch: '', password: '' });
    setIsDrawerOpen(true);
  };

  return (
    <div id="users-view" className="tab-content active">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="audit-log-container">
          <div className="main-header" style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--border-light)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Registered Employees</h3>
            <button className="btn-primary" onClick={handleAddNew}>+ Add Employee</button>
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
      </div>

      {isDrawerOpen && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setIsDrawerOpen(false); }}>
          <form className="modal-drawer" onSubmit={handleSubmit}>
            <div className="modal-header">
              <div>
                <h3>{formData.username && users.some(u => u.username === formData.username) ? 'Edit Employee Account' : 'Register Employee Account'}</h3>
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
                    <option value="BRANCH_MANAGER">BRANCH_MANAGER (Branch Level)</option>
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
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setFormData({ name: '', username: '', role: '', branch: '', password: '' })}>Clear</button>
              <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Save Account</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
