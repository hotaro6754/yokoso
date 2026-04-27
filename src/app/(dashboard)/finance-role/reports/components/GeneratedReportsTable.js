"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Loader2,
  Eye,
  Trash2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function GeneratedReportsTable({ refreshKey }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [error, setError] = useState("");

  const typeOptions = [
    { id: "all", label: "All Types" },
    { id: "financial-summary", label: "Financial Summary" },
    { id: "expense-report", label: "Expense Report" },
    { id: "payroll-report", label: "Payroll Report" },
    { id: "tax-report", label: "Tax Report" },
    { id: "department-wise", label: "Department Analysis" },
    { id: "cost-center", label: "Cost Center" },
    { id: "monthly-report", label: "Monthly Report" },
    { id: "employee-wise", label: "Employee Financial" },
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/finance-role/reports", {
          params: { page: 1, limit: 50, type: typeFilter, search: searchQuery },
        });
        setData(response.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchReports, 300);
    return () => clearTimeout(timer);
  }, [typeFilter, searchQuery, refreshKey]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const getStatusBadge = (status) => {
    if (status === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
        <Clock className="w-3 h-3" /> Processing
      </span>
    );
  };

  const getFormatBadge = (format) => {
    const colors = {
      PDF: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
      Excel: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      CSV: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${colors[format] || "bg-muted text-muted-foreground border-border"}`}>
        {format}
      </span>
    );
  };

  const handleView = async (report) => {
    try {
      const response = await apiClient.get(`/finance-role/reports/${report.id}`);
      const blob = new Blob([JSON.stringify(response.data?.data || {}, null, 2)], { type: "application/json" });
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to open report");
    }
  };

  const handleDownload = async (report) => {
    try {
      const response = await apiClient.get(`/finance-role/reports/${report.id}`);
      const extension = (report.format || "PDF").toLowerCase();
      const blob = new Blob([JSON.stringify(response.data?.data || {}, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.name.replace(/\s+/g, "_")}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to download report");
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await apiClient.delete(`/finance-role/reports/${reportId}`);
      setData((prev) => prev.filter((item) => item.id !== reportId));
      toast.success("Report deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete report");
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 premium-shadow flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 premium-shadow flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 premium-shadow"
    >
      {/* Single-row header */}
      <div className="flex items-center gap-2 mb-6 min-w-0 overflow-hidden">
        {/* Left: icon + title */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-md border border-primary/10"
          >
            <FileText className="w-5 h-5" />
          </motion.div>
          <h3 className="text-base font-bold text-foreground whitespace-nowrap">Generated Reports</h3>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border flex-shrink-0" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Type filter dropdown */}
        <div className="relative flex-shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-36 pl-9 pr-7 py-2 rounded-lg bg-background border border-border text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            {typeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-32 pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 dark:bg-secondary-900/20 text-secondary-900 dark:text-secondary-100 text-xs font-bold uppercase tracking-wider border-b border-secondary-100 dark:border-secondary-800">
            <tr>
              <th className="text-left py-3 px-4 rounded-tl-lg">Report Name</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Format</th>
              <th className="text-left py-3 px-4">Size</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">No reports found</p>
                        <p className="text-xs text-muted-foreground mt-1">Generate a report using the form on the left</p>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-muted-foreground">{item.type}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(item.date)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getFormatBadge(item.format)}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-muted-foreground">{item.size}</span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        {item.status === "completed" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                              title="View"
                              onClick={() => handleView(item)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"
                              title="Download"
                              onClick={() => handleDownload(item)}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </motion.button>
                          </>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                          title="Delete"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
