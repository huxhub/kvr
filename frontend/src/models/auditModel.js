// KVR Tata Delivery Tracker - Audit Log Utilities (audit.js)

export async function getAuditLogs() {
  const res = await fetch('/api/audit_logs');
  if (!res.ok) {
    throw new Error('Failed to retrieve audit logs from server');
  }
  return await res.json();
}

export async function addAuditLog(entry) {
  const res = await fetch('/api/audit_logs', {
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
  const logs = await getAuditLogs();
  return logs.filter(log => log.chassisNumber === chassisNumber);
}

// Kept as a dummy stub for frontend modules compatibility
export function generateSeedAuditLogs(vehicles) {
  // Handled entirely server-side in server.js during initialization or DB reset
  return [];
}
