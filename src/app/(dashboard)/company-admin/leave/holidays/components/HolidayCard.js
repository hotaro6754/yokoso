import { Calendar, MapPin, Clock } from 'lucide-react';

const HolidayCard = ({ holiday, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const daysUntil = getDaysUntil(holiday.date);
  const isPast = daysUntil < 0;

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex flex-wrap items-start justify-between mb-3 gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {holiday.name}
        </h3>
        <span
          className="px-2 py-1 rounded-full text-xs font-medium capitalize shrink-0"
          style={{
            backgroundColor: `${holiday.color}20`,
            color: holiday.color
          }}
        >
          {holiday.type}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {formatDate(holiday.date)}
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {holiday.applicableTo === 'all' ? 'Nationwide' : (holiday.applicableTo === 'location' ? (holiday.location?.name || 'Unknown Location') : holiday.state)}
        </div>

        {!isPast && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {daysUntil === 0 ? 'Today' : `${daysUntil} days left`}
          </div>
        )}
      </div>

      {holiday.description && (
        <p className="text-gray-700 dark:text-gray-300 text-sm mt-3">
          {holiday.description}
        </p>
      )}

      {holiday.isRecurring && (
        <div className="mt-3 text-xs text-green-600 dark:text-green-400">
          🔁 Recurring annually
        </div>
      )}
    </div>
  );
};

export default HolidayCard;