import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../context/authSlice';
import marketReducer from '../context/marketSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    market: marketReducer,
  },
}); 