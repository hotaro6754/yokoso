"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import LeaveOverviewCards from "@/app/(dashboard)/employee/leave/components/LeaveOverviewCards";
import LeaveHistoryTable from "@/app/(dashboard)/employee/leave/components/LeaveHistoryTable";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";


export default function LeaveHistoryPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const handleApplyLeave = () => {
    router.push("/dept-head/leave/apply");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          customTitle="My Leaves"
          subtitle="View your past and pending leave requests"
          rightContent={
            <button
              onClick={handleApplyLeave}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Plus size={16} />
              Apply Leave
            </button>
          }
        />

        <LeaveOverviewCards selectedMonth={selectedMonth} />

        <LeaveHistoryTable />
      </div>
    </div>
  );
}
