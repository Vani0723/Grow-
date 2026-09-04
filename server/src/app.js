const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const healthRouter = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Security Headers
app.use(helmet({ contentSecurityPolicy: false }));

// Middlewares
app.use(express.json());

// CORS – allow only the client URL defined in env
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: clientUrl, credentials: true }));

// Rate Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth requests from this IP, please try again later.' },
});

const authRoutes = require('./routes/auth.routes');
const stockRoutes = require('./routes/stock.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const newsRoutes = require('./routes/news.routes');

// Routes
app.use('/api', healthRouter);
app.use('/api', stockRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/news', newsRoutes);

app.use(errorHandler);

module.exports = app;
