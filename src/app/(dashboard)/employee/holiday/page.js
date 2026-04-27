"use client";
import React, { useState, useMemo, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Calendar, Search, Filter, X, Gift, Clock, TrendingUp, CalendarDays, ChevronUp, ChevronDown, Building } from "lucide-react";
import { format, isPast, isToday, isFuture, parseISO, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import EmployeeHolidayService from "@/services/employee/holiday.service";

export default function HolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);
  const [viewMode, setViewMode] = useState("list"); // "list" or "upcoming"

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const response = await EmployeeHolidayService.getHolidays({ year: yearFilter });
        setHolidays(response.data || []);
      } catch (error) {
        console.error("Failed to fetch holidays", error);
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [yearFilter]);

  useEffect(() => {
    const fetchYears = async () => {
        try {
            const currentYear = new Date().getFullYear();
            setAvailableYears([currentYear - 1, currentYear, currentYear + 1]);
        } catch (error) {
            console.error("Failed to fetch years", error);
        }
    };
    fetchYears();
  }, []);

  const filteredHolidays = useMemo(() => {
    return holidays.filter(holiday => {
      const holidayDate = parseISO(holiday.date);
      const monthMatch = monthFilter === "All" || format(holidayDate, "MMM") === monthFilter;
      const typeLabel = holiday.type ? `${holiday.type.charAt(0).toUpperCase()}${holiday.type.slice(1)}` : "";
      const typeMatch = typeFilter === "All" || typeLabel === typeFilter;
      const searchMatch = !searchQuery || holiday.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (viewMode === "upcoming") {
        return isFuture(holidayDate) || isToday(holidayDate);
      }
      
      return monthMatch && typeMatch && searchMatch;
    });
  }, [holidays, searchQuery, typeFilter, monthFilter, viewMode]);

  const stats = useMemo(() => {
    const total = holidays.length;
    const passed = holidays.filter(h => isPast(parseISO(h.date))).length;
    const upcoming = holidays.filter(h => isFuture(parseISO(h.date)) || isToday(parseISO(h.date))).length;
    const publicHolidays = holidays.filter(h => (h.type || "").toLowerCase() === "national").length;
    
    return { total, passed, upcoming, publicHolidays };
  }, [holidays]);

  const months = ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const types = ["All", "National", "Religious", "Regional", "Company"];

  const hasActiveFilters = monthFilter !== "All" || typeFilter !== "All" || searchQuery !== "" || yearFilter !== new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          pages={[
            { name: "People Operations", href: "#" },
            { name: "Holidays", href: "#" },
          ]}
          customTitle="Holiday Calendar"
          subtitle={`View all holidays for ${yearFilter}`}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[var(--color-primary)]/35 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
                <CalendarDays size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                  Total Holidays
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">For {yearFilter}</p>
            </div>
            <div className="mt-4 h-1 border-[var(--color-primary)]/45 dark:border-[var(--color-primary)]/20 border-t"></div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[var(--color-primary)]/35 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Clock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                  Upcoming
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Holidays ahead</p>
            </div>
            <div className="mt-4 h-1 border-emerald-200 dark:border-emerald-500/30 border-t"></div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[var(--color-primary)]/35 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                <TrendingUp size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                  Passed
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.passed}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Already celebrated</p>
            </div>
            <div className="mt-4 h-1 border-blue-200 dark:border-blue-500/30 border-t"></div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[var(--color-primary)]/35 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                <Gift size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                  Public Holidays
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publicHolidays}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Official holidays</p>
            </div>
            <div className="mt-4 h-1 border-amber-200 dark:border-amber-500/30 border-t"></div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-[var(--color-primary)]/35 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-800 text-[var(--color-primary)] shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  All Holidays
                </button>
                <button
                  onClick={() => setViewMode("upcoming")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    viewMode === "upcoming"
                      ? "bg-white dark:bg-gray-800 text-[var(--color-primary)] shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Upcoming
                </button>
              </div>

              {/* Search */}
              <div className="relative group flex-1 lg:flex-initial min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search holidays..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all duration-200 text-sm outline-none"
                />
              </div>

              {/* Year Filter */}
              <div className="relative group min-w-[100px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(parseInt(e.target.value))}
                  className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none appearance-none transition-all cursor-pointer hover:border-[var(--color-primary)]/50 dark:hover:border-[var(--color-primary)]/30 shadow-sm"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Month Filter */}
              <div className="relative group min-w-[140px]">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none appearance-none transition-all cursor-pointer hover:border-[var(--color-primary)]/50 dark:hover:border-[var(--color-primary)]/30 shadow-sm"
                >
                  {months.map(m => (
                    <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Type Filter */}
              <div className="relative group min-w-[140px]">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none appearance-none transition-all cursor-pointer hover:border-[var(--color-primary)]/50 dark:hover:border-[var(--color-primary)]/30 shadow-sm"
                >
                  {types.map(t => (
                    <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("All");
                  setMonthFilter("All");
                  setYearFilter(new Date().getFullYear());
                }}
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Holidays Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-primary)]/35 dark:border-gray-700 animate-pulse shadow-sm"></div>
            ))
          ) : filteredHolidays.length > 0 ? filteredHolidays.map(holiday => {
            const holidayDate = parseISO(holiday.date);
            const isPastHoliday = isPast(holidayDate) && !isToday(holidayDate);
            const isTodayHoliday = isToday(holidayDate);

            return (
              <div
                key={holiday.id}
                className={`flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl border p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                  isTodayHoliday
                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30 shadow-lg"
                    : isPastHoliday
                    ? "border-gray-100 dark:border-gray-800 opacity-80"
                    : "border-[var(--color-primary)]/35 dark:border-gray-700 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl font-bold border-2 ${
                      isTodayHoliday
                        ? "bg-[var(--color-primary)] text-[#0b1220] border-[var(--color-primary)]"
                        : isPastHoliday
                        ? "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                        : "bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/40"
                    }`}>
                      <span className="text-base leading-none">{format(holidayDate, "d")}</span>
                      <span className="text-[10px] uppercase leading-none mt-1">{format(holidayDate, "MMM")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {format(holidayDate, "EEEE")}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{format(holidayDate, "yyyy")}</p>
                    </div>
                    {isTodayHoliday && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--color-primary)] text-[#0b1220] rounded-full uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-bold mb-4 line-clamp-2 leading-snug ${
                    isTodayHoliday ? "text-gray-900 dark:text-white" : "text-gray-900 dark:text-white"
                  }`}>
                    {holiday.name}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${
                    (holiday.type || "").toLowerCase() === "national"
                      ? "bg-[var(--color-primary-hover)] text-gray-900 border-[var(--color-primary)]/50 dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)] dark:border-[var(--color-primary)]/30"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
                  }`}>
                    <Gift size={10} />
                    {holiday.type || "Holiday"}
                  </span>
                  
                  {holiday.applicableTo === 'location' && holiday.location && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30 uppercase tracking-wider">
                      <Building size={10} />
                      {holiday.location.name}
                    </span>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-3xl border border-[var(--color-primary)]/35 dark:border-gray-700 p-16 text-center shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-300">
                  <Calendar size={48} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No holidays found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    We couldn't find any holidays matching your current filters for {yearFilter}.
                  </p>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setTypeFilter("All");
                      setMonthFilter("All");
                      setYearFilter(new Date().getFullYear());
                    }}
                    className="mt-2 text-sm font-bold text-[var(--color-primary)] hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
