// src/app/(dashboard)/employee/attendance/components/BreadcrumbRightContent.js
"use client";
import { Calendar, Download } from "lucide-react";
import { useState } from "react";
import Flatpickr from "react-flatpickr";

const BreadcrumbRightContent = ({ selectedDate, setSelectedDate, onExport }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
      {/* Date Picker */}
      <div className="relative w-full sm:w-auto">
        <Flatpickr
          value={selectedDate}
          onChange={(date) => setSelectedDate(date[0])}
          options={{
            dateFormat: "d-m-Y",
            altInput: true,
            altFormat: "d-m-Y",
            allowInput: true,
            clickOpens: true,
            static: true,
          }}
          className="w-full pl-10 pr-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl 
                     bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 
                     dark:focus:border-primary-500 transition-all duration-200 text-sm"
        />
        <Calendar
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500"
          size={18}
        />
      </div>

      {/* Export Button */}
      {onExport && (
        <button
          onClick={onExport}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-sm hover:shadow-md transition-all duration-200 font-medium text-sm">
          <Download size={16} />
          Export
        </button>
      )}
    </div>
  );
};

export default BreadcrumbRightContent;
