import { pool } from '../config/db.js';

/**
 * Audit model — MySQL query functions replacing Mongoose model.
 * Primary key: id (INT AUTO_INCREMENT)
 */

const AUDIT_COLUMNS = [
  'chassisNumber', 'customerName', 'updatedBy', 'department',
  'previousStatus', 'newStatus', 'remarks', 'timestamp'
];

/** Get audit logs (paginated), ordered by timestamp descending */
export async function findAll(page = 1, limit = 25) {
  const activeLimit = Math.min(25, Math.max(1, parseInt(limit, 10) || 25));
  const activePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (activePage - 1) * activeLimit;

  const [rows] = await pool.execute(
    'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?',
    [activeLimit.toString(), offset.toString()]
  );
  return rows;
}

/** Get total count of audit logs */
export async function countAll() {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM audit_logs');
  return rows[0].count;
}

/** Get audit logs filtered by branch (via vehicles join) — for BRANCH_MANAGER */
export async function findByBranch(branch, page = 1, limit = 25) {
  const activeLimit = Math.min(25, Math.max(1, parseInt(limit, 10) || 25));
  const activePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (activePage - 1) * activeLimit;

  const [rows] = await pool.execute(
    `SELECT a.* FROM audit_logs a
     INNER JOIN vehicles v ON a.chassisNumber = v.chassisNumber
     WHERE v.branch = ?
     ORDER BY a.timestamp DESC LIMIT ? OFFSET ?`,
    [branch, activeLimit.toString(), offset.toString()]
  );
  return rows;
}

/** Count audit logs filtered by branch */
export async function countByBranch(branch) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as count FROM audit_logs a
     INNER JOIN vehicles v ON a.chassisNumber = v.chassisNumber
     WHERE v.branch = ?`,
    [branch]
  );
  return rows[0].count;
}

/** Insert one or many audit log records */
export async function insertMany(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return 0;

  // Build a multi-row INSERT for efficiency
  const placeholderRow = `(${AUDIT_COLUMNS.map(() => '?').join(', ')})`;
  const allPlaceholders = logs.map(() => placeholderRow).join(', ');
  const values = [];

  for (const log of logs) {
    for (const col of AUDIT_COLUMNS) {
      values.push(log[col] !== undefined ? log[col] : null);
    }
  }

  const [result] = await pool.execute(
    `INSERT INTO audit_logs (${AUDIT_COLUMNS.join(', ')}) VALUES ${allPlaceholders}`,
    values
  );

  return result.affectedRows;
}

/** Delete all audit logs */
export async function deleteAll() {
  await pool.execute('DELETE FROM audit_logs');
}

/** Update chassisNumber referenced in audit logs */
export async function updateChassisNumber(oldChassis, newChassis) {
  await pool.execute(
    'UPDATE audit_logs SET chassisNumber = ? WHERE chassisNumber = ?',
    [newChassis, oldChassis]
  );
}
