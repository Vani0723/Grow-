const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  getWatchlistSummary,
  simulateTick,
  recordSnapshot,
  addStock,
  removeStock,
  reorder,
  getSignificantChanges,
} = require('../controllers/watchlist.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Public or optional auth endpoints
router.get('/summary', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, () => getWatchlistSummary(req, res, next));
  }
  return getWatchlistSummary(req, res, next);
});

router.post('/tick', simulateTick);
router.get('/significant', getSignificantChanges);

// Protected endpoints
router.use(authMiddleware);

router.post('/snapshot', recordSnapshot);
router.get('/', getWatchlist);
router.post('/add', addStock);
router.delete('/remove/:symbol', removeStock);
router.put('/reorder', reorder);

module.exports = router;
