"use client";

import Breadcrumb from "@/components/common/Breadcrumb";
import EmployeeLeaveTable from "@/app/(dashboard)/hr/leave/reports/components/EmployeeLeaveTable";

export default function LeaveBalancePage() {
  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", path: "/hr" },
          { label: "Leave", path: "/hr/leave" },
          { label: "Leave Balance" },
        ]}
      />

      <EmployeeLeaveTable filters={{}} showImportExport />
    </div>
  );
}
