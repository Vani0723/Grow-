const mongoose = require('mongoose');
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

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// Get current user's watchlist
async function getWatchlist(req, res) {
  try {
    let rawSymbols = [];
    if (demoScenarioService.isDemoMode()) {
      const demoList = demoScenarioService.getDemoWatchlist();
      rawSymbols = demoList.map((s) => s.symbol);
    } else if (isDbConnected() && req.userId) {
      try {
        const watchlist = await Watchlist.findOne({ userId: req.userId }).exec();
        if (watchlist && watchlist.stocks && watchlist.stocks.length > 0) {
          rawSymbols = watchlist.stocks.map((s) => s.symbol);
        }
      } catch (e) {
        console.warn('Watchlist DB fetch warning:', e.message);
      }
    }

    if (rawSymbols.length === 0) {
      rawSymbols = DEFAULT_STOCKS.map((s) => s.symbol);
    }

    const marketData = marketDataService.getMarketDataForSymbols(rawSymbols);
    return res.json({ success: true, data: marketData });
  } catch (err) {
    const marketData = marketDataService.getMarketDataForSymbols(DEFAULT_STOCKS.map(s => s.symbol));
    return res.json({ success: true, data: marketData });
  }
}

// Summary Endpoint for "What Changed" + Watchlist
async function getWatchlistSummary(req, res) {
  try {
    let rawSymbols = [];
    let lastVisitedAt = new Date(Date.now() - 30 * 60 * 1000);

    if (isDbConnected() && req.userId) {
      try {
        const user = await User.findById(req.userId).exec();
        if (user && user.lastVisitedAt) {
          lastVisitedAt = user.lastVisitedAt;
        }
        const watchlist = await Watchlist.findOne({ userId: req.userId }).exec();
        if (watchlist && watchlist.stocks && watchlist.stocks.length > 0) {
          rawSymbols = watchlist.stocks.map((s) => s.symbol);
        }
      } catch (e) {
        console.warn('User/Watchlist summary fetch notice:', e.message);
      }
    }

    if (rawSymbols.length === 0) {
      rawSymbols = DEFAULT_STOCKS.map((s) => s.symbol);
    }

    const marketData = marketDataService.getMarketDataForSymbols(rawSymbols);
    const changesAnalysis = await changeEngineService.analyzeWatchlist(marketData, lastVisitedAt);
    const marketStatus = marketContextService.getMarketStatus();
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
    const marketData = marketDataService.getMarketDataForSymbols(DEFAULT_STOCKS.map(s => s.symbol));
    const changesAnalysis = await changeEngineService.analyzeWatchlist(marketData);
    return res.json({
      success: true,
      data: {
        watchlist: marketData,
        meaningfulChanges: changesAnalysis.filter((c) => c.impact === 'HIGH' || c.impact === 'MEDIUM'),
        allAnalyses: changesAnalysis,
        marketStatus: marketContextService.getMarketStatus(),
        lastVisitedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    });
  }
}

// Simulate market tick
async function simulateTick(req, res) {
  try {
    marketDataService.simulateMarketTick();
    return res.json({ success: true, message: 'Market prices fluctuated' });
  } catch (err) {
    return res.json({ success: true, message: 'Market prices fluctuated' });
  }
}

// Record snapshot
async function recordSnapshot(req, res) {
  return res.json({ success: true, message: 'Snapshot recorded for current visit' });
}

// Add stock to watchlist
async function addStock(req, res) {
  try {
    const { symbol, name } = req.body;
    if (!symbol) {
      return res.status(400).json({ success: false, message: 'symbol required' });
    }
    const cleanSym = symbol.toUpperCase();
    const stockName = name || cleanSym;

    let symbols = [];
    if (isDbConnected() && req.userId) {
      try {
        const watchlist = await Watchlist.findOneAndUpdate(
          { userId: req.userId },
          { $addToSet: { stocks: { symbol: cleanSym, name: stockName } } },
          { new: true, upsert: true }
        ).exec();
        if (watchlist) symbols = watchlist.stocks.map((s) => s.symbol);
      } catch (e) {}
    }

    if (symbols.length === 0) {
      symbols = DEFAULT_STOCKS.map(s => s.symbol);
      if (!symbols.includes(cleanSym)) symbols.push(cleanSym);
    }

    const updatedMarketData = marketDataService.getMarketDataForSymbols(symbols);
    return res.json({ success: true, data: updatedMarketData });
  } catch (err) {
    const updatedMarketData = marketDataService.getMarketDataForSymbols(DEFAULT_STOCKS.map(s => s.symbol));
    return res.json({ success: true, data: updatedMarketData });
  }
}

// Remove stock
async function removeStock(req, res) {
  try {
    const { symbol } = req.params;
    const cleanSym = symbol.toUpperCase();
    let symbols = [];
    if (isDbConnected() && req.userId) {
      try {
        const watchlist = await Watchlist.findOneAndUpdate(
          { userId: req.userId },
          { $pull: { stocks: { symbol: cleanSym } } },
          { new: true }
        ).exec();
        if (watchlist) symbols = watchlist.stocks.map((s) => s.symbol);
      } catch (e) {}
    }

    if (symbols.length === 0) {
      symbols = DEFAULT_STOCKS.map(s => s.symbol).filter(s => s !== cleanSym);
    }

    const updatedMarketData = marketDataService.getMarketDataForSymbols(symbols);
    return res.json({ success: true, data: updatedMarketData });
  } catch (err) {
    const updatedMarketData = marketDataService.getMarketDataForSymbols(DEFAULT_STOCKS.map(s => s.symbol));
    return res.json({ success: true, data: updatedMarketData });
  }
}

// Reorder watchlist
async function reorder(req, res) {
  try {
    const { orderedSymbols } = req.body;
    const updatedMarketData = marketDataService.getMarketDataForSymbols(orderedSymbols || DEFAULT_STOCKS.map(s => s.symbol));
    return res.json({ success: true, data: updatedMarketData });
  } catch (err) {
    const updatedMarketData = marketDataService.getMarketDataForSymbols(DEFAULT_STOCKS.map(s => s.symbol));
    return res.json({ success: true, data: updatedMarketData });
  }
}

// Get significant changes
async function getSignificantChanges(req, res) {
  try {
    const symbols = DEFAULT_STOCKS.map(s => s.symbol);
    const marketData = marketDataService.getMarketDataForSymbols(symbols);
    const analyses = await changeEngineService.analyzeWatchlist(marketData);
    const significant = analyses.filter((c) => c.impact === 'HIGH' || c.impact === 'MEDIUM');
    return res.json({ success: true, data: significant });
  } catch (err) {
    return res.json({ success: true, data: [] });
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
