import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import vehicleRoutes from './routes/vehicles.js';
import auditRoutes from './routes/audit.js';

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/audit_logs', auditRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running with MongoDB' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
