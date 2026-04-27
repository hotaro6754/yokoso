"use client";

import React, { useState, useEffect } from "react";
import { Users, Star, Clock, CheckCircle, AlertCircle, Eye, Edit, Search, Filter, Briefcase } from "lucide-react";
import Link from "next/link";
import HRMSLoader from "@/components/common/HRMSLoader";

export default function ManagerReviews() {
  const [managerData, setManagerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        // Mock data - in real app, this would come from API
        const mockManagerData = {
          managers: [
            {
              id: 1,
              name: "David Thompson",
              email: "david.thompson@company.com",
              department: "Engineering",
              teamSize: 8,
              appraisalCycle: "Q4 2024",
              status: "Pending Review", // Pending Review, In Progress, Reviewed
              finalScore: null,
              submissionDate: "2024-12-28",
              lastUpdated: "2024-12-28",
              deptHeadRating: null,
              managerSelfRating: 4.2
            },
            {
              id: 2,
              name: "Lisa Anderson",
              email: "lisa.anderson@company.com",
              department: "Engineering",
              teamSize: 6,
              appraisalCycle: "Q4 2024",
              status: "In Progress",
              finalScore: null,
              submissionDate: "2024-12-27",
              lastUpdated: "2024-12-29",
              deptHeadRating: 3.8,
              managerSelfRating: 4.0
            },
            {
              id: 3,
              name: "James Wilson",
              email: "james.wilson@company.com",
              department: "Engineering",
              teamSize: 5,
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              finalScore: 4.1,
              submissionDate: "2024-12-26",
              lastUpdated: "2024-12-30",
              deptHeadRating: 4.1,
              managerSelfRating: 4.3
            },
            {
              id: 4,
              name: "Maria Garcia",
              email: "maria.garcia@company.com",
              department: "Engineering",
              teamSize: 7,
              appraisalCycle: "Q4 2024",
              status: "Pending Review",
              finalScore: null,
              submissionDate: "2024-12-29",
              lastUpdated: "2024-12-29",
              deptHeadRating: null,
              managerSelfRating: 3.9
            },
            {
              id: 5,
              name: "Robert Chen",
              email: "robert.chen@company.com",
              department: "Engineering",
              teamSize: 4,
              appraisalCycle: "Q4 2024",
              status: "Reviewed",
              finalScore: 3.7,
              submissionDate: "2024-12-25",
              lastUpdated: "2024-12-28",
              deptHeadRating: 3.7,
              managerSelfRating: 3.8
            }
          ],
          summary: {
            totalManagers: 5,
            pendingReviews: 2,
            inProgress: 1,
            completed: 2,
            averageScore: 3.9,
            totalTeamMembers: 30
          }
        };
        
        setManagerData(mockManagerData);
      } catch (error) {
        console.error("Failed to fetch manager data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManagerData();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Pending Review": { color: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} /> },
      "In Progress": { color: "bg-blue-100 text-blue-800", icon: <Edit size={14} /> },
      "Reviewed": { color: "bg-green-100 text-green-800", icon: <CheckCircle size={14} /> }
    };
    
    const config = statusConfig[status] || statusConfig["Pending Review"];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (!score) return "text-gray-500";
    if (score >= 4.5) return "text-emerald-600 bg-emerald-50";
    if (score >= 4.0) return "text-green-600 bg-green-50";
    if (score >= 3.5) return "text-blue-600 bg-blue-50";
    if (score >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
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

  const filteredManagers = managerData?.managers?.filter(manager => {
    const matchesSearch = manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manager.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || manager.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return <HRMSLoader text="Loading manager reviews..." variant="fullscreen" size="md" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manager Reviews</h1>
              <p className="text-gray-600 dark:text-gray-400">Review and rate your department managers</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{managerData?.summary?.totalManagers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Managers</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{managerData?.summary?.pendingReviews}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{managerData?.summary?.inProgress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{managerData?.summary?.completed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{managerData?.summary?.totalTeamMembers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Team Members</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="Pending Review">Pending Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Reviewed">Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Managers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Department Managers</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Manager</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Team Size</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Self Rating</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Your Rating</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Final Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Submitted</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
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
                      <div className="text-sm text-gray-600 dark:text-gray-400">{manager.department}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{manager.teamSize}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(manager.status)}
                    </td>
                    <td className="py-4 px-4">
                      {renderStars(manager.managerSelfRating)}
                    </td>
                    <td className="py-4 px-4">
                      {renderStars(manager.deptHeadRating)}
                    </td>
                    <td className="py-4 px-4">
                      {manager.finalScore ? (
                        <span className={`inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full ${getScoreColor(manager.finalScore)}`}>
                          {manager.finalScore}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not Finalized</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{manager.submissionDate}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dept-head/performance/manager-review/${manager.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                        >
                          <Eye size={14} />
                          Review
                        </Link>
                        {manager.status === "Pending Review" && (
                          <Link
                            href={`/dept-head/performance/manager-review/${manager.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                          >
                            <Edit size={14} />
                            Rate
                          </Link>
                        )}
                      </div>
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
