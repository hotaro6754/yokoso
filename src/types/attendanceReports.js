// src/types/attendanceReports.js
export const REPORT_TYPES = {
  ATTENDANCE_TREND: 'attendance_trend',
  DEPARTMENT_COMPARISON: 'department_comparison',
  EMPLOYEE_SUMMARY: 'employee_summary',
  LATE_ARRIVALS: 'late_arrivals',
  OVERTIME_SUMMARY: 'overtime_summary',
  ABSENTEEISM: 'absenteeism'
};

export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom'
};

export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  TABLE: 'table'
};