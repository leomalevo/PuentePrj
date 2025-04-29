const { FinancialInstrument } = require('../models');
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache configuration - aumentado a 1 hora
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hora de caché (60 * 60 seconds)

const updateStockData = async (instrument) => {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${instrument.symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    console.log(`Fetching stock data for ${instrument.symbol} from: ${url}`);
    
    const response = await axios.get(url);
    console.log(`Alpha Vantage response for ${instrument.symbol}:`, JSON.stringify(response.data, null, 2));

    // Check if the response is valid
    if (!response.data || !response.data['Global Quote']) {
      console.error(`Invalid response from Alpha Vantage for ${instrument.symbol}:`, response.data);
      return null;
    }

    const data = response.data['Global Quote'];
    
    // Validate required fields
    if (!data['05. price'] || !data['09. change'] || !data['03. high'] || !data['04. low']) {
      console.error(`Missing required fields in Alpha Vantage response for ${instrument.symbol}:`, data);
      return null;
    }

    return {
      currentPrice: parseFloat(data['05. price']),
      dailyChange: parseFloat(data['09. change']),
      dailyHigh: parseFloat(data['03. high']),
      dailyLow: parseFloat(data['04. low']),
      volume: parseInt(data['06. volume'] || '0'),
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error(`Error updating stock ${instrument.symbol}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
};

const updateCryptoData = async (instrument) => {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${instrument.symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`;
    console.log(`Fetching crypto data for ${instrument.symbol} from: ${url}`);
    
    const response = await axios.get(url);
    console.log(`CoinGecko response for ${instrument.symbol}:`, JSON.stringify(response.data, null, 2));

    // Check if the response is valid
    if (!response.data || !response.data[instrument.symbol.toLowerCase()]) {
      console.error(`Invalid response from CoinGecko for ${instrument.symbol}:`, response.data);
      return null;
    }

    const data = response.data[instrument.symbol.toLowerCase()];
    
    // Validate required fields
    if (data.usd === undefined || data.usd_24h_change === undefined) {
      console.error(`Missing required fields in CoinGecko response for ${instrument.symbol}:`, data);
      return null;
    }

    return {
      currentPrice: data.usd,
      dailyChange: data.usd_24h_change,
      dailyHigh: data.usd,
      dailyLow: data.usd,
      volume: 0, // CoinGecko doesn't provide volume in this endpoint
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error(`Error updating crypto ${instrument.symbol}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
};

const updateInstrument = async (instrument) => {
  try {
    const cacheKey = `instrument_${instrument.id}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    let updateData;
    if (instrument.type === 'stock') {
      updateData = await updateStockData(instrument);
    } else {
      updateData = await updateCryptoData(instrument);
    }

    if (updateData) {
      await instrument.update(updateData);
      cache.set(cacheKey, instrument, 300); // Cache for 5 minutes
    }

    return instrument;
  } catch (error) {
    console.error(`Error updating instrument ${instrument.symbol}:`, error.message);
    return instrument;
  }
};

const updateAllInstruments = async () => {
  try {
    const instruments = await FinancialInstrument.findAll();
    
    // Dividir los instrumentos en grupos más pequeños
    const batchSize = 5; // Actualizar 5 instrumentos a la vez
    const batches = [];
    
    for (let i = 0; i < instruments.length; i += batchSize) {
      batches.push(instruments.slice(i, i + batchSize));
    }
    
    // Actualizar un batch cada 5 minutos
    for (const batch of batches) {
      const updates = batch.map(updateInstrument);
      await Promise.all(updates);
      console.log(`Updated batch of ${batch.length} instruments`);
      
      // Esperar 5 minutos antes de procesar el siguiente batch
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
      }
    }
    
    console.log('All instruments updated successfully');
  } catch (error) {
    console.error('Error updating all instruments:', error.message);
  }
};

// Start periodic updates
const startPeriodicUpdates = () => {
  // Initial update
  updateAllInstruments();
  
  // Schedule updates every 15 minutes
  setInterval(updateAllInstruments, 15 * 60 * 1000);
};

module.exports = {
  updateInstrument,
  updateAllInstruments,
  startPeriodicUpdates
}; 