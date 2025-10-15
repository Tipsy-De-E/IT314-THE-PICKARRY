import React from 'react';
import { Bell, MessageCircle, FileText, Shield, Users, Truck, Info, ChevronRight } from 'lucide-react';

const Menu = () => {
  const menuItems = [
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your notification preferences',
      hasArrow: false,
      color: 'text-blue-400'
    },
    {
      icon: MessageCircle,
      title: 'Support & Complaints',
      description: 'Get help and submit feedback',
      hasArrow: false,
      color: 'text-green-400'
    },
    {
      icon: FileText,
      title: 'General Terms & Conditions',
      description: 'View platform terms and conditions',
      hasArrow: true,
      color: 'text-purple-400'
    },
    {
      icon: Shield,
      title: 'Courier Policies',
      description: 'Review courier guidelines and policies',
      hasArrow: true,
      color: 'text-teal-400'
    },
    {
      icon: Users,
      title: 'Customer Policies',
      description: 'View customer terms and policies',
      hasArrow: true,
      color: 'text-yellow-400'
    },
    {
      icon: Truck,
      title: 'Courier Policies',
      description: 'Additional courier policy information',
      hasArrow: true,
      color: 'text-orange-400'
    },
    {
      icon: Info,
      title: 'About',
      description: 'Learn more about Pickarry',
      hasArrow: true,
      color: 'text-indigo-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Menu</h1>
        <p className="text-gray-400">Settings and information</p>
      </div>

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
};

export default Menu;