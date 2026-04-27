"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Download, Loader2, Printer } from "lucide-react";
import { assetService } from "@/services/hr-services/asset.service";
import { downloadCsv, downloadExcel, downloadPdf, printReport } from "./reportExport";

const normalizeRows = (payload) => {
  const rows = payload?.data?.assets || payload?.data || payload?.assets || payload || [];
  return Array.isArray(rows) ? rows : [];
};

export default function AssetReportTab() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await assetService.getAllAssets();
        setRows(normalizeRows(response));
      } catch (err) {
        setError(err?.message || "Failed to load asset report");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const exportRows = useMemo(() => {
    return rows.map((item) => ({
      assetId: item.assetId || item.id || "-",
      name: item.name || item.assetName || "-",
      category: item.category?.name || item.category || "-",
      status: item.status || "-",
      assignedTo: item.assignedTo?.name || item.assignee || "-",
      location: item.location || "-",
      purchaseDate: item.purchaseDate || "",
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
          <Box className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Report</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Current asset inventory and assignments.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  downloadCsv({
                    columns: ["assetId", "name", "category", "status", "assignedTo", "location", "purchaseDate"],
                    rows: exportRows,
                    fileName: "asset-report.csv",
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
                    columns: ["assetId", "name", "category", "status", "assignedTo", "location", "purchaseDate"],
                    rows: exportRows,
                    fileName: "asset-report.xlsx",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={() => downloadPdf({ fileName: "asset-report.pdf" })}
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
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Assets</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Asset</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rows.length > 0 ? (
                    rows.slice(0, 50).map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.name || item.assetName || "N/A"}
                          <span className="block text-xs text-gray-500 dark:text-gray-400">{item.assetId || item.id || ""}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.category?.name || item.category || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.status || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.assignedTo?.name || item.assignee || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No assets available.
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

