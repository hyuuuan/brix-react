/**
 * Security Page
 * Security settings and password management
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api';

const Security = () => {
  const { user, updateUser } = useAuth();
  
  // Username change state
  const [usernameForm, setUsernameForm] = useState({
    newUsername: '',
    confirmPassword: '',
  });
  const [usernameLoading, setUsernameLoading] = useState(false);
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Success modal state
  const [successModal, setSuccessModal] = useState({
    show: false,
    title: '',
    message: '',
  });

  // Error modal state
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: '',
    message: '',
  });

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    
    if (usernameForm.newUsername.length < 3) {
      setErrorModal({
        show: true,
        title: 'Invalid Username',
        message: 'Username must be at least 3 characters long',
      });
      return;
    }
    
    if (!usernameForm.confirmPassword) {
      setErrorModal({
        show: true,
        title: 'Password Required',
        message: 'Please enter your password to confirm',
      });
      return;
    }

    setUsernameLoading(true);
    try {
      const response = await authApi.changeUsername(
        usernameForm.newUsername,
        usernameForm.confirmPassword
      );
      
      if (response.success) {
        // Update user context with new username
        updateUser({ ...user, username: response.data.username });
        setUsernameForm({ newUsername: '', confirmPassword: '' });
        
        // Show success modal
        setSuccessModal({
          show: true,
          title: 'Username Changed',
          message: 'Your username has been successfully updated.',
        });
      } else {
        setErrorModal({
          show: true,
          title: 'Error',
          message: response.message || 'Failed to change username',
        });
      }
    } catch (error) {
      setErrorModal({
        show: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to change username',
      });
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword.length < 6) {
      setErrorModal({
        show: true,
        title: 'Invalid Password',
        message: 'Password must be at least 6 characters long',
      });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setErrorModal({
        show: true,
        title: 'Password Mismatch',
        message: 'New passwords do not match',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      if (response.success) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        
        // Show success modal
        setSuccessModal({
          show: true,
          title: 'Password Changed',
          message: 'Your password has been successfully updated.',
        });
      } else {
        setErrorModal({
          show: true,
          title: 'Error',
          message: response.message || 'Failed to change password',
        });
      }
    } catch (error) {
      setErrorModal({
        show: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Never</p>
              <p className="text-xs text-gray-600">Last Password Change</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">7/19/2025</p>
              <p className="text-xs text-gray-600">Account Created</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-xs text-gray-600">Login Attempts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Username and Password Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Change Username */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Change Username</h3>
            </div>
          </div>

          <form onSubmit={handleUsernameChange} className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Username</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Username</label>
              <input
                type="text"
                value={usernameForm.newUsername}
                onChange={(e) => setUsernameForm({ ...usernameForm, newUsername: e.target.value })}
                placeholder="Enter new username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Username must be at least 3 characters long</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={usernameForm.confirmPassword}
                onChange={(e) => setUsernameForm({ ...usernameForm, confirmPassword: e.target.value })}
                placeholder="Enter your current password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={usernameLoading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {usernameLoading ? 'Updating...' : 'Update Username'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900">Security Tips</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Use a strong, unique password</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Change your password regularly</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Don't share your login credentials</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Log out when using shared computers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModal.show && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {successModal.title}
            </h3>

            <p className="text-sm text-gray-600 text-center mb-6">
              {successModal.message}
            </p>

            <button
              onClick={() => setSuccessModal({ show: false, title: '', message: '' })}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal.show && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {errorModal.title}
            </h3>

            <p className="text-sm text-gray-600 text-center mb-6">
              {errorModal.message}
            </p>

            <button
              onClick={() => setErrorModal({ show: false, title: '', message: '' })}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
