"use client";

import { Users, UserCheck, CalendarX2, AlarmClock } from "lucide-react";

export default function TeamSummaryWidget({ summary }) {
  const stats = [
    {
      label: "Total Team Members",
      value: summary?.totalTeamMembers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Active Members",
      value: summary?.activeMembers ?? 0,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "On Leave Today",
      value: summary?.onLeaveToday ?? 0,
      icon: CalendarX2,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "On Notice Period",
      value: summary?.onNoticePeriod ?? 0,
      icon: AlarmClock,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Team Summary</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">Today&apos;s availability overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4">
              <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <Icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
