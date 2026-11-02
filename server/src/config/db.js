import mongoose from 'mongoose';

export let isConnectedToMongo = false;
export let isMockModeActive = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';
  const explicitMockAllowed = process.env.USE_MOCK_DB === 'true';

  if (!uri && isProduction) {
    console.error('❌ CRITICAL CONFIGURATION ERROR: MONGODB_URI is required in production environment.');
    console.error('Please configure your MongoDB Atlas connection string in your production environment variables.');
    isConnectedToMongo = false;
    isMockModeActive = false;
    throw new Error('MONGODB_URI must be set in production mode.');
  }

  const connectionUri = uri || 'mongodb://127.0.0.1:27017/localloop_manamart';

  try {
    console.log(`🔄 Attempting database connection to: ${connectionUri.includes('@') ? connectionUri.split('@')[1] : connectionUri}`);
    
    await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
    });

    isConnectedToMongo = true;
    isMockModeActive = false;
    console.log(`✅ MongoDB Atlas / Server connected successfully [Database: ${mongoose.connection.name}]`);

    // Setup lifecycle event listeners
    mongoose.connection.on('error', (err) => {
      console.error('⚠️ MongoDB connection runtime error:', err.message);
      isConnectedToMongo = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected from server');
      isConnectedToMongo = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
      isConnectedToMongo = true;
    });

    // Graceful process shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Closing MongoDB connection gracefully...`);
      try {
        await mongoose.connection.close(false);
        console.log('✅ MongoDB connection closed cleanly.');
      } catch (e) {
        console.error('Error during database close:', e.message);
      }
      process.exit(0);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  } catch (err) {
    isConnectedToMongo = false;
    if (isProduction) {
      console.error('❌ CRITICAL DATABASE ERROR: Unable to establish MongoDB Atlas connection in production.');
      console.error('Production does not allow mock database fallback. Details:', err.message);
      throw err;
    } else {
      isMockModeActive = true;
      console.warn('⚠️ =====================================================================');
      console.warn('⚠️ DEVELOPMENT NOTICE: Local MongoDB instance not reachable.');
      console.warn('⚠️ Operating in High-Fidelity Development Mock Store (USE_MOCK_DB mode).');
      console.warn('⚠️ Configure MONGODB_URI in server/.env to connect to MongoDB Atlas.');
      console.warn('⚠️ =====================================================================');
    }
  }
}

export function getDatabaseHealth() {
  return {
    connected: isConnectedToMongo,
    mockMode: isMockModeActive,
    readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    databaseName: isConnectedToMongo ? mongoose.connection.name : 'in-memory-mock',
  };
}
