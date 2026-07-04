import React, { useEffect, useState } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AuditHistory() {
  const { auditLogs, fetchAuditLogs, clearAuditLogs, loading } = useAuditLogs();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchAuditLogs(keyword);
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
            {user.role === 'ADMIN' && (
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
                <th>Timestamp</th>
                <th>Chassis Number</th>
                <th>Customer Name</th>
                <th>Changed By</th>
                <th>Department / Section</th>
                <th>Previous Status</th>
                <th>New Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
              ) : auditLogs.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No audit logs found.</td></tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log._id || log.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{log.chassisNumber}</td>
                    <td>{log.customerName}</td>
                    <td>
                      <span className="role-badge" style={{ backgroundColor: 'var(--bg-alt)', color: 'var(--primary-navy)', border: '1px solid var(--border-light)' }}>
                        {log.updatedBy}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.department}</td>
                    <td>
                      <span className={`status-badge status-${log.previousStatus?.toLowerCase().replace(' ', '-')}`}>
                        {log.previousStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${log.newStatus?.toLowerCase().replace(' ', '-')}`}>
                        {log.newStatus}
                      </span>
                    </td>
                    <td style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {log.remarks}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
