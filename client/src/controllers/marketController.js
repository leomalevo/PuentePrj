const axios = require('axios');
const { User } = require('../models');

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const getStockData = async (symbol) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
        outputsize: 'compact'
      }
    });

    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) {
      throw new Error('No data available');
    }

    const dates = Object.keys(timeSeries).sort().reverse();
    const latest = timeSeries[dates[0]];
    const previous = timeSeries[dates[1]];

    return {
      symbol,
      price: parseFloat(latest['4. close']),
      change: parseFloat(latest['4. close']) - parseFloat(previous['4. close']),
      changePercent: ((parseFloat(latest['4. close']) - parseFloat(previous['4. close'])) / parseFloat(previous['4. close'])) * 100,
      volume: parseInt(latest['6. volume']),
      high: parseFloat(latest['2. high']),
      low: parseFloat(latest['3. low'])
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

const getMarketData = async (req, res) => {
  try {
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT'];
    const marketData = await Promise.all(symbols.map(symbol => getStockData(symbol)));
    res.json(marketData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching market data' });
  }
};

const getStockDetail = async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = await getStockData(symbol);
    res.json(stockData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock detail' });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user.watchlist) {
      user.watchlist = [];
    }
    
    if (!user.watchlist.includes(symbol)) {
      user.watchlist.push(symbol);
      await user.save();
    }
    
    res.json({ message: 'Symbol added to watchlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to watchlist' });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.params;
    const user = await User.findByPk(req.user.id);
    
    if (user.watchlist) {
      user.watchlist = user.watchlist.filter(s => s !== symbol);
      await user.save();
    }
    
    res.json({ message: 'Symbol removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from watchlist' });
  }
};

module.exports = {
  getMarketData,
  getStockDetail,
  addToWatchlist,
  removeFromWatchlist
}; 