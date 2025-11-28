/**
 * Payroll API Service
 * Migrated from directflow.js payroll methods
 */

import apiClient from './client';

const payrollApi = {
  // Get payroll records with filters
  async getPayrollRecords(params = {}) {
    const response = await apiClient.get('/payroll', { params });
    return response.data;
  },

  // Get next payday
  async getNextPayday() {
    const response = await apiClient.get('/payroll/next-payday');
    return response.data;
  },

  // Get single payroll record
  async getPayrollRecord(payrollId) {
    const response = await apiClient.get(`/payroll/${payrollId}`);
    return response.data;
  },

  // Create payroll record
  async createPayroll(data) {
    const response = await apiClient.post('/payroll', data);
    return response.data;
  },

  // Update payroll record
  async updatePayroll(payrollId, data) {
    const response = await apiClient.put(`/payroll/${payrollId}`, data);
    return response.data;
  },

  // Generate payroll for period
  async generatePayroll(data) {
    const response = await apiClient.post('/payroll/generate', data);
    return response.data;
  },

  // Delete payroll record
  async deletePayroll(payrollId) {
    const response = await apiClient.delete(`/payroll/${payrollId}`);
    return response.data;
  },
};

export default payrollApi;
