import React, { useState } from 'react';
import { Bell, MessageCircle, FileText, Shield, Users, Truck, Info, ChevronRight, Edit, Eye } from 'lucide-react';

// Import components - make sure these are default exports
import SupportComplaints from './Admin-Menu/SupportComplaints';
import AdminTermsConditions from './Admin-Menu/GeneralTermsAndConditions';
import AdminCourierPolicies from './Admin-Menu/AdminCourierPolicies';
import AdminCustomerPolicies from './Admin-Menu/AdminCustomerPolicies';
import AdminAboutPickarry from './Admin-Menu/AdminAboutPickarry';

// Import AboutPickarry component - ensure it's exported correctly
import AboutPickarry from '../customer/Customer-Menu/AboutPickarry';

const Menu = () => {
  const [activeView, setActiveView] = useState('menu');

  const menuItems = [
    {
      icon: FileText,
      title: 'General Terms & Conditions',
      description: 'View platform terms and conditions',
      hasArrow: true,
      color: 'text-purple-400',
      action: () => setActiveView('terms')
    },
    {
      icon: Shield,
      title: 'Courier Policies',
      description: 'Review courier guidelines and policies',
      hasArrow: true,
      color: 'text-teal-400',
      action: () => setActiveView('courier-policies')
    },
    {
      icon: Users,
      title: 'Customer Policies',
      description: 'View customer terms and policies',
      hasArrow: true,
      color: 'text-yellow-400',
      action: () => setActiveView('customer-policies')
    },
    {
      icon: Edit,
      title: 'Edit About Page',
      description: 'Manage team members and page content',
      hasArrow: true,
      color: 'text-indigo-400',
      action: () => setActiveView('edit-about')
    },
    {
      icon: Eye,
      title: 'View About Page',
      description: 'Preview the about page as users see it',
      hasArrow: true,
      color: 'text-blue-400',
      action: () => setActiveView('view-about')
    }
  ];

  // Handle component rendering with fallback
  const renderActiveView = () => {
    try {
      switch (activeView) {
        case 'support':
          return SupportComplaints ? (
            <SupportComplaints onBack={() => setActiveView('menu')} />
          ) : (
            <div>Support component not available</div>
          );

        case 'terms':
          return AdminTermsConditions ? (
            <AdminTermsConditions onBack={() => setActiveView('menu')} />
          ) : (
            <div>Terms component not available</div>
          );

        case 'courier-policies':
          return AdminCourierPolicies ? (
            <AdminCourierPolicies onBack={() => setActiveView('menu')} />
          ) : (
            <div>Courier Policies component not available</div>
          );

        case 'customer-policies':
          return AdminCustomerPolicies ? (
            <AdminCustomerPolicies onBack={() => setActiveView('menu')} />
          ) : (
            <div>Customer Policies component not available</div>
          );

        case 'edit-about':
          return AdminAboutPickarry ? (
            <AdminAboutPickarry onBack={() => setActiveView('menu')} />
          ) : (
            <div>Edit About component not available</div>
          );

        case 'view-about':
          return AboutPickarry ? (
            <AboutPickarry onBack={() => setActiveView('menu')} isAdmin={true} />
          ) : (
            <div>About Pickarry component not available</div>
          );

        default:
          return renderMenu();
      }
    } catch (error) {
      console.error('Error rendering component:', error);
      return (
        <div className="p-6">
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4">
            <h3 className="text-white font-bold mb-2">Component Error</h3>
            <p className="text-gray-300">Unable to load the requested component. Please check the console for details.</p>
            <button
              onClick={() => setActiveView('menu')}
              className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      );
    }
  };

  const renderMenu = () => (
    <div className="space-y-6">
      {/* Admin Profile Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-gray-800 font-bold text-xl">AD</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin</h2>
            <p className="text-gray-400">Administrator Account</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:bg-gray-750 hover:border-teal-500/30 transition-all duration-200 cursor-pointer group"
              onClick={item.action}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-all duration-200">
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
                {item.hasArrow && (
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-all duration-200" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // If we're in the main menu view, render menu
  if (activeView === 'menu') {
    return renderMenu();
  }

  // Otherwise render the active component
  return renderActiveView();
};

export default Menu;