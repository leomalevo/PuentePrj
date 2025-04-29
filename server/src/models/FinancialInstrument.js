const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialInstrument = sequelize.define('FinancialInstrument', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('stock', 'crypto'),
      allowNull: false
    },
    currentPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dailyChange: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    weeklyChange: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dailyHigh: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dailyLow: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    volume: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['symbol']
      }
    ]
  });

  return FinancialInstrument;
}; 