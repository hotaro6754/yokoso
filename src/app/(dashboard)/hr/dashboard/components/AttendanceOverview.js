"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users, ChevronDown } from "lucide-react";

const AttendanceOverview = ({ snapshot, absentees = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presentToday = snapshot?.presentToday ?? 0;
  const absentToday = snapshot?.absentToday ?? 0;
  const lateArrivals = snapshot?.lateArrivals ?? 0;
  const permissionCount = 0;
  const presentOnTime = Math.max(presentToday - lateArrivals, 0);
  const totalAttendance = presentToday + absentToday + permissionCount; // Total expected

  const data = [
    { name: "Present", value: presentOnTime, color: "#10b981" }, // Emerald 500
    { name: "Late", value: lateArrivals, color: "#0f4a63" }, // Custom Dark Blue
    { name: "Permission", value: permissionCount, color: "#eab308" }, // Yellow 500
    { name: "Absent", value: absentToday, color: "#ef4444" }, // Red 500
  ];

  // Filter out zero values for the chart segments to avoid clutter, but keep them in the legend
  const activeData = data.filter(d => d.value > 0);

  const absenteesList = Array.isArray(absentees) ? absentees : [];
  const getInitials = (name = "") => {
    const parts = String(name).trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const periodOptions = ["Today", "This Week", "This Month"];

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          Attendance Overview
        </h3>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md 
                       border border-gray-200 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {selectedPeriod}
            <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 z-20 bg-white dark:bg-gray-700 
                            border border-gray-200 dark:border-gray-600 
                            rounded-md shadow-lg py-1">
              {periodOptions.map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${selectedPeriod === period
                      ? "bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Chart Section */}
        <div className="flex items-center justify-center py-2">
          <div className="w-[160px] h-[160px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data} // Use full data to ensure colors match index if needed, or activeData
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalAttendance}
              </span>
              <span className="text-[10px] text-gray-400 uppercase font-medium">Total</span>
            </div>
          </div>
        </div>

        {/* Legend / Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 mb-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Footer: Absentees */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Absentees
              </span>
              <div className="flex -space-x-2">
                {absenteesList.slice(0, 3).map((employee, index) => {
                  const avatar = employee?.avatar || employee?.profileImage || employee?.image;
                  const label = employee?.name || employee?.fullName || employee?.employeeName || "Employee";
                  return avatar ? (
                    <img
                      key={index}
                      src={avatar}
                      alt={label}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                    />
                  ) : (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 
                                 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 
                                 text-[10px] flex items-center justify-center font-semibold"
                      title={label}
                    >
                      {getInitials(label)}
                    </div>
                  );
                })}
                {absenteesList.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 
                                  bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 
                                  text-[10px] flex items-center justify-center font-semibold">
                    +{absenteesList.length - 3}
                  </div>
                )}
                {absenteesList.length === 0 && absentToday > 0 && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {absentToday} absent
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/hr/attendance"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 whitespace-nowrap"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceOverview;
