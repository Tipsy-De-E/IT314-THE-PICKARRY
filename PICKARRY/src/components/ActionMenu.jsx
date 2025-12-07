import React from 'react';
import { Eye } from 'lucide-react';

const ActionMenu = () => {
  return (
    <button className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-200">
      <Eye className="w-4 h-4" />
      <span>View</span>
    </button>
  );
};

export default ActionMenu;