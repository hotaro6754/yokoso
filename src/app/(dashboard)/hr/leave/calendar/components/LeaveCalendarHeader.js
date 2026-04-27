import { ChevronLeft, ChevronRight, Calendar, Grid, List, Search, Download, Plus } from 'lucide-react';

const LeaveCalendarHeader = ({ 
  currentDate, 
  onDateChange, 
  view, 
  onViewChange, 
  searchTerm, 
  onSearchChange 
}) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    }
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting calendar data...');
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">

      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white w-full sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewChange('month')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm ${
                view === 'month'
                  ? 'bg-white dark:bg-gray-600 text-brand-600 dark:text-brand-400 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Grid size={16} />
              Month
            </button>
            <button
              onClick={() => onViewChange('week')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm ${
                view === 'week'
                  ? 'bg-white dark:bg-gray-600 text-brand-600 dark:text-brand-400 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <List size={16} />
              Week
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Today
            </button>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Current Date Display */}
          <div className="hidden md:flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Calendar size={20} />
            {formatDate(currentDate)}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeaveCalendarHeader;