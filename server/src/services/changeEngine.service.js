const marketContextService = require('./marketContext.service');
const newsService = require('./news.service');

class ChangeEngineService {
  /**
   * Evaluate a stock's current metrics against its previous state & market context
   */
  async analyzeStockChange(stock, lastVisitedAt, prevPrice = null) {
    const symbol = stock.symbol.toUpperCase();
    const price = stock.price || 150.0;
    const change = stock.change || 0.0;
    const volumeMultiplier = stock.volumeMultiplier || (Math.abs(change) >= 5 ? 3.1 : 1.2);
    const high52 = stock.high52 || price * 1.15;
    const low52 = stock.low52 || price * 0.85;

    let score = 0;
    const reasons = [];

    // 1. Price Movement since last visit (0–30 pts)
    const absChange = Math.abs(change);
    if (absChange >= 8) {
      score += 30;
      reasons.push(`${change >= 0 ? 'Surged' : 'Plunged'} ${absChange.toFixed(1)}% since your last visit`);
    } else if (absChange >= 5) {
      score += 22;
      reasons.push(`Significant price move: ${change >= 0 ? '+' : ''}${change.toFixed(1)}%`);
    } else if (absChange >= 2) {
      score += 12;
      reasons.push(`Moderate price change: ${change >= 0 ? '+' : ''}${change.toFixed(1)}%`);
    }

    // 2. Volume Anomaly (0–20 pts)
    if (volumeMultiplier >= 3.0) {
      score += 20;
      reasons.push(`Trading volume is ${volumeMultiplier.toFixed(1)}× normal average`);
    } else if (volumeMultiplier >= 2.0) {
      score += 12;
      reasons.push(`Elevated trading volume (${volumeMultiplier.toFixed(1)}× average)`);
    }

    // 3. Benchmark Relative Performance (0–20 pts)
    const relPerf = marketContextService.getRelativePerformance(change, stock.sectorKey);
    const relBenchmark = relPerf.benchmark.relative;
    if (Math.abs(relBenchmark) >= 4) {
      score += 20;
      reasons.push(relPerf.benchmark.text);
    } else if (Math.abs(relBenchmark) >= 2) {
      score += 10;
      reasons.push(relPerf.benchmark.text);
    }

    // 4. 52-Week High / Low Events (0–15 pts)
    const distToHigh = ((high52 - price) / high52) * 100;
    const distToLow = ((price - low52) / low52) * 100;
    if (distToHigh <= 1.5) {
      score += 15;
      reasons.push('Trading near 52-week HIGH level');
    } else if (distToLow <= 1.5) {
      score += 15;
      reasons.push('Trading near 52-week LOW level');
    }

    // 5. News & Corporate Events (0–15 pts)
    const newsEvents = await newsService.getNewsForSymbol(symbol);
    const topEvent = newsEvents[0];
    if (topEvent) {
      if (topEvent.impact === 'HIGH') {
        score += 15;
        reasons.push(`High impact event: ${topEvent.title}`);
      } else if (topEvent.impact === 'MEDIUM') {
        score += 8;
        reasons.push(`Corporate event: ${topEvent.title}`);
      }
    }

    // Impact Classification
    let impact = 'NOT MEANINGFUL';
    if (score >= 75) {
      impact = 'HIGH';
    } else if (score >= 50) {
      impact = 'MEDIUM';
    } else if (score >= 25) {
      impact = 'LOW';
    }

    return {
      symbol,
      name: stock.name,
      price,
      change,
      score: Math.min(score, 100),
      impact,
      reasons,
      volumeMultiplier,
      high52,
      low52,
      marketContext: relPerf,
      topEvent: topEvent || null,
    };
  }

  async analyzeWatchlist(stocks = [], lastVisitedAt = null) {
    const results = [];
    for (const stock of stocks) {
      const analysis = await this.analyzeStockChange(stock, lastVisitedAt);
      results.push(analysis);
    }
    // Return sorted by score (highest impact first)
    return results.sort((a, b) => b.score - a.score);
  }
}

module.exports = new ChangeEngineService();
