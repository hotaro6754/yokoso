// src/components/form/date/DateRangePicker.js
"use client";
import { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';

export default function DateRangePicker({ value, onChange, placeholder = "Select date range..." }) {
  const [dateRange, setDateRange] = useState(value || []);

  useEffect(() => {
    setDateRange(value || []);
  }, [value]);

  const handleChange = (dates) => {
    setDateRange(dates);
    onChange(dates);
  };

  return (
    <div className="relative">
      <Flatpickr
        value={dateRange}
        onChange={handleChange}
        options={{
          mode: 'range',
          dateFormat: 'Y-m-d',
          enableTime: false,
          placeholder: placeholder,
          static: true,
        }}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}