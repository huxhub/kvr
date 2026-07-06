import React from 'react';
import { calculateProgress } from '../../utils/vehicleUtils.js';

export default function DeliveryTableRow({ vehicle, openDrawer, index }) {
  const progress = calculateProgress(vehicle);

  const renderStatusPill = (status, remark) => {
    const displayStatus = status || 'Not Attended';
    const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');
    const hasTooltip = remark && remark.trim().length > 0;

    return (
      <div className="status-pill-container" style={{ display: 'inline-flex' }}>
        <span className={`badge-status ${statusClass}`}>
          <span className="badge-dot"></span>
          {displayStatus}
        </span>
        {hasTooltip && (
          <span className="status-tooltip">
            {remark}
          </span>
        )}
      </div>
    );
  };

  return (
    <tr onClick={() => openDrawer(vehicle)} style={{ cursor: 'pointer' }}>
      <td style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', paddingLeft: '16px' }}>{index}</td>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary-navy)' }}>{vehicle.pl}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vehicle.variant}</span>
        </div>
      </td>
      <td>{vehicle.branch || 'Perinthalmanna'}</td>
      <td>{vehicle.expectedDeliveryDate || '-'}</td>
      <td>{renderStatusPill(vehicle.financeStatus, vehicle.financeRemark)}</td>
      <td>{renderStatusPill(vehicle.tmaStatus, vehicle.tmaRemark)}</td>
      <td>{renderStatusPill(vehicle.accountsStatus, vehicle.accountsRemark)}</td>
      <td>{renderStatusPill(vehicle.registrationStatus, vehicle.registrationRemark)}</td>
      <td>{renderStatusPill(vehicle.pdiStatus, vehicle.pdiRemark)}</td>
      <td>{renderStatusPill(vehicle.deliveryStatus, vehicle.cxoRemark)}</td>
      <td>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: progress === 100 ? 'var(--status-approved-text)' : 'var(--primary-blue)' }}>
          {progress}%
        </span>
      </td>
    </tr>
  );
}
