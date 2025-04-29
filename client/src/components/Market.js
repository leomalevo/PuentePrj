import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import MarketProducts from './MarketProducts';

const Market = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Market</h1>
        <p className="text-gray-600 mt-2">Explore and track your favorite financial instruments</p>
      </div>
      <MarketProducts />
    </div>
  );
};

export default Market; 