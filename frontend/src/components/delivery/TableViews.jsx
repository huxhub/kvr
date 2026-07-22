import React from 'react';
import DeliveryGridItem from './DeliveryGridItem.jsx';
import DeliveryTableRow from './DeliveryTableRow.jsx';

export default function TableViews({
  viewMode,
  filteredVehicles,
  openDrawer,
  currentPage
}) {
  if (viewMode === 'grid') {
    return (
      <div className="vehicle-grid">
        {filteredVehicles.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px dashed var(--border-light)', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 600 }}>No vehicle records match current filters.</p>
          </div>
        ) : (
          filteredVehicles.map((v, i) => (
            <DeliveryGridItem 
              key={v.chassisNumber} 
              vehicle={v} 
              openDrawer={openDrawer} 
              index={(currentPage - 1) * 25 + i + 1} 
            />
          ))
        )}
      </div>
    );
  }

  return (
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
            filteredVehicles.map((v, i) => (
              <DeliveryTableRow 
                key={v.chassisNumber} 
                vehicle={v} 
                openDrawer={openDrawer} 
                index={(currentPage - 1) * 25 + i + 1} 
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
