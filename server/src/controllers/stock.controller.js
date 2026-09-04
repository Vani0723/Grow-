const fs = require('fs');
const path = require('path');

const stocksDataPath = path.join(__dirname, '..', 'data', 'stocks.json');

function loadStocks() {
  try {
    const raw = fs.readFileSync(stocksDataPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load stocks data:', err);
    return [];
  }
}

// GET /api/stocks - list all stocks or filter by query param ?q=keyword
function getStocks(req, res) {
  const stocks = loadStocks();
  const q = req.query.q ? req.query.q.trim().toLowerCase() : null;
  if (q) {
    const filtered = stocks.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: stocks });
}

// GET /api/stocks/:symbol - get details for a single symbol
function getStockBySymbol(req, res) {
  const stocks = loadStocks();
  const { symbol } = req.params;
  const stock = stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
  if (!stock) {
    return res.status(404).json({ success: false, message: 'Stock not found' });
  }
  res.json({ success: true, data: stock });
}

module.exports = { getStocks, getStockBySymbol };
