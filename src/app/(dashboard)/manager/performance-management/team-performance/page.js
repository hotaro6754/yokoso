"use client";

import React, { useState, useEffect } from "react";
import { Users, TrendingUp, TrendingDown, Star, Search, Filter, Download, BarChart3 } from "lucide-react";
import HRMSLoader from "@/components/common/HRMSLoader";

export default function TeamPerformance() {
  const [teamData, setTeamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // Mock data - in real app, this would come from API
        const mockTeamData = {
          employees: [
            {
              id: 1,
              name: "Sarah Johnson",
              email: "sarah.johnson@company.com",
              designation: "Product Designer",
              department: "Design",
              currentScore: 4.5,
              previousScore: 4.2,
              trend: "up",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["Creativity", "User Research", "Collaboration"],
              improvements: ["Technical Skills", "Time Management"],
              lastReviewDate: "2024-12-15"
            },
            {
              id: 2,
              name: "Michael Chen",
              email: "michael.chen@company.com",
              designation: "Senior Developer",
              department: "Engineering",
              currentScore: 4.3,
              previousScore: 4.1,
              trend: "up",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["Problem Solving", "Code Quality", "Mentoring"],
              improvements: ["Documentation", "Cross-team Communication"],
              lastReviewDate: "2024-12-14"
            },
            {
              id: 3,
              name: "Emily Davis",
              email: "emily.davis@company.com",
              designation: "QA Engineer",
              department: "Quality",
              currentScore: 3.2,
              previousScore: 3.5,
              trend: "down",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["Attention to Detail", "Test Planning"],
              improvements: ["Automation Skills", "Communication", "Technical Knowledge"],
              lastReviewDate: "2024-12-13"
            },
            {
              id: 4,
              name: "Robert Wilson",
              email: "robert.wilson@company.com",
              designation: "Frontend Developer",
              department: "Engineering",
              currentScore: 3.4,
              previousScore: 3.4,
              trend: "stable",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["UI/UX Implementation", "React Skills"],
              improvements: ["Performance Optimization", "Testing"],
              lastReviewDate: "2024-12-12"
            },
            {
              id: 5,
              name: "John Smith",
              email: "john.smith@company.com",
              designation: "Backend Developer",
              department: "Engineering",
              currentScore: 4.1,
              previousScore: 3.9,
              trend: "up",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["API Design", "Database Skills", "Problem Solving"],
              improvements: ["Code Documentation", "Team Collaboration"],
              lastReviewDate: "2024-12-11"
            }
          ],
          summary: {
            totalEmployees: 5,
            averageScore: 3.9,
            highPerformers: 2,
            lowPerformers: 1,
            improvedEmployees: 3,
            declinedEmployees: 1
          }
        };

        setTeamData(mockTeamData);
      } catch (error) {
        console.error("Failed to fetch team performance data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 4.5) return "text-emerald-600 bg-emerald-50";
    if (score >= 4.0) return "text-green-600 bg-green-50";
    if (score >= 3.5) return "text-blue-600 bg-blue-50";
    if (score >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp size={16} className="text-green-600" />;
      case "down":
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const renderStars = (score) => {
    if (!score) return <span className="text-gray-400 text-sm">Not Rated</span>;

    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={14} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star size={14} className="fill-yellow-200 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-gray-300" />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">{score}</span>
      </div>
    );
  };

  const sortedEmployees = teamData?.employees?.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) || [];

  const filteredEmployees = sortedEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return <HRMSLoader text="Loading team performance..." variant="fullscreen" size="md" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Performance</h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive team performance analytics</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{teamData?.summary?.totalEmployees}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Team</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{teamData?.summary?.averageScore}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{teamData?.summary?.highPerformers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High Performers</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamData?.summary?.improvedEmployees}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Improved</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{teamData?.summary?.lowPerformers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Needs Support</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="currentScore">Sort by Score</option>
                <option value="designation">Sort by Designation</option>
                <option value="department">Sort by Department</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Performance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Performance Overview</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
                <tr className="border-b border-secondary-100 dark:border-secondary-800">
                  <th className="text-left py-3 px-4 text-sm font-medium cursor-pointer" onClick={() => handleSort('name')}>
                    Employee {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Designation</th>
                  <th className="text-left py-3 px-4 text-sm font-medium cursor-pointer" onClick={() => handleSort('currentScore')}>
                    Current Score {sortBy === 'currentScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Previous Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Trend</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Strengths</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Improvements</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Last Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{employee.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{employee.designation}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full ${getScoreColor(employee.currentScore)}`}>
                        {employee.currentScore}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full ${getScoreColor(employee.previousScore)}`}>
                        {employee.previousScore}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(employee.trend)}
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{employee.trend}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {employee.strengths.slice(0, 2).map((strength, index) => (
                          <span key={index} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full">
                            {strength}
                          </span>
                        ))}
                        {employee.strengths.length > 2 && (
                          <span className="text-xs text-gray-500">+{employee.strengths.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {employee.improvements.slice(0, 2).map((improvement, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                            {improvement}
                          </span>
                        ))}
                        {employee.improvements.length > 2 && (
                          <span className="text-xs text-gray-500">+{employee.improvements.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{employee.lastReviewDate}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Users size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">No team members found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
