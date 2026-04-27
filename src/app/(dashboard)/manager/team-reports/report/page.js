"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Download, ArrowLeft } from "lucide-react";
import { managerTeamReportsService } from "@/services/manager-services/team-reports.service";
import { toast } from "react-hot-toast";

export default function ReportDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get("id") || "R-101";
  const [reports, setReports] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const matchedReport = useMemo(
    () => reports.find((item) => item.id === reportId),
    [reportId, reports]
  );
  const report = matchedReport || reports[0];
  const hasReport = Boolean(matchedReport);

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "Team Reports & Insights", href: "/manager/team-reports" },
    { label: "Report", href: "/manager/team-reports/report" },
  ];

  const downloadCsv = () => {
    if (!hasReport || rows.length === 0) return;
    const csv = [
      ["Report", report?.title || "Report"],
      ["Name", "Value"],
      ...rows.map((row) => [row.label, `${row.value}%`]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${(report?.title || "report").replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    let active = true;

    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await managerTeamReportsService.getReports();
        if (!active) return;
        const normalizedReports = Array.isArray(data) ? data : data?.data || [];
        setReports(normalizedReports);
      } catch (err) {
        if (!active) return;
        const message = err?.message || "Unable to load reports";
        setError(message);
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchReports();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchPreview = async () => {
      if (!reportId) return;
      try {
        setLoading(true);
        const data = await managerTeamReportsService.getPreview(reportId);
        if (!active) return;
        const normalized = Array.isArray(data) ? data : data?.data || [];
        setRows(
          normalized.map((item) => ({
            label: item.name || "—",
            value: parseInt(String(item.value).replace(/[^0-9]/g, ""), 10) || 0
          }))
        );
      } catch (err) {
        if (!active) return;
        const message = err?.message || "Unable to load report preview";
        setError(message);
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPreview();

    return () => {
      active = false;
    };
  }, [reportId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700 p-6 shadow-sm">
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{report?.title || "Report"}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{report?.desc || "Details are unavailable."}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Category: {report?.category || "—"}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => router.push("/manager/team-reports")}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                onClick={downloadCsv}
                disabled={!hasReport || rows.length === 0 || loading}
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Team Metric Trend</h3>
              <div className="mt-4 space-y-3">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-gray-500 dark:text-gray-400">{row.label}</div>
                    <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-primary-600"
                        style={{ width: `${row.value}%` }}
                      />
                    </div>
                    <div className="w-10 text-xs text-gray-600 dark:text-gray-300">{row.value}%</div>
                  </div>
                ))}
                {rows.length === 0 && !loading && (
                  <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                    No data available for this report.
                  </div>
                )}
                {loading && (
                  <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                    Loading report data...
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Insights</h3>
              <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li>• Overall trend is stable with slight improvements.</li>
                <li>• Two team members are below the target threshold.</li>
                <li>• Suggested action: follow-up with low performers.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
