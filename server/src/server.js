require('dotenv').config();
const mongoose = require('mongoose');

// Globally disable query buffering at entry point before any routes/models are loaded
mongoose.set('bufferCommands', false);

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  console.log('Database initialization check completed.');
}).catch((err) => {
  console.warn('DB initialization notice:', err.message);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});
