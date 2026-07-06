import { pool } from '../config/db.js';

/**
 * Vehicle model — MySQL query functions replacing Mongoose model.
 * Primary key: chassisNumber (VARCHAR)
 */

// All vehicle columns (excluding auto-managed created_at/updated_at)
const VEHICLE_COLUMNS = [
  'chassisNumber', 'date', 'customerName', 'mobileNumber', 'orderNumber',
  'invoiceNumber', 'source', 'year', 'vehicleStatus', 'fuel', 'pl',
  'variant', 'colour', 'vc', 'ca', 'tl', 'branch', 'hypothecation',
  'cashDiscount', 'exchangeLoyalty', 'corporate', 'sss', 'kpkb',
  'solarOffer', 'priceDifference', 'offerRemark', 'financeType',
  'onRoadPrice', 'ip', 'loanAmount', 'balanceAmount', 'fundPercentage',
  'loanAmountStatus', 'financeRemark', 'financeStatus', 'financeTimestamp',
  'exchangeYesNo', 'tmaType', 'makeAndModel', 'regNumber', 'tmaRemark',
  'tmaStatus', 'tmaTimestamp', 'fileStatus', 'fileTimestamp', 'tallyDate',
  'accountsRemark', 'accountsStatus', 'accountsTimestamp', 'insuranceName',
  'insuranceType', 'insurancePremium', 'insuranceRemark', 'insuranceStatus',
  'insuranceTimestamp', 'registrationType', 'applicationNumber', 'taxPaidDate',
  'registerNumber', 'hsrpStatus', 'registrationRemark', 'registrationStatus',
  'registrationTimestamp', 'tmgaValue', 'vasValue', 'tmgaRemark', 'tmgaStatus',
  'tmgaTimestamp', 'pdiRemark', 'pdiStatus', 'pdiTimestamp', 'cxoRemark',
  'expectedDeliveryDate', 'actualDeliveryDate', 'homeVisit14DayStatus',
  'deliveryStatus', 'deliveryTimestamp'
];

/** Get all vehicles (paginated) */
export async function findAll(page = 1, limit = 25) {
  const activeLimit = Math.min(25, Math.max(1, parseInt(limit, 10) || 25));
  const activePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (activePage - 1) * activeLimit;

  // Parameterized limit & offset need to be passed as strings in execute
  const [rows] = await pool.execute(
    'SELECT * FROM vehicles LIMIT ? OFFSET ?',
    [activeLimit.toString(), offset.toString()]
  );
  return rows;
}

/** Get total count of vehicles */
export async function countAll() {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM vehicles');
  return rows[0].count;
}

/** Get vehicles filtered by branch (paginated) — for BRANCH_MANAGER role */
export async function findByBranch(branch, page = 1, limit = 25) {
  const activeLimit = Math.min(25, Math.max(1, parseInt(limit, 10) || 25));
  const activePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (activePage - 1) * activeLimit;

  const [rows] = await pool.execute(
    'SELECT * FROM vehicles WHERE branch = ? LIMIT ? OFFSET ?',
    [branch, activeLimit.toString(), offset.toString()]
  );
  return rows;
}

/** Get count of vehicles filtered by branch */
export async function countByBranch(branch) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as count FROM vehicles WHERE branch = ?',
    [branch]
  );
  return rows[0].count;
}

/** Find a single vehicle by chassisNumber */
export async function findByChassis(chassisNumber) {
  const [rows] = await pool.execute(
    'SELECT * FROM vehicles WHERE chassisNumber = ? LIMIT 1',
    [chassisNumber]
  );
  return rows[0] || null;
}

/** Create a new vehicle from request body */
export async function create(data) {
  // Only pick columns that exist in the table
  const cols = [];
  const placeholders = [];
  const values = [];

  for (const col of VEHICLE_COLUMNS) {
    if (data[col] !== undefined) {
      cols.push(col);
      placeholders.push('?');
      values.push(data[col]);
    }
  }

  const [result] = await pool.execute(
    `INSERT INTO vehicles (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`,
    values
  );

  // Return the inserted row
  return findByChassis(data.chassisNumber);
}

/** Update a vehicle by chassisNumber. Only updates provided fields. */
export async function updateByChassis(chassisNumber, data) {
  const fields = [];
  const values = [];

  for (const col of VEHICLE_COLUMNS) {
    // Don't allow changing the primary key via update
    if (col === 'chassisNumber') continue;
    if (data[col] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(data[col]);
    }
  }

  if (fields.length === 0) return null;

  values.push(chassisNumber);

  const [result] = await pool.execute(
    `UPDATE vehicles SET ${fields.join(', ')} WHERE chassisNumber = ?`,
    values
  );

  if (result.affectedRows === 0) return null;

  // Return the updated row
  return findByChassis(chassisNumber);
}

/** Delete a vehicle by chassisNumber */
export async function deleteByChassis(chassisNumber) {
  const [result] = await pool.execute(
    'DELETE FROM vehicles WHERE chassisNumber = ?',
    [chassisNumber]
  );
  return result.affectedRows > 0;
}
