"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Target, TrendingUp, AlertCircle, Eye, BarChart3, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { deptHeadPerformanceService } from "@/services/dept-head-services/performance.service";
import { deptHeadTeamService } from "@/services/dept-head-services/team.service";

export default function PerformanceOverviewPage() {
  const [performanceData, setPerformanceData] = useState({
    teamGoals: [],
    overdueReviews: [],
    teamRatings: [],
    lowPerformers: []
  });
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState([]);
  const [managerId, setManagerId] = useState("");
  const [loadingManagers, setLoadingManagers] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, [managerId]);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const params = managerId ? { managerId } : {};
      const response = await deptHeadPerformanceService.getOverview(params);
      setPerformanceData(response?.data || response || {});
    } catch (error) {
      console.error("Failed to fetch performance overview", error);
      toast.error("Failed to load performance overview");
      setPerformanceData({
        teamGoals: [],
        overdueReviews: [],
        teamRatings: [],
        lowPerformers: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      setLoadingManagers(true);
      const response = await deptHeadTeamService.getManagers();
      setManagers(response?.data || response || []);
    } catch (error) {
      console.error("Failed to fetch managers", error);
      toast.error("Failed to load managers");
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      ON_TRACK: { label: "On Track", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
      AT_RISK: { label: "At Risk", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
      COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
    };
    const statusInfo = statusMap[status] || statusMap.IN_PROGRESS;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Department Head", href: "/dept-head" },
            { label: "Performance Overview", href: "/dept-head/performance" },
          ]}
        />

        {/* Header Section */}
        <div className="mb-8 mt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Overview</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Monitor department performance (View Only)
                </p>
              </div>
            </div>
            <div className="w-full lg:w-72">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Filter by Manager
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                disabled={loadingManagers}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
              >
                <option value="">{loadingManagers ? "Loading managers..." : "All Managers"}</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name || manager.employeeId}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team Goals */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Goals</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Goal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading goals...
                      </td>
                    </tr>
                  ) : performanceData.teamGoals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No goals found
                      </td>
                    </tr>
                  ) : (
                    performanceData.teamGoals.map((goal) => (
                    <tr key={goal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {goal.employeeName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {goal.goalTitle}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[120px]">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">
                            {goal.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(goal.status)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Overdue Reviews */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overdue Performance Reviews</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {loading ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading overdue reviews...</p>
              </div>
            ) : performanceData.overdueReviews.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No overdue reviews</p>
              </div>
            ) : (
              <div className="space-y-3">
                {performanceData.overdueReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{review.employeeName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {review.reviewCycle} - Due: {new Date(review.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
                      {review.daysOverdue} days overdue
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Ratings */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Ratings</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Review Cycle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading ratings...
                      </td>
                    </tr>
                  ) : performanceData.teamRatings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No ratings found
                      </td>
                    </tr>
                  ) : (
                    performanceData.teamRatings.map((rating) => (
                    <tr key={rating.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {rating.employeeName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {rating.rating}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ 5.0</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <TrendingUp
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(rating.rating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {rating.reviewCycle}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Performance Flags */}
        {!loading && performanceData.lowPerformers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Low Performance Flags (View Only)</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-3">
                {performanceData.lowPerformers.map((performer) => (
                  <div
                    key={performer.id}
                    className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{performer.employeeName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Rating: {performer.rating}/5.0 - {performer.flag}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-sm font-semibold">
                      Flagged
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
