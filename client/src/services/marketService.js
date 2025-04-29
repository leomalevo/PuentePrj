import axios from 'axios';
import { getToken } from './authService';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache storage
let instrumentsCache = {
  data: null,
  timestamp: null
};

let stockDataCache = new Map();
let cryptoDataCache = new Map();

/**
 * Check if cache is still valid
 * @param {number} timestamp - Cache timestamp
 * @returns {boolean} True if cache is valid
 */
const isCacheValid = (timestamp) => {
  return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
};

/**
 * Set authentication token in axios headers
 * @param {string} token - Authentication token
 */
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Get current authentication token
 * @returns {string|null} Current authentication token
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configure axios interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Fetch stock data from Alpha Vantage API
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Stock data
 */
export const fetchStockData = async (symbol) => {
  try {
    // Check cache first
    if (stockDataCache.has(symbol) && isCacheValid(stockDataCache.get(symbol).timestamp)) {
      return stockDataCache.get(symbol).data;
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (response.data['Global Quote']) {
      const data = {
        price: parseFloat(response.data['Global Quote']['05. price']),
        change: parseFloat(response.data['Global Quote']['09. change']),
        changePercent: parseFloat(response.data['Global Quote']['10. change percent']),
        high: parseFloat(response.data['Global Quote']['03. high']),
        low: parseFloat(response.data['Global Quote']['04. low']),
        volume: parseInt(response.data['Global Quote']['06. volume']),
        lastUpdated: new Date().toISOString()
      };

      // Update cache
      stockDataCache.set(symbol, {
        data,
        timestamp: Date.now()
      });

      return data;
    }
    throw new Error('Invalid stock data received');
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch cryptocurrency data from CoinGecko API
 * @param {string} symbol - Cryptocurrency symbol
 * @returns {Promise<Object>} Crypto data
 */
export const fetchCryptoData = async (symbol) => {
  try {
    // Check cache first
    if (cryptoDataCache.has(symbol) && isCacheValid(cryptoDataCache.get(symbol).timestamp)) {
      return cryptoDataCache.get(symbol).data;
    }

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`
    );

    if (response.data[symbol]) {
      const data = {
        price: response.data[symbol].usd,
        changePercent: response.data[symbol].usd_24h_change,
        lastUpdated: new Date().toISOString()
      };

      // Update cache
      cryptoDataCache.set(symbol, {
        data,
        timestamp: Date.now()
      });

      return data;
    }
    throw new Error('Invalid crypto data received');
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all instruments from the API
 * @returns {Promise<Array>} List of instruments
 */
export const fetchInstruments = async () => {
  try {
    const response = await axios.get(`${API_URL}/instruments`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search instruments by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Search results
 */
export const searchInstruments = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/instruments/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get detailed information for an instrument
 * @param {string} id - Instrument ID
 * @returns {Promise<Object>} Instrument details
 */
export const getInstrumentDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/instruments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle favorite status for an instrument
 * @param {string} instrumentId - Instrument ID
 * @returns {Promise<Object>} Updated favorite status
 */
export const toggleFavorite = async (instrumentId) => {
  try {
    const response = await axios.post(`${API_URL}/favorites/toggle`, { instrumentId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's favorite instruments
 * @returns {Promise<Array>} List of favorite instruments
 */
export const getFavorites = async () => {
  try {
    const response = await axios.get(`${API_URL}/favorites`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate price change percentage
 * @param {Array} dailyData - Array of daily price data
 * @returns {number} Price change percentage
 */
const calculateChange = (dailyData) => {
  if (dailyData.length < 2) return 0;
  const today = parseFloat(dailyData[0]['4. close']);
  const yesterday = parseFloat(dailyData[1]['4. close']);
  return ((today - yesterday) / yesterday) * 100;
}; 