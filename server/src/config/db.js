import mongoose from 'mongoose';

export let isConnectedToMongo = false;
export let isMockModeActive = false;

export async function connectDB() {
  const rawUri =
    process.env.MONGODB_URI ||
    process.env.MONGODB_ATLAS_URI ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URI;

  const uri = rawUri ? rawUri.trim().replace(/^["']|["']$/g, '') : '';
  const isCloudOrProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.HEROKU_APP_ID);

  // If running in cloud/production and no URI was provided in environment variables:
  if (!uri && isCloudOrProduction) {
    isConnectedToMongo = false;
    isMockModeActive = true;
    console.warn('\n=============================================================================');
    console.warn('⚠️  MANAMART CLOUD DEPLOYMENT NOTICE (Render / Cloud Container):');
    console.warn('⚠️  No MONGODB_URI or MONGODB_ATLAS_URI environment variable detected.');
    console.warn('⚠️  Cloud environments do not have a local MongoDB daemon at 127.0.0.1:27017.');
    console.warn('');
    console.warn('👉  TO CONNECT YOUR MONGODB ATLAS CLUSTER:');
    console.warn('    1. Open Render Dashboard -> Select your ManaMart Web Service');
    console.warn('    2. Go to the "Environment" tab');
    console.warn('    3. Add: MONGODB_URI = mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/localloop_manamart?retryWrites=true&w=majority');
    console.warn('    4. In MongoDB Atlas -> Network Access -> Ensure "0.0.0.0/0" is whitelisted');
    console.warn('    5. Save Changes — Render will automatically redeploy and connect!');
    console.warn('');
    console.warn('🛡️  SAFE HYBRID MODE: Operating in High-Fidelity Standalone Store mode.');
    console.warn('    All customer, merchant, rider, and admin workflows are 100% active.');
    console.warn('=============================================================================\n');
    return;
  }

  const connectionUri = uri || 'mongodb://127.0.0.1:27017/localloop_manamart';
  const isAtlas = connectionUri.startsWith('mongodb+srv://');

  if (isAtlas) {
    console.log(`🌐 MongoDB Atlas cluster target detected.`);
  } else {
    console.log(`💻 Local MongoDB Compass target detected: ${connectionUri}`);
  }

  try {
    const maskedTarget = connectionUri.includes('@')
      ? connectionUri.split('@')[1]
      : connectionUri;
    console.log(`🔄 Attempting database connection to: ${maskedTarget}`);

    await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnectedToMongo = true;
    isMockModeActive = false;
    console.log(`✅ ${isAtlas ? 'MongoDB Atlas' : 'MongoDB Compass / Local'} connected successfully [Database: ${mongoose.connection.name}]`);

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
    isMockModeActive = true;
    console.warn('\n=============================================================================');
    console.warn('⚠️  MONGODB CONNECTION NOTICE:');
    console.warn(`⚠️  Failed to connect to ${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'}: ${err.message}`);
    if (isAtlas) {
      console.warn('👉  Troubleshooting MongoDB Atlas:');
      console.warn('    1. IP Whitelist: Atlas -> Network Access -> Add IP Address "0.0.0.0/0"');
      console.warn('    2. Password: Ensure special characters in password are URL-encoded');
      console.warn('    3. User: Ensure Database User has readWriteAnyDatabase permission');
    } else {
      console.warn('👉  Local Compass daemon not running at 127.0.0.1:27017.');
      console.warn('    To connect Atlas, set MONGODB_URI=mongodb+srv://... in your environment.');
    }
    console.warn('🛡️  SAFE HYBRID MODE: Keeping server ONLINE in Standalone Store mode.');
    console.warn('    Deploy will NOT crash; full platform functionality remains accessible.');
    console.warn('=============================================================================\n');
  }
}

export function getDatabaseHealth() {
  return {
    connected: isConnectedToMongo,
    mockMode: isMockModeActive,
    readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    databaseName: isConnectedToMongo ? mongoose.connection.name : 'in-memory-standalone',
  };
}
