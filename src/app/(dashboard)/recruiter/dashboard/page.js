"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import OpenPositionsSummary from "./components/OpenPositionsSummary";
import CandidatePipelineSnapshot from "./components/CandidatePipelineSnapshot";
import InterviewSchedule from "./components/InterviewSchedule";
import PendingActions from "./components/PendingActions";
import { Briefcase, Users, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import DashboardPunchWidget from "@/components/dashboard/DashboardPunchWidget";

export default function RecruiterDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const stats = await recruiterService.getDashboardStats();
      setDashboardStats(stats.data || stats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setDashboardStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Dashboard", href: "/recruiter/dashboard" },
        ]}
      />

      <div className="mb-6">
        <DashboardPunchWidget />
      </div>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recruiter Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time hiring pipeline view and pending actions
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/recruiter/requisitions"
              className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Open Requisitions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.totalOpenRequisitions || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Link>

            <Link
              href="/recruiter/candidates?stage=SCREENING"
              className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Screening</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.candidatesInScreening || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Link>

            <Link
              href="/recruiter/interviews"
              className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Interview</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.candidatesInInterview || 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </Link>

            <Link
              href="/recruiter/offers"
              className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Offers in Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.offersInProgress || 0}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </Link>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Open Positions Summary */}
            <OpenPositionsSummary />

            {/* Candidate Pipeline Snapshot */}
            <CandidatePipelineSnapshot />
          </div>

          {/* Interview Schedule and Pending Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interview Schedule */}
            <InterviewSchedule />

            {/* Pending Actions */}
            <PendingActions />
          </div>
        </div>
      )}
    </div>
  );
}
