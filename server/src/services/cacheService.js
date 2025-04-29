const NodeCache = require('node-cache');

// Configuración del caché
const cacheConfig = {
  stdTTL: 300, // 5 minutos
  checkperiod: 60 // Verificar cada minuto
};

// Crear instancias de caché
const marketDataCache = new NodeCache(cacheConfig);
const apiLimitsCache = new NodeCache({ stdTTL: 60 }); // 1 minuto

/**
 * Obtiene datos del caché
 * @param {string} key - Clave del caché
 * @returns {object|null} - Datos del caché o null si no existen
 */
const getFromCache = (key) => {
  return marketDataCache.get(key);
};

/**
 * Guarda datos en el caché
 * @param {string} key - Clave del caché
 * @param {object} data - Datos a guardar
 * @param {number} ttl - Tiempo de vida en segundos (opcional)
 */
const setInCache = (key, data, ttl = 300) => {
  marketDataCache.set(key, data, ttl);
};

/**
 * Verifica y actualiza los límites de API
 * @param {string} apiKey - Clave de la API
 * @param {string} apiName - Nombre de la API
 * @returns {boolean} - True si se puede hacer la petición
 */
const checkApiLimits = (apiKey, apiName) => {
  const limits = apiLimitsCache.get(apiKey) || {
    alphaVantage: { count: 0, resetTime: Date.now() + 60000 },
    coinGecko: { count: 0, resetTime: Date.now() + 60000 }
  };

  const currentTime = Date.now();
  
  // Resetear contadores si es necesario
  if (currentTime > limits[apiName].resetTime) {
    limits[apiName] = { count: 0, resetTime: currentTime + 60000 };
  }

  // Verificar límites
  const maxRequests = apiName === 'alphaVantage' ? 5 : 10;
  if (limits[apiName].count >= maxRequests) {
    return false;
  }

  // Actualizar contador
  limits[apiName].count++;
  apiLimitsCache.set(apiKey, limits);
  return true;
};

module.exports = {
  getFromCache,
  setInCache,
  checkApiLimits
}; 