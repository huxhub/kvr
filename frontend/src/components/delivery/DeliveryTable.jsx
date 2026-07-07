import React, { useState, useMemo } from 'react';
import DeliveryFilters from './DeliveryFilters.jsx';
import DeliveryGridItem from './DeliveryGridItem.jsx';
import DeliveryTableRow from './DeliveryTableRow.jsx';
import { DEPARTMENT_KEYS, SECTIONS, STATUS_VALUES } from '../../models/apiModel.js';

import { useAuth } from '../../context/AuthContext.jsx';

export default function DeliveryTable({ 
  vehicles, 
  branches, 
  openDrawer,
  openNewBooking,
  totalVehicles = 0, 
  currentPage = 1, 
  fetchVehicles 
}) {
  const { user } = useAuth();
  const isBranchRestricted = user?.role !== 'ADMIN';

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    global: '', 
    branch: isBranchRestricted && user?.branch ? user.branch : '', 
    status: '', 
    pending: '',
    ca: '', tl: '', expDate: '', actDate: '',
    finStatus: '', tmaStatus: '', accStatus: '', regStatus: '', pdiStatus: ''
  });

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (filters.global) {
        const term = filters.global.toLowerCase();
        const matchText = `${v.customerName} ${v.mobileNumber} ${v.orderNumber} ${v.chassisNumber} ${v.variant} ${v.ca} ${v.tl}`.toLowerCase();
        if (!matchText.includes(term)) return false;
      }
      
      const vBranch = v.branch || 'Perinthalmanna';
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
      if (filters.expDate && v.expectedDeliveryDate !== filters.expDate) return false;
      if (filters.actDate && v.actualDeliveryDate !== filters.actDate) return false;
      
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

      return true;
    });
  }, [vehicles, filters]);

  return (
    <div id="vehicles-view" className="tab-content active">
      <DeliveryFilters filters={filters} setFilters={setFilters} branches={branches} vehicles={vehicles} />
      
      <div className="list-header-controls">
        <div className="list-info-text">
          Showing <span id="lbl-result-count">{filteredVehicles.length}</span> of <span id="lbl-total-count">{totalVehicles || vehicles.length}</span> Vehicles
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {(user?.role === 'ADMIN' || user?.role === 'CRM' || user?.role === 'BOOKING IN-CHARGE') && (
            <button className="btn-primary" onClick={() => openDrawer(null)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              CRM
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
            filteredVehicles.map((v, i) => <DeliveryGridItem key={v.chassisNumber} vehicle={v} openDrawer={openDrawer} index={(currentPage - 1) * 25 + i + 1} />)
          )}
        </div>
      ) : (
        <div className="list-view-container">
          <table className="table-master">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingLeft: '16px' }}>#</th>
                <th>PL / Variant</th>
                <th>Branch</th>
                <th>Expected Delivery</th>
                <th>Fin Status</th>
                <th>TMA Status</th>
                <th>Acc Status</th>
                <th>Reg Status</th>
                <th>PDI Status</th>
                <th>Deliv Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    No matching vehicle records found.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v, i) => <DeliveryTableRow key={v.chassisNumber} vehicle={v} openDrawer={openDrawer} index={(currentPage - 1) * 25 + i + 1} />)
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
