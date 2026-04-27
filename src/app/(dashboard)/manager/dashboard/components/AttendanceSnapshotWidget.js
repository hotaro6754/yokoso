"use client";

import { AlarmClock, UserMinus, TriangleAlert } from "lucide-react";

export default function AttendanceSnapshotWidget({ snapshot }) {
  const items = [
    {
      label: "Late Arrivals Today",
      value: snapshot?.lateArrivals ?? 0,
      icon: AlarmClock,
      tone: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Absentees Today",
      value: snapshot?.absentees ?? 0,
      icon: UserMinus,
      tone: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      label: "Overtime Alerts",
      value: snapshot?.overtimeAlerts ?? 0,
      icon: TriangleAlert,
      tone: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Attendance Snapshot</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">Highlights for today</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <Icon size={18} className={item.tone} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
