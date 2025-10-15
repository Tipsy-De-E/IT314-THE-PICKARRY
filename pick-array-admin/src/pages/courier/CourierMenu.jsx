import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, FileText, Shield, Users, Truck, Info, ChevronRight } from 'lucide-react';
import { clearUserSession } from '../../utils/auth';
import '../../styles/courier-menu.css';

const CourierMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const menuOptions = [
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your notification preferences',
      action: () => console.log('Notifications clicked')
    },
    {
      icon: MessageCircle,
      title: 'Support & Complaints',
      description: 'Get help and submit feedback',
      action: () => console.log('Support clicked')
    },
    {
      icon: FileText,
      title: 'Courier Policies',
      description: 'Review courier guidelines and policies',
      action: () => console.log('Policies clicked')
    },
    {
      icon: Shield,
      title: 'Safety Guidelines',
      description: 'Important safety information for riders',
      action: () => console.log('Safety clicked')
    },
    {
      icon: Users,
      title: 'Rider Community',
      description: 'Connect with other riders',
      action: () => console.log('Community clicked')
    },
    {
      icon: Truck,
      title: 'Vehicle Maintenance',
      description: 'Tips for vehicle care and maintenance',
      action: () => console.log('Maintenance clicked')
    },
    {
      icon: Info,
      title: 'About Pickarry',
      description: 'Learn more about our company',
      action: () => console.log('About clicked')
    }
  ];

  return (
    <div className="courier-home">
      {/* Header */}
      <div className="courier-header">
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
          <div className="courier-profile">
            <div className="profile-avatar">
              <span>C</span>
            </div>
            <span className="profile-name">Courier</span>
          </div>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="courier-content">
        {/* Sidebar */}
        <div className="courier-sidebar">
          <div className="courier-profile-card">
            <div className="profile-avatar-large">
              <span>C</span>
            </div>
            <div className="profile-info">
              <h3>Courier</h3>
              <p>courier@gmail.com</p>
            </div>
          </div>

          <nav className="courier-nav">
            <button
              onClick={() => navigate('/courier/home')}
              className="nav-item"
            >
              <div className="nav-icon">🏠</div>
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/courier/history')}
              className="nav-item"
            >
              <div className="nav-icon">📋</div>
              <span>History</span>
            </button>
            <button
              onClick={() => navigate('/courier/book')}
              className="nav-item"
            >
              <div className="nav-icon">📅</div>
              <span>Book</span>
            </button>
            <button
              onClick={() => navigate('/courier/menu')}
              className="nav-item active"
            >
              <div className="nav-icon">☰</div>
              <span>Menu</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="courier-main-content">
          {/* <div>
            <h1 className="text-3xl font-bold text-white mb-2">Menu</h1>
            <p className="text-gray-400">Settings and information</p>
          </div> */}

          {/* Courier Profile Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-gray-800 font-bold text-xl">C</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Courier</h2>
                <p className="text-gray-400">courier@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={index}
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
      <div className="courier-footer">
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

export default CourierMenu;