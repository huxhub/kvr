import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Settings as SettingsIcon, User, Layers, Shield, Plus, Trash2, Download, Building } from 'lucide-react';
import { saveBackendSettings } from '../../models/apiModel.js';

export default function Settings({ branches, settings, setSettings, companyName, setCompanyName, vehicles }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Profile Settings States
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      setCustomBranches(settings.branches?.filter(b => b !== 'Perinthalmanna') || []);
      setTheme(settings.theme || 'light');
      setEnableAlerts(settings.enableAlerts !== false);
    }
  }, [settings]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast('Error', 'Passwords do not match.', 'error');
      return;
    }
    // Mock profile update
    showToast('Success', 'Profile settings updated successfully.');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    const trimmed = newBranchName.trim();
    if (!trimmed) return;
    if (branches.includes(trimmed)) {
      showToast('Warning', 'Branch already exists.', 'warning');
      return;
    }
    const updatedBranches = [...(settings.branches || ['Perinthalmanna']), trimmed];
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
    const updatedBranches = (settings.branches || ['Perinthalmanna']).filter(b => b !== branchToRemove);
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

  return (
    <div id="settings-view" className="tab-content active" style={{ animation: 'fadeIn 0.25s ease' }}>
      <div className="settings-container">
        
        {/* Settings Navigation Menu */}
        <div className="settings-sidebar">
          <button 
            type="button"
            className={`settings-tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('profile')}
          >
            <User size={16} />
            My Profile
          </button>
          {user.role === 'ADMIN' && (
            <button 
              type="button"
              className={`settings-tab-btn ${activeSubTab === 'company' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('company')}
            >
              <Building size={16} />
              Company Settings
            </button>
          )}
          <button 
            type="button"
            className={`settings-tab-btn ${activeSubTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('branches')}
          >
            <Layers size={16} />
            Manage Branches
          </button>
          <button 
            type="button"
            className={`settings-tab-btn ${activeSubTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('preferences')}
          >
            <SettingsIcon size={16} />
            System Preferences
          </button>
          <button 
            type="button"
            className={`settings-tab-btn ${activeSubTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('backup')}
          >
            <Shield size={16} />
            Data Backup & Export
          </button>
        </div>

        {/* Settings Panel Content Area */}
        <div className="settings-content">
          
          {/* Subtab: Profile */}
          {activeSubTab === 'profile' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>My Profile Settings</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Manage your account display name and password.</p>
              
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <div className="form-field">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Username (Read-Only)</label>
                  <input type="text" value={user?.username || ''} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px' }} />
                </div>
                <div className="form-field">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Role</label>
                  <input type="text" value={user?.role || ''} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px' }} />
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
          {activeSubTab === 'company' && user.role === 'ADMIN' && (
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
              
              {user.role === 'ADMIN' ? (
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
                      {/* Default branch */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: '#f8fafc' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Perinthalmanna (Default)</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>System Locked</span>
                      </div>
                      
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
                          No custom branches added yet. Use the field above to add one.
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
                  <strong>Exporting Data Backup:</strong> Downloading backup data extracts the entire current vehicle delivery master list from local storage as a JSON document. This can be stored or loaded back in case of system re-installations.
                </div>

                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleExportData}
                  style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={16} />
                  Download Vehicles JSON Backup
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
