/**
 * One-time MongoDB → MySQL Data Migration Script
 * ================================================
 * Usage:  node database/migrate-from-mongo.js
 *
 * This script:
 *  1. Connects to the old MongoDB database
 *  2. Reads all documents from users, vehicles, audits, settings
 *  3. Inserts them into MySQL tables (in dependency order)
 *  4. Uses ON DUPLICATE KEY to prevent duplicate failures
 *  5. Logs success / failure for each collection
 *
 * Prerequisites:
 *  - MongoDB must still be running and accessible
 *  - MySQL database and tables must already exist (run schema.sql first)
 *  - Set MONGO_URI in .env or pass as env variable
 *
 * DO NOT run this as part of normal application startup.
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kvr';

const mysqlConfig = {
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT, 10) || 3306,
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kvr',
};

async function migrate() {
  let mongoClient;
  let mysqlConn;

  try {
    // ── Connect to both databases ──
    console.log('Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const mongoDB = mongoClient.db();
    console.log('✅ MongoDB connected');

    console.log('Connecting to MySQL...');
    mysqlConn = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL connected');

    // ── 1. Migrate Users ──
    console.log('\n── Migrating users ──');
    const users = await mongoDB.collection('users').find({}).toArray();
    let usersOk = 0, usersFail = 0;
    for (const u of users) {
      try {
        await mysqlConn.execute(
          `INSERT INTO users (username, password, role, name, branch)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role), name = VALUES(name), branch = VALUES(branch)`,
          [
            (u.username || '').toLowerCase(),
            u.password || '',
            u.role || '',
            u.name || '',
            u.branch || 'Perinthalmanna',
          ]
        );
        usersOk++;
      } catch (err) {
        usersFail++;
        console.error(`  ✗ User "${u.username}": ${err.message}`);
      }
    }
    console.log(`  ✓ Users migrated: ${usersOk} ok, ${usersFail} failed (of ${users.length})`);

    // ── 2. Migrate Vehicles ──
    console.log('\n── Migrating vehicles ──');
    const vehicles = await mongoDB.collection('vehicles').find({}).toArray();
    let vehiclesOk = 0, vehiclesFail = 0;

    const VCOLS = [
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
      'deliveryStatus', 'deliveryTimestamp',
    ];

    for (const v of vehicles) {
      try {
        const vals = VCOLS.map(c => v[c] !== undefined ? v[c] : null);
        const placeholders = VCOLS.map(() => '?').join(', ');
        await mysqlConn.execute(
          `INSERT INTO vehicles (${VCOLS.join(', ')}) VALUES (${placeholders})
           ON DUPLICATE KEY UPDATE customerName = VALUES(customerName)`,
          vals
        );
        vehiclesOk++;
      } catch (err) {
        vehiclesFail++;
        console.error(`  ✗ Vehicle "${v.chassisNumber}": ${err.message}`);
      }
    }
    console.log(`  ✓ Vehicles migrated: ${vehiclesOk} ok, ${vehiclesFail} failed (of ${vehicles.length})`);

    // ── 3. Migrate Audit Logs ──
    console.log('\n── Migrating audit logs ──');
    const audits = await mongoDB.collection('audits').find({}).toArray();
    let auditsOk = 0, auditsFail = 0;

    for (const a of audits) {
      try {
        const ts = a.timestamp instanceof Date ? a.timestamp.toISOString().slice(0, 19).replace('T', ' ') : (a.timestamp || null);
        await mysqlConn.execute(
          `INSERT INTO audit_logs (chassisNumber, customerName, updatedBy, department, previousStatus, newStatus, remarks, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            a.chassisNumber || '',
            a.customerName || '',
            a.updatedBy || '',
            a.department || '',
            a.previousStatus || '',
            a.newStatus || '',
            a.remarks || null,
            ts,
          ]
        );
        auditsOk++;
      } catch (err) {
        auditsFail++;
        console.error(`  ✗ Audit log: ${err.message}`);
      }
    }
    console.log(`  ✓ Audit logs migrated: ${auditsOk} ok, ${auditsFail} failed (of ${audits.length})`);

    // ── 4. Migrate Settings ──
    console.log('\n── Migrating settings ──');
    const settingsDocs = await mongoDB.collection('settings').find({}).toArray();
    let settingsOk = 0, settingsFail = 0;

    for (const s of settingsDocs) {
      try {
        const key = s.key || 'global';
        const branches = JSON.stringify(s.branches || ['Perinthalmanna']);
        await mysqlConn.execute(
          `INSERT INTO settings (setting_key, companyName, companyPhone, companyEmail, companyAddress, branches, theme, enableAlerts)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE companyName = VALUES(companyName), branches = VALUES(branches)`,
          [
            key,
            s.companyName || 'KVR TATA',
            s.companyPhone || '+91 98470 12345',
            s.companyEmail || 'support@kvrgroup.com',
            s.companyAddress || 'KVR Group, NH 66, Perinthalmanna, Kerala',
            branches,
            s.theme || 'light',
            s.enableAlerts !== false ? 1 : 0,
          ]
        );
        settingsOk++;
      } catch (err) {
        settingsFail++;
        console.error(`  ✗ Settings "${s.key}": ${err.message}`);
      }
    }
    console.log(`  ✓ Settings migrated: ${settingsOk} ok, ${settingsFail} failed (of ${settingsDocs.length})`);

    console.log('\n✅ Migration complete!');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (mongoClient) await mongoClient.close();
    if (mysqlConn) await mysqlConn.end();
  }
}

migrate();
