import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Market from './components/Market';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import InstrumentDetail from './components/InstrumentDetail';
import Favorites from './components/Favorites';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/market"
            element={
              <PrivateRoute>
                <Market />
              </PrivateRoute>
            }
          />
          <Route
            path="/market/:id"
            element={
              <PrivateRoute>
                <InstrumentDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          } />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
