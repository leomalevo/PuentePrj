import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchInstruments, toggleFavoriteAction } from '../context/marketSlice';
import { getFavorites } from '../services/marketService';

const Favorites = () => {
  const dispatch = useDispatch();
  const { instruments, favorites } = useSelector((state) => state.market);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favoritesData = await getFavorites();
        console.log('Favorites data received:', favoritesData);
        // Extraer los IDs de los instrumentos favoritos
        const favoriteIds = favoritesData.map(fav => fav.instrumentId);
        dispatch({ type: 'market/setFavorites', payload: favoriteIds });
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, [dispatch]);

  const handleFavoriteClick = (e, instrumentId) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavoriteAction(instrumentId));
  };

  const favoriteInstruments = instruments.filter(instrument => 
    favorites.includes(instrument.id)
  );

  if (favoriteInstruments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Favorites</h1>
        <div className="text-center text-gray-600">
          You haven't added any instruments to your favorites yet.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Favorites</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoriteInstruments.map((instrument) => (
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFavoriteClick(e, instrument.id);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Remove from favorites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                ${typeof instrument.price === 'number' ? instrument.price.toFixed(2) : 'N/A'}
              </p>
              <p
                className={`text-lg ${
                  instrument.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {typeof instrument.dailyChange === 'number'
                  ? `${instrument.dailyChange >= 0 ? '+' : ''}${instrument.dailyChange.toFixed(2)}%`
                  : 'N/A'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Favorites; 