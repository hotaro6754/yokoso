"use client";

import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LeavesStatsCards({ selectedMonth }) {
  // Mock data
  const [statsData, setStatsData] = useState({
    totalLeaves: 20,
    leavesTaken: 5,
    remainingLeaves: 15,
    pendingLeaves: 2
  });

  // Simulate data loading per selected month
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatsData({
        totalLeaves: 20,
        leavesTaken: Math.floor(Math.random() * 10),
        remainingLeaves: Math.floor(Math.random() * 10) + 5,
        pendingLeaves: Math.floor(Math.random() * 5)
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedMonth]);

  const cards = [
    {
      title: "Total Leaves",
      value: statsData.totalLeaves,
      icon: Calendar,
      iconColor: "text-primary-600 dark:text-primary-400",
      iconBg: "bg-primary-50 dark:bg-primary-500/10",
      accentColor: "border-primary-200 dark:border-primary-500/30",
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
      title: "Remaining Leaves",
      value: statsData.remainingLeaves,
      icon: Clock,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      accentColor: "border-blue-200 dark:border-blue-500/30",
      description: "Leaves still available"
    },
    {
      title: "Pending Leaves",
      value: statsData.pendingLeaves,
      icon: XCircle,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      accentColor: "border-amber-200 dark:border-amber-500/30",
      description: "Leaves awaiting approval"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`${card.iconBg} ${card.iconColor} rounded-lg p-2.5`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                {card.title}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {card.description}
            </p>
          </div>
          <div className={`mt-4 h-1 ${card.accentColor} border-t`}></div>
        </div>
      ))}
    </div>
  );
}
