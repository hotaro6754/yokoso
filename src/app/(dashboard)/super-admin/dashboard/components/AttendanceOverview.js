"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { dashboardService as hrDashboardService } from "@/services/hr-services/dashboard.service";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AttendanceOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snapshot, setSnapshot] = useState({ presentToday: 0, absentToday: 0, lateArrivals: 0, attendanceExceptions: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await hrDashboardService.getAttendanceSnapshot();
        if (!active) return;
        const data = response?.success ? response.data : response?.data || response;
        setSnapshot({
          presentToday: Number(data?.presentToday) || 0,
          absentToday: Number(data?.absentToday) || 0,
          lateArrivals: Number(data?.lateArrivals) || 0,
          attendanceExceptions: Number(data?.attendanceExceptions) || 0
        });
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load attendance snapshot");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (selectedPeriod === "Today") {
      fetchAttendance();
    } else {
      // Keep UI stable for now; backend endpoint currently supports today snapshot
      fetchAttendance();
    }

    return () => {
      active = false;
    };
  }, [selectedPeriod]);

  const totalAttendance = (snapshot.presentToday || 0) + (snapshot.absentToday || 0);
  const pct = (value) => (totalAttendance > 0 ? Math.round((value / totalAttendance) * 100) : 0);

  const chartData = {
    labels: ["Late", "Present", "Permission", "Absent"],
    datasets: [
      {
        data: [pct(snapshot.lateArrivals), pct(snapshot.presentToday), pct(snapshot.attendanceExceptions), pct(snapshot.absentToday)],
        backgroundColor: ["#0f4a63", "var(--color-primary)", "#facc15", "#ef4444"],
        borderWidth: 0,
        borderRadius: 8,
        spacing: 6,
        hoverOffset: 10,
        cutout: "70%",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` } },
    },
  };

  const absentEmployees = [
    "/images/users/user-05.jpg",
    "/images/users/user-06.jpg",
    "/images/users/user-07.jpg",
    "/images/users/user-08.jpg",
    "/images/users/user-09.jpg",
  ];

  const periodOptions = ["Today", "This Week", "This Month"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Attendance Overview
        </h5>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {selectedPeriod}
            <svg className={`h-3 w-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 z-20 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
              {periodOptions.map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    selectedPeriod === period
                      ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-semibold"
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

      <div className="p-3 sm:p-5">
        <div className="relative mx-auto mb-6 h-40 sm:h-48 md:h-52">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Attendance</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{totalAttendance}</h3>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {[
            { label: "Present", color: "bg-blue-600", value: `${pct(snapshot.presentToday)}%` },
            { label: "Late", color: "bg-[#0f4a63]", value: `${pct(snapshot.lateArrivals)}%` },
            { label: "Permission", color: "bg-yellow-500", value: `${pct(snapshot.attendanceExceptions)}%` },
            { label: "Absent", color: "bg-red-500", value: `${pct(snapshot.absentToday)}%` },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="flex items-center text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <span className={`w-3 h-3 rounded-full mr-2 ${item.color}`} />
                {item.label}
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-3 rounded-sm">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Total Absentees</p>
            <div className="flex -space-x-2">
              {absentEmployees.slice(0, 4).map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt="Employee"
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                />
              ))}
              {absentEmployees.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                  +{absentEmployees.length - 4}
                </div>
              )}
            </div>
          </div>

          <Link
            href="/company-admin/users"
            className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {error ? (
        <div className="px-4 pb-4">
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      ) : loading ? (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 dark:text-gray-300">Loading attendance...</p>
        </div>
      ) : null}
    </div>
  );
}

