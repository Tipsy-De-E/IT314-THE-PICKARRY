import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Bike, Info, Globe, ChevronRight } from 'lucide-react';
import { clearUserSession } from '../../utils/auth';
import '../../styles/customer-menu.css';

const CustomerMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUserSession();
    navigate('/customer/auth');
  };

  const menuOptions = [
    {
      id: 1,
      icon: Settings,
      title: 'Settings',
      description: 'Manage your account preferences and privacy settings',
      action: () => console.log('Settings clicked')
    },
    {
      id: 2,
      icon: Bell,
      title: 'Notifications',
      description: 'Configure your notification preferences',
      action: () => console.log('Notifications clicked')
    },
    {
      id: 3,
      icon: Bike,
      title: 'Switch to Courier',
      description: 'Become a delivery rider and earn money',
      action: () => console.log('Switch to Courier clicked')
    },
    {
      id: 4,
      icon: Info,
      title: 'About',
      description: 'Learn more about Pickarry and our mission',
      action: () => console.log('About clicked')
    },
    {
      id: 5,
      icon: Globe,
      title: 'Check our Pickarry Website',
      description: 'Visit our official website for more information',
      action: () => window.open('https://pickarry.com', '_blank')
    }
  ];

  return (
    <div className="customer-home">
      {/* Header */}
      <div className="customer-header">
        <div className="header-logo">
          <div className="logo-icon">
            <div className="delivery-person">
              <div className="person-body"></div>
              <div className="person-head"></div>
              <div className="delivery-bag"></div>
            </div>
            <div className="scooter">
              <div className="scooter-body"></div>
              <div className="wheel wheel-front"></div>
              <div className="wheel wheel-back"></div>
            </div>
          </div>
          <span className="brand-name">Pickarry</span>
        </div>
        <div className="header-right">
          <div className="customer-profile">
            <div className="profile-avatar">
              <span>C</span>
            </div>
            <span className="profile-name">Customer</span>
          </div>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="customer-content">
        {/* Sidebar */}
        <div className="customer-sidebar">
          <div className="customer-profile-card">
            <div className="profile-avatar-large">
              <span>C</span>
            </div>
            <div className="profile-info">
              <h3>Customer</h3>
              <p>customer@gmail.com</p>
            </div>
          </div>

          <nav className="customer-nav">
            <button
              onClick={() => navigate('/customer/home')}
              className="nav-item"
            >
              <div className="nav-icon">🏠</div>
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/customer/orders')}
              className="nav-item"
            >
              <div className="nav-icon">🛒</div>
              <span>Order</span>
            </button>
            <button
              onClick={() => navigate('/customer/menu')}
              className="nav-item active"
            >
              <div className="nav-icon">☰</div>
              <span>Menu</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="menu-main-content">
          {/* <div>
            <h1 className="text-3xl font-bold text-white mb-2">Menu</h1>
            <p className="text-gray-400">Settings and information</p>
          </div> */}

          {/* Customer Profile Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-gray-800 font-bold text-xl">C</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Customer</h2>
                <p className="text-gray-400">customer@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:bg-gray-750 hover:border-teal-500/30 transition-all duration-200 cursor-pointer group"
                  onClick={option.action}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-all duration-200">
                        <Icon className="w-6 h-6 text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">{option.title}</h3>
                        <p className="text-gray-400 text-sm">{option.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-all duration-200" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="customer-footer">
        <div className="footer-logo">
          <div className="logo-icon">
            <div className="delivery-person">
              <div className="person-body"></div>
              <div className="person-head"></div>
              <div className="delivery-bag"></div>
            </div>
            <div className="scooter">
              <div className="scooter-body"></div>
              <div className="wheel wheel-front"></div>
              <div className="wheel wheel-back"></div>
            </div>
          </div>
          <span className="brand-name">Pickarry</span>
        </div>

        <div className="footer-links">
          <a href="#" className="footer-link">Contact Us</a>
          <a href="#" className="footer-link">Terms of Use</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Rider's Policy</a>
          <a href="#" className="footer-link">Customer's Policy</a>
        </div>

        <div className="footer-copyright">
          <p>INFERNO Copyright © 2021 Inferno - All rights reserved || Designed By: Mahesh</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerMenu;