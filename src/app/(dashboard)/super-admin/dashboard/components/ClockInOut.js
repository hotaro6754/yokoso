"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Circle } from "lucide-react";

export default function ClockInOut() {
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [dateFilter, setDateFilter] = useState("Today");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const deptDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

  const employees = [
    { id: 1, name: "Daniel Esbella", position: "UI/UX Designer", avatar: "/images/users/user-10.jpg", status: "on-time", time: "09:15", timestamp: "2023-10-15T09:15:00" },
    { id: 2, name: "Doglas Martini", position: "Project Manager", avatar: "/images/users/user-05.jpg", status: "on-time", time: "09:36", timestamp: "2023-10-15T09:36:00" },
    { id: 3, name: "Brian Villalobos", position: "PHP Developer", avatar: "/images/users/user-06.jpg", status: "on-time", time: "09:15", timestamp: "2023-10-15T09:15:00" },
    { id: 4, name: "Anthony Lewis", position: "Marketing Head", avatar: "/images/users/user-07.jpg", status: "late", lateBy: "30 Min", time: "08:35", timestamp: "2023-10-15T08:35:00" },
  ];

  const departmentOptions = ["All Departments", "Finance", "Development", "Marketing"];
  const dateOptions = ["Today", "This Week", "This Month"];

  useEffect(() => {
    const handler = (e) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) setIsDeptDropdownOpen(false);
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) setIsDateDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onTimeEmployees = employees
    .filter((e) => e.status !== "late")
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  const lateEmployees = employees
    .filter((e) => e.status === "late")
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 1);

  const Dropdown = ({ value, options, open, setOpen, onSelect, refEl, width = "w-40", icon }) => (
    <div className="relative" ref={refEl}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
      >
        {icon}
        <span className="truncate max-w-[90px]">{value}</span>
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`absolute right-0 mt-1 ${width} z-20 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg`}>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-xs transition-colors ${
                value === opt
                  ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-5 h-full w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-gray-700">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Clock-In / Out
        </h5>

        <div className="flex items-center gap-2">
          <Dropdown
            value={departmentFilter}
            options={departmentOptions}
            open={isDeptDropdownOpen}
            setOpen={setIsDeptDropdownOpen}
            onSelect={setDepartmentFilter}
            refEl={deptDropdownRef}
            icon={
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857" />
              </svg>
            }
          />

          <Dropdown
            value={dateFilter}
            options={dateOptions}
            open={isDateDropdownOpen}
            setOpen={setIsDateDropdownOpen}
            onSelect={setDateFilter}
            refEl={dateDropdownRef}
            width="w-32"
            icon={
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10" />
              </svg>
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        {onTimeEmployees.map((e) => (
          <div key={e.id} className="p-3 rounded-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Image src={e.avatar} alt={e.name} width={40} height={40} className="rounded-full object-cover border" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.name}</p>
                  <p className="text-xs text-gray-500 truncate">{e.position}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                <Circle size={10} className="fill-current" />
                {e.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lateEmployees.length > 0 && (
        <>
          <h6 className="mt-4 mb-2 text-sm font-medium">Late</h6>
          {lateEmployees.map((e) => (
            <div key={e.id} className="p-3 rounded-sm border border-dashed border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Image src={e.avatar} alt={e.name} width={40} height={40} className="rounded-full object-cover border" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {e.name}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        {e.lateBy}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 truncate">{e.position}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-orange-700">{e.time}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

