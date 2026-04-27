"use client";

import { useState, useMemo, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Search, Target, Calendar, Flag, CheckCircle2, Clock, AlertCircle, X } from "lucide-react";

// --- Hardcoded Goals Data
const initialGoals = [
  { id: 1, name: "Complete Project A", progress: 75, due: "2025-09-30", priority: "High", status: "In Progress" },
  { id: 2, name: "Update Documentation", progress: 100, due: "2025-09-15", priority: "Medium", status: "Completed" },
  { id: 3, name: "Improve Skills in React", progress: 50, due: "2025-10-10", priority: "High", status: "In Progress" },
  { id: 4, name: "Attend Team Workshops", progress: 80, due: "2025-10-05", priority: "Low", status: "In Progress" },
  { id: 5, name: "Prepare Quarterly Report", progress: 30, due: "2025-09-25", priority: "High", status: "Pending" },
  { id: 6, name: "Client Feedback Review", progress: 60, due: "2025-09-28", priority: "Medium", status: "In Progress" },
];

// --- Filters Component
function GoalsFilters({ searchQuery, setSearchQuery, onClearFilters }) {
  const hasActiveFilters = searchQuery !== "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search goals..."
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

// --- Single Goal Card with animated progress bar
function GoalCard({ goal, delay = 0 }) {
  const statusColors = {
    "Completed": "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    "In Progress": "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400",
    "Pending": "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  };

  const priorityColors = {
    High: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    Low: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  };

  const statusIcons = {
    "Completed": CheckCircle2,
    "In Progress": Clock,
    "Pending": AlertCircle,
  };

  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedProgress(goal.progress), delay);
    return () => clearTimeout(timeout);
  }, [goal.progress, delay]);

  const StatusIcon = statusIcons[goal.status] || Clock;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{goal.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[goal.status]}`}>
              <StatusIcon className="w-3 h-3" />
              {goal.status}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${priorityColors[goal.priority]}`}>
              <Flag className="w-3 h-3" />
              {goal.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Due: {goal.due}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{animatedProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
              goal.progress >= 80
                ? "bg-primary-600 dark:bg-primary-500"
                : goal.progress >= 50
                ? "bg-yellow-500 dark:bg-yellow-400"
                : "bg-red-500 dark:bg-red-400"
            }`}
            style={{ width: `${animatedProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// --- Main Goals Page
export default function GoalsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Performance", href: "/employee/performance" },
    { label: "Goals", href: "/employee/performance/goals" },
  ];

  const filteredGoals = useMemo(
    () =>
      initialGoals.filter((goal) =>
        goal.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const stats = {
    total: initialGoals.length,
    completed: initialGoals.filter(g => g.status === "Completed").length,
    inProgress: initialGoals.filter(g => g.status === "In Progress").length,
    pending: initialGoals.filter(g => g.status === "Pending").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        <GoalsFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClearFilters={() => setSearchQuery("")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.length > 0 ? (
            filteredGoals.map((goal, index) => (
              <GoalCard key={goal.id} goal={goal} delay={index * 100} />
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-12 text-center">
              <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No goals found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
