// src\app\(dashboard)\hr\employees\components\EmployeeFilters.js
"use client";
import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Download } from 'lucide-react';

const EmployeeFilters = ({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  designationFilter,
  setDesignationFilter,
  departmentFilter,
  setDepartmentFilter,
  statuses,
  designations,
  departments,
  onClearFilters,
  onExport
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (onExport) {
      setIsExporting(true);
      try {
        await onExport();
      } finally {
        setIsExporting(false);
      }
    }
  };

  const hasActiveFilters = statusFilter !== 'all' ||
    designationFilter !== 'all' ||
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

  // Status options mapping for display
  const statusDisplayMap = {
    'ACTIVE': 'Active',
    'PROBATION': 'Probation',
    'NOTICE_PERIOD': 'Notice Period',
    'RESIGNED': 'Resigned',
    'TERMINATED': 'Terminated',
    'SUSPENDED': 'Suspended',
    'RETIRED': 'Retired'
  };

  const uniqueStatuses = getUniqueOptions(statuses || []);
  const uniqueDesignations = getUniqueOptions(designations || []);
  const uniqueDepartments = getUniqueOptions(departments || []);

  return (
    <div className="space-y-4">
      {/* Search Bar - Always visible */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            placeholder="Search employees by name, email, ID..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-sm 
                       focus:ring-2 focus:ring-brand-500 focus:border-brand-500 
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
          />
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-white bg-black hover:bg-gray-800 rounded-sm transition-colors disabled:opacity-50 uppercase tracking-wider shadow-sm border border-black"
        >
          <Download className="w-3.5 h-3.5" />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>

      {/* Filters Toggle for Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-sm"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-sm">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-sm 
                           focus:ring-2 focus:ring-brand-500 focus:border-brand-500 
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none transition-colors"
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map(({ value, key }) => (
                  <option key={key} value={value}>{statusDisplayMap[value] || value}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Department Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Department</label>
            <div className="relative">
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-sm 
                           focus:ring-2 focus:ring-brand-500 focus:border-brand-500 
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none transition-colors"
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map(({ value, key }) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Designation Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Designation</label>
            <div className="relative">
              <select
                value={designationFilter}
                onChange={e => setDesignationFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-sm 
                           focus:ring-2 focus:ring-brand-500 focus:border-brand-500 
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none transition-colors"
              >
                <option value="all">All Designations</option>
                {uniqueDesignations.map(({ value, key }) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="w-full px-4 py-2 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 dark:text-gray-400 dark:hover:text-gray-200 disabled:dark:text-gray-600 disabled:cursor-not-allowed bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
            <span className="inline-flex items-center px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-full 
                           dark:bg-brand-500/20 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30">
              Search: "{globalFilter}"
              <button onClick={() => setGlobalFilter('')} className="ml-1.5 hover:text-brand-900 dark:hover:text-brand-300">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full 
                           dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              Status: {statusDisplayMap[statusFilter] || statusFilter}
              <button onClick={() => setStatusFilter('all')} className="ml-1.5 hover:text-emerald-900 dark:hover:text-emerald-300">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {designationFilter !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-1 bg-violet-50 text-violet-700 text-xs rounded-full 
                           dark:bg-violet-500/20 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30">
              Designation: {designationFilter}
              <button onClick={() => setDesignationFilter('all')} className="ml-1.5 hover:text-violet-900 dark:hover:text-violet-300">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {departmentFilter !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-1 bg-accent-50 text-accent-700 text-xs rounded-full 
                           dark:bg-accent-500/20 dark:text-accent-400 border border-accent-200 dark:border-accent-500/30">
              Department: {departmentFilter}
              <button onClick={() => setDepartmentFilter('all')} className="ml-1.5 hover:text-accent-900 dark:hover:text-accent-300">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeFilters;