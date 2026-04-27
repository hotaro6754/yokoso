"use client";

import { Calendar } from "lucide-react";

export default function LeaveBalanceCard({ type, allocated, used }) {
  const remaining = allocated - used;
  const percentage = allocated > 0 ? (used / allocated) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg">
          <Calendar size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {type}
          </h4>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Used</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{used} days</span>
        </div>

        {!type.toLowerCase().includes('emergency') && (
          <>
            <div className="relative h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {remaining} remaining
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {allocated} total
              </span>
            </div>
          </>
        )}
        
        {type.toLowerCase().includes('emergency') && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50 mt-2">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">
              Available as per company emergency policy
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
