import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { saveBackendSettings, updateUser } from '../../models/apiModel.js';

export function useSettings({ branches, settings, setSettings, companyName, setCompanyName, vehicles }) {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Profile Settings States
  const [profileUsername, setProfileUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync profile fields if user object changes
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

  return {
    user,
    activeSubTab,
    setActiveSubTab,
    profileUsername,
    setProfileUsername,
    displayName,
    setDisplayName,
    email,
    setEmail,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    customBranches,
    newBranchName,
    setNewBranchName,
    companyBrandingName,
    setCompanyBrandingName,
    companyPhone,
    setCompanyPhone,
    companyEmail,
    setCompanyEmail,
    companyAddress,
    setCompanyAddress,
    theme,
    setTheme,
    enableAlerts,
    setEnableAlerts,
    handleUpdateProfile,
    handleAddBranch,
    handleRemoveBranch,
    handleSaveCompanyDetails,
    handleSavePreferences,
    handleExportData,
    handleExportExcel
  };
}
