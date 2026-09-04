const fs = require('fs');
const path = require('path');
const yahooProvider = require('./yahooProvider.service');

const CACHE_TTL_MS = 10000; // 10 seconds cache

class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.stocksDataPath = path.join(__dirname, '..', 'data', 'stocks.json');
    this.priceOffsets = new Map();
    this.volumeMultipliers = new Map();
    this.liveCache = new Map();
    this.lastLiveFetchAt = 0;
  }

  loadRawStocks() {
    try {
      const raw = fs.readFileSync(this.stocksDataPath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to load raw stocks data:', err);
      return [];
    }
  }

  /**
   * Simulate live market price fluctuations & volume shifts
   */
  simulateMarketTick() {
    const rawStocks = this.loadRawStocks();
    rawStocks.forEach((stock) => {
      const upperSym = stock.symbol.toUpperCase();
      const randomShiftPct = (Math.random() * 7.0 - 3.5);
      const currentOffset = this.priceOffsets.get(upperSym) || 0;
      const newOffset = Number((currentOffset + randomShiftPct).toFixed(2));
      this.priceOffsets.set(upperSym, newOffset);

      const volMultiplier = Number((1.0 + Math.random() * 2.8).toFixed(1));
      this.volumeMultipliers.set(upperSym, volMultiplier);
    });
    this.cache.clear();
  }

  /**
   * Fetch market data with interchangeable free provider & fallback demo engine
   */
  getMarketDataForSymbols(symbols = []) {
    const rawStocks = this.loadRawStocks();
    const symbolMap = new Map(rawStocks.map((s) => [s.symbol.toUpperCase(), s]));
    const now = Date.now();

    // Trigger async background refresh of live quotes if stale
    if (now - this.lastLiveFetchAt > CACHE_TTL_MS && symbols.length > 0) {
      this.lastLiveFetchAt = now;
      yahooProvider.fetchLiveQuotes(symbols).then((liveQuotesMap) => {
        if (liveQuotesMap && liveQuotesMap.size > 0) {
          liveQuotesMap.forEach((val, key) => {
            this.liveCache.set(key, val);
          });
        }
      }).catch((e) => {
        console.warn('Background live quote fetch error:', e.message);
      });
    }

    const results = symbols.map((sym) => {
      const upperSym = sym.toUpperCase();
      const cached = this.cache.get(upperSym);

      if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
        return {
          ...cached.data,
          freshness: 'FRESH',
          updatedAt: new Date(cached.fetchedAt).toISOString(),
          timeAgoSeconds: Math.floor((now - cached.fetchedAt) / 1000),
        };
      }

      const baseStock = symbolMap.get(upperSym);
      const liveStock = this.liveCache.get(upperSym);

      const name = liveStock?.name || baseStock?.name || upperSym;
      const basePrice = liveStock?.price || baseStock?.price || 150.0;
      const initialChange = liveStock?.change || baseStock?.change || 0.0;

      const offsetPct = this.priceOffsets.get(upperSym) || 0;
      const dynamicPrice = Number((basePrice * (1 + offsetPct / 100)).toFixed(2));
      const dynamicChange = Number((initialChange + offsetPct).toFixed(2));
      const volMultiplier = this.volumeMultipliers.get(upperSym) || (Math.abs(dynamicChange) >= 5 ? 3.2 : 1.2);

      const high52 = liveStock?.high52 || Number((basePrice * 1.15).toFixed(2));
      const low52 = liveStock?.low52 || Number((basePrice * 0.82).toFixed(2));

      const source = liveStock ? 'Free Live Market Provider (Yahoo Finance)' : 'Realtime Simulated Market Engine';

      const dataObj = {
        symbol: upperSym,
        name,
        basePrice,
        price: dynamicPrice,
        change: dynamicChange,
        volumeMultiplier: volMultiplier,
        high52,
        low52,
        source,
        freshness: 'FRESH',
        updatedAt: new Date(now).toISOString(),
        timeAgoSeconds: 0,
      };

      this.cache.set(upperSym, { data: dataObj, fetchedAt: now });
      return dataObj;
    });

    return results;
  }
}

module.exports = new MarketDataService();
