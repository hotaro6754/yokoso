"use client";
import { useState, useEffect } from 'react';
import { Calendar, Users, Filter, Loader2, User } from 'lucide-react';
import { departmentService } from '@/services/hr-services/departmentService';
import { employeeService } from '@/services/hr-services/employeeService';
import CustomDropdown from '../../components/CustomDropdown';

const ReportFilters = ({ filters, onFilterChange }) => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptRes, empRes] = await Promise.all([
          departmentService.getAllDepartments(),
          employeeService.getAllEmployees()
        ]);
        setDepartments(deptRes.data || []);
        setEmployees(empRes.data || []);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dateRangeOptions = [
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  // Filter employees based on selected department if any
  const filteredEmployees = filters.department !== 'all'
    ? employees.filter(emp => emp.department?.id === filters.department || emp.departmentId === filters.department)
    : employees;

  // Convert departments to options format
  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    ...departments.map(dept => ({
      value: dept.id,
      label: dept.name
    }))
  ];

  // Convert employees to options format
  const employeeOptions = [
    { value: 'all', label: 'All Employees' },
    ...filteredEmployees.map(emp => ({
      value: emp.id,
      label: `${emp.firstName} ${emp.lastName}`
    }))
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <CustomDropdown
              value={filters.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              options={dateRangeOptions}
              placeholder="Select date range"
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <CustomDropdown
              value={filters.department}
              onChange={(value) => handleFilterChange('department', value)}
              options={departmentOptions}
              placeholder="All Departments"
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employee
          </label>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <CustomDropdown
              value={filters.employee}
              onChange={(value) => handleFilterChange('employee', value)}
              options={employeeOptions}
              placeholder="All Employees"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <button
          onClick={() => onFilterChange({
            dateRange: 'this_month',
            department: 'all',
            employee: 'all'
          })}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Reset Filters
        </button>
        <button
          onClick={() => console.log('Filters applied')}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default ReportFilters;
