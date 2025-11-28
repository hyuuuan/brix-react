/**
 * Header Component
 * Top navigation bar
 */

import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Map routes to page titles
  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/employees': 'Employees',
    '/attendance': 'Attendance',
    '/payroll': 'Payroll',
    '/settings': 'Settings',
  };

  const currentPage = pageTitles[location.pathname] || 'Dashboard';

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
      </div>
    </header>
  );
};

export default Header;
