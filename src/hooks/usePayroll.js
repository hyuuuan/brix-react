/**
 * usePayroll Hook
 * Custom hook for payroll data management using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../api';

export const usePayrollRecords = (params = {}) => {
  return useQuery({
    queryKey: ['payroll-records', params],
    queryFn: () => payrollApi.getPayrollRecords(params),
  });
};

export const useNextPayday = () => {
  return useQuery({
    queryKey: ['next-payday'],
    queryFn: () => payrollApi.getNextPayday(),
  });
};

export const usePayrollRecord = (payrollId) => {
  return useQuery({
    queryKey: ['payroll-record', payrollId],
    queryFn: () => payrollApi.getPayrollRecord(payrollId),
    enabled: !!payrollId,
  });
};

export const useCreatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => payrollApi.createPayroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
    },
  });
};

export const useUpdatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payrollId, data }) => payrollApi.updatePayroll(payrollId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-record', variables.payrollId] });
    },
  });
};

export const useGeneratePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => payrollApi.generatePayroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
    },
  });
};

export const useDeletePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payrollId) => payrollApi.deletePayroll(payrollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
    },
  });
};
