const fs = require('fs');
const path = require('path');

const CACHE_TTL_MS = 2000;

class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.stocksDataPath = path.join(__dirname, '..', 'data', 'stocks.json');
    this.priceOffsets = new Map();
    this.volumeMultipliers = new Map();
  }

  loadRawStocks() {
    try {
      const raw = fs.readFileSync(this.stocksDataPath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      return [
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2950.50, change: 1.2 },
        { symbol: 'INFY', name: 'Infosys Ltd', price: 1780.20, change: -0.8 },
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', price: 4210.00, change: 2.1 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1640.75, change: 0.5 },
        { symbol: 'AAPL', name: 'Apple Inc.', price: 224.30, change: 1.8 },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 128.50, change: 4.5 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 179.80, change: -0.3 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 448.90, change: 0.9 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.60, change: -3.2 }
      ];
    }
  }

  simulateMarketTick() {
    const rawStocks = this.loadRawStocks();
    rawStocks.forEach((stock) => {
      const upperSym = stock.symbol.toUpperCase();
      const randomShiftPct = Number((Math.random() * 6.0 - 3.0).toFixed(2));
      const currentOffset = this.priceOffsets.get(upperSym) || 0;
      const newOffset = Number((currentOffset + randomShiftPct).toFixed(2));
      this.priceOffsets.set(upperSym, newOffset);

      const volMultiplier = Number((1.0 + Math.random() * 2.5).toFixed(1));
      this.volumeMultipliers.set(upperSym, volMultiplier);
    });
    this.cache.clear();
  }

  getMarketDataForSymbols(symbols = []) {
    const rawStocks = this.loadRawStocks();
    const symbolMap = new Map(rawStocks.map((s) => [s.symbol.toUpperCase(), s]));
    const now = Date.now();

    const targetSymbols = symbols.length > 0 ? symbols : rawStocks.map(s => s.symbol);

    const results = targetSymbols.map((sym) => {
      const upperSym = sym.toUpperCase();
      const baseStock = symbolMap.get(upperSym) || {
        symbol: upperSym,
        name: upperSym + ' Corp',
        price: 150.0,
        change: 0.0
      };

      const basePrice = baseStock.price || 150.0;
      const initialChange = baseStock.change || 0.0;

      const offsetPct = this.priceOffsets.get(upperSym) || 0;
      const dynamicPrice = Number((basePrice * (1 + offsetPct / 100)).toFixed(2));
      const dynamicChange = Number((initialChange + offsetPct).toFixed(2));
      const volMultiplier = this.volumeMultipliers.get(upperSym) || (Math.abs(dynamicChange) >= 4 ? 3.0 : 1.2);

      const high52 = Number((basePrice * 1.18).toFixed(2));
      const low52 = Number((basePrice * 0.82).toFixed(2));

      return {
        symbol: upperSym,
        name: baseStock.name,
        basePrice,
        price: dynamicPrice,
        change: dynamicChange,
        volumeMultiplier: volMultiplier,
        high52,
        low52,
        source: 'Groww Mock Database Market Engine',
        freshness: 'FRESH',
        updatedAt: new Date(now).toISOString(),
        timeAgoSeconds: 0,
      };
    });

    return results;
  }
}

module.exports = new MarketDataService();
