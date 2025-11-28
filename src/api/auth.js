/**
 * Authentication API Service
 * Migrated from directflow-auth.js
 */

import apiClient from './client';

const authApi = {
  // Login
  async login(username, password, rememberMe = false) {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
      rememberMe,
    });
    return response.data;
  },

  // Logout
  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Logout from all devices
  async logoutAll() {
    const response = await apiClient.post('/auth/logout-all');
    return response.data;
  },

  // Verify token
  async verifyToken() {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },

  // Get current user profile
  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Change username
  async changeUsername(newUsername, password) {
    const response = await apiClient.post('/auth/change-username', {
      newUsername,
      password,
    });
    return response.data;
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Refresh token
  async refreshToken() {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
};

export default authApi;
