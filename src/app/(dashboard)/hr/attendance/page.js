"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Clock, Calendar, AlertCircle, Timer, Database, DollarSign } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import DailyAttendanceViewTab from "./components/DailyAttendanceViewTab";
import AttendanceCorrectionsTab from "./components/AttendanceCorrectionsTab";
import LateEarlyTrackingTab from "./components/LateEarlyTrackingTab";
import OvertimeVisibilityTab from "./components/OvertimeVisibilityTab";
import BiometricSyncTab from "./components/BiometricSyncTab";
import LOPSummaryTab from "./components/LOPSummaryTab";
import AttendanceReportsTab from "./components/AttendanceReportsTab";

export default function AttendanceManagementPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "daily-view");
  const isItAdminView = pathname?.startsWith("/it-admin");
  const homeLabel = isItAdminView ? "IT Admin" : "HR";
  const homeHref = isItAdminView ? "/it-admin/dashboard" : "/hr";
  const attendanceHref = isItAdminView ? "/it-admin/attendance" : "/hr/attendance";

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const tabs = [
    {
      id: "daily-view",
      label: "Daily Attendance View",
      icon: <Calendar size={18} />,
      component: <DailyAttendanceViewTab />,
    },
    {
      id: "corrections",
      label: "Attendance Corrections",
      icon: <AlertCircle size={18} />,
      component: <AttendanceCorrectionsTab />,
    },
    {
      id: "late-early",
      label: "Late / Early Tracking",
      icon: <Clock size={18} />,
      component: <LateEarlyTrackingTab />,
    },
    {
      id: "overtime",
      label: "Overtime Visibility",
      icon: <Timer size={18} />,
      component: <OvertimeVisibilityTab />,
    },
    {
      id: "biometric",
      label: "Biometric Management",
      icon: <Database size={18} />,
      component: <BiometricSyncTab />,
    },
    {
      id: "lop",
      label: "LOP Tracking",
      icon: <DollarSign size={18} />,
      component: <LOPSummaryTab />,
    },
    {
      id: "reports",
      label: "Historical Reports",
      icon: <Database size={18} />,
      component: <AttendanceReportsTab />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: homeLabel, href: homeHref },
            { label: "Attendance Management", href: attendanceHref },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Attendance Management Overview
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage daily attendance, corrections, late/early tracking, overtime, biometric sync, and LOP processing in one place.
            </p>
          </div>
          {/* Action buttons can be added here in the future */}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
                }
              `}
            >
              <span className={`
                ${activeTab === tab.id ? "text-brand-600 dark:text-brand-400" : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"}
              `}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}
