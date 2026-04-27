// src/app/(dashboard)/hr/payroll/salary-structure/components/SalaryStructureFilters.js
"use client";
import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import CustomDropdown from '../../../leave/components/CustomDropdown';

const SalaryStructureFilters = ({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  statuses,
  departments,
  onClearFilters
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const hasActiveFilters = statusFilter !== 'all' || 
                          departmentFilter !== 'all' || 
                          globalFilter;

  // Function to get unique values with indexes to ensure unique keys
  const getUniqueOptions = (items) => {
    const uniqueItems = [];
    const seen = new Set();
    
    items.filter(item => item !== 'all').forEach((item, index) => {
      if (!seen.has(item)) {
        seen.add(item);
        uniqueItems.push({ value: item, key: `${item}-${index}` });
      } else {
        // If duplicate, add index to make it unique
        uniqueItems.push({ value: item, key: `${item}-${index}` });
      }
    });
    
    return uniqueItems;
  };

  const uniqueStatuses = getUniqueOptions(statuses);
  const uniqueDepartments = getUniqueOptions(departments);

  return (
    <div className="space-y-4">
      {/* Search Bar - Always visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          placeholder="Search by employee, designation, ID..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Filters Toggle for Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters {hasActiveFilters && '(Active)'}
          </span>
          {isFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Filters Container */}
      <div className={`${isFiltersOpen ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Status</label>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <CustomDropdown
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  ...uniqueStatuses.map(({value}) => ({ value, label: value }))
                ]}
                placeholder="All Status"
                className="flex-1"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Department</label>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <CustomDropdown
                value={departmentFilter}
                onChange={(value) => setDepartmentFilter(value)}
                options={[
                  { value: 'all', label: 'All Departments' },
                  ...uniqueDepartments.map(({value}) => ({ value, label: value }))
                ]}
                placeholder="All Departments"
                className="flex-1"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="w-full px-4 py-2 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 dark:text-gray-400 dark:hover:text-gray-200 disabled:dark:text-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {globalFilter && (
            <span className="inline-flex items-center px-2 py-1 bg-brand-100 text-brand-800 text-xs rounded-full dark:bg-brand-900/30 dark:text-brand-400">
              Search: "{globalFilter}"
              <button onClick={() => setGlobalFilter('')} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-400">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('all')} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {departmentFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full dark:bg-purple-900/30 dark:text-purple-400">
              Department: {departmentFilter}
              <button onClick={() => setDepartmentFilter('all')} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SalaryStructureFilters;