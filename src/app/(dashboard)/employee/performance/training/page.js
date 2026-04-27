"use client";

import { useState, useMemo } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Search, BookOpen, Calendar, Clock, Award, X, PlayCircle, CheckCircle2 } from "lucide-react";

// --- Hardcoded Training Data
const initialTrainings = [
  { 
    id: 1, 
    name: "Advanced React Patterns", 
    category: "Frontend", 
    duration: "8 hours",
    status: "Completed",
    completedDate: "2025-08-15",
    progress: 100
  },
  { 
    id: 2, 
    name: "Node.js Best Practices", 
    category: "Backend", 
    duration: "6 hours",
    status: "In Progress",
    completedDate: null,
    progress: 65
  },
  { 
    id: 3, 
    name: "Leadership Skills Workshop", 
    category: "Soft Skills", 
    duration: "4 hours",
    status: "Pending",
    completedDate: null,
    progress: 0
  },
  { 
    id: 4, 
    name: "TypeScript Fundamentals", 
    category: "Frontend", 
    duration: "5 hours",
    status: "Completed",
    completedDate: "2025-07-20",
    progress: 100
  },
  { 
    id: 5, 
    name: "Agile Methodology", 
    category: "Project Management", 
    duration: "10 hours",
    status: "In Progress",
    completedDate: null,
    progress: 40
  },
];

// --- Filters Component
function TrainingFilters({ searchQuery, setSearchQuery, onClearFilters }) {
  const hasActiveFilters = searchQuery !== "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search trainings..."
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

// --- Training Card
function TrainingCard({ training, delay = 0 }) {
  const statusColors = {
    "Completed": "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    "In Progress": "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400",
    "Pending": "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  };

  const statusIcons = {
    "Completed": CheckCircle2,
    "In Progress": PlayCircle,
    "Pending": Clock,
  };

  const StatusIcon = statusIcons[training.status] || Clock;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{training.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{training.category}</p>
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[training.status]}`}>
          <StatusIcon className="w-3 h-3" />
          {training.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {training.duration}
          </div>
          {training.completedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {training.completedDate}
            </div>
          )}
        </div>

        {training.status !== "Pending" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{training.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                  training.progress >= 80
                    ? "bg-primary-600 dark:bg-primary-500"
                    : training.progress >= 50
                    ? "bg-yellow-500 dark:bg-yellow-400"
                    : "bg-red-500 dark:bg-red-400"
                }`}
                style={{ width: `${training.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {training.status === "Completed" && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Award className="w-4 h-4" />
            Certificate Available
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Training Page
export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Performance", href: "/employee/performance" },
    { label: "Training", href: "/employee/performance/training" },
  ];

  const filteredTrainings = useMemo(
    () =>
      initialTrainings.filter((training) =>
        training.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const stats = {
    total: initialTrainings.length,
    completed: initialTrainings.filter(t => t.status === "Completed").length,
    inProgress: initialTrainings.filter(t => t.status === "In Progress").length,
    pending: initialTrainings.filter(t => t.status === "Pending").length,
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Trainings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
                <PlayCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        <TrainingFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClearFilters={() => setSearchQuery("")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.length > 0 ? (
            filteredTrainings.map((training, index) => (
              <TrainingCard key={training.id} training={training} delay={index * 100} />
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No trainings found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
