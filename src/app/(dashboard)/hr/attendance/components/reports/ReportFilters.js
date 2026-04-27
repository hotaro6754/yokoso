// src/app/(dashboard)/hr/attendance/reports/components/ReportFilters.js
"use client";

import { useState } from "react";
import { DATE_RANGES, CHART_TYPES } from "@/types/attendanceReports";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";

export default function ReportFilters({
  dateRange,
  onDateRangeChange,
  customDateRange,
  onCustomDateRangeChange,
  chartType,
  onChartTypeChange,
  filters,
  onFiltersChange,
}) {
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(
    dateRange === DATE_RANGES.CUSTOM
  );

  const dateRangeOptions = [
    { value: DATE_RANGES.TODAY, label: "Today" },
    { value: DATE_RANGES.YESTERDAY, label: "Yesterday" },
    { value: DATE_RANGES.THIS_WEEK, label: "This Week" },
    { value: DATE_RANGES.LAST_WEEK, label: "Last Week" },
    { value: DATE_RANGES.THIS_MONTH, label: "This Month" },
    { value: DATE_RANGES.LAST_MONTH, label: "Last Month" },
    { value: DATE_RANGES.CUSTOM, label: "Custom Range" },
  ];

  const chartTypeOptions = [
    { value: CHART_TYPES.BAR, label: "Bar Chart" },
    { value: CHART_TYPES.LINE, label: "Line Chart" },
    { value: CHART_TYPES.PIE, label: "Pie Chart" },
    { value: CHART_TYPES.TABLE, label: "Data Table" },
  ];

  // Mock departments
  const departments = [
    { id: "1", name: "Human Resources" },
    { id: "2", name: "Information Technology" },
    { id: "3", name: "Finance" },
    { id: "4", name: "Marketing" },
    { id: "5", name: "Sales" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Report Filters
        </h3>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => {
              const value = e.target.value;
              onDateRangeChange(value);
              setIsCustomDateOpen(value === DATE_RANGES.CUSTOM);
            }}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Chart Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chart Type
          </label>
          <select
            value={chartType}
            onChange={(e) => onChartTypeChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {chartTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {isCustomDateOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <Flatpickr
              value={customDateRange.startDate}
              onChange={([date]) =>
                onCustomDateRangeChange({
                  ...customDateRange,
                  startDate: date,
                })
              }
              options={{ dateFormat: "Y-m-d" }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <Flatpickr
              value={customDateRange.endDate}
              onChange={([date]) =>
                onCustomDateRangeChange({
                  ...customDateRange,
                  endDate: date,
                })
              }
              options={{ dateFormat: "Y-m-d" }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Department Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Departments
        </label>
        <select
          multiple
          value={filters.departments}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              departments: Array.from(
                e.target.selectedOptions,
                (option) => option.value
              ),
            })
          }
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-36"
        >
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Hold Ctrl / Cmd to select multiple departments
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => {
            onDateRangeChange(DATE_RANGES.THIS_MONTH);
            onChartTypeChange(CHART_TYPES.BAR);
            onFiltersChange({
              departments: [],
              employees: [],
              locations: [],
            });
            setIsCustomDateOpen(false);
          }}
          className="w-full sm:w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-md transition dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          Reset Filters
        </button>

        <button
          className="w-full sm:w-1/2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-md transition-all shadow-sm hover:shadow-md"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
}
