const { updateAllInstruments } = require('../services/marketDataService');

/**
 * Function to update market data for all instruments
 * Handles errors and logs the process
 */
async function startUpdateInterval() {
  try {
    console.log('Starting market data update...');
    await updateAllInstruments();
    console.log('Market data update completed successfully');
  } catch (error) {
    console.error('Error updating market data:', error);
  }
}

// Execute every 5 minutes
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
setInterval(startUpdateInterval, UPDATE_INTERVAL);

// Execute immediately on startup
console.log('Initializing market data update service...');
startUpdateInterval(); 