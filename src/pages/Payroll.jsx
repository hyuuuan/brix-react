/**
 * Payroll Page
 * Payroll management interface
 */

import { useState, useEffect } from 'react';
import { usePayrollRecords, useGeneratePayroll } from '../hooks/usePayroll';
import { useEmployees, useUpdateEmployee } from '../hooks/useEmployees';
import { overtimeApi } from '../api';

const Payroll = () => {
  const [currentPeriod, setCurrentPeriod] = useState({
    start: '2025-11-01',
    end: '2025-11-30',
  });
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [filters, setFilters] = useState({
    employee: 'all',
    status: 'all',
  });
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showWageModal, setShowWageModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [overtimeRequests, setOvertimeRequests] = useState([]);

  // Fetch all payroll records (not filtered by period initially)
  const { data: payrollData, isLoading: payrollLoading, refetch } = usePayrollRecords({
    limit: 100,
  });

  const { data: employeesData } = useEmployees();
  const updateEmployee = useUpdateEmployee();

  // Fetch overtime requests
  useEffect(() => {
    fetchOvertimeRequests();
  }, []);

  const fetchOvertimeRequests = async () => {
    try {
      const response = await overtimeApi.getAllOvertimeRequests({ limit: 50 });
      if (response.success) {
        setOvertimeRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
    }
  };

  const handleApproveOvertimeRequest = async (id) => {
    try {
      console.log('Approving overtime request:', id);
      const response = await overtimeApi.updateOvertimeRequest(id, { status: 'approved' });
      console.log('Approve response:', response);
      if (response.success) {
        await fetchOvertimeRequests();
        alert('Overtime request approved');
      } else {
        alert(response.message || 'Failed to approve overtime request');
      }
    } catch (error) {
      console.error('Error approving overtime request:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(error.response?.data?.message || error.message || 'Failed to approve overtime request');
    }
  };

  const handleRejectOvertimeRequest = async (id) => {
    if (!confirm('Are you sure you want to reject this overtime request?')) {
      return;
    }
    
    try {
      console.log('Rejecting overtime request:', id);
      const response = await overtimeApi.updateOvertimeRequest(id, { status: 'rejected' });
      console.log('Reject response:', response);
      if (response.success) {
        await fetchOvertimeRequests();
        alert('Overtime request rejected');
      } else {
        alert(response.message || 'Failed to reject overtime request');
      }
    } catch (error) {
      console.error('Error rejecting overtime request:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(error.response?.data?.message || error.message || 'Failed to reject overtime request');
    }
  };

  const handleEditWage = (employee) => {
    setSelectedEmployee(employee);
    setShowWageModal(true);
  };

  const handleWageUpdate = async (newWage) => {
    try {
      await updateEmployee.mutateAsync({
        employeeId: selectedEmployee.id,
        data: { wage: newWage }
      });
      setShowWageModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to update wage:', error);
      alert(error.response?.data?.message || 'Failed to update wage');
    }
  };

  // Listen for custom events from header
  useEffect(() => {
    const handleRefresh = () => {
      refetch();
    };
    const handleProcessPayroll = () => {
      setShowProcessModal(true);
    };
    window.addEventListener('refreshPayrollData', handleRefresh);
    window.addEventListener('openProcessPayrollModal', handleProcessPayroll);
    return () => {
      window.removeEventListener('refreshPayrollData', handleRefresh);
      window.removeEventListener('openProcessPayrollModal', handleProcessPayroll);
    };
  }, [refetch]);

  const allRecords = payrollData?.data?.records || [];
  const employees = employeesData?.data?.employees || [];

  // Filter records by current period on the frontend
  const records = allRecords.filter(record => {
    const recordStart = new Date(record.pay_period_start);
    const periodStart = new Date(currentPeriod.start);
    const periodEnd = new Date(currentPeriod.end);
    
    // Check if record's pay period overlaps with our selected period
    return recordStart >= periodStart && recordStart <= periodEnd;
  });

  // Calculate summary metrics
  const calculateMetrics = () => {
    const grossPay = records.reduce((sum, r) => sum + parseFloat(r.gross_pay || 0), 0);
    const netPay = records.reduce((sum, r) => sum + parseFloat(r.net_pay || 0), 0);
    const totalTaxes = records.reduce((sum, r) => sum + parseFloat(r.total_deductions || 0), 0);
    const regularHours = records.reduce((sum, r) => sum + parseFloat(r.regular_hours || 0), 0);
    const overtimeHours = records.reduce((sum, r) => sum + parseFloat(r.overtime_hours || 0), 0);
    
    // Count unique employees in the filtered records
    const uniqueEmployees = new Set(records.map(r => r.employee_id));
    const employeeCount = uniqueEmployees.size;

    return {
      grossPay: grossPay.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      netPay: netPay.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalTaxes: totalTaxes.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      regularHours: regularHours.toFixed(1),
      overtimeHours: overtimeHours.toFixed(1),
      employeeCount,
    };
  };

  const metrics = calculateMetrics();

  const pendingOvertimeCount = overtimeRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payroll Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Payroll Overview</h3>
                <p className="text-xs text-gray-600">Current pay period summary</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Pay Period</h4>
              <p className="text-xs text-gray-600">Nov 1, 2025 - Nov 30, 2025</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900">₱{metrics.grossPay}</p>
                <p className="text-xs text-gray-600 mt-1">GROSS PAY</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900">₱{metrics.netPay}</p>
                <p className="text-xs text-gray-600 mt-1">NET PAY</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-lg font-bold text-gray-900">₱{metrics.totalTaxes}</p>
                <p className="text-xs text-gray-600 mt-1">TOTAL TAXES</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-lg font-bold text-gray-900">{metrics.regularHours}h</p>
                <p className="text-xs text-gray-600 mt-1">REGULAR HOURS</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-lg font-bold text-gray-900">{metrics.overtimeHours}h</p>
                <p className="text-xs text-gray-600 mt-1">OVERTIME HOURS</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-lg font-bold text-gray-900">{metrics.employeeCount}</p>
              <p className="text-xs text-gray-600 mt-1">EMPLOYEES</p>
            </div>
          </div>
        </div>

        {/* Employee Wages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Employee Wages</h3>
                <p className="text-xs text-gray-600">Manage hourly rates and salaries</p>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Employee Wages</h4>
            <p className="text-xs text-gray-600 mb-3">
              Average Rate: ₱{employees.length > 0 
                ? (employees.reduce((sum, emp) => sum + parseFloat(emp.wage || 0), 0) / employees.length).toFixed(2)
                : '0.00'}/hr
            </p>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {employees.slice(0, 10).map((emp) => {
              // Calculate employee's earnings this period
              const empRecords = records.filter(r => r.employee_id === emp.employee_id);
              const periodEarnings = empRecords.reduce((sum, r) => sum + parseFloat(r.gross_pay || 0), 0);
              
              return (
                <div key={emp.employee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                    <p className="text-xs text-gray-600">{emp.employee_id} · {emp.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">₱{emp.wage || '0.00'}/hr</p>
                    <p className="text-xs text-gray-600">₱{periodEarnings.toFixed(2)} this period</p>
                  </div>
                  <button 
                    onClick={() => handleEditWage(emp)}
                    className="ml-3 px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit Wage
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overtime Requests */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Overtime Requests</h3>
                <p className="text-xs text-gray-600">Review and approve overtime</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Overtime Requests</h4>
            <p className="text-xs text-orange-600">{pendingOvertimeCount} pending</p>
          </div>

          <div className="mb-4">
            <h5 className="text-xs font-semibold text-gray-700 mb-2">Recent Requests</h5>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {overtimeRequests.length > 0 ? (
              overtimeRequests.slice(0, 10).map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {request.first_name} {request.last_name}
                      </p>
                      <p className="text-xs text-gray-600">{request.employee_id} · {request.department}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Date: {new Date(request.request_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p>Hours: {request.hours_requested}h</p>
                    <p className="text-gray-700">Reason: {request.reason}</p>
                    <p className="text-gray-500">Submitted: {new Date(request.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleApproveOvertimeRequest(request.id)}
                        className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectOvertimeRequest(request.id)}
                        className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No overtime requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Payroll History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Payroll History</h3>
                <p className="text-xs text-gray-600">View past payroll records</p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Payroll History</h4>
            <select className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="current">Current Period</option>
              <option value="last">Last Period</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="space-y-2">
            {allRecords.slice(0, 5).map((record, index) => (
              <div key={record.id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{record.first_name} {record.last_name}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(record.pay_period_start).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(record.pay_period_end).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right mr-3">
                  <p className="text-xs text-gray-600">
                    {parseFloat(record.regular_hours || 0).toFixed(1)}h regular | {parseFloat(record.overtime_hours || 0).toFixed(1)}h overtime
                  </p>
                  <p className="text-xs font-medium">
                    ₱{parseFloat(record.gross_pay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })} gross | 
                    <span className="text-orange-600"> ₱{parseFloat(record.net_pay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })} net</span>
                  </p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase">
                  {record.status || 'DRAFT'}
                </span>
              </div>
            ))}
            {allRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No payroll records found</p>
                <p className="text-xs mt-1">Generate payroll to create records</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Wage Modal */}
      {showWageModal && selectedEmployee && (
        <WageEditModal
          employee={selectedEmployee}
          onClose={() => {
            setShowWageModal(false);
            setSelectedEmployee(null);
          }}
          onSave={handleWageUpdate}
          isLoading={updateEmployee.isPending}
        />
      )}

      {/* Process Payroll Modal */}
      {showProcessModal && (
        <ProcessPayrollModal
          onClose={() => setShowProcessModal(false)}
          onSuccess={() => {
            setShowProcessModal(false);
            refetch();
          }}
          employees={employees}
        />
      )}
    </div>
  );
};

// Wage Edit Modal Component
const WageEditModal = ({ employee, onClose, onSave, isLoading }) => {
  const [wage, setWage] = useState(employee?.wage || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const wageValue = parseFloat(wage);
    if (isNaN(wageValue) || wageValue < 0) {
      alert('Please enter a valid wage amount');
      return;
    }
    onSave(wageValue);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Edit Wage</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-1">Employee</p>
            <p className="text-base font-semibold text-gray-900">
              {employee.first_name} {employee.last_name}
            </p>
            <p className="text-xs text-gray-600">
              {employee.employee_id} · {employee.department}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Wage (₱) *
            </label>
            <input
              type="number"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter hourly wage"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Wage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Process Payroll Modal Component
const ProcessPayrollModal = ({ onClose, onSuccess, employees }) => {
  const generatePayroll = useGeneratePayroll();
  
  // Calculate default period (current month) in Manila timezone
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [formData, setFormData] = useState({
    pay_period_start: firstDay.toLocaleDateString('en-CA'),
    pay_period_end: lastDay.toLocaleDateString('en-CA'),
    employee_ids: [], // Empty array means all employees
    include_overtime: true,
    include_holidays: true,
  });

  const [selectAll, setSelectAll] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        pay_period_start: formData.pay_period_start,
        pay_period_end: formData.pay_period_end,
        employee_ids: selectAll ? null : Array.from(selectedEmployees),
        include_overtime: formData.include_overtime,
        include_holidays: formData.include_holidays,
      };

      await generatePayroll.mutateAsync(payload);
      onSuccess();
    } catch (error) {
      console.error('Error generating payroll:', error);
      alert(error.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmployees(new Set());
    }
  };

  const handleEmployeeToggle = (employeeId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
    setSelectAll(false);
  };

  const activeEmployees = employees.filter(emp => emp.status === 'active');

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 my-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Process Payroll</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Pay Period */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Pay Period</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  name="pay_period_start"
                  value={formData.pay_period_start}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  name="pay_period_end"
                  value={formData.pay_period_end}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Options</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="include_overtime"
                  checked={formData.include_overtime}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include overtime hours (1.5x rate)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="include_holidays"
                  checked={formData.include_holidays}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include holiday hours (2x rate)</span>
              </label>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Employees</h4>
            <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
              <label className="flex items-center mb-3 pb-3 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm font-semibold text-gray-900">
                  All Active Employees ({activeEmployees.length})
                </span>
              </label>
              
              {!selectAll && (
                <div className="space-y-2">
                  {activeEmployees.map(emp => (
                    <label key={emp.employee_id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(emp.employee_id)}
                        onChange={() => handleEmployeeToggle(emp.employee_id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {emp.first_name} {emp.last_name} ({emp.department})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {selectAll 
                ? `Payroll will be generated for all ${activeEmployees.length} active employees.`
                : `${selectedEmployees.size} employee(s) selected.`
              }
            </p>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={generatePayroll.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={generatePayroll.isPending || (!selectAll && selectedEmployees.size === 0)}
            >
              {generatePayroll.isPending ? 'Processing...' : 'Generate Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payroll;
