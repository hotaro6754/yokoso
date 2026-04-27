// src/app/(dashboard)/employee/attendance/holidays/page.js
"use client";

import { useState, useMemo, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import BreadcrumbRightContent from "../components/BreadcrumbRightContent";
import { Calendar, Search, Filter, X, Gift } from "lucide-react";
import EmployeeHolidayService from "@/services/employee/holiday.service";

// --- Filters component
function HolidayFilters({ monthFilter, setMonthFilter, typeFilter, setTypeFilter, searchQuery, setSearchQuery, onClearFilters }) {
  const months = ["All","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const types = ["All","National","Religious","Regional","Company"];
  const hasActiveFilters = monthFilter !== "All" || typeFilter !== "All" || searchQuery !== "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-primary-100/50 dark:border-gray-700 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 w-full lg:w-auto min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search holidays..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-initial min-w-[120px]">
            <select
              className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
            >
              {months.map(m => <option key={m} value={m}>{m === "All" ? "All Months" : m}</option>)}
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 lg:flex-initial min-w-[140px]">
            <select
              className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              {types.map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {hasActiveFilters && (
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
              onClick={onClearFilters}
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Holidays Page
export default function Holidays() {
  const [monthFilter, setMonthFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [holidayData, setHolidayData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const year = selectedDate.getFullYear();
        const response = await EmployeeHolidayService.getHolidays({ year });
        setHolidayData(response.data || []);
      } catch (error) {
        console.error("Failed to fetch holidays", error);
        setHolidayData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [selectedDate]);

  const filteredData = useMemo(() => holidayData.filter(h => {
    const monthMatch = monthFilter === "All" || new Date(h.date).toLocaleString("default", { month: "short" }) === monthFilter;
    const typeLabel = h.type ? `${h.type.charAt(0).toUpperCase()}${h.type.slice(1)}` : "";
    const typeMatch = typeFilter === "All" || typeLabel === typeFilter;
    const searchMatch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
    return monthMatch && typeMatch && searchMatch;
  }), [holidayData, monthFilter, typeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          customTitle="Holidays"
          subtitle="Check upcoming holidays and plan your time off"
          rightContent={<BreadcrumbRightContent selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
        />

        <HolidayFilters
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClearFilters={() => { setMonthFilter("All"); setTypeFilter("All"); setSearchQuery(""); }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 animate-pulse"></div>
            ))
          ) : filteredData.length > 0 ? filteredData.map(holiday => (
            <div
              key={holiday.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Date Badge */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-semibold border border-primary-200/50 dark:border-primary-500/20">
                  <span className="text-lg leading-tight">{new Date(holiday.date).toLocaleDateString("default", { day: "2-digit" })}</span>
                  <span className="text-[10px] uppercase leading-tight">{new Date(holiday.date).toLocaleDateString("default", { month: "short" })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(holiday.date).toLocaleDateString("default", { weekday: "long" })}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(holiday.date).toLocaleDateString("default", { year: "numeric" })}</p>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">{holiday.name}</h3>

              {/* Tag */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                (holiday.type || '').toLowerCase() === "national"
                  ? "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-500/10 dark:text-primary-400 dark:border-primary-500/30"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
              }`}>
                <Gift size={12} />
                {holiday.type ? `${holiday.type.charAt(0).toUpperCase()}${holiday.type.slice(1)}` : "Holiday"}
              </span>
            </div>
          )) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Calendar size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No holidays found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
