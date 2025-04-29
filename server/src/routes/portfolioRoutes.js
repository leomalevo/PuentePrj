const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { Portfolio, FinancialInstrument } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         instrumentId:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: number
 *           format: decimal
 *         averagePrice:
 *           type: number
 *           format: decimal
 *         totalInvestment:
 *           type: number
 *           format: decimal
 *         currentValue:
 *           type: number
 *           format: decimal
 *         profitLoss:
 *           type: number
 *           format: decimal
 *         instrument:
 *           $ref: '#/components/schemas/FinancialInstrument'
 */

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get user's portfolio
 *     description: Retrieve all financial instruments in the user's portfolio
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of portfolio items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Portfolio'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findAll({
            where: { userId: req.user.id },
            include: [{
                model: FinancialInstrument,
                as: 'FinancialInstrument'
            }]
        });
        res.json(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: 'Error fetching portfolio' });
    }
});

/**
 * @swagger
 * /api/portfolio:
 *   post:
 *     summary: Add instrument to portfolio
 *     description: Add a financial instrument to the user's portfolio
 *     tags: [Portfolio]
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
 *               - quantity
 *               - averagePrice
 *             properties:
 *               instrumentId:
 *                 type: integer
 *               quantity:
 *                 type: number
 *                 format: float
 *               averagePrice:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Instrument added to portfolio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { instrumentId, quantity, averagePrice } = req.body;
        
        // Validate required fields
        if (!instrumentId || !quantity || !averagePrice) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if instrument exists
        const instrument = await FinancialInstrument.findByPk(instrumentId);
        if (!instrument) {
            return res.status(404).json({ error: 'Financial instrument not found' });
        }

        const portfolioItem = await Portfolio.create({
            userId: req.user.id,
            instrumentId,
            quantity,
            averagePrice
        });

        // Include the instrument details in the response
        const response = await Portfolio.findByPk(portfolioItem.id, {
            include: [{
                model: FinancialInstrument,
                as: 'FinancialInstrument'
            }]
        });

        res.status(201).json(response);
    } catch (error) {
        console.error('Error adding to portfolio:', error);
        res.status(500).json({ error: 'Error adding to portfolio' });
    }
});

/**
 * @swagger
 * /api/portfolio/{instrumentId}:
 *   put:
 *     summary: Update portfolio item
 *     description: Update quantity or average price of a portfolio item
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instrumentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the financial instrument
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 format: float
 *               averagePrice:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Portfolio item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Portfolio'
 *       404:
 *         description: Portfolio item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:instrumentId', authMiddleware, async (req, res) => {
    try {
        const { instrumentId } = req.params;
        const { quantity, averagePrice } = req.body;

        // Validate that at least one field is being updated
        if (!quantity && !averagePrice) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const [updated] = await Portfolio.update(
            { quantity, averagePrice },
            {
                where: {
                    userId: req.user.id,
                    instrumentId
                }
            }
        );

        if (updated === 0) {
            return res.status(404).json({ error: 'Portfolio item not found' });
        }

        const updatedItem = await Portfolio.findOne({
            where: {
                userId: req.user.id,
                instrumentId
            },
            include: [{
                model: FinancialInstrument,
                as: 'FinancialInstrument'
            }]
        });

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({ error: 'Error updating portfolio' });
    }
});

/**
 * @swagger
 * /api/portfolio/{instrumentId}:
 *   delete:
 *     summary: Remove instrument from portfolio
 *     description: Remove a financial instrument from the user's portfolio
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instrumentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the financial instrument
 *     responses:
 *       200:
 *         description: Instrument removed from portfolio
 *       404:
 *         description: Portfolio item not found
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
        const result = await Portfolio.destroy({
            where: {
                userId: req.user.id,
                instrumentId
            }
        });

        if (result === 0) {
            return res.status(404).json({ error: 'Portfolio item not found' });
        }

        res.status(200).json({ message: 'Portfolio item removed successfully' });
    } catch (error) {
        console.error('Error removing from portfolio:', error);
        res.status(500).json({ error: 'Error removing from portfolio' });
    }
});

module.exports = router; 