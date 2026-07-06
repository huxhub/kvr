import { pool } from '../config/db.js';

/**
 * Settings model — MySQL query functions replacing Mongoose model.
 * Primary key: setting_key (VARCHAR)
 *
 * The `branches` field is stored as a JSON column.
 * mysql2 automatically parses JSON columns into JS arrays/objects on read.
 */

const SETTING_FIELDS = [
  'companyName', 'companyPhone', 'companyEmail', 'companyAddress',
  'branches', 'theme', 'enableAlerts'
];

/** Find settings by key (usually 'global') */
export async function findByKey(key = 'global') {
  const [rows] = await pool.execute(
    'SELECT * FROM settings WHERE setting_key = ? LIMIT 1',
    [key]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  // Map enableAlerts from TINYINT(1) back to boolean
  row.enableAlerts = !!row.enableAlerts;
  // Safely parse branches: mysql2 parses JSON columns automatically,
  // but if the column is TEXT, it comes back as a string — parse manually.
  if (typeof row.branches === 'string') {
    try { row.branches = JSON.parse(row.branches); } catch { row.branches = ['Perinthalmanna']; }
  }
  if (!Array.isArray(row.branches)) row.branches = ['Perinthalmanna'];
  // Map setting_key to key for API compatibility
  row.key = row.setting_key;
  return row;
}

/** Create default settings if they don't exist */
export async function createDefault(key = 'global') {
  await pool.execute(
    `INSERT IGNORE INTO settings (setting_key, branches) VALUES (?, ?)`,
    [key, JSON.stringify(['Perinthalmanna'])]
  );
  return findByKey(key);
}

/** Update settings by key using an upsert pattern */
export async function upsert(key, data) {
  // First ensure the row exists
  let settings = await findByKey(key);
  if (!settings) {
    settings = await createDefault(key);
  }

  // Build UPDATE from provided fields
  const fields = [];
  const values = [];

  for (const field of SETTING_FIELDS) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      if (field === 'branches') {
        // Serialize array to JSON string for storage
        values.push(JSON.stringify(data[field]));
      } else if (field === 'enableAlerts') {
        // Convert boolean to TINYINT
        values.push(data[field] ? 1 : 0);
      } else {
        values.push(data[field]);
      }
    }
  }

  if (fields.length === 0) return settings;

  values.push(key);

  await pool.execute(
    `UPDATE settings SET ${fields.join(', ')} WHERE setting_key = ?`,
    values
  );

  return findByKey(key);
}
