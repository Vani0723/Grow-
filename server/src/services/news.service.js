const NewsEvent = require('../models/news.model');

// Mock data generator for financial news & corporate events when DB is empty
const MOCK_EVENTS = {
  AAPL: [
    {
      title: 'Apple Reports Q3 Financial Results: iPhone Revenue Surges 12%',
      summary: 'Apple Inc. announced financial results for its fiscal third quarter, beating Wall Street estimates driven by strong iPhone sales and services growth.',
      source: 'Bloomberg News',
      url: 'https://finance.yahoo.com',
      publishedAt: new Date(Date.now() - 2 * 3600 * 1000),
      eventType: 'EARNINGS',
      impact: 'HIGH',
    },
    {
      title: 'Board Declares Cash Dividend of $0.25 per Share',
      summary: 'Apple board of directors declared a quarterly cash dividend of $0.25 per share payable to shareholders of record.',
      source: 'Reuters',
      url: 'https://finance.yahoo.com',
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000),
      eventType: 'DIVIDEND',
      impact: 'MEDIUM',
    },
  ],
  NVDA: [
    {
      title: 'NVIDIA Announces 10-for-1 Stock Split & Record AI Chip Demand',
      summary: 'NVIDIA announced a ten-for-one forward stock split to make stock ownership more accessible, alongside record quarterly revenue.',
      source: 'Financial Times',
      url: 'https://finance.yahoo.com',
      publishedAt: new Date(Date.now() - 1 * 3600 * 1000),
      eventType: 'SPLIT',
      impact: 'HIGH',
    },
  ],
  GOOGL: [
    {
      title: 'Alphabet Announces $70 Billion Share Buyback Program',
      summary: 'Alphabet Inc. authorized a additional share repurchase program of up to $70 billion of its Class A and Class C stock.',
      source: 'Wall Street Journal',
      url: 'https://finance.yahoo.com',
      publishedAt: new Date(Date.now() - 3 * 3600 * 1000),
      eventType: 'BUYBACK',
      impact: 'HIGH',
    },
  ],
  TSLA: [
    {
      title: 'Tesla Submits Regulatory Filing for Next-Gen Full Self-Driving',
      summary: 'Tesla filed key regulatory permits for expanded autonomous ride-hailing testing in major metropolitan hubs.',
      source: 'MarketWatch',
      url: 'https://finance.yahoo.com',
      publishedAt: new Date(Date.now() - 5 * 3600 * 1000),
      eventType: 'REGULATORY',
      impact: 'MEDIUM',
    },
  ],
};

class NewsService {
  async getNewsForSymbols(symbols = []) {
    if (!Array.isArray(symbols) || symbols.length === 0) return [];
    const uppercaseSymbols = symbols.map((s) => s.toUpperCase());

    try {
      // Query database
      const dbEvents = await NewsEvent.find({ symbol: { $in: uppercaseSymbols } })
        .sort({ publishedAt: -1 })
        .limit(20);

      if (dbEvents && dbEvents.length > 0) {
        return dbEvents;
      }
    } catch (e) {
      console.warn('News DB query warning, falling back to mock provider:', e.message);
    }

    // Fallback mock news for relevant symbols
    const results = [];
    uppercaseSymbols.forEach((sym) => {
      if (MOCK_EVENTS[sym]) {
        MOCK_EVENTS[sym].forEach((ev) => results.push({ symbol: sym, ...ev }));
      } else {
        // Generic fallback event for any symbol
        results.push({
          symbol: sym,
          title: `${sym} Corporate Update & Quarterly Operations Digest`,
          summary: `${sym} released its latest operational updates and market positioning strategy.`,
          source: 'Market Wire',
          url: 'https://finance.yahoo.com',
          publishedAt: new Date(Date.now() - 12 * 3600 * 1000),
          eventType: 'NEWS',
          impact: 'LOW',
        });
      }
    });

    return results.sort((a, b) => b.publishedAt - a.publishedAt);
  }

  async getNewsForSymbol(symbol) {
    const news = await this.getNewsForSymbols([symbol]);
    return news;
  }
}

module.exports = new NewsService();
