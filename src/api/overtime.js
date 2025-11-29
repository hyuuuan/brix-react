/**
 * Overtime API Module
 * Handles all overtime-related API calls
 */

import client from './client';

const overtimeApi = {
  /**
   * Get overtime requests for authenticated user
   */
  getOvertimeRequests: async (params = {}) => {
    try {
      const response = await client.get('/overtime', { params });
      return response.data;
    } catch (error) {
      console.error('Get overtime requests error:', error);
      throw error;
    }
  },

  /**
   * Submit new overtime request
   */
  submitOvertimeRequest: async (data) => {
    try {
      const response = await client.post('/overtime', data);
      return response.data;
    } catch (error) {
      console.error('Submit overtime request error:', error);
      throw error;
    }
  },

  /**
   * Cancel overtime request (only if pending)
   */
  cancelOvertimeRequest: async (id) => {
    try {
      const response = await client.delete(`/overtime/${id}`);
      return response.data;
    } catch (error) {
      console.error('Cancel overtime request error:', error);
      throw error;
    }
  },

  /**
   * Get overtime statistics
   */
  getOvertimeStats: async (period = 'month') => {
    try {
      const response = await client.get('/overtime/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get overtime stats error:', error);
      throw error;
    }
  },

  /**
   * Get all overtime requests (admin/manager only)
   */
  getAllOvertimeRequests: async (params = {}) => {
    try {
      const response = await client.get('/overtime/all', { params });
      return response.data;
    } catch (error) {
      console.error('Get all overtime requests error:', error);
      throw error;
    }
  },

  /**
   * Approve/reject overtime request (admin/manager only)
   */
  updateOvertimeRequest: async (id, data) => {
    try {
      const response = await client.patch(`/overtime/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update overtime request error:', error);
      throw error;
    }
  }
};

export default overtimeApi;
