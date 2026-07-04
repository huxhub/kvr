import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Ensure env vars are loaded before pool creation
// (ES module imports run before dotenv.config() in server.js)
dotenv.config();

// MySQL connection pool — shared across the entire application
const pool = mysql.createPool({
  host:            process.env.DB_HOST || 'localhost',
  port:            parseInt(process.env.DB_PORT, 10) || 3306,
  user:            process.env.DB_USER || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME || 'kvr',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit:      0,
  // Return DATETIME / TIMESTAMP as JS strings instead of Date objects
  // to match the previous Mongoose string-based timestamp behavior
  dateStrings:     true,
});

/**
 * Test the MySQL connection on startup with retry logic.
 * Does NOT call process.exit() on failure — the server stays up
 * so it can serve a proper error response, matching the old behavior.
 */
const connectDB = async () => {
  const MAX_RETRIES = 5;
  let attempt = 0;

  const tryConnect = async () => {
    attempt++;
    try {
      const connection = await pool.getConnection();
      console.log(`✅ MySQL Connected: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'kvr'}`);
      connection.release();
    } catch (error) {
      console.error(`❌ MySQL Connection Failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`🔄 Retrying in 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
        await tryConnect();
      } else {
        console.error('⚠️  Could not connect to MySQL after multiple attempts.');
        console.error('   Update DB_HOST / DB_USER / DB_PASSWORD / DB_NAME in backend/.env');
        console.error('   Server is running but database operations will fail until connected.');
      }
    }
  };

  await tryConnect();
};

export { pool };
export default connectDB;
