// src/app/(dashboard)/hr/attendance/reports/page.js
"use client";
import { useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ReportSelector from '../components/reports/ReportSelector';
import ReportRenderer from '../components/reports/ReportRenderer';
import ReportFilters from '../components/reports/ReportFilters';
import { REPORT_TYPES, DATE_RANGES, CHART_TYPES } from '@/types/attendanceReports';

export default function AdvancedReports() {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES.ATTENDANCE_TREND);
  const [dateRange, setDateRange] = useState(DATE_RANGES.THIS_MONTH);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });
  const [chartType, setChartType] = useState(CHART_TYPES.BAR);
  const [filters, setFilters] = useState({
    departments: [],
    employees: [],
    locations: []
  });

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        title="Advanced Reports"
        subtitle="Generate detailed attendance analytics and insights"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-4 sm:p-6 sticky top-6">
            <ReportSelector
              selectedReport={selectedReport}
              onReportChange={setSelectedReport}
            />

            <div className="mt-6">
              <ReportFilters
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                customDateRange={customDateRange}
                onCustomDateRangeChange={setCustomDateRange}
                chartType={chartType}
                onChartTypeChange={setChartType}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-4 sm:p-6">
            <ReportRenderer
              reportType={selectedReport}
              dateRange={dateRange}
              customDateRange={customDateRange}
              chartType={chartType}
              filters={filters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}