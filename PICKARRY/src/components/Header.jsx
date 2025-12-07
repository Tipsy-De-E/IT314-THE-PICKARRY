import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearUserSession, getUserSession } from '../utils/auth';
import { LogOut, User } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Header = () => {
  const navigate = useNavigate();
  const session = getUserSession();

  const handleLogout = () => {
    clearUserSession();
    navigate('/customer/auth');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* You can add logo or other header elements here */}
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification Dropdown */}
          <NotificationDropdown userType="admin" />

          {/* Admin Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              <User className="w-4 h-4" />
            </div>
            <span className="text-gray-300 text-sm">Admin</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;