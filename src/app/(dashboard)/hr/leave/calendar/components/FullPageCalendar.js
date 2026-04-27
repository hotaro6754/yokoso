"use client";
import { useState, useMemo } from 'react';

const FullPageCalendar = ({ leaves, currentDate, view, onLeaveClick, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentDate]);

  // Get leaves for a specific date
  const getLeavesForDate = (date) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];
    return leaves.filter(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const current = new Date(dateStr);

      return current >= start && current <= end;
    });
  };

  const formatDate = (date) => {
    return date ? date.getDate() : '';
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

  const isCurrentMonth = (date) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear();
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 sm:p-6">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {weekDays.map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const dateLeaves = getLeavesForDate(date);
              const isEmpty = !date;
              const isWeekendDay = !isEmpty && isWeekend(date);
              const isTodayDate = !isEmpty && isToday(date);
              const isCurrentMonthDay = !isEmpty && isCurrentMonth(date);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-3 border rounded-lg transition-all duration-200 ${isEmpty
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : isTodayDate
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md'
                        : isWeekendDay
                          ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                    } ${!isCurrentMonthDay && !isEmpty ? 'opacity-50' : ''}`}
                  onClick={() => !isEmpty && setSelectedDate(date)}
                >
                  {/* Date Header */}
                  <div className={`text-sm font-medium mb-2 flex justify-between items-center ${isTodayDate
                      ? 'text-brand-600 dark:text-brand-400'
                      : isCurrentMonthDay
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                    <span>{formatDate(date)}</span>
                    {dateLeaves.length > 0 && (
                      <span className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-1 rounded-full">
                        {dateLeaves.length}
                      </span>
                    )}
                  </div>

                  {/* Leave Items */}
                  <div className="space-y-1">
                    {dateLeaves.slice(0, 3).map(leave => (
                      <div
                        key={leave.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeaveClick(leave);
                        }}
                        className="text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity border-l-4"
                        style={{
                          backgroundColor: `${leave.color}20`,
                          borderLeftColor: leave.color
                        }}
                      >
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {leave.employeeName}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 truncate">
                          {leave.leaveType}
                        </div>
                        <div className={`text-xs font-medium ${leave.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                            leave.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                          }`}>
                          {leave.status}
                          {leave.halfDay && ` • ${leave.halfDayType === 'first_half' ? 'First Half' : 'Second Half'}`}
                        </div>
                      </div>
                    ))}

                    {dateLeaves.length > 3 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeaveClick({
                            date: date.toISOString().split('T')[0],
                            leaves: dateLeaves,
                            isMulti: true
                          });
                        }}
                        className="text-xs text-center text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 cursor-pointer p-1 bg-brand-50 dark:bg-brand-900/20 rounded"
                      >
                        +{dateLeaves.length - 3} more leaves
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-sm">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calendar Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-brand-500 rounded"></div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Annual Leave</span>
              <div className="text-xs text-gray-600 dark:text-gray-400">Paid time off</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Sick Leave</span>
              <div className="text-xs text-gray-600 dark:text-gray-400">Medical absence</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-purple-600 rounded"></div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Maternity</span>
              <div className="text-xs text-gray-600 dark:text-gray-400">Parental leave</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-yellow-600 rounded"></div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Emergency</span>
              <div className="text-xs text-gray-600 dark:text-gray-400">Urgent matters</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Unpaid</span>
              <div className="text-xs text-gray-600 dark:text-gray-400">Personal leave</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-indigo-600 rounded"></div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">WFH</span>
              <div className="text-xs text-gray-600 dark:text-gray-400">Remote work</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPageCalendar;