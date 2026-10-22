import mongoose from 'mongoose';
import app from '../server/app.js';

let cachedConnection = null;

async function connectDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  cachedConnection = await mongoose.connect(process.env.MONGO_URI);

  return cachedConnection;
}

export default async function handler(req, res) {
  try {
    await connectDatabase();

    return app(req, res);
  } catch (error) {
    console.error('API error:', error);

    return res.status(500).json({
      error: 'Server error',
    });
  }
}