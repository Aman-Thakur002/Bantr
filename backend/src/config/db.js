import mongoose from 'mongoose';
import { config } from './env.js';
import logger from './logger.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

   console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.connection.close();
   console.log('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
}