"use client";
import { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import Flatpickr from "react-flatpickr";
// import "flatpickr/dist/themes/material_blue.css"; // Choose a theme

// Custom CSS to fix visibility issues in both light and dark modes
const flatpickrCustomStyles = `
  .flatpickr-calendar {
    background: #fff !important;
    color: #374151 !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .dark .flatpickr-calendar {
    background: #374151 !important;
    color: #e5e7eb !important;
  }
  
  .flatpickr-day {
    color: #374151 !important;
  }
  
  .dark .flatpickr-day {
    color: #e5e7eb !important;
  }
  
  .flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange, .flatpickr-day.selected.inRange, .flatpickr-day.startRange.inRange, .flatpickr-day.endRange.inRange, .flatpickr-day.selected:focus, .flatpickr-day.startRange:focus, .flatpickr-day.endRange:focus, .flatpickr-day.selected:hover, .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover, .flatpickr-day.selected.prevMonthDay, .flatpickr-day.startRange.prevMonthDay, .flatpickr-day.endRange.prevMonthDay, .flatpickr-day.selected.nextMonthDay, .flatpickr-day.startRange.nextMonthDay, .flatpickr-day.endRange.nextMonthDay {
    background: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
  }
  
  .flatpickr-months .flatpickr-month, .flatpickr-weekdays, .flatpickr-weekday {
    background: #f3f4f6 !important;
    color: #374151 !important;
    fill: #374151 !important;
  }
  
  .dark .flatpickr-months .flatpickr-month, .dark .flatpickr-weekdays, .dark .flatpickr-weekday {
    background: #4b5563 !important;
    color: #e5e7eb !important;
    fill: #e5e7eb !important;
  }
  
  .flatpickr-current-month .flatpickr-monthDropdown-months, .flatpickr-current-month input.cur-year {
    color: #374151 !important;
    font-weight: 600;
  }
  
  .dark .flatpickr-current-month .flatpickr-monthDropdown-months, .dark .flatpickr-current-month input.cur-year {
    color: #e5e7eb !important;
  }
  
  .flatpickr-weekday {
    background: transparent !important;
  }
  
  .flatpickr-prev-month, .flatpickr-next-month {
    fill: #374151 !important;
  }
  
  .dark .flatpickr-prev-month, .dark .flatpickr-next-month {
    fill: #e5e7eb !important;
  }
  
  .flatpickr-day:hover {
    background: #e5e7eb !important;
  }
  
  .dark .flatpickr-day:hover {
    background: #4b5563 !important;
  }
  
  .flatpickr-day.today {
    border-color: #3b82f6 !important;
  }
  
  .flatpickr-day.today:hover {
    background: #3b82f6 !important;
    color: white !important;
  }
`;


export default function EditAttendanceModal({ isOpen, onClose, attendance, onSave }) {
  const [formData, setFormData] = useState({
    date: '',
    checkIn: '',
    checkOut: '',
    break: '',
    late: '',
    productionHours: '',
    status: 'Present'
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showProductionHoursPicker, setShowProductionHoursPicker] = useState(false);

  const statusOptions = [
    { value: 'Present', label: 'Present' },
    { value: 'Late', label: 'Late' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Half Day', label: 'Half Day' },
    { value: 'Overtime', label: 'Overtime' },
    { value: 'Leave', label: 'Leave' }
  ];

  useEffect(() => {
    if (attendance) {
      // Convert date format from "17 Dec 2024" to "2024-12-17"
      const dateStr = attendance.date;
      const dateParts = dateStr.split(' ');
      const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const formattedDate = `${dateParts[2]}-${months[dateParts[1]]}-${dateParts[0].padStart(2, '0')}`;

      setFormData({
        date: formattedDate,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        break: attendance.break,
        late: attendance.late,
        productionHours: attendance.productionHours,
        status: attendance.status
      });
    }
  }, [attendance]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';

    // If it's already in the correct format, return it
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr;
    }

    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (field, value) => {
    const formattedTime = formatTime(value);
    handleInputChange(field, formattedTime);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert date back to display format
    const dateObj = new Date(formData.date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    const updatedAttendance = {
      ...attendance,
      ...formData,
      date: formattedDate
    };

    onSave(updatedAttendance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Attendance
          </h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Date Field */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div> */}
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <div className="relative">
                <Flatpickr
                  value={formData.date}
                  onChange={(date) => handleInputChange('date', date[0].toISOString().split('T')[0])}
                  options={{
                    dateFormat: "Y-m-d",
                    altInput: true,
                    altFormat: "F j, Y", // Human-friendly format
                    allowInput: true,
                    clickOpens: true,
                    static: true // Prevents issues with modal rendering :cite[9]
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Check In and Check Out */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check In
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.checkIn.replace(/\s?(AM|PM)/i, '')}
                    onChange={(e) => handleTimeChange('checkIn', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check Out
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.checkOut.replace(/\s?(AM|PM)/i, '')}
                    onChange={(e) => handleTimeChange('checkOut', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Break and Late */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Break
                </label>
                <input
                  type="text"
                  value={formData.break}
                  onChange={(e) => handleInputChange('break', e.target.value)}
                  placeholder="e.g., 01:00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Late
                </label>
                <input
                  type="text"
                  value={formData.late}
                  onChange={(e) => handleInputChange('late', e.target.value)}
                  placeholder="e.g., 00:15"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Production Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Production Hours
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.productionHours.replace(/\s?(AM|PM)/i, '')}
                  onChange={(e) => handleInputChange('productionHours', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}