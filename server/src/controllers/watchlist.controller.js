const Watchlist = require('../models/watchlist.model');
const User = require('../models/user.model');
const changeEngineService = require('../services/changeEngine.service');
const marketDataService = require('../services/marketData.service');
const marketContextService = require('../services/marketContext.service');
const demoScenarioService = require('../services/demoScenario.service');

const DEFAULT_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd' },
  { symbol: 'INFY', name: 'Infosys Ltd' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' }
];

// Get the current user's watchlist enriched with market data & analysis
async function getWatchlist(req, res, next) {
  try {
    let rawSymbols = [];
    if (demoScenarioService.isDemoMode()) {
      const demoList = demoScenarioService.getDemoWatchlist();
      rawSymbols = demoList.map((s) => s.symbol);
    } else {
      let watchlist = await Watchlist.findOne({ userId: req.userId });
      if (!watchlist || watchlist.stocks.length === 0) {
        if (!watchlist) {
          watchlist = await Watchlist.create({ userId: req.userId, stocks: DEFAULT_STOCKS });
        } else {
          watchlist.stocks = DEFAULT_STOCKS;
          await watchlist.save();
        }
      }
      rawSymbols = watchlist.stocks.map((s) => s.symbol);
    }

    const marketData = marketDataService.getMarketDataForSymbols(rawSymbols);
    return res.json({ success: true, data: marketData });
  } catch (err) {
    next(err);
  }
}

// Aggregated Summary Endpoint for "What Changed" + Watchlist
async function getWatchlistSummary(req, res, next) {
  try {
    let rawSymbols = [];
    let user = null;

    if (req.userId) {
      user = await User.findById(req.userId);
    }

    if (demoScenarioService.isDemoMode()) {
      const demoList = demoScenarioService.getDemoWatchlist();
      rawSymbols = demoList.map((s) => s.symbol);
    } else if (req.userId) {
      let watchlist = await Watchlist.findOne({ userId: req.userId });
      if (!watchlist || watchlist.stocks.length === 0) {
        if (!watchlist) {
          watchlist = await Watchlist.create({ userId: req.userId, stocks: DEFAULT_STOCKS });
        } else {
          watchlist.stocks = DEFAULT_STOCKS;
          await watchlist.save();
        }
      }
      rawSymbols = watchlist.stocks.map((s) => s.symbol);
    }

    // Default fallback symbols if user has empty list or guest
    if (rawSymbols.length === 0) {
      rawSymbols = DEFAULT_STOCKS.map((s) => s.symbol);
    }

    const marketData = marketDataService.getMarketDataForSymbols(rawSymbols);
    const lastVisitedAt = user?.lastVisitedAt || new Date(Date.now() - 30 * 60 * 1000); // 30 mins ago
    const changesAnalysis = await changeEngineService.analyzeWatchlist(marketData, lastVisitedAt);
    const marketStatus = marketContextService.getMarketStatus();

    // High & Medium impact items for "What Changed" section
    const meaningfulChanges = changesAnalysis.filter((c) => c.impact === 'HIGH' || c.impact === 'MEDIUM');

    return res.json({
      success: true,
      data: {
        watchlist: marketData,
        meaningfulChanges,
        allAnalyses: changesAnalysis,
        marketStatus,
        lastVisitedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Trigger simulated market fluctuation tick
async function simulateTick(req, res, next) {
  try {
    marketDataService.simulateMarketTick();
    return res.json({ success: true, message: 'Market prices fluctuated' });
  } catch (err) {
    next(err);
  }
}

// Record current visit snapshot for lastVisitedAt
async function recordSnapshot(req, res, next) {
  try {
    if (req.userId) {
      const user = await User.findById(req.userId);
      if (user) {
        user.lastVisitedAt = new Date();
        const watchlist = await Watchlist.findOne({ userId: req.userId });
        const symbols = watchlist ? watchlist.stocks.map(s => s.symbol) : DEFAULT_STOCKS.map(s => s.symbol);
        const currentData = marketDataService.getMarketDataForSymbols(symbols);
        const priceMap = new Map();
        currentData.forEach(s => priceMap.set(s.symbol, s.price));
        user.lastKnownPrices = priceMap;
        await user.save();
      }
    }
    return res.json({ success: true, message: 'Snapshot recorded for current visit' });
  } catch (err) {
    next(err);
  }
}

// Add a stock to watchlist
async function addStock(req, res, next) {
  try {
    const { symbol, name } = req.body;
    if (!symbol) {
      return res.status(400).json({ success: false, message: 'symbol required' });
    }
    const cleanSym = symbol.toUpperCase();
    const stockName = name || cleanSym;

    const watchlist = await Watchlist.findOneAndUpdate(
      { userId: req.userId },
      { $addToSet: { stocks: { symbol: cleanSym, name: stockName } } },
      { new: true, upsert: true }
    );
    const symbols = watchlist.stocks.map((s) => s.symbol);
    const updatedMarketData = marketDataService.getMarketDataForSymbols(symbols);
    return res.json({ success: true, data: updatedMarketData });
  } catch (err) {
    next(err);
  }
}

// Remove a stock by its symbol
async function removeStock(req, res, next) {
  try {
    const { symbol } = req.params;
    const cleanSym = symbol.toUpperCase();
    const watchlist = await Watchlist.findOneAndUpdate(
      { userId: req.userId },
      { $pull: { stocks: { symbol: cleanSym } } },
      { new: true }
    );
    const symbols = watchlist ? watchlist.stocks.map((s) => s.symbol) : [];
    const updatedMarketData = marketDataService.getMarketDataForSymbols(symbols);
    return res.json({ success: true, data: updatedMarketData });
  } catch (err) {
    next(err);
  }
}

// Reorder watchlist
async function reorder(req, res, next) {
  try {
    const { orderedSymbols } = req.body;
    if (!Array.isArray(orderedSymbols)) {
      return res.status(400).json({ success: false, message: 'orderedSymbols array required' });
    }
    const watchlist = await Watchlist.findOne({ userId: req.userId });
    if (!watchlist) {
      return res.status(404).json({ success: false, message: 'Watchlist not found' });
    }
    const symbolToObj = {};
    watchlist.stocks.forEach((s) => (symbolToObj[s.symbol.toUpperCase()] = s));
    const newOrder = orderedSymbols.map((sym) => symbolToObj[sym.toUpperCase()]).filter(Boolean);
    watchlist.stocks = newOrder;
    await watchlist.save();

    const symbols = watchlist.stocks.map((s) => s.symbol);
    const updatedMarketData = marketDataService.getMarketDataForSymbols(symbols);
    return res.json({ success: true, data: updatedMarketData });
  } catch (err) {
    next(err);
  }
}

// Get stocks with meaningful change
async function getSignificantChanges(req, res, next) {
  try {
    let symbols = [];
    if (req.userId) {
      const watchlist = await Watchlist.findOne({ userId: req.userId });
      if (watchlist) symbols = watchlist.stocks.map((s) => s.symbol);
    }
    if (symbols.length === 0) {
      symbols = DEFAULT_STOCKS.map(s => s.symbol);
    }
    const marketData = marketDataService.getMarketDataForSymbols(symbols);
    const analyses = await changeEngineService.analyzeWatchlist(marketData);
    const significant = analyses.filter((c) => c.impact === 'HIGH' || c.impact === 'MEDIUM');
    return res.json({ success: true, data: significant });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWatchlist,
  getWatchlistSummary,
  simulateTick,
  recordSnapshot,
  addStock,
  removeStock,
  reorder,
  getSignificantChanges,
};
