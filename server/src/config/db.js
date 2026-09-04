const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Disable Mongoose buffering so queries don't hang 10000ms if DB is connecting/offline
mongoose.set('bufferCommands', false);

const FALLBACK_CLOUD_MONGO_URI = 'mongodb+srv://groww_demo:GrowwWatchlist2026@cluster0.z1pkw.mongodb.net/smart_watchlist?retryWrites=true&w=majority';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || FALLBACK_CLOUD_MONGO_URI;
  console.log('Connecting to MongoDB:', mongoUri.includes('mongodb+srv') ? 'MongoDB Atlas Cloud Cluster' : mongoUri);

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully:', conn.connection.host);
  } catch (err) {
    console.warn('⚠️ MongoDB Connection Notice:', err.message);
    console.warn('⚡ Enabling In-Memory Demo Auth & Watchlist Store for zero-downtime performance.');
  }
};

module.exports = connectDB;
