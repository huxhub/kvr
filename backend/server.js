import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mysqlSessionFactory from 'express-mysql-session';
import dotenv from 'dotenv';
import connectDB, { pool } from './config/db.js';
import { requireSession } from './middleware/requireSession.js';

dotenv.config();


connectDB();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';


app.set('trust proxy', 1);


const allowedOrigins = [
  'http://localhost:5173',
  process.env.ALLOWED_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
   
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Role', 'X-Remarks'],
}));


app.use(express.json());

// Session store: MySQL via express-mysql-session (replaces connect-mongo MongoStore)
const MySQLStore = mysqlSessionFactory(session);
const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000,  // 15 min
  expiration: 8 * 60 * 60 * 1000,  // 8 hours (matches cookie maxAge)
  createDatabaseTable: true,        // auto-creates `sessions` table if missing
}, pool);

app.use(session({
  name: 'kvr.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,                         
    secure: isProd,                         
    sameSite: 'lax',                        
    maxAge: 8 * 60 * 60 * 1000,            
  },
}));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});


import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import vehicleRoutes from './routes/vehicles.js';
import auditRoutes from './routes/audit.js';
import settingsRoutes from './routes/settings.js';

app.use('/api/auth', authRoutes);

app.use('/api/users',      requireSession, userRoutes);
app.use('/api/vehicles',   requireSession, vehicleRoutes);
app.use('/api/audit_logs', requireSession, auditRoutes);
app.use('/api/settings',   requireSession, settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running with MySQL' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} [${isProd ? 'production' : 'development'}]`);
});
