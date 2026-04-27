"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { BarChart3, PieChart, Users, TrendingUp } from "lucide-react";
import TeamSummaryWidget from "./components/TeamSummaryWidget";
import PendingApprovalsWidget from "./components/PendingApprovalsWidget";
import NineBoxSummaryWidget from "@/components/dashboard/NineBoxSummaryWidget";
import AttendanceSnapshotWidget from "./components/AttendanceSnapshotWidget";
import PerformanceActionsWidget from "./components/PerformanceActionsWidget";
import AnnouncementsWidget from "./components/AnnouncementsWidget";
import TeamPerformanceWidget from "./components/widgets/TeamPerformanceWidget";
import { managerDashboardService } from "@/services/manager-services/dashboard.service";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import DashboardPunchWidget from "@/components/dashboard/DashboardPunchWidget";

export default function ManagerDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [nineBoxData, setNineBoxData] = useState([]);
  const [error, setError] = useState("");

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "Dashboard", href: "/manager/dashboard" },
  ];

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      try {
        const [data, nineBoxResponse] = await Promise.all([
          managerDashboardService.getDashboardSummary(),
          performanceManagementService.getNineBoxGridData()
        ]);

        if (!active) return;
        setDashboardData(data);

        // Handle nineBoxResponse structure { gridData: [], unassignedEmployees: [] }
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
        if (!active) return;
        setError(err?.message || "Unable to load manager dashboard");
      }
    };

    fetchDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-6">
          <DashboardPunchWidget />
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamSummaryWidget summary={dashboardData?.teamSummary} />
          <NineBoxSummaryWidget
            employees={nineBoxData}
            viewMoreLink="/manager/performance-management/nine-box-grid"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendingApprovalsWidget approvals={dashboardData?.pendingApprovals} />
          <AttendanceSnapshotWidget snapshot={dashboardData?.attendanceSnapshot} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceActionsWidget actions={dashboardData?.performanceActions} />
          <TeamPerformanceWidget data={dashboardData?.teamPerformance} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnnouncementsWidget announcements={dashboardData?.announcements} />
        </div>
      </div>
    </div>
  );
}
