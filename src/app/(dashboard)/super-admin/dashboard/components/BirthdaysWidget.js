"use client";
import React, { useEffect, useState } from "react";
import { employeeService } from "@/services/hr-services/employeeService";

export default function BirthdaysWidget() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchBirthdays = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await employeeService.getUpcomingBirthdays();
        if (!active) return;
        const birthdays = response?.success ? response.data : response?.data || response;
        setData(Array.isArray(birthdays) ? birthdays : []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load upcoming birthdays");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchBirthdays();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 h-full w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Birthdays
        </h5>
        <button className="px-3 py-1.5 text-xs font-semibold rounded-sm bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors">
          View All
        </button>
      </div>

      <div className="p-4 space-y-4">
        {data.map((p) => (
          <div key={p.period}>
            <h6 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {p.period}
            </h6>
            <div className="space-y-3">
              {p.employees.map((e) => {
                const isToday = p.period === "Today";
                return (
                  <div
                    key={e.name}
                    className={`relative ${
                      isToday
                        ? "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 p-2 sm:p-3 rounded-sm border-2 border-blue-300 dark:border-blue-500/50"
                        : "bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-sm border border-dashed border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    {isToday && (
                      <div className="absolute -inset-1 pointer-events-none z-0 overflow-visible">
                        <span className="absolute -top-1 right-3 text-lg animate-bounce z-30" style={{ animationDuration: "2s", animationDelay: "0s" }}>🎉</span>
                        <span className="absolute -bottom-1 left-3 text-lg animate-bounce z-30" style={{ animationDuration: "2s", animationDelay: "1s" }}>✨</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 relative z-20">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
                          <img src={e.avatar} alt={e.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h6 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{e.name}</h6>
                          <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{e.role}</p>
                        </div>
                      </div>

                      <button className="flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454" />
                        </svg>
                        Send
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {error ? (
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        ) : loading ? (
          <p className="text-xs text-gray-500 dark:text-gray-300">Loading birthdays...</p>
        ) : data.length === 0 && !loading && !error ? (
          <p className="text-xs text-gray-500 dark:text-gray-300">No upcoming birthdays in the next 7 days</p>
        ) : null}
      </div>
    </div>
  );
}

