/**
 * Employees API Service
 * Migrated from directflow.js employee methods
 */

import apiClient from './client';

const employeesApi = {
  // Get all employees with filters
  async getEmployees(params = {}) {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },

  // Get single employee
  async getEmployee(employeeId) {
    const response = await apiClient.get(`/employees/${employeeId}`);
    return response.data;
  },

  // Create employee
  async createEmployee(data) {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  // Update employee
  async updateEmployee(employeeId, data) {
    const response = await apiClient.put(`/employees/${employeeId}`, data);
    return response.data;
  },

  // Delete employee
  async deleteEmployee(employeeId) {
    const response = await apiClient.delete(`/employees/${employeeId}`);
    return response.data;
  },

  // Get employee statistics
  async getEmployeeStats() {
    const response = await apiClient.get('/employees/stats/overview');
    return response.data;
  },
};

export default employeesApi;
