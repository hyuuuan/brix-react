/**
 * My Attendance Page
 * Personal attendance records and statistics
 */

import { useState, useEffect } from 'react';
import { attendanceApi, overtimeApi } from '../api';
import { getManilaTime, toManilaISODate, toManilaISODateTime, isManilaToday, formatManilaDate, getManilaDaysAgo } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

const MyAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [overtimeRequest, setOvertimeRequest] = useState({
    date: '',
    hours: '',
    reason: ''
  });

  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAllData();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Listen for refresh event from header
  useEffect(() => {
    const handleRefresh = () => fetchAllData();
    window.addEventListener('refreshMyAttendance', handleRefresh);
    return () => window.removeEventListener('refreshMyAttendance', handleRefresh);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCurrentStatus(),
        fetchSummary(),
        fetchRecentEntries(),
        fetchOvertimeRequests()
      ]);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentStatus = async () => {
    try {
      const response = await attendanceApi.getCurrentStatus();
      if (response.success) {
        setCurrentStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching current status:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await attendanceApi.getAttendanceSummary();
      console.log('📊 Summary Response:', JSON.stringify(response, null, 2));
      if (response.success) {
        console.log('📊 Summary Data:', JSON.stringify(response.data, null, 2));
        console.log('📊 Individual Fields:', {
          total_days: response.data.total_days,
          present_days: response.data.present_days,
          total_hours: response.data.total_hours,
          regular_hours: response.data.regular_hours,
          overtime_hours: response.data.overtime_hours,
          hourly_rate: response.data.hourly_rate,
          overtime_rate: response.data.overtime_rate,
          regular_pay: response.data.regular_pay,
          overtime_pay: response.data.overtime_pay,
          monthly_earnings: response.data.monthly_earnings
        });
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const endDate = toManilaISODate(getManilaTime());
      const startDate = toManilaISODate(getManilaDaysAgo(30));
      
      // Always pass employee_id to get only current user's records
      // even if user is admin, in MyAttendance we want their own records
      const response = await attendanceApi.getAttendanceRecords({
        employee_id: user?.employee_id,
        start_date: startDate,
        end_date: endDate
      });
      
      if (response.success) {
        setRecentEntries(response.data.attendance.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching recent entries:', error);
    }
  };

  const fetchOvertimeRequests = async () => {
    try {
      const response = await overtimeApi.getOvertimeRequests({ limit: 10 });
      if (response.success) {
        setOvertimeRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
    }
  };

  const handleClock = async (action) => {
    try {
      const response = await attendanceApi.clock(action);
      if (response.success) {
        await fetchAllData();
      } else {
        alert(response.message || 'Failed to clock ' + action);
      }
    } catch (error) {
      console.error('Clock error:', error);
      alert('Failed to clock ' + action + '. Please try again.');
    }
  };

  const handleBreak = async (action) => {
    try {
      const response = await attendanceApi.break(action);
      if (response.success) {
        await fetchAllData();
      } else {
        alert(response.message || 'Failed to ' + action + ' break');
      }
    } catch (error) {
      console.error('Break error:', error);
      alert('Failed to ' + action + ' break. Please try again.');
    }
  };

  const handleOvertimeRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await overtimeApi.submitOvertimeRequest({
        request_date: overtimeRequest.date,
        hours_requested: parseFloat(overtimeRequest.hours),
        reason: overtimeRequest.reason
      });
      
      if (response.success) {
        setShowOvertimeModal(false);
        setOvertimeRequest({ date: '', hours: '', reason: '' });
        await fetchOvertimeRequests();
        alert('Overtime request submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting overtime request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit overtime request. Please try again.';
      alert(errorMessage);
    }
  };

  const handleCancelOvertimeRequest = async (id) => {
    if (!confirm('Are you sure you want to cancel this overtime request?')) {
      return;
    }
    
    try {
      const response = await overtimeApi.cancelOvertimeRequest(id);
      if (response.success) {
        await fetchOvertimeRequests();
        alert('Overtime request cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling overtime request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel overtime request. Please try again.';
      alert(errorMessage);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const [inHours, inMinutes] = timeIn.split(':').map(Number);
    const [outHours, outMinutes] = timeOut.split(':').map(Number);
    const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    return (totalMinutes / 60).toFixed(1);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const formatHours = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.0' : num.toFixed(1);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  const canClockIn = currentStatus?.capabilities?.canClockIn;
  const canClockOut = currentStatus?.capabilities?.canClockOut;
  const canStartBreak = currentStatus?.capabilities?.canStartBreak;
  const canEndBreak = currentStatus?.capabilities?.canEndBreak;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Clock In/Out Buttons */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => handleClock('in')}
          disabled={!canClockIn}
          className={`p-6 rounded-xl border-2 transition-all ${
            canClockIn
              ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer'
              : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
          }`}
        >
          <div className="text-sm font-medium text-gray-700 mb-1">Clock In</div>
        </button>
        
        <button
          onClick={() => handleClock('out')}
          disabled={!canClockOut}
          className={`p-6 rounded-xl border-2 transition-all ${
            canClockOut
              ? 'bg-red-50 border-red-200 hover:bg-red-100 cursor-pointer'
              : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
          }`}
        >
          <div className="text-sm font-medium text-gray-700 mb-1">Clock Out</div>
        </button>
        
        <button
          onClick={() => handleBreak('start')}
          disabled={!canStartBreak}
          className={`p-6 rounded-xl border-2 transition-all ${
            canStartBreak
              ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 cursor-pointer'
              : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
          }`}
        >
          <div className="text-sm font-medium text-gray-700 mb-1">Start Lunch</div>
        </button>
        
        <button
          onClick={() => handleBreak('end')}
          disabled={!canEndBreak}
          className={`p-6 rounded-xl border-2 transition-all ${
            canEndBreak
              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer'
              : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
          }`}
        >
          <div className="text-sm font-medium text-gray-700 mb-1">End Lunch</div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Attendance Summary</h2>
            </div>
          </div>
          <div className="p-6">

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">{summary?.total_days || 0}</div>
              <div className="text-xs text-gray-600 mt-1">TOTAL DAYS</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">{summary?.present_days || 0}</div>
              <div className="text-xs text-gray-600 mt-1">PRESENT</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">{summary?.late_days || 0}</div>
              <div className="text-xs text-gray-600 mt-1">LATE</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">{summary?.absent_days || 0}</div>
              <div className="text-xs text-gray-600 mt-1">ABSENT</div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center p-4 bg-orange-50 rounded-lg w-full">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{summary?.attendance_rate || '100'}%</div>
                <div className="text-xs text-gray-600 mt-1">ATTENDANCE RATE</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-gray-900 text-center">{summary?.punctuality_rate || '100'}%</div>
            <div className="text-xs text-gray-600 mt-1 text-center">PUNCTUALITY</div>
          </div>
          </div>
        </div>

        {/* Personal Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Personal Statistics</h2>
            </div>
          </div>
          <div className="p-6">

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Hours Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Regular Hours</span>
                    <span className="text-lg font-bold text-blue-600">{summary?.regular_hours || '0.0'}h</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overtime Hours</span>
                    <span className="text-lg font-bold text-orange-600">{summary?.overtime_hours || '0'}h</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Hours</span>
                    <span className="text-lg font-bold text-purple-600">{summary?.total_hours || '0.0'}h</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Daily</span>
                    <span className="text-lg font-bold text-gray-700">{summary?.avg_daily_hours || '0.0'}h</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Timing Patterns</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Check-in</span>
                    <span className="text-lg font-bold text-green-600">{formatTime(summary?.avg_check_in) || '--:--'}</span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Check-out</span>
                    <span className="text-lg font-bold text-red-600">{formatTime(summary?.avg_check_out) || '--:--'}</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">On Time</span>
                    <span className="text-lg font-bold text-emerald-600">{summary?.on_time_days || '0'} days</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Late</span>
                    <span className="text-lg font-bold text-yellow-600">{summary?.late_days || '0'} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Time Entries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Recent Time Entries</h2>
            </div>
            <button onClick={fetchAllData} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="p-6">

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent time entries found
              </div>
            ) : (
              recentEntries.map((entry, index) => {
                const dateInfo = formatDate(entry.date);
                const hours = calculateHours(entry.time_in, entry.time_out);
                const isLate = entry.is_late;
                const isToday = toManilaISODate(entry.date) === toManilaISODate(getManilaTime());
                
                return (
                  <div 
                    key={entry.id || index}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                      isToday ? 'border-orange-200 bg-orange-50' : 
                      isLate ? 'border-yellow-200 bg-yellow-50' : 
                      'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center min-w-[60px]">
                      <div className="text-3xl font-bold text-gray-900">{dateInfo.day}</div>
                      <div className="text-xs font-medium text-gray-600">{dateInfo.month}</div>
                    </div>
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Time In</div>
                        <div className="font-semibold text-gray-900">{formatTime(entry.time_in)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Time Out</div>
                        <div className="font-semibold text-gray-900">{formatTime(entry.time_out)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Hours</div>
                        <div className="font-semibold text-gray-900">{hours}h</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <div className={`text-xs font-semibold ${
                          isLate ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {isLate ? 'Late' : 'On Time'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </div>
        </div>

        {/* Overtime Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Overtime Requests</h2>
            </div>
            <button
              onClick={() => setShowOvertimeModal(true)}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request Overtime
            </button>
          </div>
          <div className="p-6">

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Requests</h3>
            {overtimeRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No overtime requests found
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {overtimeRequests.map((request) => {
                  const dateInfo = formatDate(request.request_date);
                  const statusColors = {
                    pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                    approved: 'bg-green-50 border-green-200 text-green-700',
                    rejected: 'bg-red-50 border-red-200 text-red-700'
                  };
                  
                  return (
                    <div
                      key={request.id}
                      className={`p-4 rounded-lg border-2 ${statusColors[request.status] || 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <div className="text-2xl font-bold">{dateInfo.day}</div>
                            <div className="text-xs font-medium">{dateInfo.month}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {request.hours_requested}h Overtime
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {request.reason}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs font-semibold uppercase px-2 py-1 rounded">
                            {request.status}
                          </span>
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOvertimeRequest(request.id)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                      {request.approved_at && (
                        <div className="text-xs text-gray-500 mt-2">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'} on {formatManilaDate(request.approved_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Monthly Earnings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Monthly Earnings</h2>
            </div>
          </div>
          <div className="p-6">

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 mb-4">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ₱{formatCurrency(summary?.monthly_earnings)}
              </div>
              <div className="text-sm text-gray-600">MONTHLY EARNINGS</div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">₱{formatCurrency(summary?.regular_pay)}</div>
                <div className="text-xs text-gray-600 mt-1">REGULAR PAY</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">₱{formatCurrency(summary?.overtime_pay)}</div>
                <div className="text-xs text-gray-600 mt-1">OVERTIME PAY</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{formatHours(summary?.total_hours)}h</div>
                <div className="text-xs text-gray-600 mt-1">TOTAL HOURS</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatHours(summary?.avg_daily_hours)}h</div>
                <div className="text-xs text-gray-600 mt-1">AVG DAILY HOURS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hours & Pay Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Hours & Pay Breakdown</h2>
            </div>
          </div>
          <div className="p-6">

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border-l-4 border-green-500 bg-green-50 rounded">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Regular Hours</div>
                  <div className="text-xs text-gray-600">{formatHours(summary?.regular_hours)}h @ ₱{formatCurrency(summary?.hourly_rate)}/hr</div>
                </div>
                <div className="text-lg font-bold text-gray-900">₱{formatCurrency(summary?.regular_pay)}</div>
              </div>

              <div className="flex items-center gap-3 p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Overtime Hours</div>
                  <div className="text-xs text-gray-600">{formatHours(summary?.overtime_hours)}h @ ₱{formatCurrency(summary?.overtime_rate)}/hr</div>
                </div>
                <div className="text-lg font-bold text-gray-900">₱{formatCurrency(summary?.overtime_pay)}</div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Hours:</span>
                  <span className="text-lg font-bold text-gray-900">{formatHours(summary?.total_hours)}h</span>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{formatHours(summary?.avg_daily_hours)}h</div>
                  <div className="text-xs text-gray-600">AVG DAILY HOURS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Payroll Summary</h2>
            </div>
          </div>
          <div className="p-6">

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{summary?.present_days || 0}</div>
                <div className="text-xs text-gray-600 mt-1">DAYS WORKED</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">₱{formatCurrency(summary?.hourly_rate)}</div>
                <div className="text-xs text-gray-600 mt-1">HOURLY RATE</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{summary?.attendance_rate || '100'}%</div>
                  <div className="text-xs text-gray-600 mt-1">ATTENDANCE RATE</div>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">₱{formatCurrency(summary?.monthly_projection)}</div>
                  <div className="text-xs text-gray-600 mt-1">MONTHLY PROJECTION</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <div className="text-xs text-orange-800">
                <strong>Note:</strong> Monthly projection based on current attendance and hourly rate for 22 working days.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Request Modal */}
      {showOvertimeModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Request Overtime</h2>
              <button
                onClick={() => setShowOvertimeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleOvertimeRequest} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={overtimeRequest.date}
                    onChange={(e) => setOvertimeRequest({ ...overtimeRequest, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    min="0.5"
                    value={overtimeRequest.hours}
                    onChange={(e) => setOvertimeRequest({ ...overtimeRequest, hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 2.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={overtimeRequest.reason}
                    onChange={(e) => setOvertimeRequest({ ...overtimeRequest, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Please explain why overtime is needed"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowOvertimeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAttendance;
