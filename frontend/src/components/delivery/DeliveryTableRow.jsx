import React from 'react';
import { calculateProgress, getPendingDepartment } from '../../utils/vehicleUtils.js';

export default function DeliveryTableRow({ vehicle, openDrawer }) {
  const progress = calculateProgress(vehicle);
  const pendingDept = getPendingDepartment(vehicle);

  return (
    <tr onClick={() => openDrawer(vehicle)}>
      <td>{vehicle.orderNumber}</td>
      <td style={{ fontWeight: 600 }}>{vehicle.customerName}</td>
      <td>{vehicle.mobileNumber}</td>
      <td>{vehicle.pl} {vehicle.variant}</td>
      <td>{vehicle.branch || 'Perinthalmanna'}</td>
      <td>{vehicle.ca}</td>
      <td>{vehicle.tl}</td>
      <td><span className="vehicle-status-badge">{vehicle.vehicleStatus}</span></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="progress-bar-container" style={{ width: '60px', height: '6px' }}>
            <div className={`progress-bar-fill ${progress === 100 ? 'all-approved' : ''}`} style={{ width: `${progress}%` }}></div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{progress}%</span>
        </div>
      </td>
      <td>
        <span className={`pending-dept-value ${pendingDept.status.toLowerCase().replace(' ', '-')}`} style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
          {pendingDept.name}
        </span>
      </td>
      <td>{vehicle.expectedDeliveryDate || '-'}</td>
      <td>
        <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>View</button>
      </td>
    </tr>
  );
}
