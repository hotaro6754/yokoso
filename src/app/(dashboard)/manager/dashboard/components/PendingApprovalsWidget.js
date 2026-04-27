"use client";
import Link from "next/link";
import { ClipboardCheck, Clock, CalendarCheck } from "lucide-react";

export default function PendingApprovalsWidget({ approvals }) {
  const leaveRequests = approvals?.leaveRequests ?? 0;
  const attendanceCorrections = approvals?.attendanceCorrections ?? 0;
  const timesheets = approvals?.timesheets ?? 0;
  const total = approvals?.total ?? leaveRequests + attendanceCorrections + timesheets;

  const approvalsList = [
    {
      label: "Leave Requests",
      count: leaveRequests,
      icon: CalendarCheck,
      tone: "text-indigo-600",
      bg: "bg-indigo-100",
      href: "/manager/leave-approvals",
    },
    {
      label: "Attendance Corrections",
      count: attendanceCorrections,
      icon: Clock,
      tone: "text-orange-600",
      bg: "bg-orange-100",
      href: "/manager/attendance-approvals",
    },
    {
      label: "Timesheets",
      count: timesheets,
      icon: ClipboardCheck,
      tone: "text-emerald-600",
      bg: "bg-emerald-100",
      href: "/manager/timesheet-approvals",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pending Approvals</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Actions waiting for your review</p>
        </div>
        <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-3 py-1 rounded-full">
          {total} Total
        </span>
      </div>

      <div className="space-y-3">
        {approvalsList.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 hover:border-primary-200 dark:hover:border-primary-500/30 transition-colors">
              <Link href={item.href} className="flex items-center gap-3 flex-1 group">
                <div className={`h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <Icon size={18} className={item.tone} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Click to review</p>
                </div>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{item.count}</span>
                <Link href={item.href} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                  Open
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
