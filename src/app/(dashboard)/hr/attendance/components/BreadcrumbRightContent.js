// src/components/attendance/BreadcrumbRightContent.js
"use client";
import { Calendar, Filter, Download, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Flatpickr from "react-flatpickr";

const BreadcrumbRightContent = ({ selectedDate, setSelectedDate }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-auto">
        <Flatpickr
          value={selectedDate}
          onChange={(date) => setSelectedDate(date[0])}
          options={{
            dateFormat: "M j, Y",
            altInput: true,
            altFormat: "F j, Y",
            allowInput: true,
            clickOpens: true,
            static: true
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>
      
      <div className="relative w-full sm:w-auto">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full inline-flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <Filter size={18} />
          Filters
          <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isFilterOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 p-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Filter</div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Present</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Late</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Absent</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Half Day</span>
              </label>
            </div>
            <button className="w-full mt-3 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        )}
      </div>
      
      <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <Download size={18} />
        Export
      </button>
    </div>
  );
};

export default BreadcrumbRightContent;