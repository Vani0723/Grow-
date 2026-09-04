const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const healthRouter = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Security Headers
app.use(helmet({ contentSecurityPolicy: false }));

// Middlewares
app.use(express.json());

// CORS – allow client URL or allow dynamic origin in production
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: (origin, callback) => {
  if (!origin || origin === clientUrl || process.env.NODE_ENV === 'production') {
    callback(null, true);
  } else {
    callback(null, true);
  }
}, credentials: true }));

// Rate Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth requests from this IP, please try again later.' },
});

const authRoutes = require('./routes/auth.routes');
const stockRoutes = require('./routes/stock.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const newsRoutes = require('./routes/news.routes');

// API Routes
app.use('/api', healthRouter);
app.use('/api', stockRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/news', newsRoutes);

// Production Static Client Serving
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(errorHandler);

module.exports = app;
