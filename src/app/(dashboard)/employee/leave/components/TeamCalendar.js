"use client";

import { useState, useEffect } from "react";
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from "date-fns";
import { Calendar, Filter, Users, ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import leaveCalendarService from "@/services/hr-services/leave-calender.service";

// Months array
const months = [
  { name: "January", value: 0 }, { name: "February", value: 1 }, { name: "March", value: 2 },
  { name: "April", value: 3 }, { name: "May", value: 4 }, { name: "June", value: 5 },
  { name: "July", value: 6 }, { name: "August", value: 7 }, { name: "September", value: 8 },
  { name: "October", value: 9 }, { name: "November", value: 10 }, { name: "December", value: 11 },
];

const statusLabels = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

const toStatusLabel = (value) => statusLabels[value] || value;

const withAlpha = (hex, alpha) => {
  if (!hex) return "rgba(59,130,246,0.12)";
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "rgba(59,130,246,0.12)";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function TeamCalendar({ selectedMonth }) {
  const today = new Date();
  const currentYear = today.getFullYear();

  const [currentMonth, setCurrentMonth] = useState(new Date(selectedMonth));
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [calendarLeaves, setCalendarLeaves] = useState({});
  const [departments, setDepartments] = useState(["all"]);
  const [leaveTypes, setLeaveTypes] = useState(["all"]);
  const [statuses, setStatuses] = useState(["all", "approved", "pending", "rejected"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Navigation handlers
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  useEffect(() => {
    setCurrentMonth(new Date(selectedMonth));
  }, [selectedMonth]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await leaveCalendarService.getFilterOptions();
        const payload = response.data || response;
        setDepartments(["all", ...(payload.departments || [])]);
        setLeaveTypes(["all", ...(payload.leaveTypes || [])]);
        setStatuses(["all", ...(payload.statuses || ["approved", "pending", "rejected"])]);
      } catch (err) {
        console.error("Failed to load calendar filters", err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        setLoading(true);
        setError("");
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        const response = await leaveCalendarService.getCalendarView({
          month,
          year,
          department: departmentFilter,
          status: statusFilter,
          leaveType: leaveTypeFilter
        });
        const payload = response.data || response;
        const calendarDays = payload.calendarDays || [];
        const map = calendarDays.reduce((acc, item) => {
          if (item?.date) {
            acc[item.date] = item.leaves || [];
          }
          return acc;
        }, {});
        setCalendarLeaves(map);
      } catch (err) {
        console.error("Failed to load calendar view", err);
        setError(err.message || "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    };
    loadCalendar();
  }, [currentMonth, departmentFilter, statusFilter, leaveTypeFilter]);

  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);
  const startDate = startOfWeek(startMonth);
  const endDate = endOfWeek(endMonth);

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const getFilteredLeaves = (day) => {
    const key = format(day, "yyyy-MM-dd");
    return calendarLeaves[key] || [];
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-primary-100/50 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* Department Filter */}
            <div className="relative flex-1 lg:flex-initial min-w-[180px]">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d === "all" ? "All Departments" : d}</option>
                ))}
              </select>
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Leave Status Filter */}
            <div className="relative flex-1 lg:flex-initial min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All Status" : toStatusLabel(s)}</option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Month Filter */}
            <div className="relative flex-1 lg:flex-initial min-w-[200px]">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => setCurrentMonth(new Date(currentYear, Number(e.target.value)))}
                className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Leave Type Filter */}
            <div className="relative flex-1 lg:flex-initial min-w-[180px]">
              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              >
                {leaveTypes.map((t) => (
                  <option key={t} value={t}>{t === "all" ? "All Leave Types" : t}</option>
                ))}
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors duration-200"
            >
              <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            <div className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white min-w-[150px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <button
              onClick={nextMonth}
              className="p-2 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors duration-200"
            >
              <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">Loading calendar...</div>
        )}




        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayItem, idx) => {
            const leaves = getFilteredLeaves(dayItem);
            const isCurrentMonth = isSameMonth(dayItem, currentMonth);
            const isTodayDate = isToday(dayItem);
            return (
              <div
                key={idx}
                className={`border rounded-xl p-2 h-28 sm:h-32 flex flex-col gap-1 transition-all duration-200 ${
                  isCurrentMonth
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50"
                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-400"
                } ${isTodayDate && isCurrentMonth ? "ring-2 ring-primary-500 ring-offset-2" : ""}`}
              >
                <div
                  className={`text-sm font-semibold ${
                    isTodayDate && isCurrentMonth
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {format(dayItem, "d")}
                </div>

                {/* Leaves */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-20 flex-1">
                  {leaves.map((leave) => {
                    const statusIcon = leave.status === "approved" ? CheckCircle : 
                                     leave.status === "pending" ? Clock : AlertCircle;
                    const StatusIcon = statusIcon;
                    return (
                      <div
                        key={`${leave.id}-${leave.employeeName}`}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
                        style={{
                          backgroundColor: withAlpha(leave.color, 0.12),
                          borderColor: withAlpha(leave.color, 0.4),
                          color: leave.color || "#3b82f6"
                        }}
                        title={`${leave.employeeName} - ${leave.leaveType} (${toStatusLabel(leave.status)})`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <StatusIcon size={8} />
                          <span className="truncate">{leave.employeeName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
