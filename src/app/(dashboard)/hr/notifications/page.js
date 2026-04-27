"use client";

import { Bell, AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

const typeStyles = {
  approval: "bg-amber-50 text-amber-700 border-amber-200",
  compliance: "bg-rose-50 text-rose-700 border-rose-200",
  task: "bg-sky-50 text-sky-700 border-sky-200",
  system: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const notifications = [
  {
    id: "n1",
    title: "14 leave requests pending HR approval",
    detail: "Review and approve pending applications to avoid payroll delays.",
    timestamp: "Today · 9:30 AM",
    type: "approval",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    id: "n2",
    title: "12 documents expired in the last 7 days",
    detail: "Follow up on pending ID proof and contract renewals.",
    timestamp: "Yesterday · 5:12 PM",
    type: "compliance",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "n3",
    title: "Pending onboarding tasks for 6 new joiners",
    detail: "IT and Admin tasks remain incomplete for upcoming DOJ.",
    timestamp: "Yesterday · 2:45 PM",
    type: "task",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: "n4",
    title: "Attendance exceptions flagged for 18 employees",
    detail: "Late arrivals exceed policy threshold for this week.",
    timestamp: "Jan 22 · 11:05 AM",
    type: "approval",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: "n5",
    title: "Exit clearance completed for 4 employees",
    detail: "All asset recovery steps completed; forward to payroll.",
    timestamp: "Jan 21 · 4:18 PM",
    type: "system",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
];

export default function HrNotificationsPage() {
  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Breadcrumb items={[{ label: "Notifications", href: "/hr/notifications" }]} />
          <h1 className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
            HR Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Alerts, approvals, and compliance reminders for HR operations.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Latest Alerts
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-4 px-5 py-4">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${typeStyles[notification.type]}`}
              >
                {notification.icon}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {notification.timestamp}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {notification.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
