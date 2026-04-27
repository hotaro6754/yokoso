"use client";
import React, { useEffect, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { organizationService } from "@/services/hr-services/organization.service";

export default function EmployeeDepartmentChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("thisWeek");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const [dataByPeriod, setDataByPeriod] = useState({
    thisWeek: [],
    lastWeek: [],
    thisMonth: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    let active = true;
    const fetchDepartmentStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await organizationService.getDepartmentStats();
        if (!active) return;
        const departments = response?.data?.departments || [];
        const chartData = departments.map((dept) => ({
          department: dept.name,
          employees: dept.employeeCount ?? 0,
        }));
        setDataByPeriod({
          thisWeek: chartData,
          lastWeek: chartData,
          thisMonth: chartData,
        });
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load department stats");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDepartmentStats();
    return () => {
      active = false;
    };
  }, []);

  const labelMap = { thisWeek: "This Week", lastWeek: "Last Week", thisMonth: "This Month" };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 w-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Employees By Department
        </h5>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {labelMap[selectedPeriod]}
            <svg className={`h-3 w-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 z-20 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
              {Object.keys(labelMap).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedPeriod(key);
                    setIsDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs transition-colors ${
                    selectedPeriod === key
                      ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-semibold"
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
                  <XAxis dataKey="department" type="category" angle={-40} interval={0} height={60} tick={{ fontSize: 10 }} />
                  <YAxis type="number" tick={{ fontSize: 10 }} />
                </>
              ) : (
                <>
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 11 }} width={90} axisLine={false} />
                </>
              )}
              <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "6px" }} />
              <Bar
                dataKey="employees"
                fill="var(--color-primary)"
                barSize={isMobile ? 18 : 22}
                radius={[6, 6, 6, 6]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {error ? (
          <p className="mt-3 pt-2 text-xs text-rose-600 dark:text-rose-400 border-t border-gray-100 dark:border-gray-700">
            {error}
          </p>
        ) : (
          <p className="mt-3 pt-2 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-1.5" />
            {loading ? "Loading department headcount..." : "Department headcount snapshot"}
          </p>
        )}
      </div>
    </div>
  );
}

