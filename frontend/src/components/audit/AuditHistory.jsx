import React, { useEffect, useState } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import AuditLogTable from './AuditLogTable.jsx';

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

        <AuditLogTable 
          loading={loading}
          auditLogs={auditLogs}
          currentPage={currentPage}
          formatTimestamp={formatTimestamp}
          renderStatus={renderStatus}
        />

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
