import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearUserSession, getUserSession } from '../utils/auth';
import { LogOut } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-gray-300 text-sm">
            Welcome back, {session?.userData?.name || 'User'}
          </div>
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