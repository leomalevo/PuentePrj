require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');
const { sequelize } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const instrumentRoutes = require('./src/routes/instrumentRoutes');
const portfolioRoutes = require('./src/routes/portfolioRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const { startPeriodicUpdates } = require('./src/services/updateService');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/instruments', instrumentRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// Database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    // Sync all models
    return sequelize.sync();
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
      
      // Start periodic updates
      startPeriodicUpdates();
      console.log('Periodic updates started');
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app; 