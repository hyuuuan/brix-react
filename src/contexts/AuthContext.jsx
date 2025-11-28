/**
 * Authentication Context
 * Migrated from directflow-auth.js to React Context API
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      console.log('🔐 AuthContext: Initializing...');
      const storedToken = localStorage.getItem('directflow_token');
      const storedUser = localStorage.getItem('directflow_user');
      const storedExpiry = localStorage.getItem('directflow_expires');

      console.log('🔐 AuthContext: Stored data check:', {
        hasToken: !!storedToken,
        hasUser: !!storedUser,
        hasExpiry: !!storedExpiry
      });

      if (storedToken && storedUser) {
        // Check if token is expired
        if (storedExpiry && Date.now() > parseInt(storedExpiry)) {
          console.log('🔐 AuthContext: Token expired, clearing auth');
          clearAuth();
          setLoading(false);
          setInitialized(true);
          return;
        }

        try {
          const userData = JSON.parse(storedUser);
          console.log('🔐 AuthContext: Restoring user from storage:', userData.username);
          setToken(storedToken);
          setUser(userData);
        } catch (error) {
          console.error('🔐 AuthContext: Error parsing stored user data:', error);
          clearAuth();
        }
      } else {
        console.log('🔐 AuthContext: No stored credentials found');
      }

      setLoading(false);
      setInitialized(true);
      console.log('🔐 AuthContext: Initialization complete');
    };

    initAuth();
  }, []);

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem('directflow_token');
    localStorage.removeItem('directflow_user');
    localStorage.removeItem('directflow_expires');
    setToken(null);
    setUser(null);
  };

  // Login function
  const login = async (username, password, rememberMe = false) => {
    try {
      console.log('🔐 AuthContext: Starting login...');
      const response = await authApi.login(username, password, rememberMe);
      console.log('🔐 AuthContext: Login response:', response);

      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        console.log('🔐 AuthContext: User data:', userData);
        console.log('🔐 AuthContext: Token:', authToken ? 'Present' : 'Missing');

        // Calculate expiry time
        const expiryTime = Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);

        // Store authentication data
        localStorage.setItem('directflow_token', authToken);
        localStorage.setItem('directflow_user', JSON.stringify(userData));
        localStorage.setItem('directflow_expires', expiryTime.toString());
        console.log('🔐 AuthContext: Data stored in localStorage');

        // Update state
        setToken(authToken);
        setUser(userData);
        setLoading(false);
        console.log('🔐 AuthContext: State updated, login successful');

        return { success: true, user: userData };
      }

      console.log('🔐 AuthContext: Login failed -', response.message);
      setLoading(false);
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('🔐 AuthContext: Login error:', error);
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  // Logout from all devices
  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      clearAuth();
    }
  };

  // Verify token
  const verifyToken = async () => {
    try {
      const response = await authApi.verifyToken();
      return response.success;
    } catch (error) {
      clearAuth();
      return false;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Get current user
  const getCurrentUser = () => {
    return user;
  };

  // Get token
  const getToken = () => {
    return token;
  };

  const value = {
    user,
    token,
    loading,
    initialized,
    login,
    logout,
    logoutAll,
    verifyToken,
    isAuthenticated,
    getCurrentUser,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
