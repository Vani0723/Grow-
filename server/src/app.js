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

// Enable trust proxy for Render / Cloud reverse proxies (fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({ contentSecurityPolicy: false }));

// Middlewares
app.use(express.json());

// CORS – allow dynamic origin in cloud deployment
app.use(cors({ origin: true, credentials: true }));

// Rate Limiter for Auth Routes with proxy validation fix
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
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

// Candidate paths for client static assets
const candidatePaths = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'server/public'),
  path.resolve(process.cwd(), 'public')
];

let resolvedDistPath = candidatePaths.find(p => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html')));

if (resolvedDistPath) {
  console.log('✅ Serving client static assets from:', resolvedDistPath);
  app.use(express.static(resolvedDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(resolvedDistPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Warning: No precompiled client assets found in:', candidatePaths);
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Groww Smart Watchlist - API Ready</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>🌱 Groww Smart Watchlist Backend API is Live!</h2>
          <p>Backend API routes are active under <code>/api</code>.</p>
        </body>
      </html>
    `);
  });
}

app.use(errorHandler);

module.exports = app;
