import React, { useState, useMemo, useRef } from 'react';
import DeliveryFilters from './DeliveryFilters.jsx';
import DeliveryGridItem from './DeliveryGridItem.jsx';
import DeliveryTableRow from './DeliveryTableRow.jsx';
import BookingTableRow from './BookingTableRow.jsx';
import { DEPARTMENT_KEYS, SECTIONS, STATUS_VALUES, createVehicle as apiCreateVehicle, getVehicles as apiGetVehicles } from '../../models/apiModel.js';
import { getPermission } from '../admin/AccessMatrix.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { addAuditLog } from '../../models/auditModel.js';

export default function DeliveryTable({
  vehicles,
  branches,
  openDrawer,
  openNewBooking,
  openCrm,
  totalVehicles = 0,
  currentPage = 1,
  fetchVehicles,
  isBookingPage = false,
  settings,
  onDeleteVehicle
}) {
  const { user } = useAuth();
  const userRoles = useMemo(() => user?.role ? user.role.split(',').map(r => r.trim()) : [], [user?.role]);
  const isAdmin = userRoles.includes('ADMIN');
  const isBranchRestricted = !isAdmin && user?.branch !== 'All Branches';

  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    global: '',
    branch: isBranchRestricted && user?.branch ? user.branch : '',
    status: '',
    pending: '',
    ca: '', tl: '',
    finStatus: '', tmaStatus: '', accStatus: '', regStatus: '', pdiStatus: '',
    crmGenerated: ''
  });

  const parseCSV = (text) => {
    const lines = [];
    let cur = '';
    let inQuotes = false;
    let row = [];

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (c === '"') {
        if (inQuotes && next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push(cur.trim());
        cur = '';
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        row.push(cur.trim());
        if (row.some(cell => cell !== '')) {
          lines.push(row);
        }
        row = [];
        cur = '';
      } else {
        cur += c;
      }
    }
    if (cur || row.length > 0) {
      row.push(cur.trim());
      if (row.some(cell => cell !== '')) {
        lines.push(row);
      }
    }

    if (lines.length === 0) return [];
    const rawHeaders = lines[0];
    const dataRows = lines.slice(1);

    const headerKeyMap = {
      'booking date': 'date',
      'date': 'date',
      'customer name': 'customerName',
      'full name': 'customerName',
      'name': 'customerName',
      'mobile number': 'mobileNumber',
      'mobile no': 'mobileNumber',
      'mobile': 'mobileNumber',
      'email id': 'emailId',
      'email': 'emailId',
      'emailid': 'emailId',
      'booking amount': 'bookingAmount',
      'bookingamount': 'bookingAmount',
      'amount': 'bookingAmount',
      'opty id': 'optyId',
      'optyid': 'optyId',
      'ppl': 'pl',
      'pl': 'pl',
      'variant': 'variant',
      'color': 'colour',
      'colour': 'colour',
      'bo status': 'boStatus',
      'bostatus': 'boStatus',
      'bo date': 'boDate',
      'bodate': 'boDate',
      'bkb order no': 'orderNumber',
      'bkg order no': 'orderNumber',
      'order number': 'orderNumber',
      'ordernumber': 'orderNumber',
      'sap order no': 'sapOrderNo',
      'saporderno': 'sapOrderNo',
      'crm booking status': 'crmBookingStatus',
      'crm - booking status': 'crmBookingStatus',
      'crmbookingstatus': 'crmBookingStatus',
      'ca': 'ca',
      'tl': 'tl',
      'branch': 'branch',
      'region': 'region',
      'branch status': 'branchStatus',
      'branchstatus': 'branchStatus',
      'branch remark': 'branchRemark',
      'branchremark': 'branchRemark',
      'finance status': 'financeStatus',
      'financestatus': 'financeStatus',
      'finance remark': 'financeRemark',
      'financeremark': 'financeRemark',
      'chassis number': 'chassisNumber',
      'chassis': 'chassisNumber',
      'chassisnumber': 'chassisNumber',
    };

    const cleanHeaders = rawHeaders.map(h => h.replace(/^[\uFEFF\s'"]+|[\s'"]+$/g, '').toLowerCase());
    const hasPplHeader = cleanHeaders.includes('ppl');

    const keys = cleanHeaders.map(clean => {
      if (clean === 'pl') {
        return hasPplHeader ? 'variant' : 'pl';
      }
      return headerKeyMap[clean] || clean;
    });

    const todayStr = new Date().toISOString().substring(0, 10);
    return dataRows.map(r => {
      const obj = { date: todayStr };
      keys.forEach((key, idx) => {
        if (r[idx] !== undefined && r[idx] !== '') {
          obj[key] = r[idx];
        }
      });
      if (!obj.date) obj.date = todayStr;
      return obj;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result || '';
        const rows = parseCSV(text);
        if (!rows || rows.length === 0) {
          if (showToast) showToast('Error', 'No valid rows found in CSV file.', 'error');
          else alert('No valid rows found in CSV file.');
          return;
        }
        setCsvPreviewRows(rows);
      } catch (err) {
        if (showToast) showToast('Error', 'Failed to parse CSV file: ' + err.message, 'error');
        else alert('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApproveImport = async () => {
    if (!csvPreviewRows || csvPreviewRows.length === 0) return;
    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < csvPreviewRows.length; i++) {
      const row = csvPreviewRows[i];
      const submissionData = {
        ...row,
        chassisNumber: row.chassisNumber || `TEMP-${row.orderNumber || Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}-${i}`,
        fuel: row.fuel || 'Petrol',
        vehicleStatus: 'Booked',
        year: row.year || new Date().getFullYear(),
        branch: row.branch || user?.branch || (branches && branches[0]) || 'Perinthalmanna',
        ca: row.ca || user?.name || '',
      };

      try {
        await apiCreateVehicle(submissionData, user?.role);
        try {
          await addAuditLog({
            chassisNumber: submissionData.chassisNumber,
            customerName: submissionData.customerName || '',
            updatedBy: user?.role || 'ADMIN',
            department: 'Customer Booking',
            previousStatus: 'None',
            newStatus: 'Booked',
            remarks: 'CSV Bulk booking import'
          });
        } catch (_) {}
        successCount++;
      } catch (err) {
        console.error(`Failed to import row ${i + 1}:`, err);
        failCount++;
      }
    }

    setIsImporting(false);
    setCsvPreviewRows(null);

    if (successCount > 0) {
      if (showToast) showToast('Success', `${successCount} booking(s) successfully added.`);
      else alert(`${successCount} booking(s) successfully added.`);
      if (fetchVehicles) fetchVehicles(currentPage, 25, isBookingPage);
    }

    if (failCount > 0) {
      if (showToast) showToast('Warning', `${failCount} row(s) failed to import (e.g. duplicate entry).`, 'error');
      else alert(`${failCount} row(s) failed to import.`);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const filterRecord = (v, currentFilters, isBooking) => {
    if (isBooking && v.vehicleStatus !== 'Booked') return false;
    if (!isBooking && v.vehicleStatus === 'Booked') return false;

    if (currentFilters.global) {
      const term = currentFilters.global.toLowerCase();
      const matchText = `${v.customerName || ''} ${v.mobileNumber || ''} ${v.orderNumber || ''} ${v.chassisNumber || ''} ${v.variant || ''} ${v.ca || ''} ${v.tl || ''}`.toLowerCase();
      if (!matchText.includes(term)) return false;
    }

    const vBranch = v.branch || '';
    if (currentFilters.branch && vBranch !== currentFilters.branch) return false;
    if (currentFilters.status && v.vehicleStatus !== currentFilters.status) return false;

    if (currentFilters.pending) {
      if (v.vehicleStatus === 'Delivered' || v.vehicleStatus === 'Cancelled') return false;
      if (currentFilters.pending === 'any') {
        const statuses = DEPARTMENT_KEYS.map(key => v[SECTIONS[key].statusField] || STATUS_VALUES.NOT_ATTENDED);
        if (statuses.every(s => s === STATUS_VALUES.APPROVED)) return false;
      } else {
        const statusField = SECTIONS[currentFilters.pending].statusField;
        const deptStatus = v[statusField] || STATUS_VALUES.NOT_ATTENDED;
        if (deptStatus !== STATUS_VALUES.PENDING && deptStatus !== STATUS_VALUES.NOT_ATTENDED) return false;
      }
    }
    if (currentFilters.ca && v.ca !== currentFilters.ca) return false;
    if (currentFilters.tl && v.tl !== currentFilters.tl) return false;
    if (currentFilters.pl && v.pl !== currentFilters.pl) return false;
    if (currentFilters.variant && v.variant !== currentFilters.variant) return false;
    if (currentFilters.colour && v.colour !== currentFilters.colour) return false;
    if (currentFilters.boStatus && v.boStatus !== currentFilters.boStatus) return false;

    const checkDept = (filterVal, field) => {
      if (!filterVal) return true;
      const val = v[field] || STATUS_VALUES.NOT_ATTENDED;
      return val === filterVal;
    };

    if (!checkDept(currentFilters.finStatus, SECTIONS.finance.statusField)) return false;
    if (!checkDept(currentFilters.tmaStatus, SECTIONS.tma.statusField)) return false;
    if (!checkDept(currentFilters.accStatus, SECTIONS.accounts.statusField)) return false;
    if (!checkDept(currentFilters.regStatus, SECTIONS.registration.statusField)) return false;
    if (!checkDept(currentFilters.pdiStatus, SECTIONS.pdi.statusField)) return false;

    if (isBooking && currentFilters.crmGenerated) {
      if (currentFilters.crmGenerated === 'generated' && !v.crmGenerated) return false;
      if (currentFilters.crmGenerated === 'pending' && v.crmGenerated) return false;
    }

    return true;
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => filterRecord(v, filters, isBookingPage));
  }, [vehicles, filters, isBookingPage]);

  const showDownloadBtn = user && [
    'ADMIN',
    'FINANCE',
    'CRM',
    'BOOKING IN-CHARGE',
    'MANAGEMENT'
  ].includes(user.role);

  const handleDownloadCSV = async () => {
    setIsExporting(true);
    try {
      let recordsToExportSource = vehicles;
      try {
        const { vehicles: fetchedAll } = await apiGetVehicles(1, 10000);
        if (fetchedAll && fetchedAll.length > 0) {
          recordsToExportSource = fetchedAll;
        }
      } catch (err) {
        console.warn('Fallback to loaded page vehicles for CSV export:', err);
      }

      const listToExport = recordsToExportSource.filter(v => filterRecord(v, filters, isBookingPage));

      if (listToExport.length === 0) {
        alert("No data available to download with current filters.");
        return;
      }

      const columns = isBookingPage ? [
        { key: 'date', label: 'Booking Date' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'mobileNumber', label: 'Mobile Number' },
        { key: 'emailId', label: 'Email ID' },
        { key: 'bookingAmount', label: 'Booking Amount' },
        { key: 'optyId', label: 'OPTY ID' },
        { key: 'pl', label: 'PPL' },
        { key: 'variant', label: 'Variant' },
        { key: 'colour', label: 'Color' },
        { key: 'boStatus', label: 'BO Status' },
        { key: 'boDate', label: 'BO Date' },
        { key: 'orderNumber', label: 'BKB Order No' },
        { key: 'sapOrderNo', label: 'SAP Order No' },
        { key: 'crmBookingStatus', label: 'CRM Booking Status' },
        { key: 'ca', label: 'CA' },
        { key: 'tl', label: 'TL' },
        { key: 'branch', label: 'Branch' },
        { key: 'region', label: 'Region' },
        { key: 'branchStatus', label: 'Branch Status' },
        { key: 'branchRemark', label: 'Branch Remark' },
        { key: 'financeStatus', label: 'Finance Status' },
        { key: 'financeRemark', label: 'Finance Remark' }
      ] : [
        { key: 'date', label: 'Booking Date' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'mobileNumber', label: 'Mobile Number' },
        { key: 'emailId', label: 'Email ID' },
        { key: 'bookingAmount', label: 'Booking Amount' },
        { key: 'optyId', label: 'OPTY ID' },
        { key: 'orderNumber', label: 'BKG ORDER NO' },
        { key: 'sapOrderNo', label: 'SAP ORDER NO' },
        { key: 'invoiceNumber', label: 'Invoice Number' },
        { key: 'source', label: 'Booking Source' },
        { key: 'year', label: 'Manufacturing Year' },
        { key: 'vehicleStatus', label: 'Vehicle Status' },
        { key: 'chassisNumber', label: 'Chassis Number' },
        { key: 'realChassisNumber', label: 'Real Chassis Number' },
        { key: 'fuel', label: 'Fuel Type' },
        { key: 'pl', label: 'PPL' },
        { key: 'variant', label: 'PL (Variant)' },
        { key: 'colour', label: 'Color' },
        { key: 'boStatus', label: 'BO Status' },
        { key: 'boDate', label: 'BO Date' },
        { key: 'vc', label: 'Vehicle Code (VC)' },
        { key: 'ca', label: 'Customer Advisor (CA)' },
        { key: 'tl', label: 'Team Leader (TL)' },
        { key: 'branch', label: 'Branch' },
        { key: 'region', label: 'Region' },
        { key: 'crmBookingStatus', label: 'CRM - Booking Status' },
        { key: 'branchStatus', label: 'Branch Status' },
        { key: 'branchRemark', label: 'Branch Remark' },
        { key: 'hypothecation', label: 'Hypothecation' },
        { key: 'cashDiscount', label: 'Cash Discount' },
        { key: 'exchangeLoyalty', label: 'Exchange / Loyalty' },
        { key: 'corporate', label: 'Corporate Discount' },
        { key: 'sss', label: 'SSS Discount' },
        { key: 'kpkb', label: 'KPKB Special Scheme' },
        { key: 'solarOffer', label: 'Solar Offer' },
        { key: 'priceDifference', label: 'Price Difference' },
        { key: 'offerRemark', label: 'Offer Remark' },
        { key: 'financeType', label: 'Finance Type' },
        { key: 'onRoadPrice', label: 'On Road Price' },
        { key: 'ip', label: 'Initial Payment (IP)' },
        { key: 'loanAmount', label: 'Loan Amount' },
        { key: 'balanceAmount', label: 'Balance Amount' },
        { key: 'fundPercentage', label: 'Fund Percentage (%)' },
        { key: 'loanAmountStatus', label: 'Loan Amount Status' },
        { key: 'financeStatus', label: 'Finance Status' },
        { key: 'financeRemark', label: 'Finance Remark' },
        { key: 'financeTimestamp', label: 'Finance Timestamp' },
        { key: 'exchangeYesNo', label: 'Exchange (Yes/No)' },
        { key: 'tmaType', label: 'TMA Type' },
        { key: 'makeAndModel', label: 'Make and Model' },
        { key: 'regNumber', label: 'Reg Number' },
        { key: 'tmaStatus', label: 'TMA Status' },
        { key: 'tmaRemark', label: 'TMA Remark' },
        { key: 'tmaTimestamp', label: 'TMA Timestamp' },
        { key: 'fileStatus', label: 'Tally File Status' },
        { key: 'fileTimestamp', label: 'File Timestamp' },
        { key: 'tallyDate', label: 'Tally Voucher Date' },
        { key: 'accountsStatus', label: 'Accounts Status' },
        { key: 'accountsRemark', label: 'Accounts Remark' },
        { key: 'accountsTimestamp', label: 'Accounts Timestamp' },
        { key: 'insuranceType', label: 'Insurance Type' },
        { key: 'insuranceName', label: 'Insurance Company Name' },
        { key: 'insurancePremium', label: 'Insurance Premium' },
        { key: 'insuranceStatus', label: 'Insurance Status' },
        { key: 'insuranceRemark', label: 'Insurance Remark' },
        { key: 'insuranceTimestamp', label: 'Insurance Timestamp' },
        { key: 'registrationType', label: 'Registration Type' },
        { key: 'applicationNumber', label: 'Application Number' },
        { key: 'taxPaidDate', label: 'Tax Paid Date' },
        { key: 'registerNumber', label: 'Registration Number' },
        { key: 'hsrpStatus', label: 'HSRP Status' },
        { key: 'registrationStatus', label: 'Registration Status' },
        { key: 'registrationRemark', label: 'Registration Remark' },
        { key: 'registrationTimestamp', label: 'Registration Timestamp' },
        { key: 'tmgaValue', label: 'TMGA Value' },
        { key: 'vasValue', label: 'VAS Value' },
        { key: 'tmgaStatus', label: 'TMGA Status' },
        { key: 'tmgaRemark', label: 'TMGA Remark' },
        { key: 'tmgaTimestamp', label: 'TMGA Timestamp' },
        { key: 'pdiStatus', label: 'PDI Status' },
        { key: 'pdiRemark', label: 'PDI Assessment Remark' },
        { key: 'pdiTimestamp', label: 'PDI Timestamp' },
        { key: 'cxoRemark', label: 'CXO Delivery Remark' },
        { key: 'expectedDeliveryDate', label: 'Expected Delivery Date' },
        { key: 'actualDeliveryDate', label: 'Actual Delivery Date' },
        { key: 'homeVisit14DayStatus', label: '14 Day Home Visit Status' },
        { key: 'deliveryStatus', label: 'Delivery Status' },
        { key: 'deliveryTimestamp', label: 'Delivery Timestamp' }
      ];

      const headerRow = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');
      const dataRows = listToExport.map(v => {
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
      const filename = isBookingPage ? 'bookings_export.csv' : 'crm_deliveries_export.csv';
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="vehicles-view" className="tab-content active">
      <DeliveryFilters filters={filters} setFilters={setFilters} branches={branches} vehicles={vehicles} isBookingPage={isBookingPage} />

      <div className="list-header-controls">
        <div className="list-info-text">
          Showing <span id="lbl-result-count">{filteredVehicles.length}</span> of <span id="lbl-total-count">{totalVehicles || vehicles.length}</span> Vehicles
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {getPermission(settings, isBookingPage ? 'booking' : 'crm', isBookingPage ? 'btn_new_booking' : 'btn_crm_form', isBookingPage ? 'BOOKING ACTIONS' : 'CRM ACTIONS', user?.role).view && (
            <button className="btn-primary" onClick={() => isBookingPage ? openNewBooking() : openCrm()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              {isBookingPage ? 'New Booking' : 'CRM'}
            </button>
          )}
          {isBookingPage && getPermission(settings, 'booking', 'btn_upload_csv', 'BOOKING ACTIONS', user?.role).view && (
            <>
              <button 
                className="btn-secondary" 
                onClick={() => fileInputRef.current?.click()} 
                title="Upload CSV Booking Data" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload CSV
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".csv" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
            </>
          )}
          {getPermission(settings, isBookingPage ? 'booking' : 'crm', 'btn_download_csv', isBookingPage ? 'BOOKING ACTIONS' : 'CRM ACTIONS', user?.role).view && (
            <button className="btn-secondary" disabled={isExporting} onClick={handleDownloadCSV} title="Download CSV" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {isExporting ? 'Downloading...' : 'Download'}
            </button>
          )}
          <div className="view-toggles">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="vehicle-grid">
          {filteredVehicles.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px dashed var(--border-light)', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 600 }}>No vehicle records match current filters.</p>
            </div>
          ) : (
            filteredVehicles.map((v, i) => <DeliveryGridItem key={v.chassisNumber} vehicle={v} openDrawer={openDrawer} index={(currentPage - 1) * 25 + i + 1} isAdmin={isAdmin} onDelete={onDeleteVehicle} />)
          )}
        </div>
      ) : (
        <div className="list-view-container" style={{ overflowX: 'auto' }}>
          <table className="table-master">
            <thead>
              {isBookingPage ? (
                <tr>
                  <th style={{ width: '40px', paddingLeft: '16px' }}>SL NO</th>
                  <th>Booking Date</th>
                  <th>Full Name</th>
                  <th>Mobile No</th>
                  <th>Email ID</th>
                  <th>Booking Amount</th>
                  <th>OPTY ID</th>
                  <th>PPL</th>
                  <th>VARIANT</th>
                  <th>Color</th>
                  <th>BO STATUS</th>
                  <th>BO DATE</th>
                  <th>BKB ORDER NO</th>
                  <th>SAP ORDER NO</th>
                  <th>CRM - booking status</th>
                  <th>CA</th>
                  <th>TL</th>
                  <th>BRANCH</th>
                  <th>REGION</th>
                  <th>BRANCH STATUS</th>
                  <th>BRANCH REMARK</th>
                  <th>FINANCE STATUS</th>
                  <th>FINANCE REMARK</th>
                  {isAdmin && <th style={{ width: '80px' }}>ACTIONS</th>}
                </tr>
              ) : (
                <tr>
                  <th style={{ width: '40px', paddingLeft: '16px' }}>#</th>
                  <th>Customer Name</th>
                  <th>PL / Variant</th>
                  <th>Branch</th>
                  <th>Fin Status</th>
                  <th>TMA Status</th>
                  <th>Acc Status</th>
                  <th>Reg Status</th>
                  <th>PDI Status</th>
                  <th>Deliv Status</th>
                  <th>Progress</th>
                  {isAdmin && <th style={{ width: '80px' }}>ACTIONS</th>}
                </tr>
              )}
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={isBookingPage ? (isAdmin ? 24 : 23) : (isAdmin ? 12 : 11)} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    No matching vehicle records found.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v, i) => (
                  isBookingPage ? (
                    <BookingTableRow key={v.chassisNumber} vehicle={v} openDrawer={openDrawer} index={(currentPage - 1) * 25 + i + 1} isAdmin={isAdmin} onDelete={onDeleteVehicle} />
                  ) : (
                    <DeliveryTableRow key={v.chassisNumber} vehicle={v} openDrawer={openDrawer} index={(currentPage - 1) * 25 + i + 1} isAdmin={isAdmin} onDelete={onDeleteVehicle} />
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalVehicles > 25 && (
        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px', padding: '10px 0' }}>
          <button
            type="button"
            className="btn-secondary"
            disabled={currentPage === 1}
            onClick={() => fetchVehicles(currentPage - 1, 25, isBookingPage)}
            style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Page {currentPage} of {Math.ceil(totalVehicles / 25)}
          </span>

          <button
            type="button"
            className="btn-secondary"
            disabled={currentPage >= Math.ceil(totalVehicles / 25)}
            onClick={() => fetchVehicles(currentPage + 1, 25, isBookingPage)}
            style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: currentPage >= Math.ceil(totalVehicles / 25) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage >= Math.ceil(totalVehicles / 25) ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}

      {csvPreviewRows && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget && !isImporting) setCsvPreviewRows(null); }}>
          <div className="modal-drawer" style={{ maxWidth: '950px', width: '90%', maxHeight: '85vh', height: 'auto', display: 'flex', flexDirection: 'column', margin: 'auto' }}>
            <div className="modal-header">
              <div>
                <h3>Preview CSV Booking Data</h3>
                <p style={{ margin: 0, marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                  {csvPreviewRows.length} record(s) parsed from CSV. Review and approve to add to booking database.
                </p>
              </div>
              <button type="button" className="close-btn" disabled={isImporting} onClick={() => setCsvPreviewRows(null)}>×</button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', overflowX: 'auto', padding: '16px 24px', flex: 1 }}>
              <table className="table-master" style={{ width: '100%', fontSize: '0.8rem', minWidth: '1600px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>Booking Date</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>Full Name</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>Mobile No</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>OPTY ID</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>PPL</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>VARIANT</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>Color</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>BO STATUS</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>BO DATE</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>BKB ORDER NO</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>SAP ORDER NO</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>CRM - booking status</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>CA</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>TL</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>BRANCH</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>REGION</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>BRANCH STATUS</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>BRANCH REMARK</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>FINANCE STATUS</th>
                    <th style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>FINANCE REMARK</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreviewRows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.date || '-'}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.customerName || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.mobileNumber || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.optyId || '-'}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.pl || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.variant || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.colour || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.boStatus || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.boDate || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.orderNumber || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.sapOrderNo || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.crmBookingStatus || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.ca || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.tl || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.branch || user?.branch || 'Perinthalmanna'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.region || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.branchStatus || '-'}</td>
                      <td style={{ padding: '8px 12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.branchRemark}>{row.branchRemark || '-'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{row.financeStatus || '-'}</td>
                      <td style={{ padding: '8px 12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.financeRemark}>{row.financeRemark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-secondary" disabled={isImporting} onClick={() => setCsvPreviewRows(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" disabled={isImporting} onClick={handleApproveImport}>
                {isImporting ? 'Adding Bookings...' : `Approve & Add ${csvPreviewRows.length} Booking(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
