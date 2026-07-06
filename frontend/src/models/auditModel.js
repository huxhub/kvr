// KVR Tata Delivery Tracker - Audit Log Utilities (audit.js)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function getAuditLogs(page = 1, limit = 25) {
  const res = await fetch(`${API_BASE_URL}/api/audit_logs?page=${page}&limit=${limit}`);
  if (!res.ok) {
    throw new Error('Failed to retrieve audit logs from server');
  }
  const logs = await res.json();
  const totalCount = parseInt(res.headers.get('X-Total-Count'), 10) || logs.length;
  return { logs, totalCount };
}

export async function addAuditLog(entry) {
  const res = await fetch(`${API_BASE_URL}/api/audit_logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(entry)
  });

  if (!res.ok) {
    throw new Error('Failed to save audit log entry to backend');
  }
  
  return await res.json();
}

export async function getAuditLogsForVehicle(chassisNumber) {
  const { logs } = await getAuditLogs(1, 25);
  return logs.filter(log => log.chassisNumber === chassisNumber);
}

// Kept as a dummy stub for frontend modules compatibility
export function generateSeedAuditLogs(vehicles) {
  // Handled entirely server-side in server.js during initialization or DB reset
  return [];
}
