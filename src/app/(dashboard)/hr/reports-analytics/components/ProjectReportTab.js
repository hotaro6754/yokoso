"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FolderKanban, Loader2, Printer } from "lucide-react";
import projectService from "@/services/project.service";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "./reportExport";

const normalizeRows = (payload) => {
  const rows = payload?.data || payload?.projects || payload || [];
  return Array.isArray(rows) ? rows : [];
};

export default function ProjectReportTab() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await projectService.getAllProjects();
        setRows(normalizeRows(response));
      } catch (err) {
        setError(err?.message || "Failed to load project report");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const exportRows = useMemo(() => {
    return rows.map((item) => ({
      code: item.projectCode || item.code || "-",
      name: item.projectName || item.name || "-",
      client: item.clientName || item.client || "-",
      status: item.status || "-",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
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
          <FolderKanban className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Report</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Project portfolio status and key metadata.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  downloadCsv({
                    columns: ["code", "name", "client", "status", "startDate", "endDate"],
                    rows: exportRows,
                    fileName: "project-report.csv",
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
                    columns: ["code", "name", "client", "status", "startDate", "endDate"],
                    rows: exportRows,
                    fileName: "project-report.xlsx",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={() => downloadPdf({ fileName: "project-report.pdf" })}
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
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Projects</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Project</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Start</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">End</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rows.length > 0 ? (
                    rows.slice(0, 50).map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.projectName || item.name || "N/A"}
                          <span className="block text-xs text-gray-500 dark:text-gray-400">{item.projectCode || item.code || ""}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.clientName || item.client || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.status || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.startDate ? new Date(item.startDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.endDate ? new Date(item.endDate).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No projects available.
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

