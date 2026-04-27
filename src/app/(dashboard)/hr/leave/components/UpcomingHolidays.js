import React from "react";
import { Calendar } from 'lucide-react';

const UpcomingHolidays = ({ holidays = [] }) => {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center mb-6">
        <Calendar className="h-5 w-5 text-brand-600 dark:text-brand-400 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Upcoming Holidays
        </h2>
      </div>

      <div className="space-y-4">
        {holidays.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No upcoming holidays
          </p>
        ) : (
          holidays.map((holiday) => (
            <div key={holiday.id || holiday.publicId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                  {holiday.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {holiday.dateFormatted || holiday.date}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
                  {holiday.daysLeft} days
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-brand-300 dark:hover:border-brand-600 transition-colors">
        View All Holidays
      </button>
    </div>
  );
};

export default UpcomingHolidays;