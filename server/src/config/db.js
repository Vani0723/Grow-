const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Production Cloud MongoDB Atlas fallback URI for seamless live deployment
const FALLBACK_CLOUD_MONGO_URI = 'mongodb+srv://groww_demo:GrowwWatchlist2026@cluster0.z1pkw.mongodb.net/smart_watchlist?retryWrites=true&w=majority';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || FALLBACK_CLOUD_MONGO_URI;
  console.log('Connecting to MongoDB:', mongoUri.includes('mongodb+srv') ? 'MongoDB Atlas Cloud Cluster' : mongoUri);

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('MongoDB connected successfully:', conn.connection.host);
  } catch (err) {
    console.error('MongoDB Connection Notice:', err.message);
    console.warn('⚠️ Server operating in Demo Mode for guest watchlist data.');
  }
};

module.exports = connectDB;
