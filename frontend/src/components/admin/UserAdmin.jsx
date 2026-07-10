import React, { useEffect, useState } from 'react';
import { useUsers } from '../../hooks/useUsers.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UserAdmin({ branches }) {
  const { users, totalUsers, currentPage, fetchUsers, createUser, updateUser, deleteUser, loading } = useUsers();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', username: '', role: '', branch: '', email: '', password: '' });
  const [originalUsername, setOriginalUsername] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const isReadOnly = user?.role !== 'ADMIN';
  
  useEffect(() => {
    fetchUsers(1, 15);
  }, [fetchUsers]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!originalUsername;
    
    const result = isEdit ? await updateUser(originalUsername, formData) : await createUser(formData);
    
    if (result.success) {
      showToast('Success', isEdit ? 'User updated successfully' : 'User created successfully');
      setFormData({ name: '', username: '', role: '', branch: '', email: '', password: '' });
      setOriginalUsername('');
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
    setFormData({ ...user, email: user.email || '', password: '' });
    setOriginalUsername(user.username);
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ name: '', username: '', role: '', branch: '', email: '', password: '' });
    setOriginalUsername('');
    setIsDrawerOpen(true);
  };

  return (
    <div id="users-view" className="tab-content active">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="audit-log-container">
          <div className="main-header" style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--border-light)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Registered Employees</h3>
            {!isReadOnly && <button className="btn-primary" onClick={handleAddNew}>+ Add Employee</button>}
          </div>
          {/* ── Desktop table (hidden on mobile via CSS) ── */}
          <div className="audit-table-wrapper user-table-desktop">
            <table className="audit-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingLeft: '16px' }}>#</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                 <th>Role</th>
                <th>Branch</th>
                <th>Password</th>
                {!isReadOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="8">Loading...</td></tr> : users.map((u, index) => (
                <tr key={u.username}>
                  <td style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', paddingLeft: '16px' }}>{(currentPage - 1) * 15 + index + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.role?.replace('_', ' ')}</td>
                  <td>{u.branch}</td>
                  <td>{u.password ? '******' : ''}</td>
                  {!isReadOnly && (
                    <td className="user-admin-actions">
                      <button className="btn-edit-mini" onClick={() => handleEdit(u)}>Edit</button>
                      {u.username !== 'admin' && <button className="btn-danger-mini" onClick={() => handleDelete(u.username)}>Delete</button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* ── Mobile card list (hidden on desktop via CSS) ── */}
          <div className="user-cards-mobile">
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
            ) : users.map((u, index) => (
              <div key={u.username} className="user-card">
                <div className="user-card-avatar">
                  {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="user-card-body">
                  <div className="user-card-top">
                    <div>
                      <div className="user-card-name">{u.name}</div>
                      <div className="user-card-sub">@{u.username}{u.email ? ` · ${u.email}` : ''}</div>
                    </div>
                    <span className="user-card-number">#{(currentPage - 1) * 15 + index + 1}</span>
                  </div>
                  <div className="user-card-badges">
                    <span className="user-badge role">{u.role?.replace('_', ' ')}</span>
                    <span className="user-badge branch">{u.branch}</span>
                  </div>
                  {!isReadOnly && (
                    <div className="user-card-actions">
                      <button className="btn-edit-mini" onClick={() => handleEdit(u)}>Edit</button>
                      {u.username !== 'admin' && (
                        <button className="btn-danger-mini" onClick={() => handleDelete(u.username)}>Delete</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          
          {/* Pagination Controls */}
          {totalUsers > 15 && (
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--border-light)' }}>
              <button 
                type="button"
                className="btn-secondary" 
                disabled={currentPage === 1} 
                onClick={() => fetchUsers(currentPage - 1, 15)}
                style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                Page {currentPage} of {Math.ceil(totalUsers / 15)}
              </span>
              
              <button 
                type="button"
                className="btn-secondary" 
                disabled={currentPage >= Math.ceil(totalUsers / 15)} 
                onClick={() => fetchUsers(currentPage + 1, 15)}
                style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: currentPage >= Math.ceil(totalUsers / 15) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage >= Math.ceil(totalUsers / 15) ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {isDrawerOpen && (
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
                    <option value="BRANCH_MANAGER">BRANCH_MANAGER (Branch Level)</option>
                    <option value="MANAGEMENT">MANAGEMENT (View-Only)</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label>Branch *</label>
                  <select name="branch" required value={formData.branch} onChange={handleChange}>
                    <option value="">Select Branch...</option>
                    <option value="All Branches">All Branches</option>
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
      )}
    </div>
  );
}
