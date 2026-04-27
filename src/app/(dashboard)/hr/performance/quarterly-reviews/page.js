"use client";

import React, { useState, useEffect } from "react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  FileUp,
  Eye,
  MessageSquare,
  ExternalLink,
  AlertCircle as AlertIcon,
} from "lucide-react";
import ActionDropdown from "../../../master-admin/components/ActionDropdown";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { ReviewDetailsModal, RaisePIPModal, AddFeedbackModal } from "./components/ReviewModals";
import Breadcrumb from "@/components/common/Breadcrumb";

const QuarterlyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ reviewsCount: 0, pipCount: 0, meetingsCount: 0, averageRating: 0 });
  const [filters, setFilters] = useState({ cycleId: "all", quarter: "all" });
  const [searchQuery, setSearchQuery] = useState("");
  const [historyView, setHistoryView] = useState("reviews");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPIPModalOpen, setIsPIPModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    if (filters.cycleId === "all" && cycles.length === 1) {
      setFilters((prev) => ({ ...prev, cycleId: String(cycles[0].id) }));
    }
  }, [cycles, filters.cycleId]);

  useEffect(() => {
    if (!loading && reviews.length === 0 && kpis.length > 0) {
      setHistoryView("kpis");
    }
  }, [loading, reviews.length, kpis.length]);

  const readCachedKpis = () => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("zodeck_kra_upload_cache");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cyclesResult, reviewsResult, statsResult, kpisResult] = await Promise.allSettled([
        performanceManagementService.getAppraisalCycles(),
        performanceManagementService.getQuarterlyReviews(filters),
        performanceManagementService.getQuarterlyDashboardStats({ cycleId: filters.cycleId }),
        performanceManagementService.getKpis()
      ]);

      const cyclesData = cyclesResult.status === "fulfilled" ? cyclesResult.value : [];
      const reviewsData = reviewsResult.status === "fulfilled" ? reviewsResult.value : [];
      const statsData = statsResult.status === "fulfilled" ? statsResult.value : { reviewsCount: 0, pipCount: 0, meetingsCount: 0, averageRating: 0 };
      let kpisData = [];
      if (kpisResult.status === "fulfilled") {
        const resolved = kpisResult.value;
        kpisData = Array.isArray(resolved) ? resolved : resolved?.data || [];
        if (kpisData.length === 0) {
          kpisData = readCachedKpis();
        }
      } else {
        kpisData = readCachedKpis();
      }

      setCycles(cyclesData);
      setReviews(reviewsData);
      setStats(statsData);
      setKpis(kpisData);
    } catch (error) {
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAutoSchedule = async () => {
    if (!cycles.length) {
      toast.warn("No appraisal cycles available. Create a cycle first.");
      return;
    }
    if (!filters.cycleId || filters.cycleId === "all") {
      toast.warn("Please select a specific Appraisal Cycle first");
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmAutoSchedule = async () => {
    setIsConfirmOpen(false);
    try {
      setLoading(true);
      const result = await performanceManagementService.autoScheduleConnects(filters.cycleId);
      toast.success(result.message || `Successfully scheduled ${result.data?.scheduledCount || 0} connects!`, {
        icon: "🚀",
        theme: "colored"
      });
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      let data = [];
      let filename = "Quarterly_Performance_Report";

      if (historyView === "kpis") {
        data = filteredKpis.map((kpi) => ({
          Name: kpi.name || "",
          Description: kpi.description || "",
          Status: kpi.status || "Active"
        }));
        filename = "KRA_KPI_List";
      } else {
        data = await performanceManagementService.exportQuarterlyReviews(filters);
      }

      if (!data || data.length === 0) {
        toast.warn(historyView === "kpis" ? "No KRAs/KPIs available to export" : "No data available to export");
        return;
      }

      const headers = Object.keys(data[0]).join(",");
      const rows = data.map((obj) => Object.values(obj).map((val) => `"${val ?? ""}"`).join(",")).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(historyView === "kpis" ? "KRA/KPI list exported successfully!" : "Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.csv";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setLoading(true);
          let data;
          let csvHeaders = [];
          let csvRows = [];
          if (file.name.endsWith(".json")) {
            data = JSON.parse(event.target.result);
          } else {
            const lines = event.target.result.split("\n");
            const headers = lines[0].split(",").map((h) => h.trim()).filter(Boolean);
            csvHeaders = headers;
            csvRows = lines.slice(1).filter(Boolean).map((line) => line.split(","));
            data = lines.slice(1).filter(Boolean).map((line) => {
              const values = line.split(",");
              return headers.reduce((obj, header, i) => {
                obj[header.trim()] = values[i]?.trim();
                return obj;
              }, {});
            });
          }

          const normalizeKey = (key) =>
            String(key || "")
              .toLowerCase()
              .replace(/[\s_]+/g, "");

          const nameKeys = ["name", "kpi", "kra", "title", "goal"];
          const descKeys = ["description", "desc", "details", "summary"];
          const normalizedRows = Array.isArray(data)
            ? data.map((row) => {
                const normalized = {};
                Object.entries(row || {}).forEach(([k, v]) => {
                  normalized[normalizeKey(k)] = v;
                });
                return normalized;
              })
            : [];

          const hasRequired = normalizedRows.some((row) => {
            const hasName = nameKeys.some((k) => row[k]);
            const hasDesc = descKeys.some((k) => row[k]);
            return hasName && hasDesc;
          });

          let mappedPayload = normalizedRows.map((row) => {
            const name =
              row.name ||
              row.kpi ||
              row.kra ||
              row.title ||
              row.goal ||
              "";
            const description =
              row.description ||
              row.desc ||
              row.details ||
              row.summary ||
              "";
            return { name, description };
          }).filter((row) => row.name && row.description);

          if (!hasRequired && mappedPayload.length === 0 && csvHeaders.length >= 2) {
            mappedPayload = csvRows
              .map((cols) => ({
                name: (cols[0] || "").trim(),
                description: (cols[1] || "").trim(),
              }))
              .filter((row) => row.name && row.description);
          }

          if (!hasRequired && mappedPayload.length === 0) {
            toast.error("Invalid file format. Expected columns like Name/Title and Description/Details.");
            return;
          }

          if (mappedPayload.length === 0) {
            toast.error("No valid KPI/KRA rows found in the file.");
            return;
          }

          await performanceManagementService.bulkUploadKpis(mappedPayload);
          toast.success("Successfully uploaded KRAs in bulk!");
          fetchData();
        } catch (error) {
          const rawMessage = error?.message || "Upload failed";
          const isNoisy = rawMessage.length > 180 || /prisma|createMany|stack/i.test(rawMessage);
          toast.error(isNoisy ? "Upload failed. Please check the KPI/KRA template and try again." : `Upload failed: ${rawMessage}`);
          console.error("Bulk upload error:", error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleRaisePIP = (review) => {
    setSelectedReview(review);
    setIsPIPModalOpen(true);
  };

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setIsDetailsModalOpen(true);
  };

  const handleAddFeedback = (review) => {
    setSelectedReview(review);
    setIsFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async (feedback) => {
    try {
      await performanceManagementService.updateQuarterlyReview(selectedReview.id, feedback);
      toast.success("Feedback submitted successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to submit feedback: " + error.message);
    }
  };

  const getRatingColor = (rating) => {
    if (rating === "Above Expectations" || rating >= 4.5) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    if (rating === "Meets Expectations" || rating >= 3) return "bg-[var(--color-primary-hover)] text-[#0b1220] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)]";
    if (rating === "Below Expectations" || rating >= 2.5) return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const employeeName = `${review.employee.firstName} ${review.employee.lastName}`.toLowerCase();
    const reviewerName = `${review.manager.firstName} ${review.manager.lastName}`.toLowerCase();
    const designation = review.employee.designation?.name?.toLowerCase() || "";
    const cycleName = review.appraisalCycle.name?.toLowerCase() || "";
    const quarter = review.quarter?.toLowerCase() || "";

    return (
      employeeName.includes(query) ||
      reviewerName.includes(query) ||
      designation.includes(query) ||
      cycleName.includes(query) ||
      quarter.includes(query)
    );
  });

  const filteredKpis = kpis.filter((kpi) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = String(kpi.name || "").toLowerCase();
    const description = String(kpi.description || "").toLowerCase();
    return name.includes(query) || description.includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <ToastContainer />

      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr/dashboard" },
            { label: "Performance Management", href: "/hr/performance-management/appraisals" },
            { label: "Quarterly Reviews" },
          ]}
        />

        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Quarterly Reviews
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track organization-wide reviews, PIPs, 1:1 schedules, and review progress.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  name="cycleId"
                  value={filters.cycleId}
                  onChange={handleFilterChange}
                  className="h-10 min-w-[180px] appearance-none rounded-sm border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="all">All Cycles</option>
                  {cycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                  ))}
                </select>
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="quarter"
                  value={filters.quarter}
                  onChange={handleFilterChange}
                  className="h-10 min-w-[180px] appearance-none rounded-sm border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="all">All Quarters</option>
                  <option value="Q1">Q1 (Jan-Mar)</option>
                  <option value="Q2">Q2 (Apr-Jun)</option>
                  <option value="Q3">Q3 (Jul-Sep)</option>
                  <option value="Q4">Q4 (Oct-Dec)</option>
                </select>
                <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAutoSchedule}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0b1220] bg-[var(--color-primary)] rounded-sm hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
              >
                <Sparkles size={14} />
                Auto-Schedule
              </button>

              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Download size={14} />
                Export Report
              </button>

              <button
                onClick={() => window.location.assign("/hr/performance/quarterly-reviews/bulk-upload")}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0b1220] bg-[var(--color-primary-hover)] border border-[var(--color-primary)]/60 rounded-sm hover:bg-[var(--color-primary)]/70 dark:bg-[var(--color-primary)]/10 dark:border-[var(--color-primary)]/40 dark:text-[var(--color-primary)] transition-colors"
              >
                <FileUp size={14} />
                Bulk Upload KRAs
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reviews</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <BarChart3 size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reviewsCount}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <TrendingUp size={12} />
                +12%
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: "70%" }} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active PIPs</span>
              <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-full">
                <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pipCount}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                Action Req.
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-red-50 dark:bg-red-900/20 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(stats.pipCount * 10, 100)}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled 1:1s</span>
              <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <Calendar size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.meetingsCount}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                Upcoming
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-amber-50 dark:bg-amber-900/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: "45%" }} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Org Rating</span>
              <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                <BarChart3 size={14} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating?.toFixed(1) || "0.0"}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ 5.0</span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Based on {stats.reviewsCount} consolidated reviews
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Review History</h2>
              <div className="inline-flex rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setHistoryView("reviews")}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${historyView === "reviews" ? "bg-[var(--color-primary)] text-[#0b1220]" : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                >
                  Reviews
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryView("kpis")}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${historyView === "kpis" ? "bg-[var(--color-primary)] text-[#0b1220]" : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                >
                  KRAs/KPIs
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={historyView === "reviews" ? "Search employees..." : "Search KRAs/KPIs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-[var(--color-primary-hover)]/70 dark:bg-[var(--color-primary)]/10">
                <tr>
                  {historyView === "reviews" ? (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Reviewer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Cycle / Quarter</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={historyView === "reviews" ? "6" : "4"} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {historyView === "reviews" ? "Loading reviews..." : "Loading KRAs/KPIs..."}
                      </p>
                    </td>
                  </tr>
                ) : historyView === "reviews" && filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="mx-auto h-20 w-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reviews found</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
                    </td>
                  </tr>
                ) : historyView === "kpis" && filteredKpis.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="mx-auto h-20 w-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">No KRAs/KPIs found</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload a file to see them here.</p>
                    </td>
                  </tr>
                ) : historyView === "reviews" ? (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-sm bg-[var(--color-primary-hover)] text-[#0b1220] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
                            {review.employee.firstName[0]}{review.employee.lastName[0]}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {review.employee.firstName} {review.employee.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {review.employee.designation?.name || "Employee"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-300">
                            {review.manager.firstName[0]}
                          </div>
                          {review.manager.firstName} {review.manager.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{review.quarter}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{review.appraisalCycle.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-sm ${getRatingColor(review.rating)}`}>
                          {review.rating ? (typeof review.rating === "number" ? `★ ${review.rating}` : review.rating) : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {review.status === "SUBMITTED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            <CheckCircle2 size={12} /> Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <ActionDropdown
                          customActions={[
                            {
                              label: "View Details",
                              icon: Eye,
                              onClick: () => handleViewDetails(review),
                              iconClassName: "text-[var(--color-primary)]"
                            },
                            {
                              label: "Add Feedback",
                              icon: MessageSquare,
                              onClick: () => handleAddFeedback(review),
                              iconClassName: "text-purple-500"
                            },
                            {
                              label: "Raise PIP",
                              icon: AlertIcon,
                              onClick: () => handleRaisePIP(review),
                              className: "text-red-600",
                              iconClassName: "text-red-600"
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredKpis.map((kpi) => (
                    <tr key={kpi.id || kpi.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {kpi.name || "Untitled"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {kpi.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary-hover)] text-[#0b1220] border border-[var(--color-primary)]/60 dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)] dark:border-[var(--color-primary)]/40">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => toast.info(kpi.name || "KRA/KPI")}
                          className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 text-xs font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>
              Showing 1 to {historyView === "reviews" ? filteredReviews.length : filteredKpis.length} of{" "}
              {historyView === "reviews" ? reviews.length : kpis.length} results
            </span>
            <div className="flex gap-2">
              <button disabled className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-300 dark:text-gray-600 cursor-not-allowed">Previous</button>
              <button disabled className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-300 dark:text-gray-600 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmAutoSchedule}
        title="Auto-Schedule Meetings?"
        message="This will automatically schedule 1-on-1 meetings for all submitted reviews in this cycle. It respects manager capacity and avoids weekends. Proceed?"
        confirmText="Schedule Now"
        cancelText="Maybe Later"
      />

      <ReviewDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        review={selectedReview}
      />

      <RaisePIPModal
        isOpen={isPIPModalOpen}
        onClose={() => setIsPIPModalOpen(false)}
        review={selectedReview}
        onSuccess={fetchData}
      />

      <AddFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        review={selectedReview}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
};

export default QuarterlyReviewsPage;
