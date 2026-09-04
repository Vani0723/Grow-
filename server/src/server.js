require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB();

app.listen(PORT, () => {
  console.log('MONGO_URI from env:', process.env.MONGO_URI);
  console.log(`Server listening on http://localhost:${PORT}`);
});
