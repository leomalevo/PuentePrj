const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { Favorite, FinancialInstrument } = require('../models');

/**
 * @swagger
 * /api/favorites/toggle:
 *   post:
 *     summary: Toggle favorite status of an instrument
 *     description: Add or remove a financial instrument from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - instrumentId
 *             properties:
 *               instrumentId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the financial instrument
 *     responses:
 *       200:
 *         description: Favorite status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFavorite:
 *                   type: boolean
 *                   description: New favorite status
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/toggle', authMiddleware, async (req, res) => {
    try {
        const { instrumentId } = req.body;
        
        if (!instrumentId) {
            return res.status(400).json({ error: 'instrumentId is required' });
        }

        // Check if the favorite already exists
        const existingFavorite = await Favorite.findOne({
            where: {
                userId: req.user.id,
                instrumentId
            }
        });

        if (existingFavorite) {
            // If it exists, remove it
            await existingFavorite.destroy();
            res.json({ isFavorite: false });
        } else {
            // If it doesn't exist, create it
            await Favorite.create({
                userId: req.user.id,
                instrumentId
            });
            res.json({ isFavorite: true });
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ error: 'Error toggling favorite' });
    }
});

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get user's favorite instruments
 *     description: Retrieve all financial instruments marked as favorite by the user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite instruments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FinancialInstrument'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const favorites = await Favorite.findAll({
            where: { userId: req.user.id },
            include: [{
                model: FinancialInstrument,
                as: 'instrument'
            }]
        });
        res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Error fetching favorites' });
    }
});

/**
 * @swagger
 * /api/favorites/{instrumentId}:
 *   post:
 *     summary: Add instrument to favorites
 *     description: Mark a financial instrument as favorite
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instrumentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the financial instrument
 *     responses:
 *       201:
 *         description: Instrument added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Invalid instrument ID or already in favorites
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:instrumentId', authMiddleware, async (req, res) => {
    try {
        const { instrumentId } = req.params;
        const favorite = await Favorite.create({
            userId: req.user.id,
            instrumentId
        });
        res.status(201).json(favorite);
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ error: 'Error adding to favorites' });
    }
});

/**
 * @swagger
 * /api/favorites/{instrumentId}:
 *   delete:
 *     summary: Remove instrument from favorites
 *     description: Remove a financial instrument from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instrumentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the financial instrument
 *     responses:
 *       200:
 *         description: Instrument removed from favorites
 *       404:
 *         description: Favorite not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/:instrumentId', authMiddleware, async (req, res) => {
    try {
        const { instrumentId } = req.params;
        const result = await Favorite.destroy({
            where: {
                userId: req.user.id,
                instrumentId
            }
        });
        if (result === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }
        res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ error: 'Error removing from favorites' });
    }
});

module.exports = router; 