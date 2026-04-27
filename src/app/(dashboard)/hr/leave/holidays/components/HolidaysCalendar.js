"use client";
import { useState, useMemo } from 'react';

const HolidaysCalendar = ({ holidays }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
  }, [currentYear, currentMonth]);

  const getHolidaysForDate = (date) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];
    return holidays.filter(holiday => holiday.date === dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isWeekend = (date) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ‹
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ›
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const dateHolidays = getHolidaysForDate(date);
              const isEmpty = !date;
              const isWeekendDay = !isEmpty && isWeekend(date);
              const isTodayDate = !isEmpty && isToday(date);

              return (
                <div
                  key={index}
                  className={`min-h-[100px] sm:min-h-[120px] p-2 border rounded-lg ${isEmpty
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : isTodayDate
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : isWeekendDay
                        ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-medium mb-2 ${isTodayDate
                    ? 'text-brand-600 dark:text-brand-400'
                    : isEmpty
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-900 dark:text-white'
                    }`}>
                    {date ? date.getDate() : ''}
                  </div>

                  {/* Holidays */}
                  <div className="space-y-1">
                    {dateHolidays.map(holiday => (
                      <div
                        key={holiday.id}
                        onClick={() => setSelectedHoliday(holiday)}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: `${holiday.color}20` }}
                      >
                        <div
                          className="font-medium truncate"
                          style={{ color: holiday.color }}
                        >
                          {holiday.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 hidden sm:block">
                          {holiday.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holiday Details Modal */}
      {selectedHoliday && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedHoliday.name}
              </h3>
              <button
                onClick={() => setSelectedHoliday(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Date: </span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(selectedHoliday.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Type: </span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {selectedHoliday.type}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Applicable To: </span>
                <span className="text-gray-900 dark:text-white">
                  {selectedHoliday.applicableTo === 'all' ? 'All Employees' : (selectedHoliday.applicableTo === 'location' ? (selectedHoliday.location?.name || 'Specific Location') : selectedHoliday.state)}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Description: </span>
                <p className="text-gray-900 dark:text-white mt-1">
                  {selectedHoliday.description}
                </p>
              </div>

              {selectedHoliday.isRecurring && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  📅 Recurring annually
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidaysCalendar;