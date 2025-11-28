/**
 * Dashboard Page
 * Main dashboard with statistics and overview
 */

import { useAuth } from '../contexts/AuthContext';
import { useEmployeeStats } from '../hooks/useEmployees';
import { useAttendanceStats } from '../hooks/useAttendance';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: employeeStats, isLoading: employeeLoading, error: employeeError } = useEmployeeStats();
  const { data: attendanceStats, isLoading: attendanceLoading, error: attendanceError } = useAttendanceStats();

  // Calculate attendance rate
  const totalEmployees = employeeStats?.data?.total_employees || 0;
  const presentToday = attendanceStats?.data?.present || 0;
  const absentToday = attendanceStats?.data?.absent || 0;
  const lateToday = attendanceStats?.data?.late || 0;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back! Here's what's happening today.
        </h2>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Employees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Employees</p>
          {employeeLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
          )}
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Present Today</p>
          {attendanceLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-green-600">{presentToday}</p>
          )}
        </div>

        {/* Late Today */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Late Today</p>
          {attendanceLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-orange-600">{lateToday}</p>
          )}
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
          <p className="text-3xl font-bold text-purple-600">{attendanceRate}%</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's Attendance - Large Card */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Today's Attendance</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#f97316"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${attendanceRate * 5.53} 553`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-gray-900">{presentToday}</span>
                <span className="text-sm text-gray-500 mt-1">Present Today</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mb-4">
            out of {totalEmployees} employees
          </div>

          {/* Status Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">On Time</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{presentToday - lateToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Late</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{lateToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Absent</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{absentToday}</span>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">ATTENDANCE RATE</span>
              <span className={`font-semibold ${
                attendanceRate >= 90 ? 'text-green-500' : 
                attendanceRate >= 70 ? 'text-orange-500' : 
                'text-red-500'
              }`}>{attendanceRate}%</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-center flex-1">
                <div className="text-xs text-gray-500 mb-1">Total Employees</div>
                <div className="text-lg font-bold text-gray-900">{totalEmployees}</div>
              </div>
              <div className="text-center flex-1 border-l border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Present Today</div>
                <div className="text-lg font-bold text-gray-900">{presentToday}</div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Attendance Statistics */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Attendance Statistics</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">TODAY'S SUMMARY</h4>
              <span className="text-xs text-gray-500">Fri, Nov 28</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{presentToday}</div>
                <div className="text-xs text-gray-600 mt-1">Present</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{lateToday}</div>
                <div className="text-xs text-gray-600 mt-1">Late</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{absentToday}</div>
                <div className="text-xs text-gray-600 mt-1">Absent</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">PERFORMANCE</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">TARDINESS RATE</span>
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {totalEmployees > 0 ? Math.round((lateToday / totalEmployees) * 100) : 0}%
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">ON-TIME RATE</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {totalEmployees > 0 ? Math.round(((presentToday - lateToday) / totalEmployees) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Data updated • {totalEmployees} employees
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Attendance Summary</h3>
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Today's attendance rate</p>
            <div className="text-6xl font-bold text-primary-600 mb-2">{attendanceRate}%</div>
            <p className="text-sm text-gray-600 mb-6">OVERALL RATE</p>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Present:</span>
                <span className="font-semibold text-green-600">{presentToday}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Absent:</span>
                <span className="font-semibold text-red-600">{absentToday}</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Employee Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Employee Overview</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Workforce insights & analytics</p>
            <div className="text-7xl font-bold text-primary-600 mb-2">{totalEmployees}</div>
            <p className="text-lg font-semibold text-gray-900 mb-2">Total Employees</p>
            <p className="text-sm text-gray-500">active workforce</p>
          </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Status Breakdown</h3>
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Today's attendance breakdown</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">On Time</span>
                <span className="text-2xl font-bold text-green-600">{presentToday - lateToday}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Late</span>
                <span className="text-2xl font-bold text-orange-600">{lateToday}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Absent</span>
                <span className="text-2xl font-bold text-red-600">{absentToday}</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
