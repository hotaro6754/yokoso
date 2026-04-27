"use client";

import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { FileBarChart, Users, TrendingDown, Calendar, Briefcase, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { deptHeadReportsService } from "@/services/dept-head-services/reports.service";

export default function DepartmentReportsPage() {
  const [selectedReport, setSelectedReport] = useState("headcount");
  const [reportData, setReportData] = useState({
    headcount: { totalEmployees: 0, byDesignation: [], trend: "N/A" },
    attrition: { totalAttrition: 0, attritionRate: "0%", byMonth: [], reasons: [] },
    leaveTrends: { totalLeaves: 0, averagePerEmployee: 0, byType: [], peakMonths: [] },
    hiringStatus: { openPositions: 0, filledThisQuarter: 0, pendingApprovals: 0, averageTimeToFill: "N/A" }
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await deptHeadReportsService.getOverview();
      setReportData(response?.data || response || {});
    } catch (error) {
      console.error("Failed to fetch department reports", error);
      toast.error("Failed to load department reports");
      setReportData({
        headcount: { totalEmployees: 0, byDesignation: [], trend: "N/A" },
        attrition: { totalAttrition: 0, attritionRate: "0%", byMonth: [], reasons: [] },
        leaveTrends: { totalLeaves: 0, averagePerEmployee: 0, byType: [], peakMonths: [] },
        hiringStatus: { openPositions: 0, filledThisQuarter: 0, pendingApprovals: 0, averageTimeToFill: "N/A" }
      });
    } finally {
      setLoading(false);
    }
  };

  const reports = useMemo(() => ({
    headcount: {
      title: "Department Headcount",
      icon: Users,
      data: reportData.headcount || { totalEmployees: 0, byDesignation: [], trend: "N/A" },
    },
    attrition: {
      title: "Attrition Report",
      icon: TrendingDown,
      data: reportData.attrition || { totalAttrition: 0, attritionRate: "0%", byMonth: [], reasons: [] },
    },
    leaveTrends: {
      title: "Leave Trends",
      icon: Calendar,
      data: reportData.leaveTrends || { totalLeaves: 0, averagePerEmployee: 0, byType: [], peakMonths: [] },
    },
    hiringStatus: {
      title: "Hiring Status Report",
      icon: Briefcase,
      data: reportData.hiringStatus || { openPositions: 0, filledThisQuarter: 0, pendingApprovals: 0, averageTimeToFill: "N/A" },
    },
  }), [reportData]);

  const reportTabs = [
    { id: "headcount", label: "Headcount", icon: Users },
    { id: "attrition", label: "Attrition", icon: TrendingDown },
    { id: "leaveTrends", label: "Leave Trends", icon: Calendar },
    { id: "hiringStatus", label: "Hiring Status", icon: Briefcase },
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      const report = reports[selectedReport];
      if (!report) {
        toast.error("No report selected");
        return;
      }

      let rows = [];

      if (selectedReport === "headcount") {
        rows = [
          ["Metric", "Value"],
          ["Total Employees", report.data.totalEmployees ?? 0],
          ["Trend", report.data.trend ?? "N/A"],
          [],
          ["Designation", "Count"],
          ...(report.data.byDesignation || []).map((item) => [item.designation, item.count]),
        ];
      } else if (selectedReport === "attrition") {
        rows = [
          ["Metric", "Value"],
          ["Total Attrition", report.data.totalAttrition ?? 0],
          ["Attrition Rate", report.data.attritionRate ?? "0%"],
          [],
          ["Month", "Count"],
          ...(report.data.byMonth || []).map((item) => [item.month, item.count]),
          [],
          ["Reason", "Count"],
          ...(report.data.reasons || []).map((item) => [item.reason, item.count]),
        ];
      } else if (selectedReport === "leaveTrends") {
        rows = [
          ["Metric", "Value"],
          ["Total Leaves", report.data.totalLeaves ?? 0],
          ["Average Per Employee", report.data.averagePerEmployee ?? 0],
          [],
          ["Leave Type", "Count"],
          ...(report.data.byType || []).map((item) => [item.type, item.count]),
          [],
          ["Peak Month"],
          ...(report.data.peakMonths || []).map((item) => [item]),
        ];
      } else if (selectedReport === "hiringStatus") {
        rows = [
          ["Metric", "Value"],
          ["Open Positions", report.data.openPositions ?? 0],
          ["Filled This Quarter", report.data.filledThisQuarter ?? 0],
          ["Pending Approvals", report.data.pendingApprovals ?? 0],
          ["Average Time To Fill", report.data.averageTimeToFill ?? "N/A"],
        ];
      }

      const csv = rows
        .map((row) =>
          row
            .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${report.title.replace(/\s+/g, "-").toLowerCase()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const renderReportContent = () => {
    const report = reports[selectedReport];
    if (!report) return null;
    const IconComponent = report.icon;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <IconComponent className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{report.title}</h3>
          </div>
          <button
            onClick={handleExport}
            disabled={loading || exporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {loading ? "Loading..." : exporting ? "Exporting..." : "Export"}
          </button>
        </div>
        <div className="space-y-6">
          {selectedReport === "headcount" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Employees</p>
                  <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {report.data.totalEmployees}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Trend</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {report.data.trend}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">By Designation</h4>
                <div className="space-y-2">
                  {report.data.byDesignation.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.designation}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedReport === "attrition" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Attrition</p>
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                    {report.data.totalAttrition}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Attrition Rate</p>
                  <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                    {report.data.attritionRate}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">By Month</h4>
                <div className="space-y-2">
                  {report.data.byMonth.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.month}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedReport === "leaveTrends" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Leaves</p>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {report.data.totalLeaves}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Avg per Employee</p>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {report.data.averagePerEmployee}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">By Type</h4>
                <div className="space-y-2">
                  {report.data.byType.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.type}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedReport === "hiringStatus" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Open Positions</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {report.data.openPositions}
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Filled This Quarter</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {report.data.filledThisQuarter}
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Pending Approvals</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {report.data.pendingApprovals}
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Avg Time to Fill</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {report.data.averageTimeToFill}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Department Head", href: "/dept-head" },
            { label: "Department Reports", href: "/dept-head/reports" },
          ]}
        />

        {/* Header Section */}
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <FileBarChart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Department Reports</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Data insights for your department
              </p>
            </div>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {reportTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedReport === tab.id
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Content */}
        {renderReportContent()}
      </div>
    </div>
  );
}
