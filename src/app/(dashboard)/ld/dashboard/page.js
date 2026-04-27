"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import TrainingOverview from "./components/TrainingOverview";
import EmployeeLearningStatus from "./components/EmployeeLearningStatus";
import UpcomingActivities from "./components/UpcomingActivities";
import SkillsCoverageSnapshot from "./components/SkillsCoverageSnapshot";
import { BookOpen, Users, Calendar, Brain, Award, TrendingUp, Target, Filter } from "lucide-react";
import Link from "next/link";
import DashboardPunchWidget from "@/components/dashboard/DashboardPunchWidget";

export default function LDDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [filters, setFilters] = useState({
    cycle: "Q4 2024",
    department: ""
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const stats = await ldService.getDashboardStats();
      setDashboardStats(stats.data || stats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      // Set mock data for development
      setDashboardStats({
        totalActiveCourses: 0,
        mandatoryTrainings: 0,
        trainingsInProgress: 0,
        employeesEnrolled: 0,
        employeesCompleted: 0,
        overdueTrainings: 0,
        scheduledSessions: 0,
        certificationDeadlines: 0,
        keySkillsTracked: 0,
        skillGaps: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "L&D", href: "/ld" },
          { label: "Dashboard", href: "/ld/dashboard" },
        ]}
      />

      <div className="mb-6">
        <DashboardPunchWidget />
      </div>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              L&D Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Organizational learning and talent readiness overview
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/ld/courses"
              className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.totalActiveCourses || 0}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 dark:bg-primary-500/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </Link>

            <Link
              href="/ld/progress/employee"
              className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.trainingsInProgress || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Link>

            <Link
              href="/ld/progress/course"
              className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.employeesCompleted || 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </Link>

            <Link
              href="/ld/skills"
              className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skill Gaps</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.skillGaps || 0}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                  <Brain className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </Link>
          </div>

          {/* Learning Analytics Charts Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Learning Analytics Overview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filters.cycle}
                  onChange={(e) => setFilters({ ...filters, cycle: e.target.value })}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Q4 2024</option>
                  <option>Q3 2024</option>
                  <option>Q2 2024</option>
                </select>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Sales</option>
                  <option>Marketing</option>
                  <option>HR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Certification Completion Donut Chart */}
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Certification Completion
                </h4>
                <div className="flex justify-center items-center gap-4">
                  <div className="w-20 h-20 relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.65)}`}
                        className="text-emerald-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">65%</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">Completed: 85</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">Pending: 45</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Gap Bar Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Skill Gaps by Category
                </h4>
                <div className="space-y-2">
                  {[
                    { category: "Technical Skills", count: 45, color: "bg-red-500" },
                    { category: "Communication", count: 32, color: "bg-orange-500" },
                    { category: "Leadership", count: 28, color: "bg-yellow-500" },
                    { category: "Project Mgmt", count: 22, color: "bg-blue-500" },
                    { category: "Domain Knowledge", count: 18, color: "bg-purple-500" },
                  ].map((skill) => (
                    <div key={skill.category} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{skill.category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${skill.color}`}
                            style={{ width: `${(skill.count / 50) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{skill.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Assignment Trend Line */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Training Assignment Trend
                </h4>
                <div className="space-y-3">
                  {[
                    { cycle: "Q1 2024", assignments: 120, trend: "up" },
                    { cycle: "Q2 2024", assignments: 145, trend: "up" },
                    { cycle: "Q3 2024", assignments: 165, trend: "up" },
                    { cycle: "Q4 2024", assignments: 185, trend: "up" },
                  ].map((data) => (
                    <div key={data.cycle} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{data.cycle}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary-500"
                            style={{ width: `${(data.assignments / 200) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{data.assignments}</span>
                        <TrendingUp size={12} className="text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Training Overview */}
            <TrainingOverview />

            {/* Employee Learning Status */}
            <EmployeeLearningStatus />
          </div>

          {/* Upcoming Activities and Skills Coverage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Activities */}
            <UpcomingActivities />

            {/* Skills Coverage Snapshot */}
            <SkillsCoverageSnapshot />
          </div>
        </div>
      )}
    </div>
  );
}
