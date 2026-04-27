"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import DepartmentPerformanceWidget from "./components/widgets/DepartmentPerformanceWidget";
import {
  Users, Briefcase, Target, FileCheck, TrendingUp, UserPlus, AlertCircle,
  CheckCircle2, ArrowRight, Calendar, Clock, BarChart3, Zap, Activity,
  PieChart, Filter, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { deptHeadDashboardService } from "@/services/dept-head/dashboard.service";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import DashboardPunchWidget from "@/components/dashboard/DashboardPunchWidget";
import NineBoxSummaryWidget from "@/components/dashboard/NineBoxSummaryWidget";

export default function DeptHeadDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    teamOverview: {
      totalEmployees: 0,
      activeEmployees: 0,
      onLeave: 0,
      newJoiners: 0,
    },
    hiringOverview: {
      openPositions: 0,
      pendingRequisitions: 0,
      overduePositions: 0,
    },
    performanceSnapshot: {
      goalsInProgress: 0,
      overdueReviews: 0,
      averageTeamRating: 0,
    },
    pendingApprovals: {
      leaveRequests: 0,
      jobRequisitions: 0,
    },
  });
  const [nineBoxData, setNineBoxData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [data, nineBoxResponse] = await Promise.all([
          deptHeadDashboardService.getDashboardStats(),
          performanceManagementService.getNineBoxGridData()
        ]);

        console.log('Department Head Dashboard Data:', data);

        setDashboardData({
          teamOverview: {
            totalEmployees: data.teamOverview?.totalEmployees || 0,
            activeEmployees: data.teamOverview?.activeEmployees || 0,
            onLeave: data.teamOverview?.onLeave || 0,
            newJoiners: data.teamOverview?.newJoiners || 0,
          },
          hiringOverview: {
            openPositions: data.hiringOverview?.openPositions || 0,
            pendingRequisitions: data.hiringOverview?.pendingRequisitions || 0,
            overduePositions: data.hiringOverview?.overduePositions || 0,
          },
          performanceSnapshot: {
            goalsInProgress: data.performanceSnapshot?.goalsInProgress || 0,
            overdueReviews: data.performanceSnapshot?.overdueReviews || 0,
            averageTeamRating: data.performanceSnapshot?.averageTeamRating || 0,
          },
          pendingApprovals: {
            leaveRequests: data.pendingApprovals?.leaveRequests || 0,
            jobRequisitions: data.pendingApprovals?.jobRequisitions || 0,
          },
        });

        // Handle nineBoxResponse
        let gridData = [];
        const rawResponse = nineBoxResponse;
        if (rawResponse?.gridData && Array.isArray(rawResponse.gridData)) {
          gridData = rawResponse.gridData;
        } else if (rawResponse?.data?.gridData && Array.isArray(rawResponse.data.gridData)) {
          gridData = rawResponse.data.gridData;
        } else if (Array.isArray(rawResponse)) {
          gridData = rawResponse;
        }
        setNineBoxData(gridData);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-500 text-center">
            <p className="font-medium">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 p-4 sm:p-8 space-y-8">
      {/* Header Area */}
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Department Head", href: "/dept-head" },
            { label: "Dashboard", href: "/dept-head/dashboard" },
          ]}
          rightContent={
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-2">
                <Activity size={14} className="text-primary-600" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {dashboardData.pendingApprovals.leaveRequests + dashboardData.pendingApprovals.jobRequisitions} Pending Actions
                </span>
              </div>
            </div>
          }
        />

        <div className="mt-4 mb-6">
          <DashboardPunchWidget />
        </div>

        <div className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Welcome back!
          </h1>
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
            <Calendar size={14} /> {currentDate}
          </p>
        </div>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Employees',
            value: dashboardData.teamOverview.totalEmployees,
            icon: Users,
            color: 'text-blue-500',
            subText: 'All department members'
          },
          {
            label: 'Active Employees',
            value: dashboardData.teamOverview.activeEmployees,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            subText: `${((dashboardData.teamOverview.activeEmployees / Math.max(dashboardData.teamOverview.totalEmployees, 1)) * 100).toFixed(0)}% of total`
          },
          {
            label: 'Pending Approvals',
            value: dashboardData.pendingApprovals.leaveRequests + dashboardData.pendingApprovals.jobRequisitions,
            icon: FileCheck,
            color: 'text-amber-500',
            subText: 'Requires attention'
          },
          {
            label: 'Team Rating',
            value: dashboardData.performanceSnapshot.averageTeamRating,
            icon: Target,
            color: 'text-purple-500',
            subText: 'Out of 5.0 average'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between group h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none block mb-2">{stat.label}</span>
                <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{stat.value}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-sm">
                <stat.icon size={18} className={`${stat.color}`} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.subText}</p>
          </div>
        ))}
      </div>

      {/* Masonry Content Grid */}
      <div className="columns-1 xl:columns-2 gap-6 [&>div]:break-inside-avoid">

        {/* 9-Box Summary */}
        <div className="mb-6">
          <NineBoxSummaryWidget
            employees={nineBoxData}
            viewMoreLink="/dept-head/performance/nine-box-grid"
          />
        </div>

        {/* Manager Performance Comparison */}
        <div className="bg-white dark:bg-gray-900 rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-6">
          <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6 border-b border-gray-50 dark:border-gray-800/50 pb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-600" />
            Manager Ratings
          </h3>
          <div className="space-y-4">
            {[
              { name: "David Thompson", finalScore: 4.5, teamSize: 12 },
              { name: "Sarah Mitchell", finalScore: 4.2, teamSize: 8 },
              { name: "Michael Chen", finalScore: 3.9, teamSize: 10 },
              { name: "Lisa Anderson", finalScore: 4.1, teamSize: 6 },
              { name: "Robert Wilson", finalScore: 3.7, teamSize: 9 },
            ].map((manager) => (
              <div key={manager.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-sm flex items-center justify-center border border-primary-100 dark:border-primary-800">
                    <span className="text-[10px] font-bold text-primary-600">
                      {manager.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block tracking-tight uppercase">{manager.name}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{manager.teamSize} direct reports</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:w-32">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${manager.finalScore >= 4.5 ? "bg-emerald-500/80" :
                        manager.finalScore >= 4.0 ? "bg-blue-500/80" :
                          manager.finalScore >= 3.5 ? "bg-indigo-500/80" :
                            manager.finalScore >= 3.0 ? "bg-amber-500/80" : "bg-rose-500/80"
                        }`}
                      style={{ width: `${(manager.finalScore / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white w-6 text-right">{manager.finalScore.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance Analytics */}
        <div className="bg-white dark:bg-gray-900 rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-6">
          <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-gray-800/50 pb-6">
            <h2 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <PieChart size={16} className="text-primary-600" />
              Rating Distribution
            </h2>
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-gray-400" />
              <select className="text-[9px] uppercase font-bold tracking-widest bg-transparent border-none text-gray-500 dark:text-gray-400 focus:ring-0 cursor-pointer outline-none p-0">
                <option>Q4 2024</option>
                <option>Q3 2024</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 relative mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="12" fill="none" className="text-gray-50 dark:text-gray-800" />
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - 0.35)}`} className="text-emerald-500" />
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - 0.65)}`} className="text-blue-500" />
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - 0.95)}`} className="text-indigo-500" />
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - 1.0)}`} className="text-amber-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white leading-none">45</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-gray-500"><div className="w-2 h-2 bg-emerald-500 rounded-sm"></div> Outstanding</div>
                <span className="text-gray-900 dark:text-white">35%</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-gray-500"><div className="w-2 h-2 bg-blue-500 rounded-sm"></div> Exceeds</div>
                <span className="text-gray-900 dark:text-white">30%</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-gray-500"><div className="w-2 h-2 bg-indigo-500 rounded-sm"></div> Meets</div>
                <span className="text-gray-900 dark:text-white">25%</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-gray-500"><div className="w-2 h-2 bg-amber-500 rounded-sm"></div> Needs Improv.</div>
                <span className="text-gray-900 dark:text-white">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Snapshot */}
        <div className="bg-white dark:bg-gray-900 rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-6">
          <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-gray-800/50 pb-4">
            <h2 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Users size={16} className="text-primary-600" />
              Team Composition
            </h2>
            <Link
              href="/dept-head/team-management"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary-600 flex items-center gap-1 transition-colors"
            >
              View Roster <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-sm border border-gray-100 dark:border-gray-800/50 group hover:border-amber-200 transition-colors">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-sm flex items-center justify-center shrink-0">
                <AlertCircle size={16} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">{dashboardData.teamOverview.onLeave}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Currently Offline</p>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-sm border border-gray-100 dark:border-gray-800/50 group hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-sm flex items-center justify-center shrink-0">
                <UserPlus size={16} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">{dashboardData.teamOverview.newJoiners}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">New Recruits <span className="text-[8px] font-black tracking-widest text-emerald-500 opacity-60 ml-1">(30D)</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment Pipeline */}
        <div className="bg-white dark:bg-gray-900 rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-6">
          <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-gray-800/50 pb-4">
            <h2 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={16} className="text-blue-500" />
              Recruitment Pipeline
            </h2>
            <Link
              href="/dept-head/job-requisitions"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-500 flex items-center gap-1 transition-colors"
            >
              Manage <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Requisitions</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{dashboardData.hiringOverview.openPositions}</span>
              </div>
              <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                <div className="bg-blue-500 h-full w-3/4"></div>
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Approvals</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{dashboardData.hiringOverview.pendingRequisitions}</span>
              </div>
              <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                <div className="bg-amber-500 h-full w-1/4"></div>
              </div>
            </div>

            {dashboardData.hiringOverview.overduePositions > 0 && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center gap-3 rounded-sm">
                <AlertCircle size={14} className="text-rose-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span className="text-rose-500">{dashboardData.hiringOverview.overduePositions} Positions</span> require urgent attention
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Objective Tracking */}
        <div className="bg-white dark:bg-gray-900 rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-6">
          <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-gray-800/50 pb-4">
            <h2 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Target size={16} className="text-purple-500" />
              Objective Tracking
            </h2>
            <Link
              href="/dept-head/performance"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-purple-500 flex items-center gap-1 transition-colors"
            >
              Dashboard <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Objectives</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{dashboardData.performanceSnapshot.goalsInProgress}</span>
              </div>
              <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                <div className="bg-purple-500 h-full w-2/3"></div>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department Aggregate Index</span>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{dashboardData.performanceSnapshot.averageTeamRating}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">/ 5.0</span>
              </div>
            </div>

            {dashboardData.performanceSnapshot.overdueReviews > 0 && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center gap-3 rounded-sm">
                <Clock size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span className="text-amber-500">{dashboardData.performanceSnapshot.overdueReviews} Reviews</span> overdue for completion
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Administrative Actions Panel */}
        <div className="bg-white dark:bg-gray-900 rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-6">
          <h2 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-8 border-b border-gray-50 dark:border-gray-800/50 pb-4">
            <Zap size={16} className="text-primary-600" />
            Administrative Actions
          </h2>

          <div className="space-y-3">
            <Link href="/dept-head/leave-approvals" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-sm transition-all group shadow-sm">
              <div className="flex items-center gap-4">
                <FileCheck size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">Leave Approvals</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{dashboardData.pendingApprovals.leaveRequests} requests queued</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 transition-colors transform group-hover:translate-x-1" />
            </Link>

            <Link href="/dept-head/job-requisitions" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-sm transition-all group shadow-sm">
              <div className="flex items-center gap-4">
                <Briefcase size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">Job Requisitions</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{dashboardData.pendingApprovals.jobRequisitions} files pending</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 transition-colors transform group-hover:translate-x-1" />
            </Link>

            <Link href="/dept-head/team-management" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-sm transition-all group shadow-sm">
              <div className="flex items-center gap-4">
                <Users size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">Team Management</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Access roster & roles</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 transition-colors transform group-hover:translate-x-1" />
            </Link>

            <Link href="/dept-head/reports" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-sm transition-all group shadow-sm">
              <div className="flex items-center gap-4">
                <BarChart3 size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">Statistical Reports</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Export analytics</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 transition-colors transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}