/**
 * Settings API Service
 * Migrated from directflow.js settings methods
 */

import apiClient from './client';

const settingsApi = {
  // Get all system settings
  async getSettings() {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  // Get specific setting
  async getSetting(key) {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data;
  },

  // Update multiple settings
  async updateSettings(settings) {
    const response = await apiClient.put('/settings', settings);
    return response.data;
  },

  // Create new setting
  async createSetting(data) {
    const response = await apiClient.post('/settings', data);
    return response.data;
  },

  // Delete setting
  async deleteSetting(key) {
    const response = await apiClient.delete(`/settings/${key}`);
    return response.data;
  },
};

export default settingsApi;
