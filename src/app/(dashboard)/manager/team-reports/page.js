"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  FileBarChart,
  Filter,
  Search,
  Download,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { managerTeamReportsService } from "@/services/manager-services/team-reports.service";
import { toast } from "react-hot-toast";

export default function ManagerTeamReportsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [summary, setSummary] = useState({
    teamMembers: 0,
    avgGoalProgress: 0,
    appraisalsDone: 0,
    reportsUpdated: 0
  });
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "Team Reports & Insights", href: "/manager/team-reports" },
  ];

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesQuery =
        report.title.toLowerCase().includes(query.toLowerCase()) ||
        report.desc.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || report.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category, reports]);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, reportsData] = await Promise.all([
          managerTeamReportsService.getSummary(),
          managerTeamReportsService.getReports()
        ]);
        if (!active) return;
        const normalizedSummary = summaryData?.data || summaryData || {};
        const normalizedReports = Array.isArray(reportsData) ? reportsData : reportsData?.data || [];
        setSummary({
          teamMembers: normalizedSummary.teamMembers || 0,
          avgGoalProgress: normalizedSummary.avgGoalProgress || 0,
          appraisalsDone: normalizedSummary.appraisalsDone || 0,
          reportsUpdated: normalizedSummary.reportsUpdated || normalizedReports.length || 0
        });
        setReports(normalizedReports);
        setActiveReport(normalizedReports[0] || null);
      } catch (err) {
        if (!active) return;
        const message = err?.message || "Unable to load reports";
        setError(message);
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchPreview = async () => {
      if (!activeReport?.id) return;
      try {
        setPreviewLoading(true);
        const data = await managerTeamReportsService.getPreview(activeReport.id);
        if (!active) return;
        setPreviewRows(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        if (!active) return;
        const message = err?.message || "Unable to load report preview";
        setError(message);
        toast.error(message);
      } finally {
        if (active) setPreviewLoading(false);
      }
    };

    fetchPreview();

    return () => {
      active = false;
    };
  }, [activeReport?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Users size={14} /> Team Members
            </div>
            <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{summary.teamMembers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <TrendingUp size={14} /> Avg Goal Progress
            </div>
            <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{summary.avgGoalProgress}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <CheckCircle2 size={14} /> Appraisals Done
            </div>
            <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{summary.appraisalsDone}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={14} /> Reports Updated
            </div>
            <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{summary.reportsUpdated}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                <FileBarChart className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Reports & Insights</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Read-only team analytics</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search reports"
                  className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <Filter size={14} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="py-2 px-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
                >
                  <option value="All">All</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Leave">Leave</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              {filteredReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report)}
                  className={`w-full text-left rounded-xl border p-4 transition ${
                    activeReport.id === report.id
                      ? "border-primary-500/40 bg-primary-50/50 dark:bg-primary-500/10"
                      : "border-gray-200/70 dark:border-gray-700/60 hover:border-primary-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{report.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{report.desc}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{report.updated}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Category: {report.category}
                  </div>
                </button>
              ))}
              {filteredReports.length === 0 && !loading && (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400">
                  No reports match your filters.
                </div>
              )}
              {loading && (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400">
                  Loading reports...
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeReport?.title || "Report Preview"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Preview snapshot</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{activeReport?.updated || ""}</span>
              </div>
              <div className="mt-4 space-y-3">
                {previewRows.map((row) => (
                  <div key={row.name} className="rounded-lg border border-gray-200/70 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{row.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.metric}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Value: {row.value}</p>
                  </div>
                ))}
                {previewRows.length === 0 && !previewLoading && (
                  <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                    No preview data available.
                  </div>
                )}
                {previewLoading && (
                  <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                    Loading preview...
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                  onClick={() =>
                    activeReport &&
                    router.push(`/manager/team-reports/report?id=${encodeURIComponent(activeReport.id)}`)
                  }
                  disabled={!activeReport}
                >
                  <Eye size={14} /> View Report
                </button>
                <button
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => {
                    if (!activeReport) return;
                    const csv = [
                      ["Report", activeReport.title],
                      ["Metric", "Value"],
                      ...previewRows.map((row) => [row.name, row.value]),
                    ]
                      .map((row) => row.join(","))
                      .join("\n");
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `${activeReport.title.replace(/\s+/g, "-").toLowerCase()}.csv`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                  }}
                  disabled={!activeReport}
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
