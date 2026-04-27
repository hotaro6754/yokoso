import React, { useState } from "react";
import { Download } from "lucide-react";
import { leaveReportsService } from "@/services/hr-services/leaveReports.service";
import LeaveChart from "./LeaveChart";

const LeaveAnalytics = ({ analytics, period, onPeriodChange }) => {
  const data = analytics?.data || [];

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    onPeriodChange?.(newPeriod);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!data || data.length === 0) return;

    const start = analytics?.startDate ? String(analytics.startDate).split("T")[0] : "";
    const end = analytics?.endDate ? String(analytics.endDate).split("T")[0] : "";

    try {
      setIsExporting(true);
      await leaveReportsService.exportReport({
        type: "leave_requests",
        format: "excel",
        dateRange: "custom",
        startDate: start,
        endDate: end
      });
    } catch (error) {
      console.error("Failed to export report:", error);
      alert(error.message || "Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Weekly Leave Analytics
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!data || data.length === 0 || isExporting}
            className="inline-flex items-center gap-2 rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {isExporting ? "Exporting..." : "Download Report"}
          </button>
          <select 
            value={period || "thisWeek"}
            onChange={handlePeriodChange}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="thisWeek">This Week</option>
            <option value="lastWeek">Last Week</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>
      </div>

      <LeaveChart data={data} />

      <div className="flex flex-wrap justify-center mt-4 gap-4 sm:gap-6 space-x-0 sm:space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Approved</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Rejected</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Pending</span>
        </div>
      </div>
    </div>
  );
};

export default LeaveAnalytics;
