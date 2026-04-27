"use client";

import { Target, Star, UserCheck } from "lucide-react";
import Link from "next/link";

export default function PerformanceActionsWidget({ actions }) {
  const items = [
    {
      label: "Goals Pending Review",
      value: actions?.goalsPendingReview ?? 0,
      icon: Target,
      tone: "text-blue-600",
      bg: "bg-blue-100",
      href: "/manager/performance-management/team-reviews",
    },
    {
      label: "Appraisals Pending",
      value: actions?.appraisalsPending ?? 0,
      icon: Star,
      tone: "text-purple-600",
      bg: "bg-purple-100",
      href: "/manager/performance-management/team-appraisals",
    },
    {
      label: "Probation Confirmations",
      value: actions?.probationConfirmations ?? 0,
      icon: UserCheck,
      tone: "text-green-600",
      bg: "bg-green-100",
      href: "/manager/probation-confirmations",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Performance Actions</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">Items requiring manager input</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 hover:border-primary-200 dark:hover:border-primary-500/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <Icon size={18} className={item.tone} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{item.label}</p>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{item.value}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
