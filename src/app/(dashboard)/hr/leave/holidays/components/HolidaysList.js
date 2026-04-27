import { Calendar, MapPin, Trash2, Edit, Clock } from 'lucide-react';
import Link from 'next/link';

const HolidaysList = ({ holidays, onDeleteHoliday, canEdit = true }) => {
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
      case 'regional': return 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400';
      case 'company': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Holiday</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Applicable To</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              {canEdit && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {holidays.map((holiday) => {
              const daysUntil = getDaysUntil(holiday.date);
              const isPast = daysUntil < 0;

              return (
                <tr key={holiday.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900 dark:text-white">{holiday.name}</div>
                    {holiday.isRecurring && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">Recurring annually</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(holiday.date)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHolidayTypeColor(holiday.type)}`}>
                      {holiday.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {holiday.applicableTo === 'all'
                        ? 'Nationwide'
                        : (holiday.applicableTo === 'location'
                          ? (holiday.location?.name || 'Unknown Location')
                          : holiday.state)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {isPast ? (
                      <span className="text-xs text-gray-500">Past</span>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {daysUntil === 0 ? 'Today' : `${daysUntil} days left`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[280px]">
                    <span className="block truncate" title={holiday.description || ''}>
                      {holiday.description || '-'}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/hr/leave/holidays/edit/${holiday.id}`}
                          className="p-2 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
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
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {holidays.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-brand-400 dark:text-brand-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No holidays found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your filters{canEdit ? " or add new holidays" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default HolidaysList;
