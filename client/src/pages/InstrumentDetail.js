import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStockData, fetchCryptoData } from '../services/marketService';
import { toast } from 'react-toastify';

const InstrumentDetail = () => {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstrumentData = async () => {
      try {
        setLoading(true);
        let data;
        if (id.length <= 4) {
          // Assuming stock symbols are 4 characters or less
          data = await fetchStockData(id);
          const timeSeries = Object.entries(data['Time Series (Daily)']);
          setInstrument({
            id,
            type: 'stock',
            name: data['Meta Data']['2. Symbol'],
            currentPrice: parseFloat(timeSeries[0][1]['4. close']),
            high: parseFloat(timeSeries[0][1]['2. high']),
            low: parseFloat(timeSeries[0][1]['3. low']),
            volume: parseInt(timeSeries[0][1]['5. volume']),
            change: ((parseFloat(timeSeries[0][1]['4. close']) - parseFloat(timeSeries[1][1]['4. close'])) / parseFloat(timeSeries[1][1]['4. close'])) * 100,
          });
        } else {
          // Assuming crypto IDs are longer
          data = await fetchCryptoData(id);
          setInstrument({
            id,
            type: 'crypto',
            name: data.name,
            currentPrice: data.market_data.current_price.usd,
            high: data.market_data.high_24h.usd,
            low: data.market_data.low_24h.usd,
            volume: data.market_data.total_volume.usd,
            change: data.market_data.price_change_percentage_24h,
          });
        }
        setError(null);
      } catch (error) {
        setError('Failed to fetch instrument data');
        toast.error('Failed to fetch instrument data');
      } finally {
        setLoading(false);
      }
    };

    fetchInstrumentData();
    const interval = setInterval(fetchInstrumentData, 60 * 60 * 1000); // Update every 1 hour

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-gray-600 mt-2">{error || 'Instrument not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{instrument.name}</h1>
            <p className="text-gray-500">{instrument.id}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {instrument.type === 'stock' ? 'Stock' : 'Cryptocurrency'}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Current Price</h3>
              <p className="text-3xl font-bold text-gray-900">
                ${instrument.currentPrice.toFixed(2)}
              </p>
              <p
                className={`text-sm ${
                  instrument.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {instrument.change >= 0 ? '+' : ''}
                {instrument.change.toFixed(2)}%
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">24h High/Low</h3>
              <div className="flex space-x-4">
                <div>
                  <p className="text-sm text-gray-500">High</p>
                  <p className="text-lg font-semibold text-green-600">
                    ${instrument.high.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Low</p>
                  <p className="text-lg font-semibold text-red-600">
                    ${instrument.low.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Volume</h3>
              <p className="text-2xl font-bold text-gray-900">
                {instrument.volume.toLocaleString()}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Market Cap</h3>
              <p className="text-2xl font-bold text-gray-900">
                ${(instrument.currentPrice * instrument.volume).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentDetail; 