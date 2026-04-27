"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Search, Code, Users, Zap, TrendingUp, X } from "lucide-react";

// --- Hardcoded Skills Data
const initialSkills = [
  { id: 1, name: "React.js", level: 90, category: "Frontend", icon: Code },
  { id: 2, name: "Communication", level: 70, category: "Soft Skill", icon: Users },
  { id: 3, name: "Node.js", level: 80, category: "Backend", icon: Code },
  { id: 4, name: "Team Management", level: 60, category: "Leadership", icon: Users },
  { id: 5, name: "TypeScript", level: 75, category: "Frontend", icon: Zap },
];

// --- Filters Component
function SkillsFilters({ searchQuery, setSearchQuery, onClearFilters }) {
  const hasActiveFilters = searchQuery !== "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
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

// --- Single Skill Card with animated progress bar
function SkillCard({ skill, delay = 0 }) {
  const [animatedLevel, setAnimatedLevel] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedLevel(skill.level), delay);
    return () => clearTimeout(timeout);
  }, [skill.level, delay]);

  const getLevelText = (lvl) => (lvl >= 85 ? "Expert" : lvl >= 65 ? "Intermediate" : "Beginner");

  const progressColor =
    skill.level >= 85
      ? "bg-primary-600 dark:bg-primary-500"
      : skill.level >= 65
      ? "bg-yellow-500 dark:bg-yellow-400"
      : "bg-red-500 dark:bg-red-400";

  const levelBadgeColor =
    skill.level >= 85
      ? "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400"
      : skill.level >= 65
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
      : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";

  const Icon = skill.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{skill.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{skill.category}</p>
          </div>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">{skill.level}%</span>
      </div>

      <div className="mb-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${progressColor}`}
            style={{ width: `${animatedLevel}%` }}
          ></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelBadgeColor}`}>
          {getLevelText(skill.level)}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-3 h-3" />
          Improving
        </div>
      </div>
    </div>
  );
}

// --- Main Skills Page
export default function SkillsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Performance", href: "/employee/performance" },
    { label: "Skills", href: "/employee/performance/skills" },
  ];

  const filteredSkills = useMemo(
    () =>
      initialSkills.filter((skill) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const avgLevel = filteredSkills.length > 0
    ? Math.round(filteredSkills.reduce((sum, skill) => sum + skill.level, 0) / filteredSkills.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Skill Level</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{avgLevel}%</p>
            </div>
            <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <SkillsFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClearFilters={() => setSearchQuery("")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill, index) => (
              <SkillCard key={skill.id} skill={skill} delay={index * 100} />
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-12 text-center">
              <Code className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No skills found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
