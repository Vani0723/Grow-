require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to Mock Database Engine
connectDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Smart Watchlist Mock Engine listening on 0.0.0.0:${PORT}`);
});
