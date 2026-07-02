/**
 * seed.js — One-time migration script
 * Reads data from backend/data/*.json files and inserts them into MongoDB.
 * Run once with: node scripts/seed.js
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Import Mongoose Models
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Audit from '../models/Audit.js';

const readJSON = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  [SKIP] ${filename} not found.`);
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  // Handle { vehicles: [...] } wrapper or plain array
  return Array.isArray(parsed) ? parsed : (parsed.vehicles || []);
};

const seed = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/kvr';
    await mongoose.connect(uri);
    console.log('MongoDB Connected for seeding...\n');

    // ── USERS ─────────────────────────────────────────────────────
    const usersData = readJSON('users.json');
    if (usersData.length > 0) {
      await User.deleteMany({});
      await User.insertMany(usersData, { ordered: false });
      console.log(`✅ Seeded ${usersData.length} users`);
    }

    // ── VEHICLES ──────────────────────────────────────────────────
    const vehiclesData = readJSON('database.json');
    if (vehiclesData.length > 0) {
      await Vehicle.deleteMany({});
      // insertMany with ordered:false to continue past duplicates
      const result = await Vehicle.insertMany(vehiclesData, { ordered: false });
      console.log(`✅ Seeded ${result.length} vehicles`);
    }

    // ── AUDIT LOGS ────────────────────────────────────────────────
    const auditData = readJSON('audit_logs.json');
    if (auditData.length > 0) {
      await Audit.deleteMany({});
      await Audit.insertMany(auditData, { ordered: false });
      console.log(`✅ Seeded ${auditData.length} audit logs`);
    }

    console.log('\n🎉 Seeding complete! You can now start the server.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
