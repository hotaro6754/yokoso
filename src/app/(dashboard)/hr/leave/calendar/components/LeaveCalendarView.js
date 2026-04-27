"use client";
import { useState, useRef, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';

const LeaveCalendarView = ({ leaves, currentDate, view, onLeaveClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthViewDate, setMonthViewDate] = useState(currentDate);
  const calendarRef = useRef(null);

  // Group leaves by date for easy lookup
  const leavesByDate = leaves.reduce((acc, leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(leave);
      current.setDate(current.getDate() + 1);
    }

    return acc;
  }, {});

  // Custom calendar plugin to render leave indicators
  const leaveIndicatorPlugin = function (instance) {
    return {
      onMonthChange: function () {
        // Update month view when calendar month changes
        setMonthViewDate(instance.currentYear, instance.currentMonth + 1);
      },
      onDayCreate: function (dObj, dStr, fp, dayElem) {
        const dateStr = dayElem.dateObj.toISOString().split('T')[0];
        const dayLeaves = leavesByDate[dateStr];

        if (dayLeaves && dayLeaves.length > 0) {
          // Add leave indicator dots
          const indicatorContainer = document.createElement('div');
          indicatorContainer.className = 'flex justify-center gap-1 mt-1';

          dayLeaves.slice(0, 3).forEach(leave => {
            const dot = document.createElement('div');
            dot.className = 'w-2 h-2 rounded-full cursor-pointer';
            dot.style.backgroundColor = leave.color;
            dot.title = `${leave.employeeName} - ${leave.leaveType}`;
            dot.onclick = (e) => {
              e.stopPropagation();
              onLeaveClick(leave);
            };
            indicatorContainer.appendChild(dot);
          });

          if (dayLeaves.length > 3) {
            const moreDot = document.createElement('div');
            moreDot.className = 'w-2 h-2 rounded-full bg-gray-400 cursor-pointer';
            moreDot.title = `${dayLeaves.length - 3} more leaves`;
            moreDot.onclick = (e) => {
              e.stopPropagation();
              // Show all leaves for this date
              const dateLeaves = dayLeaves.map(leave => ({
                ...leave,
                date: dateStr
              }));
              onLeaveClick({
                date: dateStr,
                leaves: dateLeaves,
                isMulti: true
              });
            };
            indicatorContainer.appendChild(moreDot);
          }

          dayElem.appendChild(indicatorContainer);
        }
      }
    };
  };

  const handleDateSelect = (selectedDates) => {
    if (selectedDates.length > 0) {
      setSelectedDate(selectedDates[0]);
      const dateStr = selectedDates[0].toISOString().split('T')[0];
      const dateLeaves = leavesByDate[dateStr];

      if (dateLeaves && dateLeaves.length > 0) {
        if (dateLeaves.length === 1) {
          onLeaveClick(dateLeaves[0]);
        } else {
          onLeaveClick({
            date: dateStr,
            leaves: dateLeaves,
            isMulti: true
          });
        }
      }
    }
  };

  // Flatpickr configuration
  const flatpickrConfig = {
    inline: true,
    mode: 'single',
    defaultDate: currentDate,
    onChange: handleDateSelect,
    plugins: [leaveIndicatorPlugin],
    locale: {
      firstDayOfWeek: 1 // Monday
    },
    onReady: (selectedDates, dateStr, instance) => {
      // Store reference to flatpickr instance
      calendarRef.current = instance;
    }
  };

  // Update calendar when currentDate changes
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.setDate(currentDate, false);
    }
  }, [currentDate]);

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Flatpickr
          options={flatpickrConfig}
          className="hidden" // Hide the input, we only want the calendar
        />

        {/* Custom header for the calendar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {leaves.length} leaves scheduled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Annual Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Sick Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Maternity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Unpaid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Rejected</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Approved</span>
            <span className="text-lg font-bold text-blue-800 dark:text-blue-300">
              {leaves.filter(l => l.status === 'approved').length}
            </span>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Pending</span>
            <span className="text-lg font-bold text-yellow-800 dark:text-yellow-300">
              {leaves.filter(l => l.status === 'pending').length}
            </span>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-800 dark:text-red-300">Rejected</span>
            <span className="text-lg font-bold text-red-800 dark:text-red-300">
              {leaves.filter(l => l.status === 'rejected').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendarView;