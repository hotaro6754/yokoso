"use client";
import { Search, Filter } from 'lucide-react';
import CustomDropdown from '../../components/CustomDropdown';

const PoliciesHeader = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange,
  applicableToFilter,
  onApplicableToFilterChange,
  accrualMethodFilter,
  onAccrualMethodFilterChange
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'archived', label: 'Archived' }
  ];

  const applicableToOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'all_employees', label: 'All Employees' },
    { value: 'full_time', label: 'Full-time Only' },
    { value: 'part_time', label: 'Part-time Only' },
    { value: 'male_employees', label: 'Male Employees' },
    { value: 'female_employees', label: 'Female Employees' },
    { value: 'permanent', label: 'Permanent Staff' },
    { value: 'contract', label: 'Contract Staff' }
  ];

  const accrualMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'one_time', label: 'One-time' },
    { value: 'hourly', label: 'Hourly' }
  ];

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0 relative">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <CustomDropdown
              value={statusFilter}
              onChange={onStatusFilterChange}
              options={statusOptions}
              placeholder="All Status"
              className="min-w-[150px]"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 relative">
            <CustomDropdown
              value={applicableToFilter}
              onChange={onApplicableToFilterChange}
              options={applicableToOptions}
              placeholder="All Types"
              className="min-w-[150px]"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 relative">
            <CustomDropdown
              value={accrualMethodFilter}
              onChange={onAccrualMethodFilterChange}
              options={accrualMethodOptions}
              placeholder="All Methods"
              className="min-w-[150px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesHeader;