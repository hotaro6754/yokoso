"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  FileText,
  PieChart,
  BarChart3,
  Calendar,
  Users,
} from "lucide-react";

const reportTypes = [
  {
    id: "financial-summary",
    label: "Financial Summary",
    description: "Overview & key metrics",
    icon: DollarSign,
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    ringColor: "ring-blue-200 dark:ring-blue-800",
    selectedBorder: "border-blue-400 dark:border-blue-500",
  },
  {
    id: "expense-report",
    label: "Expense Report",
    description: "Expense analysis & breakdown",
    icon: Receipt,
    gradient: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-50 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
    ringColor: "ring-violet-200 dark:ring-violet-800",
    selectedBorder: "border-violet-400 dark:border-violet-500",
  },
  {
    id: "payroll-report",
    label: "Payroll Report",
    description: "Payroll cost analysis",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-green-600",
    lightBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    ringColor: "ring-emerald-200 dark:ring-emerald-800",
    selectedBorder: "border-emerald-400 dark:border-emerald-500",
  },
  {
    id: "tax-report",
    label: "Tax Report",
    description: "Tax deductions & compliance",
    icon: FileText,
    gradient: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    ringColor: "ring-amber-200 dark:ring-amber-800",
    selectedBorder: "border-amber-400 dark:border-amber-500",
  },
  {
    id: "department-wise",
    label: "Department Analysis",
    description: "Cost by department",
    icon: PieChart,
    gradient: "from-cyan-500 to-sky-600",
    lightBg: "bg-cyan-50 dark:bg-cyan-900/20",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    ringColor: "ring-cyan-200 dark:ring-cyan-800",
    selectedBorder: "border-cyan-400 dark:border-cyan-500",
  },
  {
    id: "cost-center",
    label: "Cost Center",
    description: "Cost center analysis",
    icon: BarChart3,
    gradient: "from-rose-500 to-pink-600",
    lightBg: "bg-rose-50 dark:bg-rose-900/20",
    iconColor: "text-rose-600 dark:text-rose-400",
    ringColor: "ring-rose-200 dark:ring-rose-800",
    selectedBorder: "border-rose-400 dark:border-rose-500",
  },
  {
    id: "monthly-report",
    label: "Monthly Report",
    description: "Month-wise performance",
    icon: Calendar,
    gradient: "from-teal-500 to-emerald-600",
    lightBg: "bg-teal-50 dark:bg-teal-900/20",
    iconColor: "text-teal-600 dark:text-teal-400",
    ringColor: "ring-teal-200 dark:ring-teal-800",
    selectedBorder: "border-teal-400 dark:border-teal-500",
  },
  {
    id: "employee-wise",
    label: "Employee Financial",
    description: "Per-employee financials",
    icon: Users,
    gradient: "from-indigo-500 to-violet-600",
    lightBg: "bg-indigo-50 dark:bg-indigo-900/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    ringColor: "ring-indigo-200 dark:ring-indigo-800",
    selectedBorder: "border-indigo-400 dark:border-indigo-500",
  },
];

export default function ReportTypeCards({ selectedReportType, setSelectedReportType }) {
  return (
    <div className="glass-card rounded-2xl p-5 premium-shadow">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Select Report Type</h3>
        {selectedReportType && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold"
          >
            {reportTypes.find((r) => r.id === selectedReportType)?.label}
          </motion.span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          const isSelected = selectedReportType === report.id;
          return (
            <motion.button
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedReportType(isSelected ? null : report.id)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center group ${isSelected
                  ? `${report.lightBg} ${report.selectedBorder} shadow-md ring-2 ${report.ringColor}`
                  : "bg-muted/30 border-border hover:bg-muted/60 hover:border-border"
                }`}
            >
              <div className={`p-2.5 rounded-xl ${isSelected ? report.lightBg : "bg-muted/50 group-hover:bg-muted"} transition-all`}>
                <Icon className={`w-4 h-4 ${isSelected ? report.iconColor : "text-muted-foreground group-hover:text-foreground"} transition-colors`} />
              </div>
              <div>
                <p className={`text-[10px] font-bold leading-tight ${isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"} transition-colors`}>
                  {report.label}
                </p>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary shadow flex items-center justify-center"
                >
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
