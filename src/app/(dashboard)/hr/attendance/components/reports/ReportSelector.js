// src/app/(dashboard)/hr/attendance/reports/components/ReportSelector.js
"use client";
import { REPORT_TYPES } from '@/types/attendanceReports';

const reportOptions = [
  {
    id: REPORT_TYPES.ATTENDANCE_TREND,
    name: 'Attendance Trends',
    description: 'Analyze attendance patterns over time',
    icon: '📈'
  },
  {
    id: REPORT_TYPES.DEPARTMENT_COMPARISON,
    name: 'Department Comparison',
    description: 'Compare attendance across departments',
    icon: '🏢'
  },
  {
    id: REPORT_TYPES.EMPLOYEE_SUMMARY,
    name: 'Employee Summary',
    description: 'Detailed attendance report by employee',
    icon: '👤'
  },
  {
    id: REPORT_TYPES.LATE_ARRIVALS,
    name: 'Late Arrivals',
    description: 'Identify patterns in late arrivals',
    icon: '⏰'
  },
  {
    id: REPORT_TYPES.OVERTIME_SUMMARY,
    name: 'Overtime Summary',
    description: 'Analyze overtime trends and patterns',
    icon: '💼'
  },
  {
    id: REPORT_TYPES.ABSENTEEISM,
    name: 'Absenteeism Report',
    description: 'Track and analyze absenteeism patterns',
    icon: '❌'
  }
];

export default function ReportSelector({ selectedReport, onReportChange }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Select Report Type
      </h3>
      <div className="space-y-2">
        {reportOptions.map((report) => (
          <div
            key={report.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedReport === report.id
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
            onClick={() => onReportChange(report.id)}
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{report.icon}</span>
              <div>
                <h4 className={`font-medium ${
                  selectedReport === report.id 
                    ? 'text-brand-700 dark:text-brand-300' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {report.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {report.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}