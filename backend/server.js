import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { requireSession } from './middleware/requireSession.js';

// Load env vars first
import { execSync } from 'child_process';
try { execSync(''); } catch (_) {}

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Only allow requests from the configured origin (dev: localhost:5173)
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,          // Allow cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Role', 'X-Remarks']
}));

// ─── Body / Cookie Parsing ────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── Session ──────────────────────────────────────────────────────────────────
app.use(session({
  name: 'kvr.sid',
  secret: process.env.SESSION_SECRET || 'fallback-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,           // JS cannot read the cookie
    sameSite: 'strict',       // Blocks CSRF from cross-site requests
    secure: false,            // Set to true when serving over HTTPS in production
    maxAge: 8 * 60 * 60 * 1000  // 8-hour session lifetime
  }
}));

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import vehicleRoutes from './routes/vehicles.js';
import auditRoutes from './routes/audit.js';
import settingsRoutes from './routes/settings.js';

// Public routes (no session required)
app.use('/api/auth', authRoutes);

// Protected routes (session required)
app.use('/api/users', requireSession, userRoutes);
app.use('/api/vehicles', requireSession, vehicleRoutes);
app.use('/api/audit_logs', requireSession, auditRoutes);
app.use('/api/settings', requireSession, settingsRoutes);

// Basic health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running with MongoDB' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
