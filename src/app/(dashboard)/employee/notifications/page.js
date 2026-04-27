"use client";

import Breadcrumb from "@/components/common/Breadcrumb";
import { Bell, Info, CheckCircle } from "lucide-react";

const notifications = [
  { title: "Policy Update", message: "Leave policy updated for FY 2026.", time: "2 hours ago", type: "announcement" },
  { title: "Payroll Processed", message: "January salary processed successfully.", time: "1 day ago", type: "update" },
  { title: "Festival Greeting", message: "Happy Republic Day from HR team.", time: "2 days ago", type: "announcement" },
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications Center</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Company announcements and HR alerts.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((notif, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-4">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  {notif.type === "announcement" ? (
                    <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                      <Info size={16} />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
