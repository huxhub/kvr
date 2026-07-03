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
        <div className="main-header" style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--border-light)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)' }}>Global Audit History & System Logs</h3>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Filter logs by keyword..." 
              style={{ width: '300px' }} 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {user.role === 'ADMIN' && (
              <button className="btn-secondary" style={{ borderColor: '#cbd5e1', fontSize: '0.8rem' }} onClick={handleClear}>
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
