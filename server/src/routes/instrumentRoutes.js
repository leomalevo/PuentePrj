const express = require('express');
const router = express.Router();
const { 
  getAllInstruments,
  getInstrumentById,
  getTopInstruments,
  searchInstruments,
  getInstrumentDetails,
  updateAllInstruments,
  getFavorites,
  toggleFavorite
} = require('../controllers/instrumentController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Instrument:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         symbol:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [stock, crypto]
 *         currentPrice:
 *           type: number
 *           format: float
 *         dailyChange:
 *           type: number
 *           format: float
 *         weeklyChange:
 *           type: number
 *           format: float
 *         dailyHigh:
 *           type: number
 *           format: float
 *         dailyLow:
 *           type: number
 *           format: float
 *         volume:
 *           type: integer
 *         lastUpdated:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/instruments:
 *   get:
 *     summary: Get all instruments
 *     tags: [Instruments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of instruments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 instruments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Instrument'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', getAllInstruments);

/**
 * @swagger
 * /api/instruments/top:
 *   get:
 *     summary: Get top instruments by volume
 *     tags: [Instruments]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [stock, crypto]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of top instruments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Instrument'
 */
router.get('/top', getTopInstruments);

/**
 * @swagger
 * /api/instruments/search:
 *   get:
 *     summary: Search instruments
 *     tags: [Instruments]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (symbol or name)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [stock, crypto]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: symbol
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 instruments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Instrument'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/search', searchInstruments);

/**
 * @swagger
 * /api/instruments/{id}:
 *   get:
 *     summary: Get instrument by ID
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Instrument details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instrument'
 *       404:
 *         description: Instrument not found
 */
router.get('/:id', getInstrumentById);

/**
 * @swagger
 * /api/instruments/{id}/details:
 *   get:
 *     summary: Get detailed instrument information including historical data
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detailed instrument information
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Instrument'
 *                 - type: object
 *                   properties:
 *                     historicalData:
 *                       type: object
 *       404:
 *         description: Instrument not found
 */
router.get('/:id/details', getInstrumentDetails);

/**
 * @swagger
 * /api/instruments/favorites:
 *   get:
 *     summary: Get user's favorite instruments
 *     tags: [Instruments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of favorite instruments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 instruments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Instrument'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/favorites', authMiddleware, getFavorites);

/**
 * @swagger
 * /api/instruments/{id}/favorite:
 *   post:
 *     summary: Toggle favorite status for an instrument
 *     tags: [Instruments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Favorite status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Instrument not found
 */
router.post('/:id/favorite', authMiddleware, toggleFavorite);

/**
 * @swagger
 * /api/instruments/update:
 *   post:
 *     summary: Update all instruments data
 *     tags: [Instruments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instruments updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/update', authMiddleware, updateAllInstruments);

module.exports = router; 