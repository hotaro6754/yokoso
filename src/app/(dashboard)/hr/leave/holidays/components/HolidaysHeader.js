import { Calendar, List, Filter, Calendar as CalendarIcon } from 'lucide-react';
import CustomDropdown from '../../components/CustomDropdown';

const HolidaysHeader = ({
  view,
  onViewChange,
  yearFilter,
  onYearFilterChange,
  typeFilter,
  onTypeFilterChange,
  totalHolidays,
  availableYears = [],
  loading = false
}) => {
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'national', label: 'National' },
    { value: 'religious', label: 'Religious' },
    { value: 'regional', label: 'Regional' },
    { value: 'company', label: 'Company' }
  ];

  // Ensure availableYears has at least current year
  const yearOptionsArray = availableYears.length > 0 
    ? availableYears 
    : [yearFilter - 1, yearFilter, yearFilter + 1];

  // Convert years to options format
  const yearOptions = yearOptionsArray.map(year => ({
    value: year,
    label: year.toString()
  }));

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-0">
          {loading ? (
            <span className="inline-flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-600 mr-2"></div>
              Loading...
            </span>
          ) : (
            `${totalHolidays} ${totalHolidays === 1 ? 'holiday' : 'holidays'} in ${yearFilter}`
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* View Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 self-start sm:self-auto">
          <button
            onClick={() => onViewChange('list')}
            disabled={loading}
            className={`p-2 rounded-md flex items-center gap-2 text-sm ${view === 'list'
                ? 'bg-white dark:bg-gray-600 text-brand-600 dark:text-brand-400 shadow'
                : 'text-gray-600 dark:text-gray-400'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <List size={16} />
            List View
          </button>
          <button
            onClick={() => onViewChange('calendar')}
            disabled={loading}
            className={`p-2 rounded-md flex items-center gap-2 text-sm ${view === 'calendar'
                ? 'bg-white dark:bg-gray-600 text-brand-600 dark:text-brand-400 shadow'
                : 'text-gray-600 dark:text-gray-400'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CalendarIcon size={16} />
            Calendar View
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <CustomDropdown
              value={yearFilter}
              onChange={(value) => onYearFilterChange(parseInt(value))}
              options={yearOptions}
              placeholder="Select Year"
              className="min-w-[120px]"
            />
          </div>

          <CustomDropdown
            value={typeFilter}
            onChange={onTypeFilterChange}
            options={typeOptions}
            placeholder="All Types"
            className="min-w-[150px]"
          />
        </div>
      </div>
    </div>
  );
};

export default HolidaysHeader;