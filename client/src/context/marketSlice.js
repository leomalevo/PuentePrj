import { createSlice } from '@reduxjs/toolkit';
import { fetchInstruments as fetchInstrumentsService, searchInstruments, toggleFavorite, getFavorites } from '../services/marketService';

const initialState = {
  instruments: [],
  loading: false,
  error: null,
  favorites: [],
  searchResults: []
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    fetchInstrumentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchInstrumentsSuccess: (state, action) => {
      state.loading = false;
      state.instruments = action.payload;
      state.error = null;
    },
    fetchInstrumentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload.instruments || [];
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    }
  }
});

export const {
  fetchInstrumentsStart,
  fetchInstrumentsSuccess,
  fetchInstrumentsFailure,
  setSearchResults,
  setFavorites
} = marketSlice.actions;

export const fetchInstrumentsAction = () => async (dispatch) => {
  try {
    dispatch(fetchInstrumentsStart());
    const data = await fetchInstrumentsService();
    dispatch(fetchInstrumentsSuccess(data));
  } catch (error) {
    dispatch(fetchInstrumentsFailure(error.message));
  }
};

export const searchInstrumentsAction = (query) => async (dispatch) => {
  try {
    const results = await searchInstruments(query);
    dispatch(setSearchResults(results));
  } catch (error) {
    console.error('Search error:', error);
    dispatch(setSearchResults({ instruments: [] }));
  }
};

export const toggleFavoriteAction = (instrumentId) => async (dispatch) => {
  try {
    await toggleFavorite(instrumentId);
    const favorites = await getFavorites();
    const favoriteIds = favorites.map(fav => fav.instrumentId);
    dispatch(setFavorites(favoriteIds));
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
};

export default marketSlice.reducer; 