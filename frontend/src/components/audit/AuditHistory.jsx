import React, { useEffect, useState } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AuditHistory() {
  const { auditLogs, totalAudits, currentPage, fetchAuditLogs, clearAuditLogs, loading } = useAuditLogs();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [keyword, setKeyword] = useState('');

  // Load on mount and whenever keyword changes
  useEffect(() => {
    fetchAuditLogs(1, 25, keyword);
  }, [fetchAuditLogs, keyword]);

  const handleClear = async () => {
    if (window.confirm('Clear all audit logs from storage? This action cannot be undone.')) {
      const result = await clearAuditLogs();
      if (result.success) {
        showToast('Audits Cleared', 'Audit trail has been reset.', 'info');
      } else {
        showToast('Clear Failed', result.error, 'error');
      }
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '-';
    if (typeof ts === 'string' && ts.length === 19 && ts.includes('-') && ts.includes(':')) {
      return ts;
    }
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toISOString().replace('T', ' ').substring(0, 19);
    } catch {
      return ts;
    }
  };

  const renderStatus = (status) => {
    if (!status) return '-';
    const clean = status.trim();
    if (clean === 'Approved' || clean === 'Pending' || clean === 'Not Attended') {
      const cls = clean.toLowerCase().replace(/\s+/g, '-');
      return (
        <span className={`badge-status ${cls}`} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
          {clean}
        </span>
      );
    }
    return <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>{clean}</span>;
  };

  return (
    <div id="audit-view" className="tab-content active">
      <div className="audit-log-container">
        <div className="audit-header-bar">
          <div className="audit-header-title">
            <h3>Global Audit History & System Logs</h3>
          </div>
          <div className="audit-header-actions">
            <input 
              type="text" 
              className="audit-search-input"
              placeholder="Filter logs by keyword..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button
              className="btn-secondary"
              onClick={() => fetchAuditLogs(currentPage, 25, keyword)}
              disabled={loading}
              title="Refresh audit logs"
              style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {loading ? '⏳' : '🔄'} Refresh
            </button>
            {(() => {
              const userRoles = user?.role ? user.role.split(',').map(r => r.trim()) : [];
              return userRoles.includes('ADMIN');
            })() && (
              <button className="btn-secondary audit-clear-btn" onClick={handleClear}>
                Clear Audit Files
              </button>
            )}
          </div>
        </div>

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

        {/* Pagination Controls */}
        {totalAudits > 25 && (
          <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px', padding: '10px 0' }}>
            <button 
              type="button"
              className="btn-secondary" 
              disabled={currentPage === 1} 
              onClick={() => fetchAuditLogs(currentPage - 1, 25, keyword)}
              style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
              Page {currentPage} of {Math.ceil(totalAudits / 25)}
            </span>
            
            <button 
              type="button"
              className="btn-secondary" 
              disabled={currentPage >= Math.ceil(totalAudits / 25)} 
              onClick={() => fetchAuditLogs(currentPage + 1, 25, keyword)}
              style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: currentPage >= Math.ceil(totalAudits / 25) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage >= Math.ceil(totalAudits / 25) ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
