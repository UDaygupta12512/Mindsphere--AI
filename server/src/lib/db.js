import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Check if MongoDB URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('🔗 Connecting to MongoDB...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'development');
    
    // Add connection options for better Vercel compatibility
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 5, // Minimum number of connections in the pool
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    
    // In serverless environments like Vercel, don't exit the process
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw error; // Let the calling function handle the error
    } else {
      process.exit(1);
    }
  }
};
