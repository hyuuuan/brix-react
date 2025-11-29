/**
 * Analytics Page
 * Comprehensive attendance statistics and insights
 */

import { useState, useEffect, useRef } from 'react';
import { useAttendanceStats, useAttendanceRecords } from '../hooks/useAttendance';
import { useEmployees } from '../hooks/useEmployees';

const Analytics = () => {
  const [filters, setFilters] = useState({
    employee: 'all',
    department: 'all',
    dateRange: 'last_30_days',
  });
  
  // Search states for dropdowns
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  // Refs for click outside detection
  const employeeDropdownRef = useRef(null);
  const departmentDropdownRef = useRef(null);

  const { data: statsData } = useAttendanceStats();
  const { data: recordsData } = useAttendanceRecords({
    page: 1,
    limit: 1000, // Get all records for analytics
  });
  const { data: employeesData } = useEmployees();

  const stats = statsData?.data || {};
  const allRecords = recordsData?.data?.records || [];
  const employees = employeesData?.data?.employees || [];
  const departments = [...new Set(employees.map(e => e.department))].filter(Boolean);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setShowEmployeeDropdown(false);
      }
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter employees based on search
  const filteredEmployeesList = employees.filter(emp =>
    emp.employee_id?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.first_name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.last_name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  // Filter departments based on search
  const filteredDepartmentsList = departments.filter(dept =>
    dept.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  // Apply filters to records
  const records = allRecords.filter(record => {
    // Employee filter
    if (filters.employee !== 'all' && record.employee_id !== filters.employee) {
      return false;
    }
    
    // Department filter
    if (filters.department !== 'all') {
      const employee = employees.find(e => e.employee_id === record.employee_id);
      if (!employee || employee.department !== filters.department) {
        return false;
      }
    }
    
    // Date range filter using Manila timezone
    const recordDate = new Date(record.date);
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    today.setHours(0, 0, 0, 0);
    
    switch (filters.dateRange) {
      case 'last_7_days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return recordDate >= sevenDaysAgo;
      case 'last_30_days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return recordDate >= thirtyDaysAgo;
      case 'last_90_days':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        return recordDate >= ninetyDaysAgo;
      case 'this_month':
        return recordDate.getMonth() === today.getMonth() && 
               recordDate.getFullYear() === today.getFullYear();
      case 'last_month':
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        return recordDate.getMonth() === lastMonth.getMonth() && 
               recordDate.getFullYear() === lastMonth.getFullYear();
      default:
        return true;
    }
  });

  // Get display text for selected employee
  const selectedEmployeeText = filters.employee === 'all' 
    ? 'All Employees' 
    : (() => {
        const emp = employees.find(e => e.employee_id === filters.employee);
        return emp ? `${emp.employee_id} - ${emp.first_name} ${emp.last_name}` : 'All Employees';
      })();

  // Get display text for selected department
  const selectedDepartmentText = filters.department === 'all' 
    ? 'All Departments' 
    : filters.department;

  // Update search text when filter changes
  useEffect(() => {
    setEmployeeSearch(selectedEmployeeText);
  }, [selectedEmployeeText]);

  useEffect(() => {
    setDepartmentSearch(selectedDepartmentText);
  }, [selectedDepartmentText]);

  // Calculate analytics metrics
  const calculateMetrics = () => {
    const totalEmployees = employees.filter(e => e.status === 'active').length;
    const presentCount = stats.present || 0;
    const absentCount = stats.absent || 0;
    const lateCount = stats.late || 0;
    const onLeaveCount = stats.onLeave || 0;

    // Calculate total hours from records
    const totalHours = records.reduce((sum, record) => {
      return sum + (parseFloat(record.total_hours) || 0);
    }, 0);

    // Calculate attendance rate
    const attendanceRate = totalEmployees > 0 
      ? ((presentCount / totalEmployees) * 100).toFixed(0)
      : 0;

    // Calculate punctuality rate (on-time vs late)
    const totalAttendance = presentCount + lateCount;
    const punctualityRate = totalAttendance > 0
      ? ((presentCount / totalAttendance) * 100).toFixed(0)
      : 100;

    // Calculate overtime (assuming 8h is standard)
    const overtimeHours = records.reduce((sum, record) => {
      const hours = parseFloat(record.total_hours) || 0;
      return sum + (hours > 8 ? hours - 8 : 0);
    }, 0);

    // Weekly attendance patterns
    const weeklyData = calculateWeeklyPatterns(records);

    // Tardiness trends
    const tardinessData = calculateTardinessTrends(records);

    return {
      attendanceRate,
      punctualityRate,
      totalHours: totalHours.toFixed(1),
      overtimeHours: overtimeHours.toFixed(1),
      presentCount,
      absentCount,
      lateCount,
      onLeaveCount,
      totalEmployees,
      weeklyData,
      tardinessData,
    };
  };

  const calculateWeeklyPatterns = (records) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const patterns = daysOfWeek.map(() => ({ present: 0, late: 0, absent: 0 }));

    records.forEach(record => {
      const date = new Date(record.date);
      const dayIndex = date.getDay();
      
      if (record.status === 'present') patterns[dayIndex].present++;
      else if (record.status === 'late') patterns[dayIndex].late++;
      else if (record.status === 'absent') patterns[dayIndex].absent++;
    });

    return daysOfWeek.map((day, index) => ({
      day,
      ...patterns[index],
    }));
  };

  const calculateTardinessTrends = (records) => {
    const lateRecords = records.filter(r => r.status === 'late');
    const avgDelay = lateRecords.length > 0
      ? lateRecords.reduce((sum, r) => sum + 15, 0) / lateRecords.length // Simplified: assume 15min avg
      : 0;

    return {
      lateArrivals: lateRecords.length,
      avgDelay: avgDelay.toFixed(0),
    };
  };

  const metrics = calculateMetrics();
  
  const clearFilters = () => {
    setFilters({
      employee: 'all',
      department: 'all',
      dateRange: 'last_30_days',
    });
    setEmployeeSearch('All Employees');
    setDepartmentSearch('All Departments');
  };

  const handleSelectEmployee = (employeeId) => {
    setFilters({ ...filters, employee: employeeId });
    setShowEmployeeDropdown(false);
    if (employeeId === 'all') {
      setEmployeeSearch('All Employees');
    } else {
      const emp = employees.find(e => e.employee_id === employeeId);
      setEmployeeSearch(emp ? `${emp.employee_id} - ${emp.first_name} ${emp.last_name}` : 'All Employees');
    }
  };

  const handleSelectDepartment = (dept) => {
    setFilters({ ...filters, department: dept });
    setShowDepartmentDropdown(false);
    setDepartmentSearch(dept === 'all' ? 'All Departments' : dept);
  };

  const hasActiveFilters = filters.employee !== 'all' || filters.department !== 'all' || filters.dateRange !== 'last_30_days';

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {/* Employee Filter - Searchable Dropdown */}
            <div className="relative" ref={employeeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                onFocus={() => {
                  setEmployeeSearch('');
                  setShowEmployeeDropdown(true);
                }}
                placeholder="Search employees..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {showEmployeeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    onClick={() => handleSelectEmployee('all')}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-200"
                  >
                    <span className="font-medium">All Employees</span>
                  </div>
                  {filteredEmployeesList.map((emp) => (
                    <div
                      key={emp.employee_id}
                      onClick={() => handleSelectEmployee(emp.employee_id)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <div className="font-medium text-gray-900">
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {emp.employee_id} • {emp.department}
                      </div>
                    </div>
                  ))}
                  {filteredEmployeesList.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No employees found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Department Filter - Searchable Dropdown */}
            <div className="relative" ref={departmentDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input
                type="text"
                value={departmentSearch}
                onChange={(e) => setDepartmentSearch(e.target.value)}
                onFocus={() => {
                  setDepartmentSearch('');
                  setShowDepartmentDropdown(true);
                }}
                placeholder="Search departments..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {showDepartmentDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    onClick={() => handleSelectDepartment('all')}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-200"
                  >
                    <span className="font-medium">All Departments</span>
                  </div>
                  {filteredDepartmentsList.map((dept) => (
                    <div
                      key={dept}
                      onClick={() => handleSelectDepartment(dept)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <span className="font-medium text-gray-900">{dept}</span>
                    </div>
                  ))}
                  {filteredDepartmentsList.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No departments found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </select>
            </div>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-4 text-sm text-gray-600 hover:text-gray-900 flex items-center whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
        
        {hasActiveFilters ? (
          <p className="text-xs text-green-600">{employees.filter(e => {
            if (filters.employee !== 'all' && e.employee_id !== filters.employee) return false;
            if (filters.department !== 'all' && e.department !== filters.department) return false;
            return true;
          }).length} employees</p>
        ) : (
          <p className="text-xs text-gray-500">No filters active</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Attendance Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900">Attendance Rate</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.attendanceRate}%</p>
          <p className="text-xs text-green-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Improving
          </p>
        </div>

        {/* Punctuality Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-pink-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900">Punctuality Rate</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.punctualityRate}%</p>
          <p className="text-xs text-green-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Improving
          </p>
        </div>

        {/* Total Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900">Total Hours</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.totalHours}h</p>
          <p className="text-xs text-gray-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            No change
          </p>
        </div>

        {/* Overtime Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900">Overtime Hours</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.overtimeHours}h</p>
          <p className="text-xs text-gray-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            No change
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Overview - Presence Statistics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">Attendance Overview</h3>
          </div>
          <p className="text-xs text-gray-600 mb-4">Distribution of attendance status</p>

          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-900 text-center mb-4">Presence Statistics</h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-1">{metrics.presentCount}</p>
                <p className="text-xs text-gray-600">Present (0%)</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-600 mb-1">{metrics.lateCount}</p>
                <p className="text-xs text-gray-600">Late (0%)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-4xl font-bold text-red-600 mb-1">{metrics.absentCount}</p>
                <p className="text-xs text-gray-600">Absent (0%)</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-1">{metrics.onLeaveCount}</p>
                <p className="text-xs text-gray-600">On Leave (0%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tardiness Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">Tardiness Trends</h3>
          </div>
          <p className="text-xs text-gray-600 mb-6">Late arrivals and average delays</p>

          <div className="space-y-8">
            <h4 className="text-lg font-bold text-gray-900 text-center">Tardiness Trends</h4>
            
            {/* Chart placeholder */}
            <div className="h-48 flex items-end justify-center space-x-8">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-2 -rotate-45 origin-bottom-left whitespace-nowrap">11/26/25</div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-6 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-sm mr-1"></div>
                <span className="text-gray-600">Late Arrivals</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-sm mr-1"></div>
                <span className="text-gray-600">Avg Delay (min)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Attendance Patterns */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">Weekly Attendance Patterns</h3>
          </div>
          <p className="text-xs text-gray-600 mb-6">Attendance by day of week</p>

          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-900 text-center">Weekly Attendance Patterns</h4>
            
            {/* Chart */}
            <div className="h-48 flex items-end justify-between px-4">
              {metrics.weeklyData.map((day, index) => {
                const total = day.present + day.late + day.absent;
                const maxHeight = 150;
                const height = total > 0 ? (total / Math.max(...metrics.weeklyData.map(d => d.present + d.late + d.absent))) * maxHeight : 0;
                
                return (
                  <div key={day.day} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-green-600 rounded-t transition-all duration-300"
                      style={{ height: `${height}px` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2">{day.day}</div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-6 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded-sm mr-1"></div>
                <span className="text-gray-600">Present</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-sm mr-1"></div>
                <span className="text-gray-600">Late</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-sm mr-1"></div>
                <span className="text-gray-600">Absent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
