"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/common/Breadcrumb";
import { BarChart3, TrendingUp, FileText, Sparkles } from "lucide-react";
import ReportTypeCards from "./components/ReportTypeCards";
import ReportGeneratorWidget from "./components/ReportGeneratorWidget";
import GeneratedReportsTable from "./components/GeneratedReportsTable";

export default function FinanceReportsPage() {
  const breadcrumbItems = [
    { label: "Finance", href: "/finance-role" },
    { label: "Reports", href: "/finance-role/reports" },
  ];

  const [selectedReportType, setSelectedReportType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden glass-card rounded-2xl p-6 premium-shadow"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <div className="relative flex items-center gap-5">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30"
            >
              <BarChart3 className="w-7 h-7" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Finance Reports</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Sparkles className="w-3 h-3" /> Analytics
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate, configure, and download comprehensive financial reports across all dimensions.
              </p>
            </div>
            {/* Quick stats */}
            <div className="hidden lg:flex items-center gap-6">
              {[
                { icon: FileText, label: "Report Types", value: "8" },
                { icon: TrendingUp, label: "Formats", value: "3" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-xl font-extrabold text-foreground">{stat.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Report Type Selector */}
        <ReportTypeCards
          selectedReportType={selectedReportType}
          setSelectedReportType={setSelectedReportType}
        />

        {/* Generator + Table — 1/3 + 2/3 split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ReportGeneratorWidget
              selectedReportType={selectedReportType}
              onGenerated={() => setRefreshKey((prev) => prev + 1)}
            />
          </div>
          <div className="lg:col-span-2">
            <GeneratedReportsTable refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
