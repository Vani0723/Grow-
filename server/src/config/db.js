const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-watchlist';
  console.log('MONGO_URI from env:', mongoUri.startsWith('mongodb+srv') ? 'MongoDB Atlas (Configured)' : mongoUri);

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout instead of hanging
    });
    console.log('MongoDB connected successfully:', conn.connection.host);
  } catch (err) {
    console.error('MongoDB Connection Notice:', err.message);
    console.warn('⚠️ Server will operate in Guest/Demo mode without persistent MongoDB storage. To enable MongoDB persistence on Render, set MONGO_URI in Environment Variables.');
  }
};

module.exports = connectDB;
