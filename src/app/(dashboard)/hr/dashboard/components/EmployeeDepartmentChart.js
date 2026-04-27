"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EmployeeDepartmentChart = () => {
  const dataByPeriod = {
    thisWeek: [
      { department: "UI/UX", employees: 80 },
      { department: "Development", employees: 110 },
      { department: "Management", employees: 75 },
      { department: "HR", employees: 20 },
      { department: "Testing", employees: 60 },
      { department: "Marketing", employees: 100 },
    ],
    lastWeek: [
      { department: "UI/UX", employees: 75 },
      { department: "Development", employees: 105 },
      { department: "Management", employees: 70 },
      { department: "HR", employees: 18 },
      { department: "Testing", employees: 55 },
      { department: "Marketing", employees: 95 },
    ],
    thisMonth: [
      { department: "UI/UX", employees: 85 },
      { department: "Development", employees: 115 },
      { department: "Management", employees: 80 },
      { department: "HR", employees: 22 },
      { department: "Testing", employees: 65 },
      { department: "Marketing", employees: 105 },
    ],
  };

  const [selectedPeriod, setSelectedPeriod] = useState("thisWeek");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const labelMap = {
    thisWeek: "This Week",
    lastWeek: "Last Week",
    thisMonth: "This Month",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 
                      flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Employees By Department
        </h5>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg
                       border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {labelMap[selectedPeriod]}
            <svg
              className={`h-3 w-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 z-20
                            bg-white dark:bg-gray-700
                            border border-gray-200 dark:border-gray-600
                            rounded-md shadow-lg">
              {Object.keys(labelMap).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedPeriod(key);
                    setIsDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs transition-colors ${selectedPeriod === key
                      ? "bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                >
                  {labelMap[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <div className="h-56 sm:h-64 md:h-72 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataByPeriod[selectedPeriod]}
              layout={isMobile ? "horizontal" : "vertical"}
              margin={{ top: 5, right: 20, left: isMobile ? -20 : 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {isMobile ? (
                <>
                  <XAxis
                    dataKey="department"
                    type="category"
                    angle={-40}
                    interval={0}
                    height={60}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis type="number" tick={{ fontSize: 10 }} />
                </>
              ) : (
                <>
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} />
                  <YAxis
                    dataKey="department"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={90}
                    axisLine={false}
                  />
                </>
              )}
              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "6px",
                }}
              />
              <Bar
                dataKey="employees"
                fill="hsl(174, 72%, 41%)"
                barSize={isMobile ? 18 : 22}
                radius={[6, 6, 6, 6]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <p className="mt-3 pt-2 text-xs text-gray-600 dark:text-gray-300 
                      border-t border-gray-100 dark:border-gray-700">
          <span className="inline-block w-2 h-2 bg-brand-500 rounded-full mr-1.5" />
          No of Employees increased by{" "}
          <span className="text-brand-600 dark:text-brand-400 font-semibold">+20%</span> from last week
        </p>
      </div>
    </div>
  );
};

export default EmployeeDepartmentChart;
