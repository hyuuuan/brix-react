/**
 * Header Component
 * Top navigation bar
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getManilaTime } from '../../utils/dateUtils';

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [saveStatus, setSaveStatus] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Update current date every minute
  useEffect(() => {
    const updateDate = () => {
      const manilaTime = getManilaTime();
      const formatted = manilaTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      setCurrentDate(formatted);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Map routes to page titles
  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/employees': 'Employees',
    '/attendance': 'Attendance',
    '/analytics': 'Analytics',
    '/payroll': 'Payroll',
    '/settings': 'Settings',
    '/my-attendance': 'My Attendance',
    '/security': 'Security',
  };

  const currentPage = pageTitles[location.pathname] || 'Dashboard';
  const isEmployeesPage = location.pathname === '/employees';
  const isAttendancePage = location.pathname === '/attendance';
  const isAnalyticsPage = location.pathname === '/analytics';
  const isPayrollPage = location.pathname === '/payroll';
  const isSettingsPage = location.pathname === '/settings';
  const isMyAttendancePage = location.pathname === '/my-attendance';

  // Dispatch custom event for Add Employee button
  const handleAddEmployee = () => {
    window.dispatchEvent(new CustomEvent('openAddEmployeeModal'));
  };

  // Dispatch custom event for Add Entry button
  const handleAddEntry = () => {
    window.dispatchEvent(new CustomEvent('openAddEntryModal'));
  };

  // Handle export for Analytics page
  const handleExportAnalytics = () => {
    // Create CSV content
    const headers = ['Metric', 'Value'];
    const data = [
      ['Export Date', new Date().toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' })],
      ['Attendance Rate', '100%'],
      ['Punctuality Rate', '100%'],
      ['Total Hours', '1138h'],
      ['Overtime Hours', '0h'],
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const manilaDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    link.setAttribute('download', `analytics-report-${manilaDate.toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle settings actions
  const handleExportSettings = () => {
    setSaveStatus('Exporting...');
    window.dispatchEvent(new CustomEvent('exportSettings'));
    setTimeout(() => {
      setSaveStatus('Exported');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  const handleImportSettings = () => {
    setSaveStatus('Importing...');
    window.dispatchEvent(new CustomEvent('importSettings'));
    setTimeout(() => {
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  const handleSaveSettings = () => {
    setSaveStatus('Saving...');
    window.dispatchEvent(new CustomEvent('saveSettings'));
    setTimeout(() => {
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  // Listen for save status updates from Settings page
  useEffect(() => {
    const handleSettingsSaved = () => {
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    };

    window.addEventListener('settingsSaved', handleSettingsSaved);

    return () => {
      window.removeEventListener('settingsSaved', handleSettingsSaved);
    };
  }, []);

  // Handle refresh for Payroll page
  const handleRefreshPayroll = () => {
    window.dispatchEvent(new CustomEvent('refreshPayrollData'));
  };

  // Handle process payroll
  const handleProcessPayroll = () => {
    window.dispatchEvent(new CustomEvent('openProcessPayrollModal'));
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex-1 lg:ml-0 ml-4">
          <h2 className="text-2xl font-bold text-gray-900">{currentPage}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Current Date Display */}
          <div className="hidden md:flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{currentDate}</span>
          </div>

          {isMyAttendancePage && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user?.first_name} {user?.last_name}</div>
                <div className="text-xs text-gray-500">ID: {user?.employee_id} • {user?.department || 'Operations'}</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <span>Current Month</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('refreshMyAttendance'))}
              className="p-2 text-cyan-600 bg-white border border-cyan-200 rounded-lg hover:bg-cyan-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}

        {isEmployeesPage && (
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export</span>
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Import</span>
            </button>
            <button
              onClick={handleAddEmployee}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Employee</span>
            </button>
          </div>
        )}

        {isAttendancePage && (
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export</span>
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            <button
              onClick={handleAddEntry}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Entry</span>
            </button>
          </div>
        )}

        {isAnalyticsPage && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportAnalytics}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export</span>
            </button>
          </div>
        )}

        {isPayrollPage && (
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Data</span>
            </button>
            <button
              onClick={handleProcessPayroll}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Process Payroll</span>
            </button>
          </div>
        )}

        {isSettingsPage && (
          <div className="flex items-center space-x-3">
            {saveStatus && (
              <span className="text-sm text-gray-600 font-medium">{saveStatus}</span>
            )}
            <button
              onClick={handleExportSettings}
              className="px-4 py-2 bg-white border border-orange-500 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export</span>
            </button>
            <button
              onClick={handleImportSettings}
              className="px-4 py-2 bg-white border border-orange-500 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Import</span>
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save</span>
            </button>
          </div>
        )}
        </div>
      </div>
    </header>
  );
};

export default Header;
