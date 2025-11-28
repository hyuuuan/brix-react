/**
 * API Client Configuration
 * Base Axios instance with interceptors for authentication
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('🌐 API Client: Base URL configured as:', API_BASE_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('directflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🌐 API Request:', config.method.toUpperCase(), config.url, config.baseURL);
    return config;
  },
  (error) => {
    console.error('🌐 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('🌐 API Response:', response.config.method.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('🌐 API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.message);
    
    // Don't auto-redirect on 401 - let the app handle it
    // The ProtectedRoute will handle redirects if needed
    // Only log the error and reject the promise
    
    return Promise.reject(error);
  }
);

export default apiClient;
