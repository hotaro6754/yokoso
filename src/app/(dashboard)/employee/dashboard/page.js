"use client";

import React, { useState, useEffect } from "react";
import { employeeDashboardService } from "@/services/employee/dashboard.service";
import { employeeProbationService } from "@/services/employee-services/probation.service";
import HRMSLoader from "@/components/common/HRMSLoader";
import { LineChart, BarChart3, PieChart, TrendingUp } from "lucide-react";

// Components
import EmployeeDashboardHeader from "./components/EmployeeDashboardHeader";
import DashboardPunchWidget from "@/components/dashboard/DashboardPunchWidget";
import AttendanceWidget from "./components/widgets/AttendanceWidget";
import LeaveWidget from "./components/widgets/LeaveWidget";
import PayrollWidget from "./components/widgets/PayrollWidget";
import PendingRequestsWidget from "./components/widgets/PendingRequestsWidget";
import NotificationsWidget from "./components/widgets/NotificationsWidget";
import UpcomingEventsWidget from "./components/widgets/UpcomingEventsWidget";
import HolidayListWidget from "./components/widgets/HolidayListWidget";
import AppraisalWidget from "./components/AppraisalWidget";
import ProbationWidget from "./components/widgets/ProbationWidget";
import PulseSurveyWidget from "./components/widgets/PulseSurveyWidget";

export default function EmployeeDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [probationStatus, setProbationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = React.useCallback(async () => {
    try {
      const [dashboardRes, probationRes] = await Promise.all([
        employeeDashboardService.getDashboardStats(),
        employeeProbationService.getStatus().catch(err => {
          console.warn("Probation fetch error or 404", err);
          return null;
        })
      ]);

      setDashboardData(dashboardRes);
      setProbationStatus(probationRes);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <HRMSLoader text="Loading dashboard..." variant="fullscreen" size="md" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Dashboard Unavailable</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          {error || "We couldn't load your dashboard information."}
        </p>
        {error.includes("Employee record not found") && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            It looks like you are logged in, but your user account is not linked to an active Employee profile. Please contact your HR administrator.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <EmployeeDashboardHeader attendance={dashboardData?.attendance} />

        {/* Standardized Punch In/Out Widget */}
        <div className="mb-6">
          <DashboardPunchWidget onPunchSuccess={fetchData} />
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">

          {/* Probation Widget - Conditionally Rendered */}
          {probationStatus && probationStatus.status !== 'NO_RECORD' && (
            <div className="break-inside-avoid mb-6">
              <ProbationWidget data={probationStatus} />
            </div>
          )}

          <div className="break-inside-avoid mb-6">
            <AttendanceWidget data={dashboardData?.attendance} />
          </div>
          <div className="break-inside-avoid mb-6">
            <LeaveWidget data={dashboardData?.leaves} />
          </div>
          <div className="break-inside-avoid mb-6">
            <PayrollWidget data={dashboardData?.payroll} />
          </div>
          <div className="break-inside-avoid mb-6">
            <PendingRequestsWidget data={dashboardData?.requests} />
          </div>
          <div className="break-inside-avoid mb-6">
            <NotificationsWidget data={dashboardData?.notifications} />
          </div>
          <div className="break-inside-avoid mb-6">
            <PulseSurveyWidget />
          </div>
          <div className="break-inside-avoid mb-6">
            <AppraisalWidget data={dashboardData?.appraisal} />
          </div>
          <div className="break-inside-avoid mb-6">
            <UpcomingEventsWidget data={dashboardData?.events} />
          </div>
          <div className="break-inside-avoid mb-6">
            <HolidayListWidget
              holidays={dashboardData?.holidays}
              notices={dashboardData?.notices}
            />
          </div>
        </div>

        {/* Employee Performance Analytics Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Performance Analytics
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Trend Line Chart */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Performance Trend
                </h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {dashboardData?.performance?.performanceTrend?.length > 0 ? (
                    dashboardData.performance.performanceTrend.map((data, index) => (
                      <div key={data.cycle} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {data.score}
                          </span>
                          <div
                            className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                            style={{ height: `${(data.score / 5) * 160}px` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                          {data.cycle.split(' ')[0]}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Certification Progress Donut Chart */}
            <div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Certification Progress
                </h3>
                <div className="flex justify-center items-center">
                  <div className="w-20 h-20 relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-gray-200 dark:text-gray-600"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - (dashboardData?.performance?.certificationProgress?.percentage / 100 || 0.75))}`}
                        className="text-green-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {dashboardData?.performance?.certificationProgress?.percentage || 75}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Completed</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {dashboardData?.performance?.certificationProgress?.completed || 6}/{dashboardData?.performance?.certificationProgress?.total || 8}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Pending</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {(dashboardData?.performance?.certificationProgress?.total || 8) - (dashboardData?.performance?.certificationProgress?.completed || 6)}/{dashboardData?.performance?.certificationProgress?.total || 8}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Bar Chart */}
          <div className="mt-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Current Cycle Ratings by Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {dashboardData?.performance?.categoryRatings?.map((item) => (
                  <div key={item.category} className="text-center">
                    <div className="h-24 flex flex-col justify-end mb-2">
                      <div
                        className={`w-full ${item.color} rounded-t-lg transition-all duration-300 hover:opacity-80`}
                        style={{ height: `${(item.score / 5) * 96}px` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.score}/5.0
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}