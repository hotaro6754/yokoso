"use client";

import React, { useState, useMemo } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Home, AlertCircle } from "lucide-react";
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";

export default function AttendanceCalendar() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const years = [currentYear, currentYear - 1, currentYear - 2];
  const months = [
    { name: "January", value: 0 },
    { name: "February", value: 1 },
    { name: "March", value: 2 },
    { name: "April", value: 3 },
    { name: "May", value: 4 },
    { name: "June", value: 5 },
    { name: "July", value: 6 },
    { name: "August", value: 7 },
    { name: "September", value: 8 },
    { name: "October", value: 9 },
    { name: "November", value: 10 },
    { name: "December", value: 11 },
  ];

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Dummy attendance data with punch in/out & total hours
  const attendanceData = useMemo(
    () => ({
      [`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`]: {
        status: "OnTime",
        punchIn: "09:00 AM",
        punchOut: "06:00 PM",
        total: "9h 0m",
      },
      [`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-02`]: {
        status: "Late",
        punchIn: "09:45 AM",
        punchOut: "06:00 PM",
        total: "8h 15m",
      },
      [`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-03`]: {
        status: "Absent",
        punchIn: "--",
        punchOut: "--",
        total: "--",
      },
      [`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-04`]: {
        status: "OnTime",
        punchIn: "09:05 AM",
        punchOut: "06:00 PM",
        total: "8h 55m",
      },
      [`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-05`]: {
        status: "WFH",
        punchIn: "09:00 AM",
        punchOut: "06:00 PM",
        total: "9h 0m",
      },
      // ... add more days as needed
    }),
    [currentMonth, currentYear]
  );

  const statusColors = {
    OnTime: {
      bg: "bg-primary-50 dark:bg-primary-500/10",
      text: "text-primary-700 dark:text-primary-400",
      border: "border-primary-200 dark:border-primary-500/30",
      icon: CheckCircle
    },
    Late: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-500/30",
      icon: Clock
    },
    Absent: {
      bg: "bg-red-50 dark:bg-red-500/10",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-500/30",
      icon: XCircle
    },
    WFH: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-500/30",
      icon: Home
    },
    SickLeave: {
      bg: "bg-yellow-50 dark:bg-yellow-500/10",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-500/30",
      icon: AlertCircle
    },
  };

const generateCalendar = () => {
  const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const dateStr = format(day, "yyyy-MM-dd");
      const data = attendanceData[dateStr] || null;
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isTodayDate = isToday(day);
      const statusConfig = data ? statusColors[data.status] : null;

      let content;
      if (data) {
        if (data.status === "Absent") {
          content = (
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="text-xs font-semibold">Absent</div>
            </div>
          );
        } else {
          content = (
            <div className="flex flex-col gap-0.5 mt-1.5 text-[10px] w-full px-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">In:</span>
                <span className="font-medium">{data.punchIn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Out:</span>
                <span className="font-medium">{data.punchOut}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5 border-t border-gray-200 dark:border-gray-600 mt-0.5">
                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                <span className="font-semibold">{data.total}</span>
              </div>
            </div>
          );
        }
      } else {
        content = null;
      }

      days.push(
        <div
          key={dateStr}
          className={`
            relative h-28 sm:h-32 flex flex-col rounded-xl p-2 border transition-all duration-200
            ${!isCurrentMonth
              ? "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-400"
              : statusConfig
              ? `${statusConfig.bg} ${statusConfig.border} border-2`
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50"
            }
            ${isTodayDate && isCurrentMonth ? "ring-2 ring-primary-500 ring-offset-2" : ""}
          `}
        >
          <div className={`flex items-center justify-between mb-1 ${statusConfig ? statusConfig.text : "text-gray-700 dark:text-gray-300"}`}>
            <span className={`text-sm font-semibold ${isTodayDate ? "text-primary-600 dark:text-primary-400" : ""}`}>
              {format(day, "d")}
            </span>
            {statusConfig && (
              <statusConfig.icon className="h-3.5 w-3.5" />
            )}
          </div>
          {content}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={format(day, "yyyy-MM-dd")} className="grid grid-cols-7 gap-2 mb-2">
        {days}
      </div>
    );
    days = [];
  }
  return rows;
};


  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((parseInt(selectedYear) - 1).toString());
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((parseInt(selectedYear) + 1).toString());
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const canGoNext = () => {
    return !(parseInt(selectedYear) === currentYear && selectedMonth >= currentMonth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          customTitle="Leave Summary Details"
          subtitle="View your attendance calendar and records"
        />

        {/* Calendar Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-6">
          {/* Header with Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {months[selectedMonth].name} {selectedYear}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attendance calendar</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Year Selector */}
              <select
                className="px-4 py-2 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm font-medium cursor-pointer"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors duration-200"
                  disabled={parseInt(selectedYear) === currentYear - 2 && selectedMonth === 0}
                >
                  <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canGoNext()}
                >
                  <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div 
                key={d} 
                className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="mb-6">{generateCalendar()}</div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            {Object.entries(statusColors).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className={`${config.bg} ${config.border} border rounded-lg p-1.5`}>
                    <Icon className={`h-3.5 w-3.5 ${config.text}`} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
