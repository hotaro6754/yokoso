// src/app/(dashboard)/hr/payroll/reports/components/ReportFilters.js
"use client";
import { useState, useEffect } from 'react';
import { Calendar, FileText, Users, User } from 'lucide-react';
import { departmentService } from '../../../../../../services/hr-services/departmentService';
import { employeeService } from '../../../../../../services/hr-services/employeeService';
import CustomDropdown from '../../../leave/components/CustomDropdown';

const ReportFilters = ({
  selectedReportType,
  setSelectedReportType,
  dateRange,
  setDateRange
}) => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState({ deps: false, emps: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedReportType === 'department-wise') {
          setLoading(prev => ({ ...prev, deps: true }));
          const response = await departmentService.getAllDepartments();
          setDepartments(response.data || []);
        } else if (selectedReportType === 'employee-wise') {
          setLoading(prev => ({ ...prev, emps: true }));
          const response = await employeeService.getAllEmployees();
          setEmployees(response.data.employees || []);
        }
      } catch (err) {
        console.error('Error fetching filter data:', err);
      } finally {
        setLoading({ deps: false, emps: false });
      }
    };

    fetchData();
  }, [selectedReportType]);

  const reportTypes = [
    { id: 'all', name: 'All Reports' },
    { id: 'payroll-summary', name: 'Payroll Summary' },
    { id: 'tax-report', name: 'Tax Report' },
    { id: 'department-wise', name: 'Department Wise Report' },
    { id: 'employee-wise', name: 'Employee Wise Report' },
    { id: 'bank-transfer', name: 'Bank Transfer Report' },
    { id: 'deductions', name: 'Deductions Report' },
    { id: 'year-end', name: 'Year End Report' }
  ];

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Report Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Report Type
        </label>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <CustomDropdown
            value={selectedReportType}
            onChange={(value) => setSelectedReportType(value)}
            options={reportTypes.map(report => ({ value: report.id, label: report.name }))}
            placeholder="All Reports"
            className="flex-1"
          />
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full pl-3 pr-10 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="relative">
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full pl-3 pr-10 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Filters (conditional based on report type) */}
      {selectedReportType === 'department-wise' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <CustomDropdown
              value=""
              onChange={() => {}}
              options={[
                { value: '', label: loading.deps ? 'Loading...' : 'All Departments' },
                ...departments.map(dep => ({ value: dep.id, label: dep.name }))
              ]}
              placeholder={loading.deps ? 'Loading...' : 'All Departments'}
              className="flex-1"
            />
          </div>
        </div>
      )}

      {selectedReportType === 'employee-wise' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employee
          </label>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <CustomDropdown
              value=""
              onChange={() => {}}
              options={[
                { value: '', label: loading.emps ? 'Loading...' : 'All Employees' },
                ...employees.map(emp => ({ value: emp.id, label: `${emp.firstName} ${emp.lastName} (${emp.employeeId})` }))
              ]}
              placeholder={loading.emps ? 'Loading...' : 'All Employees'}
              className="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;