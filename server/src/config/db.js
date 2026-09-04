const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Disable Mongoose buffering globally so queries never hang 10000ms
mongoose.set('bufferCommands', false);

const FALLBACK_CLOUD_MONGO_URI = 'mongodb+srv://groww_demo:GrowwWatchlist2026@cluster0.z1pkw.mongodb.net/smart_watchlist?retryWrites=true&w=majority';

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  // In production (e.g. Render), if MONGO_URI is missing or points to localhost, use cloud Atlas URI
  if (!mongoUri || (process.env.NODE_ENV === 'production' && mongoUri.includes('localhost'))) {
    mongoUri = FALLBACK_CLOUD_MONGO_URI;
  }

  console.log('Connecting to MongoDB:', mongoUri.includes('mongodb+srv') ? 'MongoDB Atlas Cloud Cluster' : mongoUri);

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully:', conn.connection.host);
  } catch (err) {
    console.warn('⚠️ MongoDB Connection Notice:', err.message);
    console.warn('⚡ Operating with zero-downtime in-memory demo store.');
  }
};

module.exports = connectDB;
