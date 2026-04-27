"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  Layers,
  Users,
  CalendarRange,
  RefreshCcw,
  CheckCircle2,
  Clock
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import { useAuth } from "@/context/AuthContext";

const tabs = [
  { id: "ctc", label: "CTC Structures", icon: Layers, href: "/payroll-compliance/salary-structure/ctc" },
  // { id: "assignment", label: "Assign to Employees", icon: Users, href: "/payroll-compliance/salary-structure/assignment" },
  // { id: "effective-dates", label: "Effective Dates", icon: CalendarRange, href: "/payroll-compliance/salary-structure/effective-dates" },
  { id: "revisions", label: "Salary Revisions", icon: RefreshCcw, href: "/payroll-compliance/salary-structure/revisions" },
  { id: "history", label: "CTC History", icon: Clock, href: "/payroll-compliance/salary-structure/history" }
];

export default function PayrollComplianceSalaryStructureLayout({ children }) {
  const pathname = usePathname();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await payrollSalaryStructureService.getSalaryStructureStats();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setStats({
            totalStructures: 0,
            activeStructures: 0,
            assignedEmployees: 0,
            pendingAssignments: 0
          });
        }
      } catch (error) {
        setStats({
          totalStructures: 0,
          activeStructures: 0,
          assignedEmployees: 0,
          pendingAssignments: 0
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const statsChartOptions = useMemo(() => ({
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit"
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "60%"
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Total", "Active", "Assigned", "Pending"]
    },
    yaxis: { labels: { show: false } },
    colors: ["hsl(var(--primary))"],
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "inherit",
        color: "var(--foreground)"
      }
    }
  }), []);

  const statsChartSeries = useMemo(() => ([
    {
      name: "Count",
      data: [
        stats?.totalStructures || 0,
        stats?.activeStructures || 0,
        stats?.assignedEmployees || 0,
        stats?.pendingAssignments || 0
      ]
    }
  ]), [stats]);

  const { isHR } = useAuth();

  const filteredTabs = useMemo(() => {
    if (isHR) {
      return tabs
        .filter(tab => tab.id !== "ctc")
        .map(tab => tab.id === "revisions" ? { ...tab, label: "Salary Revision Approval" } : tab);
    }
    return tabs;
  }, [isHR]);

  return (
    <div className="bg-background min-h-screen p-4 sm:p-6">
      <Breadcrumb />

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isHR ? "Salary Revision Approval" : "Salary Structure"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isHR ? "Approve or reject employee salary revisions and view history" : "Manage and configure salary components and structures"}
          </p>
        </div>
      </div>

      {stats && !isHR && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {[
            { label: "Total Structures", value: stats.totalStructures, icon: Layers, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-800" },
            { label: "Active", value: stats.activeStructures, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-800" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`p-4 rounded-xl border ${stat.border} ${stat.bg} flex items-center gap-4 transition-all hover:shadow-md`}
            >
              <div className={`p-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${stat.color}`}>
                <stat.icon size={20} strokeWidth={2} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">{stat.value}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.005 }}
        className="glass-card rounded-2xl premium-shadow border border-border/20"
      >
        <div className="flex flex-wrap gap-2 border-b border-border px-3 pt-3 sm:px-4">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm relative ${isActive
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 sm:p-6">
          {loadingStats && !stats && (
            <div className="text-sm text-muted-foreground">Loading stats...</div>
          )}
          {children}
        </div>
      </motion.div>
    </div>
  );
}
