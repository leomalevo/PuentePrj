const { sequelize } = require('./database');
const User = require('../models/User')(sequelize);
const FinancialInstrument = require('../models/FinancialInstrument')(sequelize);
const Favorite = require('../models/Favorite')(sequelize);
const Portfolio = require('../models/Portfolio')(sequelize);

// Define relationships
User.hasMany(Favorite, { foreignKey: 'userId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

FinancialInstrument.hasMany(Favorite, { foreignKey: 'instrumentId' });
Favorite.belongsTo(FinancialInstrument, { foreignKey: 'instrumentId' });

User.hasMany(Portfolio, { foreignKey: 'userId' });
Portfolio.belongsTo(User, { foreignKey: 'userId' });

FinancialInstrument.hasMany(Portfolio, { foreignKey: 'instrumentId' });
Portfolio.belongsTo(FinancialInstrument, { foreignKey: 'instrumentId' });

const initDB = async () => {
  try {
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');

    // Create default admin user
    await User.create({
      name: 'Admin',
      email: 'admin@market.com',
      password: 'admin1234',
      role: 'admin'
    });
    console.log('Admin user created successfully');

    // Create predefined financial instruments (20-30 total)
    const sampleInstruments = [
      // Stocks (15)
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        currentPrice: 175.34,
        dailyChange: 2.5,
        weeklyChange: 5.2,
        dailyHigh: 176.45,
        dailyLow: 173.21,
        volume: 75000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        type: 'stock',
        currentPrice: 135.67,
        dailyChange: 1.8,
        weeklyChange: 3.9,
        dailyHigh: 136.78,
        dailyLow: 134.56,
        volume: 45000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        type: 'stock',
        currentPrice: 300.45,
        dailyChange: 1.2,
        weeklyChange: 2.8,
        dailyHigh: 301.50,
        dailyLow: 299.20,
        volume: 35000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        type: 'stock',
        currentPrice: 3200.00,
        dailyChange: -0.5,
        weeklyChange: 1.2,
        dailyHigh: 3210.00,
        dailyLow: 3190.00,
        volume: 2500000,
        lastUpdated: new Date()
      },
      {
        symbol: 'META',
        name: 'Meta Platforms Inc.',
        type: 'stock',
        currentPrice: 280.75,
        dailyChange: 1.5,
        weeklyChange: 3.2,
        dailyHigh: 281.50,
        dailyLow: 279.00,
        volume: 20000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        type: 'stock',
        currentPrice: 800.50,
        dailyChange: -2.1,
        weeklyChange: -1.5,
        dailyHigh: 810.00,
        dailyLow: 795.00,
        volume: 30000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        type: 'stock',
        currentPrice: 250.30,
        dailyChange: 3.2,
        weeklyChange: 8.5,
        dailyHigh: 252.00,
        dailyLow: 248.00,
        volume: 15000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        type: 'stock',
        currentPrice: 150.25,
        dailyChange: 0.8,
        weeklyChange: 1.5,
        dailyHigh: 151.00,
        dailyLow: 149.50,
        volume: 10000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'V',
        name: 'Visa Inc.',
        type: 'stock',
        currentPrice: 220.40,
        dailyChange: 0.5,
        weeklyChange: 1.8,
        dailyHigh: 221.00,
        dailyLow: 219.00,
        volume: 8000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'WMT',
        name: 'Walmart Inc.',
        type: 'stock',
        currentPrice: 140.60,
        dailyChange: -0.3,
        weeklyChange: 0.5,
        dailyHigh: 141.00,
        dailyLow: 140.00,
        volume: 12000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        type: 'stock',
        currentPrice: 160.75,
        dailyChange: 0.4,
        weeklyChange: 1.2,
        dailyHigh: 161.00,
        dailyLow: 160.00,
        volume: 7000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'PG',
        name: 'Procter & Gamble Co.',
        type: 'stock',
        currentPrice: 145.30,
        dailyChange: 0.2,
        weeklyChange: 0.8,
        dailyHigh: 146.00,
        dailyLow: 144.50,
        volume: 5000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'MA',
        name: 'Mastercard Inc.',
        type: 'stock',
        currentPrice: 350.20,
        dailyChange: 1.2,
        weeklyChange: 2.5,
        dailyHigh: 351.00,
        dailyLow: 349.00,
        volume: 4000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'HD',
        name: 'Home Depot Inc.',
        type: 'stock',
        currentPrice: 320.45,
        dailyChange: -0.8,
        weeklyChange: -0.5,
        dailyHigh: 322.00,
        dailyLow: 319.00,
        volume: 3000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'BAC',
        name: 'Bank of America Corp.',
        type: 'stock',
        currentPrice: 35.20,
        dailyChange: 0.3,
        weeklyChange: 0.8,
        dailyHigh: 35.50,
        dailyLow: 35.00,
        volume: 15000000,
        lastUpdated: new Date()
      },
      // Cryptocurrencies (10)
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        currentPrice: 65000.00,
        dailyChange: 500.00,
        weeklyChange: 2000.00,
        dailyHigh: 65500.00,
        dailyLow: 64500.00,
        volume: 5000000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        currentPrice: 3500.00,
        dailyChange: 50.00,
        weeklyChange: 200.00,
        dailyHigh: 3550.00,
        dailyLow: 3450.00,
        volume: 2000000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'BNB',
        name: 'Binance Coin',
        type: 'crypto',
        currentPrice: 400.00,
        dailyChange: 5.00,
        weeklyChange: 20.00,
        dailyHigh: 405.00,
        dailyLow: 395.00,
        volume: 1000000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        type: 'crypto',
        currentPrice: 100.00,
        dailyChange: 2.00,
        weeklyChange: 10.00,
        dailyHigh: 102.00,
        dailyLow: 98.00,
        volume: 800000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'XRP',
        name: 'Ripple',
        type: 'crypto',
        currentPrice: 0.50,
        dailyChange: 0.01,
        weeklyChange: 0.05,
        dailyHigh: 0.51,
        dailyLow: 0.49,
        volume: 500000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        type: 'crypto',
        currentPrice: 1.20,
        dailyChange: 0.02,
        weeklyChange: 0.10,
        dailyHigh: 1.22,
        dailyLow: 1.18,
        volume: 400000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'DOGE',
        name: 'Dogecoin',
        type: 'crypto',
        currentPrice: 0.15,
        dailyChange: 0.001,
        weeklyChange: 0.005,
        dailyHigh: 0.151,
        dailyLow: 0.149,
        volume: 300000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'DOT',
        name: 'Polkadot',
        type: 'crypto',
        currentPrice: 20.00,
        dailyChange: 0.5,
        weeklyChange: 2.0,
        dailyHigh: 20.50,
        dailyLow: 19.50,
        volume: 200000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'MATIC',
        name: 'Polygon',
        type: 'crypto',
        currentPrice: 1.50,
        dailyChange: 0.02,
        weeklyChange: 0.10,
        dailyHigh: 1.52,
        dailyLow: 1.48,
        volume: 150000000,
        lastUpdated: new Date()
      },
      {
        symbol: 'LTC',
        name: 'Litecoin',
        type: 'crypto',
        currentPrice: 150.00,
        dailyChange: 1.00,
        weeklyChange: 5.00,
        dailyHigh: 151.00,
        dailyLow: 149.00,
        volume: 100000000,
        lastUpdated: new Date()
      }
    ];

    await FinancialInstrument.bulkCreate(sampleInstruments);
    console.log('Predefined financial instruments created successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close connection
    await sequelize.close();
  }
};

initDB(); 