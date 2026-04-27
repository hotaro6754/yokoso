"use client";

import React, { useState, useEffect } from "react";
import { Users, TrendingUp, TrendingDown, Star, Search, Filter, Download, BarChart3, Briefcase, Award } from "lucide-react";
import HRMSLoader from "@/components/common/HRMSLoader";
import { toast } from "react-hot-toast";

export default function DepartmentPerformance() {
  const [departmentData, setDepartmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        // Mock data - in real app, this would come from API
        const mockDepartmentData = {
          managers: [
            {
              id: 1,
              name: "David Thompson",
              email: "david.thompson@company.com",
              department: "Engineering",
              designation: "Engineering Manager",
              teamSize: 8,
              currentScore: 4.5,
              previousScore: 4.2,
              trend: "up",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["Leadership", "Project Delivery", "Team Development"],
              improvements: ["Strategic Planning", "Cross-department Collaboration"],
              lastReviewDate: "2024-12-15"
            },
            {
              id: 2,
              name: "Lisa Anderson",
              email: "lisa.anderson@company.com",
              department: "Engineering",
              designation: "Product Manager",
              teamSize: 6,
              currentScore: 4.3,
              previousScore: 4.1,
              trend: "up",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["Product Strategy", "Stakeholder Management", "Innovation"],
              improvements: ["Technical Knowledge", "Team Mentoring"],
              lastReviewDate: "2024-12-14"
            },
            {
              id: 3,
              name: "James Wilson",
              email: "james.wilson@company.com",
              department: "Engineering",
              designation: "QA Manager",
              teamSize: 5,
              currentScore: 3.8,
              previousScore: 3.5,
              trend: "up",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["Quality Standards", "Process Improvement", "Attention to Detail"],
              improvements: ["Team Leadership", "Communication"],
              lastReviewDate: "2024-12-13"
            },
            {
              id: 4,
              name: "Maria Garcia",
              email: "maria.garcia@company.com",
              department: "Engineering",
              designation: "DevOps Manager",
              teamSize: 4,
              currentScore: 4.1,
              previousScore: 4.1,
              trend: "stable",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["Infrastructure Management", "Automation", "Problem Solving"],
              improvements: ["Documentation", "Team Building"],
              lastReviewDate: "2024-12-12"
            },
            {
              id: 5,
              name: "Robert Chen",
              email: "robert.chen@company.com",
              department: "Engineering",
              designation: "Technical Lead",
              teamSize: 7,
              currentScore: 3.9,
              previousScore: 3.7,
              trend: "up",
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              strengths: ["Technical Expertise", "Code Quality", "Mentoring"],
              improvements: ["Project Management", "Client Communication"],
              lastReviewDate: "2024-12-11"
            }
          ],
          summary: {
            totalManagers: 5,
            averageScore: 4.1,
            topPerformers: 2,
            needsImprovement: 0,
            improvedManagers: 4,
            stableManagers: 1,
            totalTeamMembers: 30,
            departmentName: "Engineering"
          }
        };
        
        setDepartmentData(mockDepartmentData);
      } catch (error) {
        console.error("Failed to fetch department performance data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
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

  const sortedManagers = departmentData?.managers?.sort((a, b) => {
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

  const filteredManagers = sortedManagers.filter(manager => 
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";
    const stringValue = Array.isArray(value) ? value.join(", ") : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const rows = [
        [
          "Manager",
          "Email",
          "Department",
          "Designation",
          "Team Size",
          "Current Score",
          "Previous Score",
          "Trend",
          "Appraisal Cycle",
          "Status",
          "Strengths",
          "Improvements",
          "Last Review Date",
        ],
        ...filteredManagers.map((manager) => [
          manager.name,
          manager.email,
          manager.department,
          manager.designation,
          manager.teamSize,
          manager.currentScore,
          manager.previousScore,
          manager.trend,
          manager.appraisalCycle,
          manager.status,
          manager.strengths,
          manager.improvements,
          manager.lastReviewDate,
        ]),
      ];

      const csvContent = rows
        .map((row) => row.map(escapeCsvValue).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `department-performance-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Department performance report exported");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <HRMSLoader text="Loading department performance..." variant="fullscreen" size="md" />;
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Department Performance</h1>
              <p className="text-gray-600 dark:text-gray-400">{departmentData?.summary?.departmentName} department analytics</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{departmentData?.summary?.totalManagers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Managers</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{departmentData?.summary?.averageScore}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{departmentData?.summary?.topPerformers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Top Performers</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{departmentData?.summary?.improvedManagers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Improved</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{departmentData?.summary?.stableManagers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stable</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{departmentData?.summary?.totalTeamMembers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
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
                <option value="teamSize">Sort by Team Size</option>
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manager Performance Overview</h2>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              {isExporting ? "Exporting..." : "Export Report"}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer" onClick={() => handleSort('name')}>
                    Manager {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Designation</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Team Size</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer" onClick={() => handleSort('currentScore')}>
                    Current Score {sortBy === 'currentScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Previous Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Trend</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Strengths</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Improvements</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Last Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredManagers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{manager.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{manager.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{manager.designation}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{manager.teamSize}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full ${getScoreColor(manager.currentScore)}`}>
                        {manager.currentScore}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full ${getScoreColor(manager.previousScore)}`}>
                        {manager.previousScore}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(manager.trend)}
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{manager.trend}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {manager.strengths.slice(0, 2).map((strength, index) => (
                          <span key={index} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full">
                            {strength}
                          </span>
                        ))}
                        {manager.strengths.length > 2 && (
                          <span className="text-xs text-gray-500">+{manager.strengths.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {manager.improvements.slice(0, 2).map((improvement, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                            {improvement}
                          </span>
                        ))}
                        {manager.improvements.length > 2 && (
                          <span className="text-xs text-gray-500">+{manager.improvements.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{manager.lastReviewDate}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredManagers.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Briefcase size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">No managers found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
