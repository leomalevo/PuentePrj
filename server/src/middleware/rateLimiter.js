const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

// Cache para almacenar los límites de cada API
const apiLimitsCache = new NodeCache({ stdTTL: 60 }); // 1 minuto

/**
 * Rate limiting configuration for external APIs
 * Alpha Vantage: 5 requests per minute
 * CoinGecko: 10 requests per minute
 */
const rateLimits = {
  alphaVantage: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    currentRequests: 0,
    lastReset: Date.now()
  },
  coingecko: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    currentRequests: 0,
    lastReset: Date.now()
  }
};

/**
 * Checks if a request can be made to the specified API based on rate limits
 * @param {string} api - The API to check ('alphaVantage' or 'coingecko')
 * @returns {boolean} - True if request is allowed, false if rate limit exceeded
 */
function checkRateLimit(api) {
  const now = Date.now();
  const limit = rateLimits[api];
  
  // Reset counter if window has passed
  if (now - limit.lastReset >= limit.windowMs) {
    limit.currentRequests = 0;
    limit.lastReset = now;
  }
  
  // Check if we've exceeded the limit
  if (limit.currentRequests >= limit.maxRequests) {
    return false;
  }
  
  // Increment counter and allow request
  limit.currentRequests++;
  return true;
}

/**
 * Middleware to handle rate limiting for external API calls
 * @param {string} api - The API to apply rate limiting to
 * @returns {Function} - Express middleware function
 */
const rateLimiter = (api) => {
  return (req, res, next) => {
    if (checkRateLimit(api)) {
      next();
    } else {
      res.status(429).json({
        error: `Rate limit exceeded for ${api}. Please try again later.`,
        retryAfter: Math.ceil((rateLimits[api].lastReset + rateLimits[api].windowMs - Date.now()) / 1000)
      });
    }
  };
};

// Middleware para verificar y actualizar los límites de API
const checkApiLimits = (req, res, next) => {
  const apiKey = req.query.apikey || req.headers['x-api-key'];
  
  if (!apiKey) {
    return next();
  }

  const currentTime = Date.now();
  const apiLimits = apiLimitsCache.get(apiKey) || {
    alphaVantage: { count: 0, resetTime: currentTime + 60000 },
    coinGecko: { count: 0, resetTime: currentTime + 60000 }
  };

  // Verificar si necesitamos resetear los contadores
  if (currentTime > apiLimits.alphaVantage.resetTime) {
    apiLimits.alphaVantage = { count: 0, resetTime: currentTime + 60000 };
  }
  if (currentTime > apiLimits.coinGecko.resetTime) {
    apiLimits.coinGecko = { count: 0, resetTime: currentTime + 60000 };
  }

  // Actualizar el caché
  apiLimitsCache.set(apiKey, apiLimits);

  // Agregar los límites a la respuesta para que el cliente los conozca
  res.setHeader('X-RateLimit-AlphaVantage-Limit', 5);
  res.setHeader('X-RateLimit-AlphaVantage-Remaining', 5 - apiLimits.alphaVantage.count);
  res.setHeader('X-RateLimit-AlphaVantage-Reset', apiLimits.alphaVantage.resetTime);

  res.setHeader('X-RateLimit-CoinGecko-Limit', 10);
  res.setHeader('X-RateLimit-CoinGecko-Remaining', 10 - apiLimits.coinGecko.count);
  res.setHeader('X-RateLimit-CoinGecko-Reset', apiLimits.coinGecko.resetTime);

  next();
};

/**
 * Increments the API call counter
 * @param {string} apiKey - The API key used
 * @param {string} api - The API being called
 */
const incrementApiCount = (apiKey, api) => {
  if (!rateLimits[api]) {
    console.warn(`No rate limit configuration found for API: ${api}`);
    return;
  }
  
  const now = Date.now();
  const limit = rateLimits[api];
  
  if (now - limit.lastReset >= limit.windowMs) {
    limit.currentRequests = 0;
    limit.lastReset = now;
  }
  
  limit.currentRequests++;
};

module.exports = {
  rateLimiter,
  incrementApiCount,
  checkRateLimit,
  checkApiLimits
}; 