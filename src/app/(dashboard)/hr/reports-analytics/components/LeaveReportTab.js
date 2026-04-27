"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, Loader2, Printer } from "lucide-react";
import { leaveReportsService } from "@/services/hr-services/leaveReports.service";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "./reportExport";

const normalizeRows = (payload) => {
  const rows = payload?.data || payload?.rows || payload || [];
  return Array.isArray(rows) ? rows : [];
};

export default function LeaveReportTab({ globalFilters }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          department: globalFilters?.departmentId !== "all" ? globalFilters?.departmentId : "all",
          page: 1,
          limit: 100,
        };
        if (globalFilters?.startDate) params.startDate = globalFilters.startDate;
        if (globalFilters?.endDate) params.endDate = globalFilters.endDate;

        const response = await leaveReportsService.getEmployeeLeaveSummary(params);
        setRows(normalizeRows(response));
      } catch (err) {
        setError(err?.message || "Failed to load leave report");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [globalFilters]);

  const exportRows = useMemo(() => {
    return rows.map((item) => ({
      employee: item.name || item.employeeName || "-",
      department: item.department || "-",
      totalLeaves: item.totalLeaves || 0,
      usedLeaves: item.usedLeaves || 0,
      remainingLeaves: item.remainingLeaves || 0,
    }));
  }, [rows]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <CalendarDays className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Report</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Employee-wise leave usage and balances.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  downloadCsv({
                    columns: ["employee", "department", "totalLeaves", "usedLeaves", "remainingLeaves"],
                    rows: exportRows,
                    fileName: "leave-report.csv",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button
                onClick={() =>
                  downloadExcel({
                    columns: ["employee", "department", "totalLeaves", "usedLeaves", "remainingLeaves"],
                    rows: exportRows,
                    fileName: "leave-report.xlsx",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={() => downloadPdf({ fileName: "leave-report.pdf" })}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Printer className="h-4 w-4" />
                PDF / Print
              </button>
              <button
                onClick={printReport}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Employee Leave Summary</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Used</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rows.length > 0 ? (
                    rows.slice(0, 50).map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.name || item.employeeName || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.department || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.totalLeaves || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.usedLeaves || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.remainingLeaves || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No leave data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
