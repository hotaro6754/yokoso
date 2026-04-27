"use client";
import { Search, X, Calendar, User, Clock } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

export default function LeaveRequestsFilters({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  leaveTypeFilter,
  setLeaveTypeFilter,
  dateRangeFilter,
  setDateRangeFilter,
  statuses,
  leaveTypes,
  onClearFilters
}) {
  const hasActiveFilters = statusFilter !== 'all' || leaveTypeFilter !== 'all' || dateRangeFilter !== 'all' || globalFilter;

  // Convert statuses to options format
  const statusOptions = statuses.map(status => ({
    value: status,
    label: status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)
  }));

  // Convert leave types to options format
  const leaveTypeOptions = leaveTypes.map(type => ({
    value: type,
    label: type === 'all' ? 'All Types' : type
  }));

  // Date range options
  const dateRangeOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'nextMonth', label: 'Next Month' },
    { value: 'past', label: 'Past Leaves' },
    { value: 'upcoming', label: 'Upcoming Leaves' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm relative">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search employees, leave types, or reasons..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-shrink-0 relative">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="All Status"
            className="min-w-[150px]"
          />
        </div>

        {/* Leave Type Filter */}
        <div className="flex items-center gap-2 flex-shrink-0 relative">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <CustomDropdown
            value={leaveTypeFilter}
            onChange={setLeaveTypeFilter}
            options={leaveTypeOptions}
            placeholder="All Types"
            className="min-w-[150px]"
          />
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2 flex-shrink-0 relative">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <CustomDropdown
            value={dateRangeFilter}
            onChange={setDateRangeFilter}
            options={dateRangeOptions}
            placeholder="All Dates"
            className="min-w-[150px]"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}