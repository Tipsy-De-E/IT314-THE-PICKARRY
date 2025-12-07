import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Truck, Users, ShoppingCart, Menu, BookOpen, MessageSquare } from 'lucide-react';
import logo from '../assets/images/LOGO.png';

const Sidebar = () => {
  const navItems = [
    { path: '/admin', icon: Home, label: 'Home' },
    { path: '/admin/courier', icon: Truck, label: 'Courier' },
    { path: '/admin/customer', icon: Users, label: 'Customer' },
    { path: '/admin/order', icon: ShoppingCart, label: 'Order' },
    { path: '/admin/fare', icon: BookOpen, label: 'Fare' },
    { path: '/admin/complaints', icon: MessageSquare, label: 'Report' },
    { path: '/admin/menu', icon: Menu, label: 'Menu' },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-center">
          <img src={logo} alt="Pickarry Logo" className="w-19 h-12" />
        </div>
      </div>

      {/* Admin Profile */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-gray-800 font-bold text-sm">AD</span>
          </div>
          <div>
            <p className="text-white font-medium">Admin</p>
            <p className="text-gray-400 text-sm">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Optional */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-500 text-xs text-center">
          © 2025 Pickarry Admin
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
