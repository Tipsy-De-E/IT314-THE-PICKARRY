import React, { useState } from 'react';
import { MoreVertical, CreditCard as Edit, Trash2, Eye } from 'lucide-react';

const ActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
          <div className="py-2">
            <button className="flex items-center space-x-3 w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200">
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            <button className="flex items-center space-x-3 w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center space-x-3 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 transition-all duration-200">
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;