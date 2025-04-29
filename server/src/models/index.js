const { sequelize } = require('../config/database');

const User = require('./User')(sequelize);
const FinancialInstrument = require('./FinancialInstrument')(sequelize);
const Favorite = require('./Favorite')(sequelize);
const Portfolio = require('./Portfolio')(sequelize);
const RefreshToken = require('./RefreshToken')(sequelize);

// Define relationships
User.hasMany(Favorite, { foreignKey: 'userId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

FinancialInstrument.hasMany(Favorite, { 
  foreignKey: 'instrumentId',
  as: 'favorites'
});
Favorite.belongsTo(FinancialInstrument, { 
  foreignKey: 'instrumentId',
  as: 'instrument'
});

User.hasMany(Portfolio, { foreignKey: 'userId' });
Portfolio.belongsTo(User, { foreignKey: 'userId' });

FinancialInstrument.hasMany(Portfolio, { foreignKey: 'instrumentId' });
Portfolio.belongsTo(FinancialInstrument, { foreignKey: 'instrumentId' });

// RefreshToken relationships
User.hasMany(RefreshToken, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
RefreshToken.belongsTo(User, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

module.exports = {
  User,
  FinancialInstrument,
  Favorite,
  Portfolio,
  RefreshToken,
  sequelize
}; 