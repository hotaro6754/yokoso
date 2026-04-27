"use client";

import { useState, useEffect } from "react";
import { Building2, CheckCircle2, XCircle, Users } from "lucide-react";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import DepartmentTableWrapper from "./DepartmentTableWrapper";

export default function DepartmentsTab({ viewOnly = false, allowFetch = true }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!allowFetch) {
      setLoading(false);
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await organizationService.getDepartmentStats();
        const statsData = response?.success ? response.data : response?.data || response;
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching department stats:", error);
        if (!String(error?.message || "").toLowerCase().includes("access denied")) {
          toast.error("Failed to load department statistics");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [allowFetch, viewOnly]);

  const statCards = [
    {
      title: "Total Departments",
      value: stats?.totalDepartments || 0,
      icon: <Building2 className="text-brand-600 dark:text-brand-400" size={24} />,
      bgColor: "bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-500/20 dark:to-brand-500/10",
      borderColor: "border-brand-200 dark:border-brand-500/30",
      gradient: "from-brand-500 to-brand-600",
    },
    {
      title: "Active Departments",
      value: stats?.activeDepartments || stats?.byStatus?.active || 0,
      icon: <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />,
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/20 dark:to-emerald-500/10",
      borderColor: "border-emerald-200 dark:border-emerald-500/30",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Inactive Departments",
      value: stats?.inactiveDepartments || stats?.byStatus?.inactive || 0,
      icon: <XCircle className="text-rose-600 dark:text-rose-400" size={24} />,
      bgColor: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/20 dark:to-rose-500/10",
      borderColor: "border-rose-200 dark:border-rose-500/30",
      gradient: "from-rose-500 to-rose-600",
    },
    {
      title: "Total Employees",
      value: stats?.totalEmployees || 0,
      icon: <Users className="text-accent-600 dark:text-accent-400" size={24} />,
      bgColor: "bg-gradient-to-br from-accent-50 to-accent-100/50 dark:from-accent-500/20 dark:to-accent-500/10",
      borderColor: "border-accent-200 dark:border-accent-500/30",
      gradient: "from-accent-500 to-accent-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 p-6 rounded-sm border-2 ${card.borderColor} shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] group relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </h3>
                </div>
                <div className={`p-3.5 rounded-sm ${card.bgColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Table */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
        <DepartmentTableWrapper viewOnly={viewOnly} allowFetch={allowFetch} />
      </div>
    </div>
  );
}
