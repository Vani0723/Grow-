const express = require('express');
const router = express.Router();
const { getStocks, getStockBySymbol } = require('../controllers/stock.controller');

router.get('/stocks', getStocks);
router.get('/stocks/:symbol', getStockBySymbol);

module.exports = router;
