"use client";

import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import WelcomeStrip from "./components/WelcomeStrip";
import StatsCard from "./components/StatsCard";
import EmployeeDepartmentChart from "./components/EmployeeDepartmentChart";
import AttendanceOverview from "./components/AttendanceOverview";
import ClockInOut from "./components/ClockInOut";
import EmployeesTable from "./components/EmployeesTable";
import EmployeeStatusWidget from "./components/EmployeeStatusWidget";
import JobApplicantsWidget from "./components/JobApplicantsWidget";
import RecentActivitiesWidget from "./components/RecentActivitiesWidget";
import BirthdaysWidget from "./components/BirthdaysWidget";
import { dashboardService } from "@/services/super-admin-services/dashboard.service";
import { authService } from "@/services/auth-services/authService";

export default function SuperAdminDashboard() {
  const [visibleElements, setVisibleElements] = useState(new Set());
  const elementRefs = useRef({});
  const [dashboardStats, setDashboardStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute("data-animate-id");
            if (elementId) setVisibleElements((prev) => new Set(prev).add(elementId));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const timeoutId = setTimeout(() => {
      Object.values(elementRefs.current).forEach((ref) => ref && observer.observe(ref));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const [statsResponse, userResponse] = await Promise.all([
          dashboardService.getDashboardStats(),
          authService.getCurrentUser(),
        ]);
        if (!active) return;
        setDashboardStats(statsResponse?.data || []);
        setUserProfile(userResponse?.data || null);
      } catch (err) {
        if (!active) return;
        // Keep UI functional with existing mock data if error occurs
      } finally {
        // no-op
      }
    };
    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  // UI-only mock data (single company)
  const userData = {
    userName: userProfile?.employee?.firstName || "",
    avatarUrl:
      userProfile?.avatarUrl ||
      userProfile?.profileImage ||
      "/images/users/default-avatar.png",
  };

  const statsData = [
    {
      title: "Employees",
      value: String(dashboardStats?.userOverview?.totalUsers ?? 0),
      comparison: "Active users",
      trend: "up",
      iconBgColor: "bg-blue-600",
      href: "/company-admin/users",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      title: "Pending Leave",
      value: String(dashboardStats?.pendingLeave ?? 0),
      comparison: "Awaiting approval",
      trend: "up",
      iconBgColor: "bg-orange-600",
      href: "/company-admin/leave-management",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Active Policies",
      value: String(dashboardStats?.activePolicies ?? 0),
      comparison: "Company policies",
      trend: "up",
      iconBgColor: "bg-green-600",
      href: "/company-admin/policy-rule",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10M7 11h10M7 15h7M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      ),
    },
    {
      title: "Departments",
      value: String(dashboardStats?.departments ?? 0),
      comparison: "Total departments",
      trend: "up",
      iconBgColor: "bg-purple-600",
      href: "/company-admin/departments",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "Active Workflows",
      value: String(dashboardStats?.workflowStatus?.activeWorkflows ?? 0),
      comparison: "Running workflows",
      trend: "up",
      iconBgColor: "bg-indigo-600",
      href: "/company-admin/workflow-management",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Custom Policies",
      value: String(dashboardStats?.customPolicies ?? 0),
      comparison: "Company-specific",
      trend: "up",
      iconBgColor: "bg-pink-600",
      href: "/company-admin/policy-rule",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Page Header */}
      <Breadcrumb pageName="Admin Dashboard" />

      {/* Welcome Strip */}
      <div
        ref={(el) => (elementRefs.current["welcome"] = el)}
        data-animate-id="welcome"
        className={`scroll-fade-in ${visibleElements.has("welcome") ? "animate-fade-in" : ""}`}
      >
        <WelcomeStrip
          userName={userData.userName}
          avatarUrl={userData.avatarUrl}
        />
      </div>

      {/* KPI Cards (top) */}
      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {statsData.map((stat, index) => {
          const elementId = `stat-${index}`;
          return (
            <div
              key={index}
              ref={(el) => (elementRefs.current[elementId] = el)}
              data-animate-id={elementId}
              className={`h-full scroll-fade-in ${visibleElements.has(elementId) ? "animate-fade-in" : ""}`}
              style={visibleElements.has(elementId) ? { animationDelay: `${index * 50}ms` } : {}}
            >
              <StatsCard {...stat} />
            </div>
          );
        })}
      </div>

      {/* Employees By Department (after KPI cards) */}
      <div
        ref={(el) => (elementRefs.current["dept-chart"] = el)}
        data-animate-id="dept-chart"
        className={`w-full scroll-fade-in ${visibleElements.has("dept-chart") ? "animate-fade-in" : ""}`}
      >
        <EmployeeDepartmentChart />
      </div>

      {/* Row: Attendance Overview + Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div
          ref={(el) => (elementRefs.current["attendance-overview"] = el)}
          data-animate-id="attendance-overview"
          className={`w-full scroll-fade-in ${visibleElements.has("attendance-overview") ? "animate-fade-in" : ""}`}
        >
          <AttendanceOverview />
        </div>
        <div
          ref={(el) => (elementRefs.current["employees"] = el)}
          data-animate-id="employees"
          className={`w-full scroll-fade-in ${visibleElements.has("employees") ? "animate-fade-in" : ""}`}
        >
          <EmployeesTable />
        </div>
      </div>

      {/* Row: Employee Status (full width) */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div
          ref={(el) => (elementRefs.current["employee-status"] = el)}
          data-animate-id="employee-status"
          className={`w-full scroll-fade-in ${visibleElements.has("employee-status") ? "animate-fade-in" : ""}`}
        >
          <EmployeeStatusWidget />
        </div>
      </div>

      {/* Row: Clock + Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div
          ref={(el) => (elementRefs.current["clock-in-out"] = el)}
          data-animate-id="clock-in-out"
          className={`w-full scroll-fade-in ${visibleElements.has("clock-in-out") ? "animate-fade-in" : ""}`}
        >
          <ClockInOut />
        </div>
        <div
          ref={(el) => (elementRefs.current["job-applicants"] = el)}
          data-animate-id="job-applicants"
          className={`w-full scroll-fade-in ${visibleElements.has("job-applicants") ? "animate-fade-in" : ""}`}
        >
          <JobApplicantsWidget />
        </div>
      </div>

      {/* Row: Recent Activities + Birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-6">
          <RecentActivitiesWidget />
        </div>
        <div className="lg:col-span-6">
          <BirthdaysWidget />
        </div>
      </div>
    </div>
  );
}

