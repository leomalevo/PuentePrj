import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchInstrumentsStart,
  fetchInstrumentsSuccess,
  fetchInstrumentsFailure,
} from '../context/marketSlice';
import { getTopInstruments } from '../services/marketService';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { instruments, favorites, loading } = useSelector((state) => state.market);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(fetchInstrumentsStart());
      try {
        const data = await getTopInstruments();
        dispatch(fetchInstrumentsSuccess(data));
      } catch (error) {
        dispatch(fetchInstrumentsFailure(error.message));
        toast.error('Failed to fetch market data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000); // Update every 1 hour

    return () => clearInterval(interval);
  }, [dispatch]);

  const favoriteInstruments = instruments.filter((instrument) =>
    favorites.includes(instrument.id)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Track your favorite instruments and portfolio performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Favorite Instruments
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : favoriteInstruments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No favorite instruments yet</p>
              <Link
                to="/market"
                className="mt-4 inline-block text-primary-600 hover:text-primary-700"
              >
                Browse Market →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteInstruments.map((instrument) => (
                <Link
                  key={instrument.id}
                  to={`/instrument/${instrument.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {instrument.name}
                      </h3>
                      <p className="text-sm text-gray-500">{instrument.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${instrument.price.toFixed(2)}
                      </p>
                      <p
                        className={`text-sm ${
                          instrument.change >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {instrument.change >= 0 ? '+' : ''}
                        {instrument.change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Portfolio Overview
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">
                Total Portfolio Value
              </h3>
              <p className="text-3xl font-bold text-primary-600">$0.00</p>
              <p className="text-sm text-gray-500">No investments yet</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">
                Portfolio Performance
              </h3>
              <p className="text-3xl font-bold text-gray-900">0.00%</p>
              <p className="text-sm text-gray-500">No change</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 