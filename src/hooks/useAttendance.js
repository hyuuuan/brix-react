/**
 * useAttendance Hook
 * Custom hook for attendance data management using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api';

export const useCurrentStatus = () => {
  return useQuery({
    queryKey: ['attendance-current-status'],
    queryFn: () => attendanceApi.getCurrentStatus(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useAttendanceRecords = (params = {}) => {
  return useQuery({
    queryKey: ['attendance-records', params],
    queryFn: () => attendanceApi.getAttendanceRecords(params),
  });
};

export const useAttendanceStatus = () => {
  return useQuery({
    queryKey: ['attendance-status'],
    queryFn: () => attendanceApi.getAttendanceStatus(),
  });
};

export const useAttendanceSummary = (employeeId = null) => {
  return useQuery({
    queryKey: ['attendance-summary', employeeId],
    queryFn: () => attendanceApi.getAttendanceSummary(employeeId),
  });
};

export const useAttendanceStats = () => {
  const token = localStorage.getItem('directflow_token');
  
  return useQuery({
    queryKey: ['attendance-stats'],
    queryFn: () => attendanceApi.getAttendanceStats(),
    enabled: !!token,
  });
};

export const useClock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action) => attendanceApi.clock(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-current-status'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
    },
  });
};

export const useBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action) => attendanceApi.break(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-current-status'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
    },
  });
};

export const useCreateManualEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => attendanceApi.createManualEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => attendanceApi.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => attendanceApi.deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
    },
  });
};
