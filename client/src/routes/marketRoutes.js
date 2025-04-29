const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getMarketData,
  getStockDetail,
  addToWatchlist,
  removeFromWatchlist
} = require('../controllers/marketController');

// Public routes
router.get('/stocks', getMarketData);
router.get('/stocks/:symbol', getStockDetail);

// Protected routes
router.post('/watchlist', auth, addToWatchlist);
router.delete('/watchlist/:symbol', auth, removeFromWatchlist);

module.exports = router; 