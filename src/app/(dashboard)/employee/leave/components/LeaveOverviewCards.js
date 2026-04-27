"use client";

import { Calendar, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import EmployeeLeaveService from "@/services/employee/leave.service";

export default function LeaveOverviewCards({ selectedMonth }) {
  const [statsData, setStatsData] = useState({
    totalLeaves: 0,
    leavesTaken: 0,
    remainingLeaves: 0,
    pendingLeaves: 0,
    lopLeaves: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [selectedMonth]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await EmployeeLeaveService.getDashboardStats();
      const overview = data.overview || data || {};
      setStatsData({
        totalLeaves: overview.totalLeaves || 0,
        leavesTaken: overview.usedLeaves || overview.leavesTaken || 0,
        remainingLeaves: overview.remainingLeaves || 0,
        pendingLeaves: overview.pendingLeaves || 0,
        lopLeaves: overview.lopLeaves || overview.unpaidLeaves || 0
      });
    } catch (error) {
      console.error("Failed to fetch leave stats", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Leaves",
      value: statsData.totalLeaves,
      icon: Calendar,
      iconColor: "text-brand-600 dark:text-brand-400",
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      accentColor: "border-brand-200 dark:border-brand-500/30",
      description: "Total leave entitlement"
    },
    {
      title: "Leaves Taken",
      value: statsData.leavesTaken,
      icon: CheckCircle,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      accentColor: "border-emerald-200 dark:border-emerald-500/30",
      description: "Approved leaves used"
    },
    {
      title: "Remaining",
      value: statsData.remainingLeaves,
      icon: Clock,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      accentColor: "border-blue-200 dark:border-blue-500/30",
      description: "Leaves still available"
    },
    {
      title: "Pending",
      value: statsData.pendingLeaves,
      icon: XCircle,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      accentColor: "border-amber-200 dark:border-amber-500/30",
      description: "Awaiting approval"
    },
    {
      title: "Loss of Pay (LOP)",
      value: statsData.lopLeaves,
      icon: AlertCircle,
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-50 dark:bg-red-500/10",
      accentColor: "border-red-200 dark:border-red-500/30",
      description: "Unpaid leave days"
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-28 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:border-gray-300 transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                {card.title}
              </p>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                {card.value}
              </h4>
            </div>
            <div className={`${card.iconBg} ${card.iconColor} p-2 rounded-sm`}>
              <card.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${card.iconBg.replace('bg-', 'bg-').replace('/10', '')}`}></span>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
