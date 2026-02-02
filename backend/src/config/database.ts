import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    
    console.log('[DB] MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected');
    });

    mongoose.connection.on('error', (error) => {
      console.error('[DB] MongoDB connection error:', error);
    });
  } catch (error) {
    console.error('[DB] Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('[DB] MongoDB disconnected successfully');
  } catch (error) {
    console.error('[DB] Failed to disconnect from MongoDB:', error);
    process.exit(1);
  }
};
