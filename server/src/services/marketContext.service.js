class MarketContextService {
  constructor() {
    this.benchmark = {
      name: 'S&P 500 Index',
      symbol: 'SPY',
      price: 550.20,
      change: 0.60, // +0.60% today
    };

    this.sectors = {
      TECH: { name: 'Technology Sector', change: 1.80 },
      AUTO: { name: 'Automotive Sector', change: -3.20 },
      CONSUMER: { name: 'Consumer Discretionary', change: 0.40 },
      ENTERTAINMENT: { name: 'Media & Entertainment', change: 1.10 },
      SEMICONDUCTOR: { name: 'Semiconductors', change: 4.20 },
    };
  }

  getMarketStatus() {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();
    // Simplified market open window check
    const isOpen = day >= 1 && day <= 5 && hour >= 13 && hour <= 21;
    return {
      status: isOpen ? 'MARKET OPEN' : 'MARKET CLOSED',
      timestamp: now.toISOString(),
      benchmark: this.benchmark,
    };
  }

  getRelativePerformance(stockChange, sectorKey) {
    const benchmarkDiff = Number((stockChange - this.benchmark.change).toFixed(2));
    const sector = this.sectors[sectorKey] || this.sectors.TECH;
    const sectorDiff = Number((stockChange - sector.change).toFixed(2));

    return {
      benchmark: {
        name: this.benchmark.name,
        change: this.benchmark.change,
        relative: benchmarkDiff,
        text:
          benchmarkDiff >= 0
            ? `Outperformed ${this.benchmark.name} by ${Math.abs(benchmarkDiff)}%`
            : `Underperformed ${this.benchmark.name} by ${Math.abs(benchmarkDiff)}%`,
      },
      sector: {
        name: sector.name,
        change: sector.change,
        relative: sectorDiff,
        text:
          sectorDiff >= 0
            ? `Outperformed ${sector.name} by ${Math.abs(sectorDiff)}%`
            : `Underperformed ${sector.name} by ${Math.abs(sectorDiff)}%`,
      },
    };
  }
}

module.exports = new MarketContextService();
