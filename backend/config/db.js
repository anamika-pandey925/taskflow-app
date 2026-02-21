const mongoose = require('mongoose');

const connectDB = async () => {
  // First try the real MongoDB URI from .env
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (err) {
    console.warn(`⚠️  Could not reach MongoDB (${err.message})`);
    console.log('🔄 Falling back to in-memory MongoDB for demo...');
  }

  // Fallback: spin up an in-memory MongoDB instance (zero config)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ In-memory MongoDB started at', uri);
    console.log('ℹ️  Data will reset on server restart. Use a real MongoDB URI for persistence.\n');
  } catch (fallbackErr) {
    console.error('❌ Failed to start in-memory MongoDB:', fallbackErr.message);
    process.exit(1);
  }
};

module.exports = connectDB;
