const newsService = require('../services/news.service');

async function getNews(req, res, next) {
  try {
    const { symbols } = req.query; // comma-separated e.g. ?symbols=AAPL,GOOGL
    let symbolList = [];
    if (symbols) {
      symbolList = symbols.split(',').map((s) => s.trim());
    }
    const news = await newsService.getNewsForSymbols(symbolList);
    return res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

async function getNewsBySymbol(req, res, next) {
  try {
    const { symbol } = req.params;
    const news = await newsService.getNewsForSymbol(symbol);
    return res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNews, getNewsBySymbol };
