/**
 * Attendance API Service
 * Migrated from directflow.js attendance methods
 */

import apiClient from './client';

const attendanceApi = {
  // Get current attendance status
  async getCurrentStatus() {
    const response = await apiClient.get('/attendance/current-status');
    return response.data;
  },

  // Clock in/out
  async clock(action) {
    const response = await apiClient.post('/attendance/clock', { action });
    return response.data;
  },

  // Break start/end
  async break(action) {
    const response = await apiClient.post('/attendance/break', { action });
    return response.data;
  },

  // Get attendance records with filters
  async getAttendanceRecords(params = {}) {
    const response = await apiClient.get('/attendance', { params });
    return response.data;
  },

  // Get attendance status overview
  async getAttendanceStatus() {
    const response = await apiClient.get('/attendance/status');
    return response.data;
  },

  // Manual attendance entry (requires manager/admin)
  async createManualEntry(data) {
    const response = await apiClient.post('/attendance/manual', data);
    return response.data;
  },

  // Update attendance record
  async updateAttendance(id, data) {
    const response = await apiClient.put(`/attendance/${id}`, data);
    return response.data;
  },

  // Delete attendance record
  async deleteAttendance(id) {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data;
  },

  // Get attendance summary
  async getAttendanceSummary(employeeId = null) {
    const url = employeeId ? `/attendance/summary/${employeeId}` : '/attendance/summary';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get attendance statistics
  async getAttendanceStats() {
    const response = await apiClient.get('/attendance/stats');
    return response.data;
  },
};

export default attendanceApi;
