import React from 'react';
import { Search, Filter } from 'lucide-react';

const SearchFilter = ({
  searchValue,
  onSearchChange,
  showCategoryFilter = false
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
        />
      </div>
      
      <div className="flex items-center space-x-4 ml-4">
        {showCategoryFilter && (
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:text-white transition-all duration-200">
            <span>Category</span>
            <Filter className="w-4 h-4" />
          </button>
        )}
        <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:text-white transition-all duration-200">
          <span>Filter</span>
          <Filter className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;