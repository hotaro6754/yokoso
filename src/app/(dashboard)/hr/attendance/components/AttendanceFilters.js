// src/app/(dashboard)/hr/attendance/components/AttendanceFilters.js
"use client";
import { Search, Filter, X, Building, Briefcase, ChevronDown } from 'lucide-react';

export default function AttendanceFilters({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  designationFilter = 'all',
  setDesignationFilter = () => {},
  statuses = [],
  departments = [],
  designations = [],
  onClearFilters
}) {
  const hasActiveFilters = statusFilter !== 'all' || departmentFilter !== 'all' || designationFilter !== 'all' || globalFilter;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all text-sm"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="flex flex-col min-w-[160px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-sm appearance-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all text-sm"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Department Filter */}
          <div className="flex flex-col min-w-[180px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Department</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-sm appearance-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Designation Filter */}
          <div className="flex flex-col min-w-[180px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Designation</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-sm appearance-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all text-sm"
              >
                <option value="all">All Designations</option>
                {designations.map(desig => (
                  <option key={desig.id} value={desig.id}>
                    {desig.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex flex-col justify-end">
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors border border-dashed border-gray-300 dark:border-gray-600 rounded-sm hover:border-red-300 dark:hover:border-red-900/50"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}