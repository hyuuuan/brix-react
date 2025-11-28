/**
 * useEmployees Hook
 * Custom hook for employee data management using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api';

export const useEmployees = (params = {}) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeesApi.getEmployees(params),
  });
};

export const useEmployee = (employeeId) => {
  return useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeesApi.getEmployee(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => employeesApi.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, data }) => employeesApi.updateEmployee(employeeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId) => employeesApi.deleteEmployee(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useEmployeeStats = () => {
  const token = localStorage.getItem('directflow_token');
  
  return useQuery({
    queryKey: ['employee-stats'],
    queryFn: () => employeesApi.getEmployeeStats(),
    enabled: !!token,
  });
};
