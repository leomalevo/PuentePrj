import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchInstrumentsAction,
  toggleFavoriteAction,
  setSearchResults
} from '../context/marketSlice';
import { useAuth } from '../context/AuthContext';
import { getFavorites, searchInstruments, fetchStockData, fetchCryptoData } from '../services/marketService';

/**
 * Mapping of cryptocurrency symbols to CoinGecko IDs
 */
const symbolToCoinGeckoId = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  ADA: 'cardano',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  DOGE: 'dogecoin',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  LTC: 'litecoin'
};

/**
 * MarketProducts component displays a list of financial instruments
 * with real-time price updates and search functionality
 */
const MarketProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { instruments, loading, error, favorites, searchResults } = useSelector((state) => state.market);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [updatedInstruments, setUpdatedInstruments] = useState([]);

  /**
   * Update instrument data from external APIs
   * @param {Object} instrument - Instrument object
   * @returns {Promise<Object>} Updated instrument data
   */
  const updateInstrumentData = async (instrument) => {
    try {
      let data;
      if (instrument.type === 'stock') {
        data = await fetchStockData(instrument.symbol);
      } else {
        const id = symbolToCoinGeckoId[instrument.symbol] || instrument.symbol;
        data = await fetchCryptoData(id);
      }
      return {
        ...instrument,
        currentPrice: data.price,
        dailyChange: data.changePercent,
        dailyHigh: data.high,
        dailyLow: data.low,
        volume: data.volume,
        lastUpdated: data.lastUpdated
      };
    } catch (error) {
      return instrument;
    }
  };

  /**
   * Load initial data and set up periodic updates
   */
  const loadData = async () => {
    if (isAuthenticated) {
      try {
        await dispatch(fetchInstrumentsAction());
        const favoritesData = await getFavorites();
        const favoriteIds = favoritesData.map(fav => fav.instrumentId);
        dispatch({ type: 'market/setFavorites', payload: favoriteIds });

        // Update price data for each instrument and limit to 20 instruments
        const updatedData = await Promise.all(
          instruments
            .slice(0, 20) // Limit to 20 instruments
            .map(updateInstrumentData)
        );
        setUpdatedInstruments(updatedData);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    }
  };

  // Set up periodic data updates
  useEffect(() => {
    loadData();
    const updateInterval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(updateInterval);
  }, [dispatch, isAuthenticated, logout, navigate]);

  /**
   * Handle search form submission
   * @param {Event} e - Form submission event
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    setCurrentSearch(query);

    if (!query) {
      dispatch(setSearchResults({ instruments: [] }));
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchInstruments(query);
      dispatch(setSearchResults(results));
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      dispatch(setSearchResults({ instruments: [] }));
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handle favorite button click
   * @param {Event} e - Click event
   * @param {string} instrumentId - ID of the instrument
   */
  const handleFavoriteClick = async (e, instrumentId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(toggleFavoriteAction(instrumentId));
      const updatedFavorites = await getFavorites();
      const favoriteIds = updatedFavorites.map(fav => fav.instrumentId);
      dispatch({ type: 'market/setFavorites', payload: favoriteIds });
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  // Determine which instruments to display
  const displayInstruments = currentSearch && searchResults.length > 0 
    ? searchResults 
    : updatedInstruments.length > 0 ? updatedInstruments : instruments;

  if (!isAuthenticated) {
    return <div className="text-center p-4">Please log in to view market data</div>;
  }

  if (loading && displayInstruments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading market data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by symbol or name..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {displayInstruments.length === 0 ? (
        <div className="text-center text-xl">
          {currentSearch ? 'No instruments found matching your search' : 'No instruments available'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayInstruments.map((instrument) => (
            <Link
              to={`/market/${instrument.id}`}
              key={instrument.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{instrument.name}</h3>
                  <p className="text-gray-600">{instrument.symbol}</p>
                </div>
                <button
                  onClick={(e) => handleFavoriteClick(e, instrument.id)}
                  className={`text-2xl ${favorites.includes(instrument.id) ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
                  title={favorites.includes(instrument.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.includes(instrument.id) ? '★' : '☆'}
                </button>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${typeof instrument.currentPrice === 'number' ? instrument.currentPrice.toFixed(2) : 'N/A'}
                </p>
                <div className="space-y-1">
                  <p className={`text-lg ${instrument.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    Daily: {typeof instrument.dailyChange === 'number'
                      ? `${instrument.dailyChange >= 0 ? '+' : ''}${instrument.dailyChange.toFixed(2)}%`
                      : 'N/A'}
                  </p>
                  <p className={`text-lg ${instrument.weeklyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    Weekly: {typeof instrument.weeklyChange === 'number'
                      ? `${instrument.weeklyChange >= 0 ? '+' : ''}${instrument.weeklyChange.toFixed(2)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div>
                  <p className="text-gray-600">High:</p>
                  <p>${typeof instrument.dailyHigh === 'number' ? instrument.dailyHigh.toFixed(2) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Low:</p>
                  <p>${typeof instrument.dailyLow === 'number' ? instrument.dailyLow.toFixed(2) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Volume:</p>
                  <p>{typeof instrument.volume === 'number' ? instrument.volume.toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketProducts; 