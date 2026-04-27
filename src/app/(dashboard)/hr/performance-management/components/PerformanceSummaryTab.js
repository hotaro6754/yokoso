"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2, Star, TrendingDown, Users } from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";

export default function PerformanceSummaryTab() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await performanceManagementService.getPerformanceDashboard({});
      const data = response.success ? response.data : response.data || response;
      setDashboard(data || null);
    } catch (error) {
      console.error("Error fetching performance dashboard:", error);
      toast.error(error.message || "Failed to fetch performance dashboard");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  const distribution = dashboard?.ratingDistribution || [
    { label: "5", value: 12 },
    { label: "4", value: 28 },
    { label: "3", value: 38 },
    { label: "2", value: 15 },
    { label: "1", value: 7 },
  ];
  const maxDistribution = Math.max(...distribution.map((item) => item.value || 0), 1);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">% Reviews Completed</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {dashboard?.completionRate || dashboard?.reviewsCompletedPercent || 0}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Top Performers</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {dashboard?.topPerformersCount || dashboard?.topPerformers?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Needs Improvement</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {dashboard?.needsImprovementCount || dashboard?.needsImprovement?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {dashboard?.averageRating || "3.6"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Rating Distribution</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ratings across all departments</p>
                </div>
              </div>
              <div className="space-y-3">
                {distribution.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-8 text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                    <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-brand-500"
                        style={{ width: `${(item.value / maxDistribution) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Average Rating by Department</h3>
              <div className="mt-4 space-y-3">
                {(dashboard?.avgRatingByDepartment || []).length > 0 ? (
                  dashboard.avgRatingByDepartment.map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{dept.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{dept.average || "-"}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No department data available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Performers</h3>
              <div className="mt-4 space-y-2">
                {(dashboard?.topPerformers || []).length > 0 ? (
                  dashboard.topPerformers.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{employee.name}</span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        {employee.rating || "5"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No top performers yet.</p>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Needs Improvement</h3>
              <div className="mt-4 space-y-2">
                {(dashboard?.needsImprovement || []).length > 0 ? (
                  dashboard.needsImprovement.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{employee.name}</span>
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                        {employee.rating || "2"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No improvement alerts.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
