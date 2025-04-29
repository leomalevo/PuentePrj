const { FinancialInstrument, Favorite } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');
const NodeCache = require('node-cache');

const MAX_INSTRUMENTS = 25; // Límite de instrumentos

// Cache configuration
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

/**
 * Update instrument data from external APIs
 * @param {string} symbol - Instrument symbol
 * @param {string} type - Instrument type (stock/crypto)
 * @returns {Promise<Object>} Updated instrument data
 */
const updateInstrumentData = async (symbol, type) => {
  try {
    if (type === 'stock') {
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol,
          apikey: process.env.ALPHA_VANTAGE_API_KEY
        }
      });

      const dailyData = response.data['Time Series (Daily)'];
      if (!dailyData) return null;

      // Get today's and last week's data
      const dates = Object.keys(dailyData).sort().reverse();
      const today = dailyData[dates[0]];
      const lastWeek = dailyData[dates[5]]; // 5 trading days ago

      const currentPrice = parseFloat(today['4. close']);
      const lastWeekPrice = parseFloat(lastWeek['4. close']);
      const weeklyChange = ((currentPrice - lastWeekPrice) / lastWeekPrice) * 100;

      return {
        currentPrice,
        dailyChange: parseFloat(today['4. close']) - parseFloat(today['1. open']),
        weeklyChange,
        dailyHigh: parseFloat(today['2. high']),
        dailyLow: parseFloat(today['3. low']),
        volume: parseInt(today['5. volume']),
        lastUpdated: new Date()
      };
    } else if (type === 'crypto') {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids: symbol,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_last_updated_at: true,
          include_7d_change: true
        }
      });

      const data = response.data[symbol];
      if (!data) return null;

      return {
        currentPrice: data.usd,
        dailyChange: data.usd_24h_change,
        weeklyChange: data.usd_7d_change,
        dailyHigh: null, // Not available in free API
        dailyLow: null, // Not available in free API
        volume: data.usd_24h_vol,
        lastUpdated: new Date(data.last_updated_at * 1000)
      };
    }
  } catch (error) {
    return null;
  }
};

/**
 * Get all instruments with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllInstruments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await FinancialInstrument.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['symbol', 'ASC']]
    });

    res.json({
      instruments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching instruments' });
  }
};

/**
 * Get instrument by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInstrumentById = async (req, res) => {
  try {
    const instrument = await FinancialInstrument.findByPk(req.params.id);
    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }
    res.json(instrument);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching instrument' });
  }
};

/**
 * Get top instruments by volume
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTopInstruments = async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    const where = type ? { type } : {};

    const instruments = await FinancialInstrument.findAll({
      where,
      order: [['volume', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(instruments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching top instruments' });
  }
};

/**
 * Search instruments by symbol or name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchInstruments = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 10, sortBy = 'symbol', sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      [Op.or]: [
        { symbol: { [Op.iLike]: `%${q}%` } },
        { name: { [Op.iLike]: `%${q}%` } }
      ]
    };

    if (type) {
      where.type = type;
    }

    const { count, rows } = await FinancialInstrument.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    res.json({
      instruments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error searching instruments' });
  }
};

/**
 * Get detailed instrument information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInstrumentDetails = async (req, res) => {
  try {
    const instrument = await FinancialInstrument.findByPk(req.params.id);
    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }

    const cacheKey = `instrument_details_${instrument.id}`;
    let details = cache.get(cacheKey);

    if (!details) {
      details = await updateInstrumentData(instrument.symbol, instrument.type);
      if (details) {
        cache.set(cacheKey, details);
      }
    }

    res.json({
      ...instrument.toJSON(),
      details
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching instrument details' });
  }
};

/**
 * Update all instruments data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAllInstruments = async (req, res) => {
  try {
    const instruments = await FinancialInstrument.findAll();
    const updates = [];

    for (const instrument of instruments) {
      const data = await updateInstrumentData(instrument.symbol, instrument.type);
      if (data) {
        updates.push(instrument.update(data));
      }
    }

    await Promise.all(updates);
    res.json({ message: 'Instruments updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating instruments' });
  }
};

/**
 * Get user's favorite instruments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{
        model: FinancialInstrument,
        as: 'instrument'
      }]
    });

    res.json(favorites.map(fav => fav.instrument));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching favorites' });
  }
};

/**
 * Toggle favorite status for an instrument
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleFavorite = async (req, res) => {
  try {
    const { instrumentId } = req.body;
    const existingFavorite = await Favorite.findOne({
      where: {
        userId: req.user.id,
        instrumentId
      }
    });

    if (existingFavorite) {
      await existingFavorite.destroy();
      res.json({ isFavorite: false });
    } else {
      await Favorite.create({
        userId: req.user.id,
        instrumentId
      });
      res.json({ isFavorite: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error toggling favorite' });
  }
};

const createInstrument = async (req, res) => {
  try {
    const { symbol, name, type } = req.body;
    
    if (!symbol || !name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const instrument = await FinancialInstrument.create({
      symbol,
      name,
      type,
      currentPrice: 0,
      dailyChange: 0,
      dailyHigh: 0,
      dailyLow: 0,
      volume: 0
    });

    res.status(201).json(instrument);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  updateInstrumentData,
  getAllInstruments,
  getInstrumentById,
  getTopInstruments,
  searchInstruments,
  getInstrumentDetails,
  updateAllInstruments,
  getFavorites,
  toggleFavorite,
  createInstrument
}; 