import { useState, useCallback } from 'react';
import { getAuditLogs as apiGetAuditLogs } from '../models/auditModel.js';

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAuditLogs = useCallback(async (keyword = '') => {
    setLoading(true);
    try {
      let logs = await apiGetAuditLogs();
      
      if (keyword) {
        const kw = keyword.toLowerCase();
        logs = logs.filter(log => 
          (log.chassisNumber && log.chassisNumber.toLowerCase().includes(kw)) ||
          (log.customerName && log.customerName.toLowerCase().includes(kw)) ||
          (log.department && log.department.toLowerCase().includes(kw)) ||
          (log.remarks && log.remarks.toLowerCase().includes(kw))
        );
      }
      
      setAuditLogs(logs);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAuditLogs = async () => {
    try {
      await fetch('/api/audit_logs', { method: 'DELETE' });
      await fetchAuditLogs();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { auditLogs, loading, error, fetchAuditLogs, clearAuditLogs };
}
