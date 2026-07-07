/**
 * Run this script once to create tables and seed data.
 * Usage: node database/setup.js
 */
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ override: true });

const __dirname = dirname(fileURLToPath(import.meta.url));

async function setup() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT, 10) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kvr',
    multipleStatements: true, // required to run .sql files with many statements
  });

  try {
    console.log('✅ Connected to MySQL');

    // 1. Run schema.sql (creates tables)
    console.log('\n📦 Creating tables...');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(schema);
    console.log('✅ Tables created');

    // 2. Run seed.sql (inserts data)
    console.log('\n🌱 Seeding data...');
    const seed = readFileSync(join(__dirname, 'seed.sql'), 'utf8');
    await conn.query(seed);
    console.log('✅ Data seeded');

    // 3. Verify
    const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
    const [vehicles] = await conn.query('SELECT COUNT(*) as count FROM vehicles');
    const [audits] = await conn.query('SELECT COUNT(*) as count FROM audit_logs');
    const [settings] = await conn.query('SELECT COUNT(*) as count FROM settings');

    console.log('\n📊 Final counts:');
    console.log(`   Users:      ${users[0].count}`);
    console.log(`   Vehicles:   ${vehicles[0].count}`);
    console.log(`   Audit logs: ${audits[0].count}`);
    console.log(`   Settings:   ${settings[0].count}`);
    console.log('\n✅ Setup complete!');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
  } finally {
    await conn.end();
  }
}

setup();
