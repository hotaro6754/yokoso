// src/app/(dashboard)/hr/attendance/reports/components/ReportRenderer.js
"use client";
import { useEffect, useState } from 'react';
import { REPORT_TYPES, CHART_TYPES } from '@/types/attendanceReports';
import AttendanceTrendChart from './AttendanceTrendChart';
// import DepartmentComparisonChart from './charts/DepartmentComparisonChart';
// import EmployeeSummaryTable from './tables/EmployeeSummaryTable';
// import LateArrivalsReport from './LateArrivalsReport';
// import OvertimeSummary from './OvertimeSummary';
// import AbsenteeismReport from './AbsenteeismReport';

// Mock data functions - replace with actual API calls
const mockAttendanceData = () => {
  const days = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      present: Math.floor(Math.random() * 50) + 150,
      late: Math.floor(Math.random() * 20),
      absent: Math.floor(Math.random() * 15),
      overtime: Math.floor(Math.random() * 25)
    });
  }
  return days;
};

const mockDepartmentData = () => {
  return [
    { department: 'HR', present: 95, late: 12, absent: 5, overtime: 8 },
    { department: 'IT', present: 88, late: 15, absent: 8, overtime: 22 },
    { department: 'Finance', present: 92, late: 8, absent: 3, overtime: 5 },
    { department: 'Marketing', present: 85, late: 18, absent: 10, overtime: 12 },
    { department: 'Sales', present: 78, late: 25, absent: 15, overtime: 18 }
  ];
};

export default function ReportRenderer({ reportType, dateRange, customDateRange, chartType, filters }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      let reportData;

      switch (reportType) {
        case REPORT_TYPES.ATTENDANCE_TREND:
          reportData = mockAttendanceData();
          break;
        case REPORT_TYPES.DEPARTMENT_COMPARISON:
          reportData = mockDepartmentData();
          break;
        case REPORT_TYPES.EMPLOYEE_SUMMARY:
          reportData = []; // Would be employee data
          break;
        case REPORT_TYPES.LATE_ARRIVALS:
          reportData = []; // Would be late arrivals data
          break;
        case REPORT_TYPES.OVERTIME_SUMMARY:
          reportData = []; // Would be overtime data
          break;
        case REPORT_TYPES.ABSENTEEISM:
          reportData = []; // Would be absenteeism data
          break;
        default:
          reportData = [];
      }

      setData(reportData);
      setIsLoading(false);
    }, 1000);
  }, [reportType, dateRange, customDateRange, filters]);

  const renderReport = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      );
    }

    switch (reportType) {
      case REPORT_TYPES.ATTENDANCE_TREND:
        return (
          <AttendanceTrendChart
            data={data}
            chartType={chartType}
            dateRange={dateRange}
            customDateRange={customDateRange}
          />
        );
      case REPORT_TYPES.DEPARTMENT_COMPARISON:
        return (
          // <DepartmentComparisonChart 
          //   data={data} 
          //   chartType={chartType}
          //   filters={filters}
          // />
          <>
          </>
        );
      case REPORT_TYPES.EMPLOYEE_SUMMARY:
        return <EmployeeSummaryTable data={data} filters={filters} />;
      case REPORT_TYPES.LATE_ARRIVALS:
        return <LateArrivalsReport data={data} filters={filters} />;
      case REPORT_TYPES.OVERTIME_SUMMARY:
        return <OvertimeSummary data={data} filters={filters} />;
      case REPORT_TYPES.ABSENTEEISM:
        return <AbsenteeismReport data={data} filters={filters} />;
      default:
        return <div>Select a report type to begin</div>;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
            Print
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold text-white bg-brand-500 rounded-md hover:bg-brand-600 transition-all shadow-sm hover:shadow-md">
            Export CSV
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
            Export PDF
          </button>
        </div>
      </div>

      {renderReport()}
    </div>
  );
}