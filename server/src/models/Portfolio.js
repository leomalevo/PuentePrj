const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Portfolio = sequelize.define('Portfolio', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    instrumentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'FinancialInstruments',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    averagePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    totalInvestment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'instrumentId']
      }
    ]
  });

  return Portfolio;
}; 