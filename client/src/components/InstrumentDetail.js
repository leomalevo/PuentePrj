import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

/**
 * InstrumentDetail component displays detailed information about a specific financial instrument
 * including market data, historical performance, and trading information
 */
const InstrumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch instrument details from the API
   */
  useEffect(() => {
    const fetchInstrumentDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/instruments/${id}`);
        setInstrument(response.data);
      } catch (err) {
        setError('Failed to load instrument details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstrumentDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading instrument details...</div>
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

  if (!instrument) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Instrument not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/market')}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        ← Back to Market
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{instrument.name || 'Unknown Instrument'}</h1>
            <p className="text-gray-600 text-xl">{instrument.symbol || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              ${typeof instrument.price === 'number' ? instrument.price.toFixed(2) : 'N/A'}
            </p>
            <p className={`text-lg ${instrument.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {typeof instrument.dailyChange === 'number'
                ? `${instrument.dailyChange >= 0 ? '+' : ''}${instrument.dailyChange.toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Market Data</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">High:</span>
                <span>${typeof instrument.high === 'number' ? instrument.high.toFixed(2) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low:</span>
                <span>${typeof instrument.low === 'number' ? instrument.low.toFixed(2) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volume:</span>
                <span>{typeof instrument.volume === 'number' ? instrument.volume.toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Market Cap:</span>
                <span>{typeof instrument.marketCap === 'number' ? `$${instrument.marketCap.toLocaleString()}` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Performance</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Change:</span>
                <span className={instrument.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {typeof instrument.dailyChange === 'number'
                    ? `${instrument.dailyChange >= 0 ? '+' : ''}${instrument.dailyChange.toFixed(2)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly Change:</span>
                <span className={instrument.weeklyChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {typeof instrument.weeklyChange === 'number'
                    ? `${instrument.weeklyChange >= 0 ? '+' : ''}${instrument.weeklyChange.toFixed(2)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Change:</span>
                <span className={instrument.monthlyChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {typeof instrument.monthlyChange === 'number'
                    ? `${instrument.monthlyChange >= 0 ? '+' : ''}${instrument.monthlyChange.toFixed(2)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {instrument.description && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{instrument.description}</p>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Type: {instrument.type || 'N/A'}</p>
              <p className="text-gray-600">Exchange: {instrument.exchange || 'N/A'}</p>
              <p className="text-gray-600">Sector: {instrument.sector || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated: {instrument.lastUpdated || 'N/A'}</p>
              <p className="text-gray-600">Currency: {instrument.currency || 'USD'}</p>
              <p className="text-gray-600">Country: {instrument.country || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentDetail; 