import mongoose from 'mongoose';

let cachedConnection = null;

export async function connectDB() {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  // Reuse an existing connection attempt
  if (!cachedConnection) {
    cachedConnection = mongoose.connect(process.env.MONGO_URI);
  }

  try {
    await cachedConnection;

    console.log('MongoDB connected successfully');

    return mongoose.connection;
  } catch (error) {
    cachedConnection = null;
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}