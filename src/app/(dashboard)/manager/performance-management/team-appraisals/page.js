"use client";

import React, { useState, useEffect } from "react";
import { Users, Star, Clock, CheckCircle, AlertCircle, Eye, Edit, Search, Filter, FileText } from "lucide-react";
import Link from "next/link";
import HRMSLoader from "@/components/common/HRMSLoader";
import { managerPerformanceService } from "@/services/manager/performance.service";
import { toast } from "react-hot-toast";

export default function TeamAppraisals() {
  const [teamData, setTeamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const data = await managerPerformanceService.getTeamAppraisals({
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm || undefined
        });
        setTeamData(data);
      } catch (error) {
        console.error("Failed to fetch team appraisals:", error);
        toast.error(error.message || "Failed to load team appraisals");
        setTeamData({ employees: [], stats: {} });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [statusFilter, searchTerm]);

  // Filter employees based on search term
  const filteredEmployees = teamData?.employees?.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      NOT_STARTED: { color: "gray", icon: Clock, text: "Not Started" },
      PENDING: { color: "yellow", icon: Clock, text: "Pending" },
      IN_PROGRESS: { color: "blue", icon: AlertCircle, text: "In Progress" },
      PENDING_MANAGER_REVIEW: { color: "orange", icon: Clock, text: "Pending Review" },
      COMPLETED: { color: "green", icon: CheckCircle, text: "Completed" },
      REVIEWED: { color: "green", icon: CheckCircle, text: "Reviewed" },
      SUBMITTED: { color: "purple", icon: FileText, text: "Submitted" }
    };

    const config = statusConfig[status] || statusConfig.NOT_STARTED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/20 dark:text-${config.color}-300`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingStars = (rating) => {
    if (!rating) return <span className="text-gray-400">Not Rated</span>;

    // Convert enum to numeric if needed
    let numericRating = rating;
    if (typeof rating === 'string') {
      switch (rating) {
        case 'EXCEEDS_EXPECTATIONS': numericRating = 5; break;
        case 'MEETS_EXPECTATIONS': numericRating = 4; break;
        case 'NEEDS_IMPROVEMENT': numericRating = 3; break;
        case 'UNSATISFACTORY': numericRating = 2; break;
        default: numericRating = 3; break;
      }
    }

    // Ensure we have a number
    numericRating = parseInt(numericRating) || 3;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= numericRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{numericRating.toFixed(1)}</span>
      </div>
    );
  };

  if (isLoading) {
    return <HRMSLoader text="Loading team appraisals..." variant="fullscreen" size="md" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Team Appraisals</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and review your team's performance appraisals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-primary-600" size={24} />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredEmployees.length}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {teamData?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Team</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamData.stats.totalEmployees || 0}</p>
                </div>
                <Users className="text-blue-500" size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Not Started</p>
                  <p className="text-2xl font-bold text-gray-600">{teamData.stats.notStarted || 0}</p>
                </div>
                <Clock className="text-gray-500" size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{teamData.stats.pendingReviews || 0}</p>
                </div>
                <Clock className="text-yellow-500" size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{teamData.stats.inProgress || 0}</p>
                </div>
                <Edit className="text-blue-500" size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{teamData.stats.completed || 0}</p>
                </div>
                <CheckCircle className="text-green-500" size={20} />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="PENDING_MANAGER_REVIEW">Pending Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="SUBMITTED">Submitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team Appraisals Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100 border-b border-primary-100 dark:border-primary-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Appraisal Cycle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Self Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Manager Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={48} className="text-gray-300 dark:text-gray-600" />
                        <p className="text-lg font-medium">No team appraisals found</p>
                        <p className="text-sm">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Your team hasn't submitted any appraisals yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {employee.designation}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {employee.appraisalCycle || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(employee.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRatingStars(employee.employeeSelfRating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRatingStars(employee.managerRating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(employee.submissionDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {employee.appraisalId ? (
                            <>
                              <Link
                                href={`/manager/performance-management/team-appraisals/${employee.appraisalId}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                <Eye size={14} />
                                View
                              </Link>
                              {employee.status === "PENDING_MANAGER_REVIEW" && (
                                <Link
                                  href={`/manager/performance-management/team-appraisals/${employee.appraisalId}/review`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                >
                                  <Edit size={14} />
                                  Review
                                </Link>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Not Started
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
