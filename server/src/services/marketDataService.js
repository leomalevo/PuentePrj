const axios = require('axios');
const { FinancialInstrument } = require('../models');
const { getFromCache, setInCache, checkApiLimits } = require('./cacheService');

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Configuración de instrumentos predefinidos
const PREDEFINED_INSTRUMENTS = {
  stocks: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
    'TSLA', 'NVDA', 'JPM', 'V', 'WMT'
  ],
  crypto: [
    'bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano',
    'solana', 'polkadot', 'dogecoin', 'avalanche-2', 'polygon'
  ]
};

// Tiempo de retraso para datos gratuitos (15 minutos)
const DELAY_MINUTES = 15;
const DELAY_MS = DELAY_MINUTES * 60 * 1000;

/**
 * Actualiza los datos de una acción usando Alpha Vantage
 * @param {string} symbol - Símbolo de la acción
 * @returns {object|null} - Datos actualizados o null si hay error
 */
async function updateStockData(symbol) {
  try {
    // Verificar límites de API
    if (!checkApiLimits(ALPHA_VANTAGE_API_KEY, 'alphaVantage')) {
      console.log(`Límite de Alpha Vantage alcanzado para ${symbol}`);
      return null;
    }

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    if (response.data['Error Message'] || response.data['Note']) {
      console.error(`Error Alpha Vantage para ${symbol}:`, response.data['Error Message'] || response.data['Note']);
      return null;
    }

    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) return null;

    // Obtener datos con retraso de 15 minutos
    const dates = Object.keys(timeSeries).sort().reverse();
    const delayedData = timeSeries[dates[1]]; // Usar datos del día anterior para simular retraso

    return {
      price: parseFloat(delayedData['4. close']),
      change: parseFloat(delayedData['4. close']) - parseFloat(delayedData['1. open']),
      changePercent: ((parseFloat(delayedData['4. close']) - parseFloat(delayedData['1. open'])) / parseFloat(delayedData['1. open'])) * 100,
      high: parseFloat(delayedData['2. high']),
      low: parseFloat(delayedData['3. low']),
      volume: parseInt(delayedData['5. volume'])
    };
  } catch (error) {
    console.error(`Error actualizando datos de ${symbol}:`, error);
    return null;
  }
}

/**
 * Actualiza los datos de una criptomoneda usando CoinGecko
 * @param {string} symbol - ID de la criptomoneda
 * @returns {object|null} - Datos actualizados o null si hay error
 */
async function updateCryptoData(symbol) {
  try {
    // Verificar límites de API
    if (!checkApiLimits('coingecko', 'coinGecko')) {
      console.log(`Límite de CoinGecko alcanzado para ${symbol}`);
      return null;
    }

    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: symbol,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_last_updated_at: true
      }
    });

    const data = response.data[symbol];
    if (!data) return null;

    // Simular retraso de 15 minutos
    const lastUpdated = data.last_updated_at * 1000;
    if (Date.now() - lastUpdated < DELAY_MS) {
      console.log(`Esperando retraso de 15 minutos para ${symbol}`);
      return null;
    }

    return {
      price: data.usd,
      changePercent: data.usd_24h_change,
      high: data.usd,
      low: data.usd,
      volume: 0 // CoinGecko no proporciona volumen en el endpoint simple
    };
  } catch (error) {
    console.error(`Error actualizando datos de ${symbol}:`, error);
    return null;
  }
}

/**
 * Actualiza todos los instrumentos predefinidos
 */
async function updateAllInstruments() {
  try {
    console.log('Iniciando actualización de instrumentos...');
    
    // Actualizar acciones
    for (const symbol of PREDEFINED_INSTRUMENTS.stocks) {
      const data = await updateStockData(symbol);
      if (data) {
        await FinancialInstrument.update(data, {
          where: { symbol, type: 'stock' }
        });
        setInCache(`stock_${symbol}`, data);
      }
    }

    // Actualizar criptomonedas
    for (const symbol of PREDEFINED_INSTRUMENTS.crypto) {
      const data = await updateCryptoData(symbol);
      if (data) {
        await FinancialInstrument.update(data, {
          where: { symbol, type: 'crypto' }
        });
        setInCache(`crypto_${symbol}`, data);
      }
    }

    console.log('Actualización de instrumentos completada');
  } catch (error) {
    console.error('Error en la actualización de instrumentos:', error);
  }
}

module.exports = {
  updateStockData,
  updateCryptoData,
  updateAllInstruments,
  PREDEFINED_INSTRUMENTS
}; 