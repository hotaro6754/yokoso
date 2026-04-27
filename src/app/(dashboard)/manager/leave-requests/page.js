"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import BreadcrumbRightContent from "./components/BreadcrumbRightContent";
import LeaveOverviewCards from "./components/LeaveOverviewCards";
import RequestLeaveForm from "./components/RequestLeaveForm";
import LeaveHistoryTable from "./components/LeaveHistoryTable";

export default function ManagerLeaveRequestsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          customTitle="Leave Requests"
          subtitle="Submit and track your leave requests"
          rightContent={
            <BreadcrumbRightContent
              selectedDate={selectedMonth}
              setSelectedDate={setSelectedMonth}
            />
          }
        />

        <div className="rounded-sm border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20 shadow-sm">
          <div className="flex gap-2 text-xs text-blue-800 dark:text-blue-300">
            <span className="font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">Policy Note:</span>
            <span>You are eligible for 10 holidays plus leave as per company policy. Leaves (ELs) are accrued monthly.</span>
          </div>
        </div>

        <LeaveOverviewCards selectedMonth={selectedMonth} />

        <RequestLeaveForm onSubmitted={() => setRefreshKey((prev) => prev + 1)} />

        <LeaveHistoryTable key={refreshKey} />
      </div>
    </div>
  );
}
