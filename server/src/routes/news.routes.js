const express = require('express');
const router = express.Router();
const { getNews, getNewsBySymbol } = require('../controllers/news.controller');

router.get('/', getNews);
router.get('/:symbol', getNewsBySymbol);

module.exports = router;
