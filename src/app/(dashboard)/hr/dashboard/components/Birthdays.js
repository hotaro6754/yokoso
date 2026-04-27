"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { employeeService } from "@/services/hr-services/employeeService";

const Birthdays = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [birthdaysData, setBirthdaysData] = useState([]);

  useEffect(() => {
    let active = true;

    const fetchBirthdays = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await employeeService.getUpcomingBirthdays();
        if (!active) return;
        const payload = response?.success ? response.data : response?.data || response;
        setBirthdaysData(Array.isArray(payload) ? payload : []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load birthdays");
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Birthdays
        </h5>
        <Link
          href="/hr/employees"
          className="px-3 py-1.5 text-xs font-semibold rounded-md 
                     bg-brand-50 hover:bg-brand-100 text-brand-600 
                     dark:bg-brand-500/10 dark:hover:bg-brand-500/20 dark:text-brand-400 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {birthdaysData.map((periodData, periodIndex) => (
          <div key={periodIndex}>
            <h6 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {periodData.period}
            </h6>

            <div className="space-y-3">
              {periodData.employees.map((employee, empIndex) => {
                const isToday = periodData.period === "Today";
                return (
                  <div
                    key={empIndex}
                    className={`relative ${
                      isToday
                        ? "bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5 p-2 sm:p-3 rounded-lg border-2 border-brand-300 dark:border-brand-500/50"
                        : "bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    {/* Minimal Celebration Animation for Today */}
                    {isToday && (
                      <div className="absolute -inset-1 pointer-events-none z-0 overflow-visible">
                        {/* Minimal floating icons */}
                        <span className="absolute -top-1 right-3 text-lg animate-bounce z-30" style={{ animationDuration: "2s", animationDelay: "0s" }}>
                          🎉
                        </span>
                        <span className="absolute -bottom-1 left-3 text-lg animate-bounce z-30" style={{ animationDuration: "2s", animationDelay: "1s" }}>
                          ✨
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 relative z-20">
                      {/* Left */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="w-full h-full object-cover"
                        />
                        </div>

                        <div className="min-w-0">
                          <h6 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                            {employee.name}
                          </h6>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {employee.role}
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        className="flex items-center gap-1 text-xs font-semibold 
                                   bg-brand-500 hover:bg-brand-600 
                                   dark:bg-brand-500 dark:hover:bg-brand-600
                                   text-white px-3 py-1.5 rounded-md 
                                   transition-colors whitespace-nowrap shadow-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h6m6 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3h12a3 3 0 013 3z"
                          />
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
        ) : birthdaysData.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-300">
            No upcoming birthdays in the next 30 days
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Birthdays;
