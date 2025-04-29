const { Portfolio, FinancialInstrument } = require('../models');

const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findAll({
      where: { userId: req.user.id },
      include: [FinancialInstrument]
    });

    const portfolioWithValue = portfolio.map(item => ({
      ...item.toJSON(),
      currentValue: item.quantity * item.FinancialInstrument.currentPrice,
      profitLoss: (item.quantity * item.FinancialInstrument.currentPrice) - item.totalInvestment
    }));

    res.json(portfolioWithValue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addToPortfolio = async (req, res) => {
  try {
    const { instrumentId, quantity, price } = req.body;
    
    const existingPosition = await Portfolio.findOne({
      where: {
        userId: req.user.id,
        instrumentId
      }
    });

    if (existingPosition) {
      // Update existing position
      const newQuantity = existingPosition.quantity + quantity;
      const newTotalInvestment = existingPosition.totalInvestment + (quantity * price);
      const newAveragePrice = newTotalInvestment / newQuantity;

      await existingPosition.update({
        quantity: newQuantity,
        averagePrice: newAveragePrice,
        totalInvestment: newTotalInvestment
      });

      res.json(existingPosition);
    } else {
      // Create new position
      const newPosition = await Portfolio.create({
        userId: req.user.id,
        instrumentId,
        quantity,
        averagePrice: price,
        totalInvestment: quantity * price
      });

      res.status(201).json(newPosition);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeFromPortfolio = async (req, res) => {
  try {
    const { instrumentId, quantity } = req.body;
    
    const position = await Portfolio.findOne({
      where: {
        userId: req.user.id,
        instrumentId
      }
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    if (position.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity' });
    }

    if (position.quantity === quantity) {
      await position.destroy();
      res.json({ message: 'Position removed' });
    } else {
      const newQuantity = position.quantity - quantity;
      const newTotalInvestment = position.totalInvestment * (newQuantity / position.quantity);

      await position.update({
        quantity: newQuantity,
        totalInvestment: newTotalInvestment
      });

      res.json(position);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getPortfolio,
  addToPortfolio,
  removeFromPortfolio
}; 