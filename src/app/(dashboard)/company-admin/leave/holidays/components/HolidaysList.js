import { Calendar, MapPin, Trash2, Edit, Clock } from 'lucide-react';
import Link from 'next/link';

const HolidaysList = ({ holidays, onDeleteHoliday }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const holidayDate = new Date(dateString);
    const diffTime = holidayDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getHolidayTypeColor = (type) => {
    switch (type) {
      case 'national': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'religious': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'regional': return 'bg-[var(--color-primary-hover)] text-[#0b1220] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)]';
      case 'company': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="grid gap-4">
        {holidays.map(holiday => {
          const daysUntil = getDaysUntil(holiday.date);
          const isPast = daysUntil < 0;

          return (
            <div key={holiday.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row items-start justify-between">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {holiday.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHolidayTypeColor(holiday.type)}`}>
                      {holiday.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(holiday.date)}
                    </div>

                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {holiday.applicableTo === 'all' ? 'Nationwide' : (holiday.applicableTo === 'location' ? (holiday.location?.name || 'Unknown Location') : holiday.state)}
                    </div>

                    {!isPast && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {daysUntil === 0 ? 'Today' : `${daysUntil} days left`}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-3 sm:mt-0">
                    {holiday.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4 self-end sm:self-start">
                  <Link
                    href={`/company-admin/leave/holidays/edit/${holiday.id}`}
                    className="p-2 text-[var(--color-primary)] hover:text-[var(--color-primary)]/80"
                    title="Edit Holiday"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => onDeleteHoliday(holiday.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete Holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {holiday.isRecurring && (
                <div className="mt-3 text-xs text-green-600 dark:text-green-400">
                  🔁 Recurring annually
                </div>
              )}
            </div>
          );
        })}
      </div>

      {holidays.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No holidays found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your filters or add new holidays
          </p>
        </div>
      )}
    </div>
  );
};

export default HolidaysList;
