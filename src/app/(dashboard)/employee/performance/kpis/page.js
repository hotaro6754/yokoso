"use client";

import { useState, useMemo, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Search, TrendingUp, X, Target } from "lucide-react";

// --- Hardcoded KPI Data
const initialKPIs = [
  { id: 1, name: "Tasks Completed", value: 45, target: 50, category: "Productivity" },
  { id: 2, name: "Customer Tickets Resolved", value: 30, target: 40, category: "Support" },
  { id: 3, name: "Sales Calls Made", value: 75, target: 100, category: "Sales" },
  { id: 4, name: "Code Reviews Done", value: 20, target: 25, category: "Quality" },
  { id: 5, name: "Team Meetings Attended", value: 10, target: 12, category: "Collaboration" },
];

// --- KPI Filters
function KPIFilters({ searchQuery, setSearchQuery, onClearFilters }) {
  const hasActiveFilters = searchQuery !== "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search KPIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        {hasActiveFilters && (
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            onClick={onClearFilters}
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// --- KPI Card with animated circular progress
function KPICard({ kpi, delay = 0 }) {
  const progress = Math.min((kpi.value / kpi.target) * 100, 100);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedProgress(progress), delay);
    return () => clearTimeout(timeout);
  }, [progress, delay]);

  const strokeColor =
    progress >= 100 ? "#10b981" : progress >= 70 ? "#f59e0b" : "#ef4444";

  const circleStyle = {
    strokeDasharray: 2 * Math.PI * 30,
    strokeDashoffset: 2 * Math.PI * 30 * (1 - animatedProgress / 100),
    transition: "stroke-dashoffset 1.2s ease-out",
  };

  const categoryColors = {
    "Productivity": "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400",
    "Support": "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    "Sales": "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    "Quality": "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    "Collaboration": "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{kpi.name}</h3>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${categoryColors[kpi.category] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}>
          {kpi.category}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="30"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
              className="dark:stroke-gray-700"
            />
            <circle
              cx="40"
              cy="40"
              r="30"
              stroke={strokeColor}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              style={circleStyle}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {Math.round(animatedProgress)}%
            </span>
          </div>
        </div>

        {/* KPI Details */}
        <div className="flex-1">
          <div className="mb-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpi.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              of {kpi.target} target
            </p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${animatedProgress}%`,
                backgroundColor: strokeColor,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main KPI Page
export default function KPIsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Performance", href: "/employee/performance" },
    { label: "KPIs", href: "/employee/performance/kpis" },
  ];

  const filteredKPIs = useMemo(
    () =>
      initialKPIs.filter((kpi) =>
        kpi.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const totalProgress = filteredKPIs.length > 0
    ? Math.round(
        filteredKPIs.reduce((sum, kpi) => sum + (kpi.value / kpi.target) * 100, 0) /
        filteredKPIs.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Progress</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{totalProgress}%</p>
            </div>
            <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <KPIFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClearFilters={() => setSearchQuery("")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKPIs.length > 0 ? (
            filteredKPIs.map((kpi, index) => (
              <KPICard key={kpi.id} kpi={kpi} delay={index * 100} />
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-12 text-center">
              <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No KPIs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
