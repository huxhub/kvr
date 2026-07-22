import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Plus, Trash2, Download } from 'lucide-react';
import { saveBackendSettings, updateUser } from '../../models/apiModel.js';
import AccessMatrix from '../admin/AccessMatrix.jsx';

export default function Settings({ branches, settings, setSettings, companyName, setCompanyName, vehicles, activeSubTab }) {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const userRoles = user?.role ? user.role.split(',').map(r => r.trim()) : [];

  // Profile Settings States
  const [profileUsername, setProfileUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync profile fields if user object changes (e.g. on loading/restoring session)
  useEffect(() => {
    if (user) {
      setProfileUsername(user.username || '');
      setDisplayName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Branch Manager States
  const [customBranches, setCustomBranches] = useState([]);
  const [newBranchName, setNewBranchName] = useState('');

  // Company Settings States
  const [companyBrandingName, setCompanyBrandingName] = useState(companyName);
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Preferences States
  const [theme, setTheme] = useState('light');
  const [enableAlerts, setEnableAlerts] = useState(true);

  // Sync form states with database settings prop
  useEffect(() => {
    if (settings) {
      setCompanyBrandingName(settings.companyName || 'KVR TATA');
      setCompanyPhone(settings.companyPhone || '');
      setCompanyEmail(settings.companyEmail || '');
      setCompanyAddress(settings.companyAddress || '');
      setCustomBranches(settings.branches || []);
      setTheme(settings.theme || 'light');
      setEnableAlerts(settings.enableAlerts !== false);
    }
  }, [settings]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast('Error', 'Passwords do not match.', 'error');
      return;
    }
    try {
      const payload = { 
        name: displayName.trim(),
        username: profileUsername.trim().toLowerCase(),
        email: email.trim()
      };
      if (newPassword) payload.password = newPassword;

      const updated = await updateUser(user.username, payload, user.role);

      // Update the in-memory session so changes take effect immediately
      updateUserProfile({ 
        username: updated.username || profileUsername.trim().toLowerCase(),
        name: updated.name || displayName.trim(),
        email: updated.email || email.trim()
      });

      showToast('Success', 'Profile updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('Error', err.message || 'Failed to update profile.', 'error');
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    const trimmed = newBranchName.trim();
    if (!trimmed) return;
    if (branches.includes(trimmed)) {
      showToast('Warning', 'Branch already exists.', 'warning');
      return;
    }
    const updatedBranches = [...(settings.branches || []), trimmed];
    try {
      const updated = await saveBackendSettings({
        ...settings,
        branches: updatedBranches
      });
      setSettings(updated);
      setNewBranchName('');
      showToast('Success', `Branch "${trimmed}" added successfully.`);
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleRemoveBranch = async (branchToRemove) => {
    const updatedBranches = (settings.branches || []).filter(b => b !== branchToRemove);
    try {
      const updated = await saveBackendSettings({
        ...settings,
        branches: updatedBranches
      });
      setSettings(updated);
      showToast('Success', `Branch removed successfully.`);
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleSaveCompanyDetails = async (e) => {
    e.preventDefault();
    const trimmed = companyBrandingName.trim();
    if (!trimmed) {
      showToast('Error', 'Company name cannot be empty.', 'error');
      return;
    }
    try {
      const updated = await saveBackendSettings({
        ...settings,
        companyName: trimmed,
        companyPhone: companyPhone.trim(),
        companyEmail: companyEmail.trim(),
        companyAddress: companyAddress.trim()
      });
      setSettings(updated);
      setCompanyName(trimmed);
      showToast('Success', 'Company details saved successfully.');
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleSavePreferences = async () => {
    try {
      const updated = await saveBackendSettings({
        ...settings,
        theme: theme,
        enableAlerts: enableAlerts
      });
      setSettings(updated);
      document.body.className = `theme-${theme}`;
      showToast('Success', 'Preferences saved successfully.');
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vehicles || []));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${companyName.toLowerCase().replace(/\s+/g, '_')}_vehicles_export_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export Started', 'Vehicle database downloaded.', 'info');
  };

  const handleExportExcel = () => {
    if (!vehicles || vehicles.length === 0) {
      showToast('No Data', 'There are no vehicle records to export.', 'warning');
      return;
    }

    const columns = [
      { key: 'chassisNumber', label: 'Chassis Number' },
      { key: 'date', label: 'Booking Date' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'mobileNumber', label: 'Mobile Number' },
      { key: 'orderNumber', label: 'Order Number' },
      { key: 'invoiceNumber', label: 'Invoice Number' },
      { key: 'source', label: 'Booking Source' },
      { key: 'year', label: 'Manufacturing Year' },
      { key: 'vehicleStatus', label: 'Vehicle Status' },
      { key: 'fuel', label: 'Fuel Type' },
      { key: 'pl', label: 'Product Line (PL)' },
      { key: 'variant', label: 'Variant' },
      { key: 'colour', label: 'Colour' },
      { key: 'vc', label: 'Vehicle Code (VC)' },
      { key: 'ca', label: 'Customer Advisor (CA)' },
      { key: 'tl', label: 'Team Leader (TL)' },
      { key: 'branch', label: 'Branch' },
      { key: 'hypothecation', label: 'Hypothecation' },
      { key: 'cashDiscount', label: 'Cash Discount / Green Bonus' },
      { key: 'exchangeLoyalty', label: 'Exchange / Loyalty' },
      { key: 'corporate', label: 'Corporate Discount' },
      { key: 'sss', label: 'SSS Discount' },
      { key: 'kpkb', label: 'KPKB / Special Scheme' },
      { key: 'solarOffer', label: 'Solar Offer' },
      { key: 'priceDifference', label: 'Price Difference' },
      { key: 'offerRemark', label: 'Offer Remark' },
      { key: 'financeType', label: 'Finance Type' },
      { key: 'onRoadPrice', label: 'On Road Price' },
      { key: 'ip', label: 'Initial Payment (IP)' },
      { key: 'loanAmount', label: 'Loan Amount' },
      { key: 'balanceAmount', label: 'Balance Amount' },
      { key: 'fundPercentage', label: 'Fund Percentage' },
      { key: 'loanAmountStatus', label: 'Loan Amount Status' },
      { key: 'financeStatus', label: 'Finance Status' },
      { key: 'tmaStatus', label: 'TMA Status' },
      { key: 'fileStatus', label: 'Tally File Status' },
      { key: 'accountsStatus', label: 'Accounts Status' },
      { key: 'insuranceStatus', label: 'Insurance Status' },
      { key: 'registrationStatus', label: 'Registration Status' },
      { key: 'tmgaStatus', label: 'TMGA Status' },
      { key: 'pdiStatus', label: 'PDI Status' },
      { key: 'deliveryStatus', label: 'Delivery Status' }
    ];

    const headerRow = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');
    const dataRows = vehicles.map(v => {
      return columns.map(col => {
        const val = v[col.key] !== undefined && v[col.key] !== null ? String(v[col.key]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `${companyName.toLowerCase().replace(/\s+/g, '_')}_vehicles_backup_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
    
    showToast('Export Started', 'Vehicles backup saved as Excel CSV.', 'info');
  };

  const handleExportBookings = () => {
    const bookings = (vehicles || []).filter(v => v.vehicleStatus === 'Booked');
    if (bookings.length === 0) {
      showToast('No Data', 'There are no booking records to export.', 'warning');
      return;
    }

    const columns = [
      { key: 'chassisNumber', label: 'Chassis Number' },
      { key: 'date', label: 'Booking Date' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'mobileNumber', label: 'Mobile Number' },
      { key: 'orderNumber', label: 'Order Number' },
      { key: 'invoiceNumber', label: 'Invoice Number' },
      { key: 'source', label: 'Booking Source' },
      { key: 'year', label: 'Manufacturing Year' },
      { key: 'vehicleStatus', label: 'Vehicle Status' },
      { key: 'fuel', label: 'Fuel Type' },
      { key: 'pl', label: 'Product Line (PL)' },
      { key: 'variant', label: 'Variant' },
      { key: 'colour', label: 'Colour' },
      { key: 'vc', label: 'Vehicle Code (VC)' },
      { key: 'ca', label: 'Customer Advisor (CA)' },
      { key: 'tl', label: 'Team Leader (TL)' },
      { key: 'branch', label: 'Branch' },
      { key: 'hypothecation', label: 'Hypothecation' },
      { key: 'cashDiscount', label: 'Cash Discount / Green Bonus' },
      { key: 'exchangeLoyalty', label: 'Exchange / Loyalty' },
      { key: 'corporate', label: 'Corporate Discount' },
      { key: 'sss', label: 'SSS Discount' },
      { key: 'kpkb', label: 'KPKB / Special Scheme' },
      { key: 'solarOffer', label: 'Solar Offer' },
      { key: 'priceDifference', label: 'Price Difference' },
      { key: 'offerRemark', label: 'Offer Remark' },
      { key: 'financeType', label: 'Finance Type' },
      { key: 'onRoadPrice', label: 'On Road Price' },
      { key: 'ip', label: 'Initial Payment (IP)' },
      { key: 'loanAmount', label: 'Loan Amount' },
      { key: 'balanceAmount', label: 'Balance Amount' },
      { key: 'fundPercentage', label: 'Fund Percentage' },
      { key: 'loanAmountStatus', label: 'Loan Amount Status' },
      { key: 'financeStatus', label: 'Finance Status' }
    ];

    const headerRow = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');
    const dataRows = bookings.map(v => {
      return columns.map(col => {
        const val = v[col.key] !== undefined && v[col.key] !== null ? String(v[col.key]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `${companyName.toLowerCase().replace(/\s+/g, '_')}_bookings_backup_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
    
    showToast('Export Started', 'Bookings backup saved as Excel CSV.', 'info');
  };

  return (
    <div id="settings-view" className="tab-content active" style={{ animation: 'fadeIn 0.25s ease' }}>
      <div className="settings-container" style={{ display: 'block' }}>
        
        {/* Settings Panel Content Area */}
        <div className="settings-content" style={{ paddingLeft: 0 }}>
          
          {/* Subtab: Profile */}
          {activeSubTab === 'profile' && (
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
                  <input type="text" value={user?.role?.split(',').map(r => r.trim().replace('_', ' ')).join(', ') || ''} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px' }} />
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
          )}

          {/* Subtab: Company Settings */}
          {activeSubTab === 'company' && userRoles.includes('ADMIN') && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>Company details & branding</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Configure support contact details, addresses, and overall platform branding name.</p>
              
              <form onSubmit={handleSaveCompanyDetails} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                <div className="form-field">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Company branding name *</label>
                  <input 
                    type="text" 
                    value={companyBrandingName} 
                    onChange={(e) => setCompanyBrandingName(e.target.value)} 
                    required 
                    style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} 
                  />
                </div>
                <div className="form-field">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Support Contact Number</label>
                  <input 
                    type="text" 
                    value={companyPhone} 
                    onChange={(e) => setCompanyPhone(e.target.value)} 
                    style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} 
                  />
                </div>
                <div className="form-field">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Support Email Address</label>
                  <input 
                    type="email" 
                    value={companyEmail} 
                    onChange={(e) => setCompanyEmail(e.target.value)} 
                    style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} 
                  />
                </div>
                <div className="form-field">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Registered Location / Address</label>
                  <textarea 
                    value={companyAddress} 
                    onChange={(e) => setCompanyAddress(e.target.value)} 
                    rows="3"
                    style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif", fontSize: '0.85rem', resize: 'vertical' }} 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Save Company Details</button>
              </form>
            </div>
          )}

          {/* Subtab: Branch Manager */}
          {activeSubTab === 'branches' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>Manage Sales Branches</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Create and remove customized sales branches for {companyName}.</p>
              
              {userRoles.includes('ADMIN') ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Add Branch Form */}
                  <form onSubmit={handleAddBranch} style={{ display: 'flex', gap: '10px', maxWidth: '500px', alignItems: 'flex-end' }}>
                    <div className="form-field" style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Add New Branch</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Kozhikode, Palakkad..." 
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        required
                        style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: "'Poppins', sans-serif", fontSize: '0.85rem' }}
                      />
                    </div>
                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px' }}>
                      <Plus size={16} />
                      Add Branch
                    </button>
                  </form>

                  {/* Branch Lists */}
                  <div style={{ maxWidth: '600px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px', marginTop: 0 }}>Current Branch List</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>

                      
                      {/* Custom branches */}
                      {customBranches.map(b => (
                        <div key={b} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: '#ffffff' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{b}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveBranch(b)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            title="Remove Branch"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {customBranches.length === 0 && (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', background: '#ffffff' }}>
                          No branches added yet. Use the field above to add one.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  Only Administrator accounts have permission to configure and manage sales branches.
                </div>
              )}
            </div>
          )}

          {/* Subtab: Preferences */}
          {activeSubTab === 'preferences' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>System Preferences</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Customize theme display settings and notification alerts.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
                <div className="form-field">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Branding Theme Variant</label>
                  <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)} 
                    style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 500, fontFamily: "'Poppins', sans-serif", color: '#0f172a', backgroundColor: '#ffffff' }}
                  >
                    <option value="light">Classic Light (Clean White)</option>
                    <option value="indigo">Indigo Accent (Modern Dev)</option>
                    <option value="emerald">Emerald Forest (Soft Teal)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                  <input 
                    type="checkbox" 
                    id="alerts-checkbox" 
                    checked={enableAlerts} 
                    onChange={(e) => setEnableAlerts(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="alerts-checkbox" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                    Enable real-time toast alert banners
                  </label>
                </div>

                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleSavePreferences}
                  style={{ alignSelf: 'flex-start', marginTop: '10px' }}
                >
                  Save Preference Settings
                </button>
              </div>
            </div>
          )}

          {/* Subtab: Backup */}
          {activeSubTab === 'backup' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>Data Backup & Export</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Export or retrieve vehicle databases for system backups.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e3a8a', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <strong>Exporting Data Backup:</strong> Export the entire current vehicle delivery master list either as a raw JSON backup or as a compatibility-friendly Excel CSV spreadsheet.
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handleExportBookings}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  >
                    <Download size={16} />
                    Download Bookings Excel Backup
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handleExportExcel}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Download size={16} />
                    Download Vehicles Excel Backup
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={handleExportData}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Download size={16} />
                    Download JSON Backup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subtab: Roles & Access */}
          {activeSubTab === 'access' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>Roles & Access Permissions</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Manage edit and view access roles for each form field. Changes apply instantly.</p>
              <div style={{ borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                <AccessMatrix settings={settings} setSettings={setSettings} isReadOnly={user.role !== 'ADMIN'} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
