import axiosInstance from '../config/axios';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Response data with token and user info
 */
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data;
};

/**
 * Login user with credentials
 * @param {Object} credentials - User login credentials
 * @returns {Promise<Object>} Response data with token and user info
 */
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    
    if (response.data.token && response.data.user) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user and clear local storage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get current user from local storage
 * @returns {Object|null} Current user object or null if not logged in
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get authentication token from local storage
 * @returns {string|null} Authentication token or null if not present
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set authentication token in axios headers and local storage
 * @param {string} token - Authentication token
 */
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}; 