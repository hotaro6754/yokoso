"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Award, Clock, CheckCircle, AlertCircle, Star } from "lucide-react";
import HRMSLoader from "@/components/common/HRMSLoader";
import { employeePerformanceService } from "@/services/employee/performance.service";
import { toast } from "react-hot-toast";

export default function AppraisalHistory() {
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current year for dynamic data
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const history = await employeePerformanceService.getAppraisalHistory();
        setHistoryData(history);
      } catch (error) {
        console.error("Failed to fetch history data", error);
        toast.error("Failed to load appraisal history");
        setHistoryData([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  // Calculate dynamic performance metrics from history data
  const hasHistory = historyData && historyData.length > 0;
  const latestScore = hasHistory && historyData[0]?.overallRating ? historyData[0].overallRating : 0;
  const latestRating = hasHistory ? historyData[0]?.status : "No Rating";
  const totalCycles = historyData?.length || 0;
  const previousScore = hasHistory && historyData.length > 1 && historyData[1]?.overallRating ? historyData[1].overallRating : 0;
  const scoreTrend = hasHistory ? latestScore - previousScore : 0;
  const trendText = scoreTrend > 0 ? `+${scoreTrend.toFixed(1)}` : scoreTrend < 0 ? `${scoreTrend.toFixed(1)}` : hasHistory ? "0.0" : "N/A";
  const trendColor = scoreTrend > 0 ? "text-green-600" : scoreTrend < 0 ? "text-red-600" : "text-gray-600";

  const getScoreColor = (score) => {
    if (score >= 4.5) return "text-emerald-600 bg-emerald-50";
    if (score >= 4.0) return "text-green-600 bg-green-50";
    if (score >= 3.5) return "text-blue-600 bg-blue-50";
    if (score >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const getRatingBadge = (rating) => {
    const ratingConfig = {
      "Outstanding": { color: "bg-emerald-100 text-emerald-800" },
      "Exceeds Expectations": { color: "bg-green-100 text-green-800" },
      "Meets Expectations": { color: "bg-blue-100 text-blue-800" },
      "Below Expectations": { color: "bg-yellow-100 text-yellow-800" },
      "Needs Improvement": { color: "bg-orange-100 text-orange-800" }
    };
    
    return ratingConfig[rating] || ratingConfig["Meets Expectations"];
  };

  if (isLoading) {
    return <HRMSLoader text="Loading appraisal history..." variant="fullscreen" size="md" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appraisal History</h1>
              <p className="text-gray-600 dark:text-gray-400">Your performance evaluation records</p>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <span className={`text-xs font-medium ${trendColor}`}>
                {hasHistory ? `${trendText} from last cycle` : "No previous cycles"}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {hasHistory ? latestScore.toFixed(1) : "N/A"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasHistory ? "Latest Score" : "No completed appraisals"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Award size={20} />
              </div>
              <span className="text-xs text-blue-600 font-medium">
                {hasHistory ? historyData[0]?.appraisalCycle?.name || "N/A" : "N/A"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {latestRating}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasHistory ? "Current Rating" : "No ratings available"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <CheckCircle size={20} />
              </div>
              <span className="text-xs text-purple-600 font-medium">All time</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalCycles}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalCycles === 0 ? "No completed cycles" : "Total Cycles"}
            </p>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Records</h2>
          
          {!hasHistory ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Appraisal History</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't completed any performance appraisals yet. Once you submit your first appraisal, it will appear here.
              </p>
              <Link
                href="/employee/performance/my-appraisal"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Calendar size={16} />
                Complete Your First Appraisal
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Appraisal Cycle</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Period</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Completion Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {historyData?.map((appraisal) => (
                      <tr key={appraisal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {appraisal.appraisalCycle?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {appraisal.appraisalCycle?.startDate ? 
                              `${new Date(appraisal.appraisalCycle.startDate).toLocaleDateString()} - ${new Date(appraisal.appraisalCycle.endDate).toLocaleDateString()}` 
                              : 'N/A'
                            }
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full ${getScoreColor(appraisal.overallRating)}`}>
                            {appraisal.overallRating || 'N/A'}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {appraisal.completedAt ? new Date(appraisal.completedAt).toLocaleDateString() : 
                             appraisal.submittedAt ? new Date(appraisal.submittedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Link 
                            href={`/employee/performance/history/${appraisal.id}`}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>


      </div>
    </div>
  );
}
