import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { calculateProgress } from '../../utils/vehicleUtils.js';

export default function DeliveryTableRow({ vehicle, openDrawer, index, isAdmin, onDelete, isSelected, onToggleSelect }) {
  const progress = calculateProgress(vehicle);
  const [tooltip, setTooltip] = useState(null);

  const renderStatusPill = (status, remark, percentage, fieldKey) => {
    const displayStatus = status || 'Not Attended';
    const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');
    const hasPercentage = percentage !== undefined && percentage !== null && percentage !== '';
    const hasTooltip = true;

    return (
      <div
        className="status-pill-container"
        style={{ display: 'inline-flex' }}
        onMouseEnter={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setTooltip({
            id: `status-tooltip-${vehicle.chassisNumber}-${fieldKey}`,
            left: rect.left + rect.width / 2,
            top: rect.top,
            displayStatus,
            percentage: hasPercentage ? percentage : null,
            remark
          });
        }}
        onMouseLeave={() => setTooltip(null)}
        onFocus={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setTooltip({
            id: `status-tooltip-${vehicle.chassisNumber}-${fieldKey}`,
            left: rect.left + rect.width / 2,
            top: rect.top,
            displayStatus,
            percentage: hasPercentage ? percentage : null,
            remark
          });
        }}
        onBlur={() => setTooltip(null)}
      >
        <span
          className={`badge-status ${statusClass}`}
          tabIndex={hasTooltip ? 0 : undefined}
          aria-describedby={hasTooltip ? `status-tooltip-${vehicle.chassisNumber}-${fieldKey}` : undefined}
        >
          <span className="badge-dot"></span>
          {displayStatus}
        </span>
      </div>
    );
  };

  return (
    <>
    <tr onClick={() => openDrawer(vehicle)} style={{ cursor: 'pointer', backgroundColor: isSelected ? '#f0f7ff' : undefined }}>
      <td onClick={(e) => e.stopPropagation()} style={{ width: '40px', paddingLeft: '16px', textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={!!isSelected}
          onChange={() => onToggleSelect && onToggleSelect(vehicle.chassisNumber)}
          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
        />
      </td>
      <td style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', paddingLeft: '8px' }}>{index}</td>
      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{vehicle.customerName || '-'}</td>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary-navy)' }}>{vehicle.pl}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vehicle.variant}</span>
        </div>
      </td>
      <td>{vehicle.branch || '-'}</td>
      <td>{renderStatusPill(vehicle.financeStatus, vehicle.financeRemark, vehicle.fundPercentage, 'finance')}</td>
      <td>{renderStatusPill(vehicle.tmaStatus, vehicle.tmaRemark, null, 'tma')}</td>
      <td>{renderStatusPill(vehicle.accountsStatus, vehicle.accountsRemark, null, 'accounts')}</td>
      <td>{renderStatusPill(vehicle.registrationStatus, vehicle.registrationRemark, null, 'registration')}</td>
      <td>{renderStatusPill(vehicle.tmgaStatus, vehicle.tmgaRemark, null, 'tmga')}</td>
      <td>{renderStatusPill(vehicle.pdiStatus, vehicle.pdiRemark, null, 'pdi')}</td>
      <td>{renderStatusPill(vehicle.deliveryStatus, vehicle.cxoRemark, null, 'delivery')}</td>
      <td>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: progress === 100 ? 'var(--status-approved-text)' : 'var(--primary-blue)' }}>
          {progress}%
        </span>
      </td>
      {isAdmin && (
        <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
          <button
            type="button"
            className="btn-danger-mini"
            onClick={() => onDelete && onDelete(vehicle)}
            title="Delete Record"
          >
            Delete
          </button>
        </td>
      )}
    </tr>
    {tooltip && createPortal(
      <span
        id={tooltip.id}
        className="status-tooltip status-tooltip-portal"
        role="tooltip"
        style={{ left: tooltip.left, top: tooltip.top }}
      >
        <div>{tooltip.displayStatus}</div>
        {tooltip.percentage !== null && <div>Finance Progress: {tooltip.percentage}%</div>}
        {tooltip.remark && <div>{tooltip.remark}</div>}
      </span>,
      document.body
    )}
    </>
  );
}
