"use client";

import { useAuth } from "@/context/AuthContext";
import { Briefcase, Building2, UserCheck, Clock } from "lucide-react";
import Link from "next/link";

const getDisplayName = (user) => {
  if (user?.employee?.firstName) {
    return `${user.employee.firstName} ${user.employee.lastName || ""}`.trim();
  }
  if (user?.firstName) {
    return `${user.firstName} ${user.lastName || ""}`.trim();
  }
  return user?.email || "Employee";
};

export default function EmployeeDashboardHeader({ attendance }) {
  const { user } = useAuth();
  const name = getDisplayName(user);
  const designation = user?.employee?.designation?.name || "Team Member";
  const department = user?.employee?.department?.name || "Department";
  const reportingManager = user?.employee?.reportingManager
    ? `${user.employee.reportingManager.firstName || ""} ${user.employee.reportingManager.lastName || ""}`.trim()
    : "Not assigned";
  const shiftName = attendance?.shiftName || "General Shift";
  const workMode = attendance?.workMode || user?.employee?.workMode || "WFO";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-primary-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <img
              src="/images/users/user-01.png"
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="inline-flex items-center gap-1">
                <Briefcase size={14} /> {designation}
              </span>
              <span className="hidden sm:inline-flex items-center text-gray-300 dark:text-gray-600">|</span>
              <span className="inline-flex items-center gap-1">
                <Building2 size={14} /> {department}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
              <UserCheck size={13} />
              Reporting Manager: <span className="font-medium text-gray-700 dark:text-gray-300">{reportingManager}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-sm font-medium border border-primary-100/60 dark:border-primary-500/20">
            <Clock size={14} />
            {shiftName}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-600">
            Work Mode: {workMode}
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
