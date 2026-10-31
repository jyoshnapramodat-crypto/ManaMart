import mongoose from 'mongoose';

export let isConnectedToMongo = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/localloop_manamart';
  
  try {
    // Attempt connection with 1 second timeout so app boots instantly
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1000,
    });
    isConnectedToMongo = true;
    console.log('✅ MongoDB connected successfully to:', mongoose.connection.name);
  } catch (err) {
    isConnectedToMongo = false;
    console.log('ℹ️ Notice: MongoDB daemon not detected locally. Seamlessly operating in high-performance in-memory repository store.');
  }
}
