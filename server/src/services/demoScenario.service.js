class DemoScenarioService {
  isDemoMode() {
    return process.env.DEMO_MODE === 'true';
  }

  getDemoWatchlist() {
    return [
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corp.',
        price: 128.50,
        change: 6.80,
        volumeMultiplier: 3.4,
        high52: 130.00,
        low52: 65.00,
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 142.80,
        change: 5.40,
        volumeMultiplier: 2.8,
        high52: 155.00,
        low52: 110.00,
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        price: 198.40,
        change: -5.60,
        volumeMultiplier: 3.1,
        high52: 270.00,
        low52: 138.00,
      },
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 185.50,
        change: 1.25,
        volumeMultiplier: 1.1,
        high52: 199.50,
        low52: 165.00,
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        price: 402.10,
        change: -0.85,
        volumeMultiplier: 1.0,
        high52: 430.00,
        low52: 320.00,
      },
    ];
  }
}

module.exports = new DemoScenarioService();
