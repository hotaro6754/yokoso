// src/app/(dashboard)/hr/assets/components/AssetStats.js
"use client";
import { useEffect, useState } from "react";
import { Package, CheckCircle, AlertTriangle, Monitor, Archive, Clock } from "lucide-react";
import { assetService } from "../../../../../services/hr-services/asset.service";

export default function AssetStats({ stats: externalStats }) {
  const [internalStats, setInternalStats] = useState(null);

  useEffect(() => {
    if (externalStats) return;

    const fetchStats = async () => {
      try {
        const response = await assetService.getAssetsStats();
        setInternalStats(response.data);
      } catch (error) {
        console.error("Asset stats error:", error.message);
      }
    };

    fetchStats();
  }, [externalStats]);

  const stats = externalStats || internalStats;

  if (!stats) return null;

  const cardData = [
    {
      title: "Total Assets",
      value: stats.totalAssets || 0,
      icon: Package,
      iconBg: "bg-brand-50 dark:bg-brand-900/20",
      iconColor: "text-brand-600 dark:text-brand-400",
      hoverBorder: "hover:border-brand-200 dark:hover:border-brand-800"
    },
    {
      title: "Available",
      value: stats.byStatus?.available || stats.byStatus?.inStock || 0,
      icon: CheckCircle,
      iconBg: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      hoverBorder: "hover:border-green-200 dark:hover:border-green-800"
    },
    {
      title: "Assigned",
      value: stats.byStatus?.assigned || 0,
      icon: Monitor,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      hoverBorder: "hover:border-blue-200 dark:hover:border-blue-800"
    },
    {
      title: "Maintenance",
      value: stats.byStatus?.maintenance || stats.byStatus?.underRepair || stats.assetsDueForMaintenance || 0,
      icon: Clock,
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      hoverBorder: "hover:border-orange-200 dark:hover:border-orange-800"
    },
    {
      title: "Retired",
      value: stats.byStatus?.retired || 0,
      icon: Archive,
      iconBg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      hoverBorder: "hover:border-red-200 dark:hover:border-red-800"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`group bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm transition-all duration-200 ${card.hoverBorder}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  {card.title}
                </p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {card.value}
                </h4>
              </div>
              <div className={`p-2 rounded-full ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
