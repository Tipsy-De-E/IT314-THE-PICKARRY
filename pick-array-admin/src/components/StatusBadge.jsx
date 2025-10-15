import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-400';
      case 'Delivered':
        return 'text-green-400';
      case 'Inactive':
        return 'text-red-400';
      case 'Canceled':
        return 'text-red-400';
      case 'Pending':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;