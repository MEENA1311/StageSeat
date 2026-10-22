import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { connectDB } from './db.js';

import authRoutes from './routes/auth.js';
import showRoutes from './routes/shows.js';
import bookingRoutes from './routes/bookings.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true
  })
);

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StageSeat API'
  });
});

// Connect to MongoDB before database-dependent routes
const databaseMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DATABASE CONNECTION ERROR:', error);

    res.status(500).json({
      message: 'Database connection failed.',
      error: error.message
    });
  }
};

app.use('/api/auth', databaseMiddleware, authRoutes);
app.use('/api/shows', databaseMiddleware, showRoutes);
app.use('/api/bookings', databaseMiddleware, bookingRoutes);

export default app;