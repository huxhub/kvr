import React, { useState, useMemo } from 'react';
import DeliveryFilters from './DeliveryFilters.jsx';
import DeliveryGridItem from './DeliveryGridItem.jsx';
import DeliveryTableRow from './DeliveryTableRow.jsx';
import { DEPARTMENT_KEYS, SECTIONS, STATUS_VALUES } from '../../models/apiModel.js';

export default function DeliveryTable({ vehicles, branches, openDrawer }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    global: '', branch: '', status: '', pending: '',
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
          Showing <span id="lbl-result-count">{filteredVehicles.length}</span> of <span id="lbl-total-count">{vehicles.length}</span> Vehicles
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-primary" onClick={() => openDrawer(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Booking
          </button>
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
            filteredVehicles.map(v => <DeliveryGridItem key={v.chassisNumber} vehicle={v} openDrawer={openDrawer} />)
          )}
        </div>
      ) : (
        <div className="list-view-container">
          <table className="table-master">
            <thead>
              <tr>
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
                filteredVehicles.map(v => <DeliveryTableRow key={v.chassisNumber} vehicle={v} openDrawer={openDrawer} />)
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
