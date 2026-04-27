"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ExportHistoryTable({ refreshKey = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const loadExports = useCallback(async (searchValue) => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/finance-role/account-bank-export/exports", {
        params: {
          page: 1,
          limit: 50,
          status: "all",
          search: searchValue || ""
        }
      });
      setData(response.data?.data?.exports || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load export history");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExports("");
  }, [loadExports, refreshKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExports(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, loadExports]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        icon: CheckCircle2,
        bg: "bg-success/10",
        text: "text-success",
        border: "border-success/20",
        label: "Completed",
      },
      processing: {
        icon: Clock,
        bg: "bg-warning/10",
        text: "text-warning",
        border: "border-warning/20",
        label: "Processing",
      },
      failed: {
        icon: XCircle,
        bg: "bg-destructive/10",
        text: "text-destructive",
        border: "border-destructive/20",
        label: "Failed",
      },
    };

    const config = statusConfig[status] || statusConfig.processing;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const filteredData = data.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesStatus;
  });

  const filterTabs = [
    { id: "all", label: "All", count: data.length },
    {
      id: "completed",
      label: "Completed",
      count: data.filter((e) => e.status === "completed").length,
    },
    {
      id: "processing",
      label: "Processing",
      count: data.filter((e) => e.status === "processing").length,
    },
    {
      id: "failed",
      label: "Failed",
      count: data.filter((e) => e.status === "failed").length,
    },
  ];

  const handleDownload = async (exportItem) => {
    try {
      const response = await apiClient.get(
        `/finance-role/account-bank-export/exports/${exportItem.id}/download`,
        { responseType: "blob" }
      );
      const contentType = response.headers?.["content-type"] || "application/octet-stream";
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      const contentDisposition = response.headers?.["content-disposition"] || "";
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const fallbackName = exportItem.fileName || `bank-export-${exportItem.id}`;
      const downloadName = fileNameMatch?.[1] || fallbackName;
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Export downloaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to download export file");
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 premium-shadow flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 premium-shadow"
    >
      {/* Header — single row: icon+title | filter pills | search */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">

        {/* Left: icon + title */}
        <div className="flex items-center gap-2 min-w-0">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-md border border-primary/10 flex-shrink-0"
          >
            <FileText className="w-5 h-5" />
          </motion.div>
          <h3 className="text-base font-bold text-foreground whitespace-nowrap">Export History</h3>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border flex-shrink-0" />

        {/* Center: filter pill tabs */}
        <div className="flex items-center gap-1.5 flex-1">
          {filterTabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${statusFilter === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === tab.id ? "bg-white/20 text-white" : "bg-border text-foreground"
                }`}>
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Right: search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search exports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-52 pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 dark:bg-secondary-900/20 text-secondary-900 dark:text-secondary-100 text-xs font-bold uppercase tracking-wider border-b border-secondary-100 dark:border-secondary-800">
            <tr>
              <th className="text-left py-3 px-4 rounded-tl-lg">
                File Name
              </th>
              <th className="text-left py-3 px-4">
                Type
              </th>
              <th className="text-left py-3 px-4">
                Account
              </th>
              <th className="text-left py-3 px-4">
                Date
              </th>
              <th className="text-left py-3 px-4">
                Records
              </th>
              <th className="text-left py-3 px-4">
                Amount
              </th>
              <th className="text-left py-3 px-4">
                Status
              </th>
              <th className="text-left py-3 px-4 rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No export files found</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          {item.fileName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                          {item.format}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-foreground">{item.exportType}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-foreground">{item.account}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(item.date)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-foreground">
                        {item.records}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-bold text-foreground">
                        {item.amount > 0 ? formatCurrency(item.amount) : "-"}
                      </span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-4 px-4">
                      {item.status === "completed" && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Download"
                          onClick={() => handleDownload(item)}
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                      )}
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
