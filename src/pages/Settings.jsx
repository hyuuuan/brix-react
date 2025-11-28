/**
 * Settings Page
 * System configuration and preferences
 */

import { useState, useEffect } from 'react';
import { settingsApi, employeesApi } from '../api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    deleted: 0
  });
  const [userSettings, setUserSettings] = useState({
    defaultRole: 'employee',
    defaultHourlyRate: 500,
    requireEmailVerification: false,
    autoGeneratePasswords: true
  });
  const [accountPolicies, setAccountPolicies] = useState({
    lockoutAttempts: 5,
    lockoutDuration: 30,
    autoDeactivate: false,
    inactiveThreshold: 90
  });
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    workingHoursStart: '',
    workingHoursEnd: '',
    timezone: '',
    dateFormat: '',
    timeFormat: '',
    currency: '',
    language: '',
    emailNotifications: false,
    autoBackup: false,
    twoFactorAuth: false,
    payPeriod: '',
    payday: '',
    overtimeRate: '',
    overtimeThreshold: '',
    roundingRules: '',
    autoCalculate: false,
    autoApproveRegular: false,
    requireOvertimeApproval: false,
    cutoffTime: '',
    lateThreshold: '',
    breakDuration: '',
    attendanceAlerts: false,
    payrollReminders: false,
    systemUpdates: false,
    sessionTimeout: '',
    passwordExpiry: '',
    maxLoginAttempts: '',
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await employeesApi.getEmployees({ status: 'all' });
      if (response.success) {
        const employees = response.data.employees;
        const stats = {
          total: employees.length,
          active: employees.filter(e => e.status === 'active').length,
          inactive: employees.filter(e => e.status === 'inactive').length,
          admins: employees.filter(e => e.role === 'admin').length,
          deleted: employees.filter(e => e.status === 'inactive').length // Using inactive as "deleted"
        };
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchDeletedEmployees = async () => {
    try {
      const response = await employeesApi.getEmployees({ status: 'inactive' });
      if (response.success) {
        setDeletedEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching deleted employees:', error);
    }
  };

  const handleViewDeletedEmployees = () => {
    setShowDeletedModal(true);
    fetchDeletedEmployees();
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleRecoverEmployee = async (employeeId) => {
    try {
      await employeesApi.updateEmployee(employeeId, { status: 'active' });
      // Refresh the lists
      await fetchDeletedEmployees();
      await fetchUserStats();
      // Remove from selected if it was selected
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    } catch (error) {
      console.error('Error recovering employee:', error);
      alert('Failed to recover employee. Please try again.');
    }
  };

  const handleRecoverSelected = async () => {
    try {
      await Promise.all(
        selectedEmployees.map(id => employeesApi.updateEmployee(id, { status: 'active' }))
      );
      // Refresh the lists
      await fetchDeletedEmployees();
      await fetchUserStats();
      setSelectedEmployees([]);
    } catch (error) {
      console.error('Error recovering selected employees:', error);
      alert('Failed to recover some employees. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getSettings();
      if (response.success) {
        setFormData({
          companyName: response.data.companyName || '',
          companyAddress: response.data.companyAddress || '',
          companyPhone: response.data.companyPhone || '',
          workingHoursStart: response.data.workingHoursStart || '09:00',
          workingHoursEnd: response.data.workingHoursEnd || '17:00',
          timezone: response.data.timezone || 'UTC-8 (Pacific Time)',
          dateFormat: response.data.dateFormat || 'MM/DD/YYYY',
          timeFormat: response.data.timeFormat || '12 Hour',
          currency: response.data.currency || 'USD ($)',
          language: response.data.language || 'English',
          emailNotifications: response.data.emailNotifications || false,
          autoBackup: response.data.autoBackup || false,
          twoFactorAuth: response.data.twoFactorAuth || false,
          payPeriod: response.data.payPeriod || 'monthly',
          payday: response.data.payday || 'friday',
          overtimeRate: response.data.overtimeRate || '1.5',
          overtimeThreshold: response.data.overtimeThreshold || '40',
          roundingRules: response.data.roundingRules || 'nearest_quarter',
          autoCalculate: response.data.autoCalculate || false,
          autoApproveRegular: response.data.autoApproveRegular || false,
          requireOvertimeApproval: response.data.requireOvertimeApproval || false,
          cutoffTime: response.data.cutoffTime || '23:59',
          lateThreshold: response.data.lateThreshold || '15',
          breakDuration: response.data.breakDuration || '60',
          attendanceAlerts: response.data.attendanceAlerts || false,
          payrollReminders: response.data.payrollReminders || false,
          systemUpdates: response.data.systemUpdates || false,
          sessionTimeout: response.data.sessionTimeout || '30',
          passwordExpiry: response.data.passwordExpiry || '90',
          maxLoginAttempts: response.data.maxLoginAttempts || '5',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    try {
      const response = await settingsApi.updateSettings(formData);
      if (response.success) {
        window.dispatchEvent(new CustomEvent('settingsSaved'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Listen for header button events
  useEffect(() => {
    const handleExport = () => {
      const dataStr = JSON.stringify(formData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const handleImport = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const importedData = JSON.parse(event.target.result);
              setFormData(importedData);
              await settingsApi.updateSettings(importedData);
              window.dispatchEvent(new CustomEvent('settingsSaved'));
            } catch (error) {
              console.error('Error importing settings:', error);
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    };

    const handleSave = () => {
      saveSettings();
    };

    window.addEventListener('exportSettings', handleExport);
    window.addEventListener('importSettings', handleImport);
    window.addEventListener('saveSettings', handleSave);

    return () => {
      window.removeEventListener('exportSettings', handleExport);
      window.removeEventListener('importSettings', handleImport);
      window.removeEventListener('saveSettings', handleSave);
    };
  }, [formData]);

  const tabs = [
    { id: 'general', name: 'General', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'payroll', name: 'Payroll', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'attendance', name: 'Attendance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'notifications', name: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
    { id: 'security', name: 'Security', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { id: 'users', name: 'Users', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { id: 'link', name: 'Link', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-100 rounded-xl p-1 mb-6">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Company Information</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="Enter company name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.companyPhone}
                          onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                          placeholder="(555) 123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                          value={formData.companyAddress}
                          onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                          placeholder="Enter company address"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours Start</label>
                        <input
                          type="time"
                          value={formData.workingHoursStart}
                          onChange={(e) => handleInputChange('workingHoursStart', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours End</label>
                        <input
                          type="time"
                          value={formData.workingHoursEnd}
                          onChange={(e) => handleInputChange('workingHoursEnd', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Regional Settings</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          value={formData.timezone}
                          onChange={(e) => handleInputChange('timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option>UTC-8 (Pacific Time)</option>
                          <option>UTC-7 (Mountain Time)</option>
                          <option>UTC-6 (Central Time)</option>
                          <option>UTC-5 (Eastern Time)</option>
                          <option>Asia/Manila (Philippine Time)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                        <select
                          value={formData.dateFormat}
                          onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                        <select
                          value={formData.timeFormat}
                          onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option>12 Hour</option>
                          <option>24 Hour</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select
                          value={formData.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                          <option>JPY (¥)</option>
                          <option>PHP (₱)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={formData.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Tagalog</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">System Preferences</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive email alerts for important events</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.emailNotifications}
                          onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">Auto-backup</p>
                        <p className="text-sm text-gray-600">Automatically backup data daily</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.autoBackup}
                          onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Require 2FA for all users</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.twoFactorAuth}
                          onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payroll' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pay Period Configuration */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Pay Period Configuration</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period</label>
                      <select
                        value={formData.payPeriod}
                        onChange={(e) => handleInputChange('payPeriod', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-Weekly</option>
                        <option value="semimonthly">Semi-Monthly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payday</label>
                      <select
                        value={formData.payday}
                        onChange={(e) => handleInputChange('payday', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Overtime Configuration */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Overtime Configuration</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Rate Multiplier</label>
                      <input
                        type="number"
                        value={formData.overtimeRate}
                        onChange={(e) => handleInputChange('overtimeRate', e.target.value)}
                        step="0.1"
                        placeholder="2.2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">Standard rate multiplier for overtime hours</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Threshold (hours/week)</label>
                      <input
                        type="number"
                        value={formData.overtimeThreshold}
                        onChange={(e) => handleInputChange('overtimeThreshold', e.target.value)}
                        placeholder="40"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">Hours per week before overtime applies</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Rounding Rules</label>
                      <select
                        value={formData.roundingRules}
                        onChange={(e) => handleInputChange('roundingRules', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="none">No Rounding</option>
                        <option value="nearest_5">Nearest 5 Minutes</option>
                        <option value="nearest_quarter">Nearest 15 Minutes</option>
                        <option value="nearest_half">Nearest 30 Minutes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payroll Automation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Payroll Automation</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.autoCalculate}
                        onChange={(e) => handleInputChange('autoCalculate', e.target.checked)}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="font-medium text-gray-900">Auto-calculate payroll</label>
                        <p className="text-sm text-gray-600">Automatically calculate payroll at end of pay period</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.autoApproveRegular}
                        onChange={(e) => handleInputChange('autoApproveRegular', e.target.checked)}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="font-medium text-gray-900">Auto-approve regular hours</label>
                        <p className="text-sm text-gray-600">Automatically approve regular time entries</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.requireOvertimeApproval}
                        onChange={(e) => handleInputChange('requireOvertimeApproval', e.target.checked)}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="font-medium text-gray-900">Require overtime approval</label>
                        <p className="text-sm text-gray-600">Overtime hours must be approved before payroll</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payroll Cutoff Time</label>
                      <input
                        type="time"
                        value={formData.cutoffTime}
                        onChange={(e) => handleInputChange('cutoffTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">Time entries after this time go to next pay period</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">Attendance Settings</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Late Threshold (minutes)</label>
                      <input
                        type="number"
                        value={formData.lateThreshold}
                        onChange={(e) => handleInputChange('lateThreshold', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Break Duration (minutes)</label>
                      <input
                        type="number"
                        value={formData.breakDuration}
                        onChange={(e) => handleInputChange('breakDuration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">Attendance Alerts</p>
                        <p className="text-sm text-gray-600">Get notified when employees clock in/out</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.attendanceAlerts}
                          onChange={(e) => handleInputChange('attendanceAlerts', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">Payroll Reminders</p>
                        <p className="text-sm text-gray-600">Remind about upcoming payroll processing</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.payrollReminders}
                          onChange={(e) => handleInputChange('payrollReminders', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900">System Updates</p>
                        <p className="text-sm text-gray-600">Notifications about system maintenance</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.systemUpdates}
                          onChange={(e) => handleInputChange('systemUpdates', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={formData.sessionTimeout}
                        onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                        className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                      <input
                        type="number"
                        value={formData.passwordExpiry}
                        onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                        className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        value={formData.maxLoginAttempts}
                        onChange={(e) => handleInputChange('maxLoginAttempts', e.target.value)}
                        className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">User Management</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-6">Manage employee accounts, roles, and permissions through the dedicated user management interface.</p>
                    
                    <div className="space-y-3 mb-6">
                      <button
                        onClick={() => window.location.href = '/employees'}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Add New Employee
                      </button>
                      <button
                        onClick={() => window.location.href = '/employees'}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Manage All Users
                      </button>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <button className="w-full px-3 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                          Export Users
                        </button>
                        <button className="w-full px-3 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                          Import Users
                        </button>
                        <button className="w-full px-3 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                          Bulk Password Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Statistics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">User Statistics</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600">{userStats.total}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Employees</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600">{userStats.active}</div>
                        <div className="text-sm text-gray-600 mt-1">Active Employees</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600">{userStats.inactive}</div>
                        <div className="text-sm text-gray-600 mt-1">Inactive Employees</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600">{userStats.admins}</div>
                        <div className="text-sm text-gray-600 mt-1">Administrators</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Default User Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Default User Settings</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Role for New Users</label>
                      <select
                        value={userSettings.defaultRole}
                        onChange={(e) => setUserSettings({ ...userSettings, defaultRole: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Hourly Rate (₱)</label>
                      <input
                        type="number"
                        value={userSettings.defaultHourlyRate}
                        onChange={(e) => setUserSettings({ ...userSettings, defaultHourlyRate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex items-start pt-2">
                      <input
                        type="checkbox"
                        checked={userSettings.requireEmailVerification}
                        onChange={(e) => setUserSettings({ ...userSettings, requireEmailVerification: e.target.checked })}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="font-medium text-gray-900">Require email verification for new accounts</label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={userSettings.autoGeneratePasswords}
                        onChange={(e) => setUserSettings({ ...userSettings, autoGeneratePasswords: e.target.checked })}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="font-medium text-gray-900">Auto-generate secure passwords</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Policies */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Account Policies</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Lockout After (failed attempts)</label>
                      <input
                        type="number"
                        value={accountPolicies.lockoutAttempts}
                        onChange={(e) => setAccountPolicies({ ...accountPolicies, lockoutAttempts: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lockout Duration (minutes)</label>
                      <input
                        type="number"
                        value={accountPolicies.lockoutDuration}
                        onChange={(e) => setAccountPolicies({ ...accountPolicies, lockoutDuration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex items-start pt-2">
                      <input
                        type="checkbox"
                        checked={accountPolicies.autoDeactivate}
                        onChange={(e) => setAccountPolicies({ ...accountPolicies, autoDeactivate: e.target.checked })}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="font-medium text-gray-900">Auto-deactivate inactive accounts</label>
                      </div>
                    </div>
                    {accountPolicies.autoDeactivate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Inactive Threshold (days)</label>
                        <input
                          type="number"
                          value={accountPolicies.inactiveThreshold}
                          onChange={(e) => setAccountPolicies({ ...accountPolicies, inactiveThreshold: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Data Recovery */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
                  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Data Recovery</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-6">Recover deleted employee accounts and restore them to active status.</p>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">{userStats.deleted}</div>
                        <div className="text-sm text-gray-600 mt-1">Inactive Employees</div>
                      </div>
                      <button
                        onClick={handleViewDeletedEmployees}
                        className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                      >
                        View Inactive Employees ({userStats.deleted})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'link' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">Integration Links</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">Configure external integrations and API connections</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Deleted Employees Recovery Modal */}
      {showDeletedModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Deleted Employees Recovery</h2>
              <button
                onClick={() => {
                  setShowDeletedModal(false);
                  setSelectedEmployees([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 mb-6">
                Below are employees that have been deleted from the system. You can recover them to restore their access and data.
              </p>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Employee</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Employee ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date Deleted</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">
                          No deleted employees found
                        </td>
                      </tr>
                    ) : (
                      deletedEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            {employee.employee_id}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{employee.employee_id}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{employee.department || 'N/A'}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{formatDate(employee.updated_at)}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedEmployees.includes(employee.id)}
                                  onChange={() => handleSelectEmployee(employee.id)}
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                Select
                              </label>
                              <button
                                onClick={() => handleRecoverEmployee(employee.id)}
                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Recover
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => {
                  setShowDeletedModal(false);
                  setSelectedEmployees([]);
                }}
                className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRecoverSelected}
                disabled={selectedEmployees.length === 0}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedEmployees.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recover Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
