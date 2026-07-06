import { useState, useCallback } from 'react';
import { getAuditLogs as apiGetAuditLogs } from '../models/auditModel.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [totalAudits, setTotalAudits] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAuditLogs = useCallback(async (page = 1, limit = 25, keyword = '') => {
    setLoading(true);
    try {
      const { logs, totalCount } = await apiGetAuditLogs(page, limit);
      
      let filtered = logs;
      if (keyword) {
        const kw = keyword.toLowerCase();
        filtered = logs.filter(log => 
          (log.chassisNumber && log.chassisNumber.toLowerCase().includes(kw)) ||
          (log.customerName && log.customerName.toLowerCase().includes(kw)) ||
          (log.department && log.department.toLowerCase().includes(kw)) ||
          (log.remarks && log.remarks.toLowerCase().includes(kw))
        );
      }
      
      setAuditLogs(filtered);
      setTotalAudits(totalCount);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAuditLogs = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/audit_logs`, { method: 'DELETE', credentials: 'include' });
      await fetchAuditLogs(1, 25);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { auditLogs, totalAudits, currentPage, loading, error, fetchAuditLogs, clearAuditLogs };
}
