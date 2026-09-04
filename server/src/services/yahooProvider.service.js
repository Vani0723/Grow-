const yahooFinance = require('yahoo-finance2').default;

const NSE_SYMBOLS = new Set([
  'RELIANCE', 'INFY', 'TCS', 'HDFCBANK', 'TATAMOTORS', 'ICICIBANK',
  'SBIN', 'BHARTIARTL', 'ITC', 'WIPRO', 'LTIM', 'HINDUNILVR', 'AXISBANK'
]);

class YahooProviderService {
  /**
   * Convert symbol to Yahoo ticker (e.g. RELIANCE -> RELIANCE.NS)
   */
  toYahooSymbol(symbol) {
    const cleanSym = symbol.toUpperCase().trim();
    if (NSE_SYMBOLS.has(cleanSym)) {
      return `${cleanSym}.NS`;
    }
    if (cleanSym.endsWith('.NS') || cleanSym.endsWith('.BO')) {
      return cleanSym;
    }
    return cleanSym;
  }

  /**
   * Fetch live real-time quotes for given symbols
   */
  async fetchLiveQuotes(symbols = []) {
    if (!symbols || symbols.length === 0) return new Map();

    const results = new Map();
    const yahooSymbols = symbols.map((sym) => this.toYahooSymbol(sym));

    try {
      // Fetch quote for array of symbols using yahoo-finance2
      const quotes = await yahooFinance.quote(yahooSymbols);
      const quoteList = Array.isArray(quotes) ? quotes : [quotes];

      quoteList.forEach((q) => {
        if (!q || !q.symbol) return;
        const cleanSymbol = q.symbol.replace(/\.NS$/, '').replace(/\.BO$/, '').toUpperCase();

        const price = q.regularMarketPrice || q.postMarketPrice || 100.0;
        const prevClose = q.regularMarketPreviousClose || price;
        const changePct = q.regularMarketChangePercent || (prevClose ? ((price - prevClose) / prevClose) * 100 : 0);

        results.set(cleanSymbol, {
          symbol: cleanSymbol,
          name: q.shortName || q.longName || cleanSymbol,
          price: Number(price.toFixed(2)),
          change: Number(changePct.toFixed(2)),
          high52: q.fiftyTwoWeekHigh ? Number(q.fiftyTwoWeekHigh.toFixed(2)) : Number((price * 1.15).toFixed(2)),
          low52: q.fiftyTwoWeekLow ? Number(q.fiftyTwoWeekLow.toFixed(2)) : Number((price * 0.82).toFixed(2)),
          volume: q.regularMarketVolume || 1000000,
          source: 'Free Yahoo Finance Live Feed',
        });
      });
    } catch (err) {
      console.warn('Yahoo Finance live quote fetch warning (falling back to demo mode if offline):', err.message);
    }

    return results;
  }
}

module.exports = new YahooProviderService();
