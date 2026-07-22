import React, { useState, useMemo } from 'react';
import DeliveryFilters from './DeliveryFilters.jsx';
import DeliveryGridItem from './DeliveryGridItem.jsx';
import DeliveryTableRow from './DeliveryTableRow.jsx';
import BookingTableRow from './BookingTableRow.jsx';
import { DEPARTMENT_KEYS, SECTIONS, STATUS_VALUES } from '../../models/apiModel.js';
import { getPermission } from '../admin/AccessMatrix.jsx';

import { useAuth } from '../../context/AuthContext.jsx';

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

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      // Split bookings vs deliveries
      if (isBookingPage && v.vehicleStatus !== 'Booked') return false;
      if (!isBookingPage && v.vehicleStatus === 'Booked') return false;

      if (filters.global) {
        const term = filters.global.toLowerCase();
        const matchText = `${v.customerName} ${v.mobileNumber} ${v.orderNumber} ${v.chassisNumber} ${v.variant} ${v.ca} ${v.tl}`.toLowerCase();
        if (!matchText.includes(term)) return false;
      }

      const vBranch = v.branch || '';
      if (filters.branch && vBranch !== filters.branch) return false;
      if (filters.status && v.vehicleStatus !== filters.status) return false;

      if (filters.pending) {
        if (v.vehicleStatus === 'Delivered' || v.vehicleStatus === 'Cancelled') return false;
        if (filters.pending === 'any') {
          const statuses = DEPARTMENT_KEYS.map(key => v[SECTIONS[key].statusField] || STATUS_VALUES.NOT_ATTENDED);
          if (statuses.every(s => s === STATUS_VALUES.APPROVED)) return false;
        } else {
          const statusField = SECTIONS[filters.pending].statusField;
          const deptStatus = v[statusField] || STATUS_VALUES.NOT_ATTENDED;
          if (deptStatus !== STATUS_VALUES.PENDING && deptStatus !== STATUS_VALUES.NOT_ATTENDED) return false;
        }
      }
      if (filters.ca && v.ca !== filters.ca) return false;
      if (filters.tl && v.tl !== filters.tl) return false;

      const checkDept = (filterVal, field) => {
        if (!filterVal) return true;
        const val = v[field] || STATUS_VALUES.NOT_ATTENDED;
        return val === filterVal;
      };

      if (!checkDept(filters.finStatus, SECTIONS.finance.statusField)) return false;
      if (!checkDept(filters.tmaStatus, SECTIONS.tma.statusField)) return false;
      if (!checkDept(filters.accStatus, SECTIONS.accounts.statusField)) return false;
      if (!checkDept(filters.regStatus, SECTIONS.registration.statusField)) return false;
      if (!checkDept(filters.pdiStatus, SECTIONS.pdi.statusField)) return false;
 
      if (isBookingPage && filters.crmGenerated) {
        if (filters.crmGenerated === 'generated' && !v.crmGenerated) return false;
        if (filters.crmGenerated === 'pending' && v.crmGenerated) return false;
      }
 
      return true;
    });
  }, [vehicles, filters, isBookingPage]);

  const showDownloadBtn = user && [
    'ADMIN',
    'FINANCE',
    'CRM',
    'BOOKING IN-CHARGE',
    'MANAGEMENT'
  ].includes(user.role);

  const handleDownloadCSV = () => {
    const listToExport = filteredVehicles;
    if (listToExport.length === 0) {
      alert("No data available to download with current filters.");
      return;
    }

    const columns = isBookingPage ? [
      { key: 'date', label: 'Booking Date' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'mobileNumber', label: 'Mobile Number' },
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
      { key: 'customerName', label: 'Customer Name' },
      { key: 'pl', label: 'PL' },
      { key: 'variant', label: 'Variant' },
      { key: 'branch', label: 'Branch' },
      { key: 'financeStatus', label: 'Finance Status' },
      { key: 'financeRemark', label: 'Finance Remark' },
      { key: 'tmaStatus', label: 'TMA Status' },
      { key: 'tmaRemark', label: 'TMA Remark' },
      { key: 'accountsStatus', label: 'Accounts Status' },
      { key: 'accountsRemark', label: 'Accounts Remark' },
      { key: 'registrationStatus', label: 'Registration Status' },
      { key: 'registrationRemark', label: 'Registration Remark' },
      { key: 'pdiStatus', label: 'PDI Status' },
      { key: 'pdiRemark', label: 'PDI Remark' },
      { key: 'deliveryStatus', label: 'Delivery Status' },
      { key: 'cxoRemark', label: 'CXO Remark' }
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
          {showDownloadBtn && (
            <button className="btn-secondary" onClick={handleDownloadCSV} title="Download CSV" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download
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
                  <th>OPTY ID</th>
                  <th>PPL</th>
                  <th>PL</th>
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
                  <td colSpan={isBookingPage ? (isAdmin ? 22 : 21) : (isAdmin ? 12 : 11)} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
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
            onClick={() => fetchVehicles(currentPage - 1, 25)}
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
            onClick={() => fetchVehicles(currentPage + 1, 25)}
            style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: currentPage >= Math.ceil(totalVehicles / 25) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage >= Math.ceil(totalVehicles / 25) ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
