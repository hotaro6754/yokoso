"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, FileText, TrendingUp } from "lucide-react";
import ReportList from "@/app/(dashboard)/hr/payroll/reports/components/ReportList";
import { payrollService } from "@/services/hr-services/payroll.service";

export default function PayrollReportTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getPayrollAnalytics();
        setAnalytics(response?.data || null);
      } catch (error) {
        console.error("Error fetching payroll analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleDownloadReport = async (report) => {
    try {
      const blob = await payrollService.downloadReport(
        report.id,
        report.format?.toLowerCase() || "pdf"
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = report.name || `report-${report.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payroll Files
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generated payroll reports available for review and download.
            </p>
          </div>
          <Link
            href="/hr/payroll/reports"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200"
          >
            <FileText className="h-4 w-4" />
            Open Payroll Reports
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-sm bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Reports
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading ? "—" : analytics?.totalReports || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-sm bg-secondary-50 p-2 text-secondary-600 dark:bg-secondary-500/20 dark:text-secondary-300">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                This Month
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading ? "—" : analytics?.reportsThisMonth || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-sm bg-primary-50 p-2 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Distributed
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading ? "—" : analytics?.totalDistributed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ReportList onDownload={handleDownloadReport} />
      </div>
    </div>
  );
}
