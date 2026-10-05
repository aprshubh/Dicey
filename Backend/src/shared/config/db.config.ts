import mongoose from 'mongoose';
import { env } from './env.config';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('📦 MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB connection disconnected');
    });

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: env.NODE_ENV !== 'production',
    });
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB on startup:', error);
    // Don't crash immediately in dev mode if MongoDB URI hasn't been configured yet, but log clear instructions
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('⚠️ Server started, but MongoDB is not connected yet. Please update MONGODB_URI in your .env file.');
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('📦 MongoDB disconnected successfully');
  } catch (error) {
    logger.error('❌ Error during MongoDB disconnection:', error);
  }
};
