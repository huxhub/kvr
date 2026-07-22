import { pool } from '../config/db.js';

/**
 * User model — MySQL query functions replacing Mongoose model.
 * Primary key: username (VARCHAR)
 */

/** Find a single user by username */
export async function findByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
}

/** Find a single user by email */
export async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email.toLowerCase()]
  );
  return rows[0] || null;
}

/** Get all users (paginated, excludes password for client safety, optionally filtered by branch) */
export async function findAll(page = 1, limit = 15, branch = null) {
  const activeLimit = Math.min(15, Math.max(1, parseInt(limit, 10) || 15));
  const activePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (activePage - 1) * activeLimit;

  if (branch) {
    const [rows] = await pool.execute(
      "SELECT username, role, name, branch, email FROM users WHERE branch = ? AND role != 'ADMIN' LIMIT ? OFFSET ?",
      [branch, activeLimit.toString(), offset.toString()]
    );
    return rows;
  } else {
    const [rows] = await pool.execute(
      'SELECT username, role, name, branch, email FROM users LIMIT ? OFFSET ?',
      [activeLimit.toString(), offset.toString()]
    );
    return rows;
  }
}

/** Get total count of users, optionally filtered by branch */
export async function countAll(branch = null) {
  if (branch) {
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE branch = ? AND role != 'ADMIN'", [branch]);
    return rows[0].count;
  } else {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
    return rows[0].count;
  }
}

/** Create a new user */
export async function create({ username, password, role, name, branch = '', email = '' }) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, password, role, name, branch, email) VALUES (?, ?, ?, ?, ?, ?)',
    [username.toLowerCase(), password, role, name, branch, email]
  );
  return { username: username.toLowerCase(), role, name, branch, email };
}

/** Update a user by username. Only updates provided fields. */
export async function updateByUsername(username, data) {
  // Build SET clause dynamically from provided fields
  const allowed = ['password', 'role', 'name', 'branch', 'email', 'username'];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      // normalize username to lowercase if it's changing
      if (key === 'username') {
        values.push(data[key].toLowerCase());
      } else {
        values.push(data[key]);
      }
    }
  }

  if (fields.length === 0) return null;

  values.push(username.toLowerCase());

  const [result] = await pool.execute(
    `UPDATE users SET ${fields.join(', ')} WHERE username = ?`,
    values
  );

  if (result.affectedRows === 0) return null;

  // If username was updated, we need to query using the new username
  const targetUsername = data.username ? data.username.toLowerCase() : username.toLowerCase();

  // Return the updated user (without password)
  const [rows] = await pool.execute(
    'SELECT username, role, name, branch, email FROM users WHERE username = ?',
    [targetUsername]
  );
  return rows[0] || null;
}

/** Delete a user by username */
export async function deleteByUsername(username) {
  const [result] = await pool.execute(
    'DELETE FROM users WHERE username = ?',
    [username.toLowerCase()]
  );
  return result.affectedRows > 0;
}

/** Update password for a specific user (used during auto-upgrade from plain-text) */
export async function updatePassword(username, hashedPassword) {
  await pool.execute(
    'UPDATE users SET password = ? WHERE username = ?',
    [hashedPassword, username]
  );
}
