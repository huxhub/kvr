import React from 'react';

export default function AuditLogTable({
  loading,
  auditLogs,
  currentPage,
  formatTimestamp,
  renderStatus
}) {
  return (
    <div className="audit-table-wrapper">
      <table className="audit-table">
        <thead>
          <tr>
            <th style={{ width: '40px', paddingLeft: '16px' }}>#</th>
            <th>Timestamp</th>
            <th>Chassis Number</th>
            <th>Customer Name</th>
            <th>Changed By</th>
            <th>Department Section</th>
            <th>Previous Status</th>
            <th>New Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
          ) : auditLogs.length === 0 ? (
            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No audit logs found.</td></tr>
          ) : (
            auditLogs.map((log, index) => (
              <tr key={log._id || log.id}>
                <td style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', paddingLeft: '16px' }}>
                  {(currentPage - 1) * 25 + index + 1}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {formatTimestamp(log.timestamp)}
                </td>
                <td style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.02em' }}>
                  {log.chassisNumber}
                </td>
                <td>{log.customerName}</td>
                <td>
                  <span className="role-badge">
                    {log.updatedBy}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--primary-navy)' }}>{log.department}</td>
                <td>{renderStatus(log.previousStatus)}</td>
                <td>{renderStatus(log.newStatus)}</td>
                <td style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {log.remarks}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
