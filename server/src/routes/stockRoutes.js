const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');
const { checkAuth } = require('../middleware/auth');
const { alphaVantageLimiter, incrementApiCount } = require('../middleware/rateLimiter');

// Cache configuration
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

/**
 * @swagger
 * /api/stocks/quote/{symbol}:
 *   get:
 *     summary: Get current stock quote
 *     description: Retrieve the current quote for a specific stock symbol
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol (e.g., AAPL, GOOGL)
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialInstrument'
 *       400:
 *         description: Invalid symbol or API error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/quote/:symbol', checkAuth, alphaVantageLimiter, async (req, res) => {
    try {
        const { symbol } = req.params;
        const cacheKey = `quote_${symbol}`;

        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const data = await callAlphaVantage({
            function: 'GLOBAL_QUOTE',
            symbol: symbol
        });

        const quote = data['Global Quote'];
        if (!quote) {
            return res.status(404).json({ error: 'Stock quote not found' });
        }

        const formattedQuote = {
            symbol: quote['01. symbol'],
            open: parseFloat(quote['02. open']),
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low']),
            price: parseFloat(quote['05. price']),
            volume: parseInt(quote['06. volume']),
            latestTradingDay: quote['07. latest trading day'],
            previousClose: parseFloat(quote['08. previous close']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent']
        };

        // Cache the result
        cache.set(cacheKey, formattedQuote);
        
        // Increment API call counter
        incrementApiCount(ALPHA_VANTAGE_API_KEY, 'alphaVantage');

        res.json(formattedQuote);
    } catch (error) {
        console.error('Error fetching stock quote:', error);
        res.status(500).json({ error: error.message || 'Error fetching stock quote' });
    }
});

/**
 * @swagger
 * /api/stocks/search/{keywords}:
 *   get:
 *     summary: Search for stocks
 *     description: Search for stocks using keywords
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keywords
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keywords
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FinancialInstrument'
 *       400:
 *         description: Invalid search or API error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/search/:keywords', checkAuth, alphaVantageLimiter, async (req, res) => {
    try {
        const { keywords } = req.params;
        const cacheKey = `search_${keywords}`;

        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const data = await callAlphaVantage({
            function: 'SYMBOL_SEARCH',
            keywords: keywords
        });

        if (!data.bestMatches || data.bestMatches.length === 0) {
            return res.status(404).json({ error: 'No matches found' });
        }

        const matches = data.bestMatches.map(match => ({
            symbol: match['1. symbol'],
            name: match['2. name'],
            type: match['3. type'],
            region: match['4. region'],
            marketOpen: match['5. marketOpen'],
            marketClose: match['6. marketClose'],
            timezone: match['7. timezone'],
            currency: match['8. currency']
        }));

        // Cache the result
        cache.set(cacheKey, matches);
        
        // Increment API call counter
        incrementApiCount(ALPHA_VANTAGE_API_KEY, 'alphaVantage');

        res.json(matches);
    } catch (error) {
        console.error('Error searching stocks:', error);
        res.status(500).json({ error: error.message || 'Error searching stocks' });
    }
});

/**
 * @swagger
 * /api/stocks/time-series/{symbol}:
 *   get:
 *     summary: Get stock time series data
 *     description: Retrieve historical price data for a specific stock
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [1min, 5min, 15min, 30min, 60min]
 *         description: Time interval for the data points
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   open:
 *                     type: number
 *                     format: float
 *                   high:
 *                     type: number
 *                     format: float
 *                   low:
 *                     type: number
 *                     format: float
 *                   close:
 *                     type: number
 *                     format: float
 *                   volume:
 *                     type: integer
 *       400:
 *         description: Invalid symbol or API error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/time-series/:symbol', checkAuth, alphaVantageLimiter, async (req, res) => {
    try {
        const { symbol } = req.params;
        const { interval } = req.query;
        const cacheKey = `time_series_${symbol}_${interval}`;

        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const data = await callAlphaVantage({
            function: 'TIME_SERIES_INTRADAY',
            symbol: symbol,
            interval: interval || '5min'
        });

        const timeSeriesKey = `Time Series (${interval || '5min'})`;
        if (!data[timeSeriesKey]) {
            return res.status(404).json({ error: 'Time series data not found' });
        }

        const timeSeries = data[timeSeriesKey];
        const formattedTimeSeries = Object.entries(timeSeries).map(([timestamp, data]) => ({
            timestamp,
            open: parseFloat(data['1. open']),
            high: parseFloat(data['2. high']),
            low: parseFloat(data['3. low']),
            close: parseFloat(data['4. close']),
            volume: parseInt(data['5. volume'])
        }));

        // Cache the result
        cache.set(cacheKey, formattedTimeSeries);
        
        // Increment API call counter
        incrementApiCount(ALPHA_VANTAGE_API_KEY, 'alphaVantage');

        res.json(formattedTimeSeries);
    } catch (error) {
        console.error('Error fetching time series:', error);
        res.status(500).json({ error: error.message || 'Error fetching time series' });
    }
});

module.exports = router; 