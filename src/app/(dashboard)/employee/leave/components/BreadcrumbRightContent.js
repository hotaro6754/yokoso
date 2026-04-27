"use client";

import { Calendar, Download } from "lucide-react";
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
            dateFormat: "M j, Y",
            altInput: true,
            altFormat: "F j, Y",
            allowInput: true,
            clickOpens: true,
            static: true,
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Calendar
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>

      {/* Export Button */}
      <button
        type="button"
        onClick={onExport}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60"
        disabled={!onExport}
      >
        <Download size={18} />
        Export
      </button>
    </div>
  );
};

export default BreadcrumbRightContent;
