"use client";
import React, { useEffect, useMemo, useState } from "react";
import { reportsAnalyticsService } from "@/services/hr-services/reports-analytics.service";

export default function EmployeeStatusWidget() {
  const [period, setPeriod] = useState("This Week");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [headcountSummary, setHeadcountSummary] = useState({ total: 0, byStatus: {} });

  useEffect(() => {
    let active = true;
    const fetchHeadcount = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await reportsAnalyticsService.getHeadcountReport();
        if (!active) return;
        const report = response?.success ? response.data : response?.data || response;
        setHeadcountSummary(report?.summary || { total: 0, byStatus: {} });
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load headcount summary");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchHeadcount();
    return () => {
      active = false;
    };
  }, []);

  const total = headcountSummary?.total || 0;
  const breakdown = useMemo(() => {
    const colors = ["bg-blue-600", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-purple-500", "bg-cyan-500"];
    const entries = Object.entries(headcountSummary?.byStatus || {});
    if (!entries.length) return [];
    return entries.map(([status, value], index) => {
      const safeValue = Number(value) || 0;
      return {
        label: status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        value: safeValue,
        pct: total > 0 ? safeValue / total : 0,
        color: colors[index % colors.length]
      };
    });
  }, [headcountSummary, total]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 w-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Employee Status
        </h5>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {period}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-2">
          <span>Total Employee</span>
          <span className="font-bold text-gray-900 dark:text-white">{total}</span>
        </div>

        {/* Segmented bar */}
        <div className="w-full h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4 flex">
          {breakdown.length ? (
            breakdown.map((b) => (
              <div key={b.label} className={`${b.color}`} style={{ width: `${Math.max(2, b.pct * 100)}%` }} />
            ))
          ) : (
            <div className="w-full bg-gray-200 dark:bg-gray-600" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {breakdown.map((b) => (
            <div key={b.label} className="rounded-sm border border-gray-100 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <span className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
                  {b.label} ({Math.round(b.pct * 100)}%)
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{b.value}</div>
              </div>
            </div>
          ))}
        </div>

        {error ? (
          <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">{error}</p>
        ) : loading ? (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Loading employee status...</p>
        ) : null}

        <div className="mt-4 rounded-sm bg-gray-50 dark:bg-gray-700 p-3">
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Top Performer</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/images/users/user-10.jpg" alt="Top performer" className="w-9 h-9 rounded-full object-cover" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">Daniel Esbella</div>
                <div className="text-xs text-gray-500 dark:text-gray-300 truncate">iOS Developer</div>
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              Performance <span className="text-blue-700 dark:text-blue-400">99%</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setPeriod((p) => (p === "This Week" ? "This Month" : "This Week"))}
          className="mt-4 w-full px-3 py-2 text-xs font-semibold rounded-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
        >
          View All Employees
        </button>
      </div>
    </div>
  );
}

