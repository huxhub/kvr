import React from 'react';

export default function BookingTableRow({ vehicle, openDrawer, index, isAdmin, onDelete }) {
  const renderBadge = (text) => {
    if (!text) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
    const t = text.toUpperCase();
    let bg = '#e2e8f0'; // Neutral gray
    let fg = '#475569';
    
    if (t.includes('DONE') || t.includes('APPROVED') || t.includes('STOCK') || t.includes('LIVE') || t.includes('PURCHASE')) {
      bg = '#dcfce7'; // Light green
      fg = '#166534'; // Dark green
    } else if (t.includes('PENDING') || t.includes('REQUESTED') || t.includes('BLOCKED') || t.includes('CHANGE')) {
      bg = '#fef9c3'; // Light yellow
      fg = '#854d0e'; // Dark yellow
    } else if (t.includes('CANCEL') || t.includes('REFUND') || t.includes('ISSUE') || t.includes('NOT LIVE') || t.includes('NO STOCK')) {
      bg = '#fee2e2'; // Light red
      fg = '#991b1b'; // Dark red
    }
    
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: bg,
        color: fg,
        whiteSpace: 'nowrap'
      }}>
        {text}
      </span>
    );
  };

  return (
    <tr onClick={() => openDrawer(vehicle)} style={{ cursor: 'pointer' }}>
      <td style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', paddingLeft: '16px' }}>{index}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.date || '-'}</td>
      <td style={{ fontWeight: 600, color: 'var(--primary-navy)', whiteSpace: 'nowrap' }}>{vehicle.customerName || '-'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.mobileNumber || '-'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.optyId || '-'}</td>
      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{vehicle.pl || '-'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.variant || '-'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.colour || '-'}</td>
      <td>{renderBadge(vehicle.boStatus)}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.boDate || '-'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.orderNumber || '-'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.sapOrderNo || '-'}</td>
      <td>{renderBadge(vehicle.crmBookingStatus)}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.ca || '-'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.tl || '-'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.branch || '-'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{vehicle.region || '-'}</td>
      <td>{renderBadge(vehicle.branchStatus)}</td>
      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={vehicle.branchRemark}>
        {vehicle.branchRemark || '-'}
      </td>
      <td>{renderBadge(vehicle.financeStatus)}</td>
      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={vehicle.financeRemark}>
        {vehicle.financeRemark || '-'}
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
  );
}
