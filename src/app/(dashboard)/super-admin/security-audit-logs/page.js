"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import DatePicker from "@/components/common/DatePicker";
import Pagination from "@/components/common/Pagination";
import { auditLogService } from "@/services/super-admin-services/audit-log.service";
import { Download, Filter, Loader2, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function toStartOfDayISO(yyyyMmDd) {
  if (!yyyyMmDd) return undefined;
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  return d.toISOString();
}

function toEndOfDayISO(yyyyMmDd) {
  if (!yyyyMmDd) return undefined;
  const d = new Date(`${yyyyMmDd}T23:59:59.999`);
  return d.toISOString();
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MODULE_OPTIONS = [
  { label: "All modules", value: "" },
  { label: "User Management", value: "USER" },
  { label: "Roles & Permissions", value: "ROLE" },
  { label: "Policy & Rules", value: "POLICY" },
  { label: "Workflow", value: "WORKFLOW" },
  { label: "Organization", value: "COMPANY" },
  { label: "Security", value: "AUTH" },
];

export default function SecurityAuditLogsPage() {
  const [searchText, setSearchText] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    critical: 0,
    warnings: 0,
  });

  const baseParams = useMemo(() => {
    const params = {};
    if (searchText?.trim()) params.search = searchText.trim();
    if (moduleFilter) params.module = moduleFilter;
    const startDate = toStartOfDayISO(fromDate);
    const endDate = toEndOfDayISO(toDate);
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [searchText, moduleFilter, fromDate, toDate]);

  const fetchLogs = useCallback(
    async (nextPage = page, nextLimit = limit, overrideParams = null) => {
      try {
        setLoading(true);
        const params = {
          page: nextPage,
          limit: nextLimit,
          ...(overrideParams || baseParams),
        };
        const res = await auditLogService.getAllLogs({
          ...params,
        });

        const payload = res?.data ?? res;
        const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        const total = payload?.pagination?.total ?? payload?.pagination?.totalItems ?? payload?.total ?? 0;

        if (items.length || total >= 0) {
          setLogs(items);
          setTotalItems(total);
          setStats((p) => ({ ...p, total }));
        } else {
          setLogs([]);
          setTotalItems(0);
          setStats((p) => ({ ...p, total: 0 }));
        }
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.message || "Failed to fetch logs");
        setLogs([]);
        setTotalItems(0);
        setStats((p) => ({ ...p, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [baseParams, page, limit]
  );

  const fetchStats = useCallback(async (overrideParams = null) => {
    try {
      // Stats follow the current filter context.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const params = overrideParams || baseParams;
      const [todayRes, criticalRes, warningsRes] = await Promise.all([
        auditLogService.getAllLogs({
          page: 1,
          limit: 1,
          ...params,
          startDate: today.toISOString(),
          endDate: todayEnd.toISOString(),
        }),
        auditLogService.getAllLogs({ page: 1, limit: 1, ...params, action: "DELETE" }),
        auditLogService.getAllLogs({ page: 1, limit: 1, ...params, action: "REJECT" }),
      ]);

      const todayTotal = (todayRes?.data ?? todayRes)?.pagination?.total ?? (todayRes?.data ?? todayRes)?.total ?? 0;
      const criticalTotal = (criticalRes?.data ?? criticalRes)?.pagination?.total ?? (criticalRes?.data ?? criticalRes)?.total ?? 0;
      const warningsTotal = (warningsRes?.data ?? warningsRes)?.pagination?.total ?? (warningsRes?.data ?? warningsRes)?.total ?? 0;

      setStats((p) => ({
        ...p,
        today: todayTotal,
        critical: criticalTotal,
        warnings: warningsTotal,
      }));
    } catch (e) {
      console.error(e);
      // Keep existing stats if optional calls fail
    }
  }, [baseParams]);

  useEffect(() => {
    // initial load
    fetchLogs(1, limit);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // pagination changes
    fetchLogs(page, limit);
  }, [page, limit, fetchLogs]);

  const handleViewAll = async () => {
    setSearchText("");
    setModuleFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
    const emptyParams = {};
    await fetchLogs(1, limit, emptyParams);
    await fetchStats(emptyParams);
  };

  const handleApplyFilters = async () => {
    setPage(1);
    await fetchLogs(1, limit);
    await fetchStats();
  };

  const handleExport = async () => {
    try {
      toast.loading("Preparing export...", { id: "exportLogs" });

      const response = await auditLogService.exportLogs({ ...baseParams });

      const disposition =
        response.headers?.["content-disposition"] || response.headers?.["Content-Disposition"];
      let fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      if (disposition) {
        const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i);
        const extracted = decodeURIComponent(match?.[1] || match?.[2] || "");
        if (extracted) fileName = extracted;
      }

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export completed.", { id: "exportLogs" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to export logs", { id: "exportLogs" });
    }
  };

  return (
    <div className="min-h-screen space-y-6 pb-12 pt-6">
      <Toaster position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumb pageName="Security & Audit Logs" />

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:bg-primary-700 transition-all"
        >
          <Download className="h-4 w-4" />
          Export logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Search user / action..."
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full appearance-none pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {MODULE_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <DatePicker
            name="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="dd-mm-yyyy"
            maxDate={toDate ? new Date(toDate) : null}
          />

          <DatePicker
            name="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="dd-mm-yyyy"
            minDate={fromDate ? new Date(fromDate) : null}
          />
        </div>
      </div>

      {/* Logs Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
          <button
            type="button"
            onClick={handleViewAll}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            View All
          </button>
        </div>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Logs</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.today}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today's Logs</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.warnings}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 pb-6">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="company-admin-primary-bg-90">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-700 dark:text-white/90 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-700 dark:text-white/90 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-700 dark:text-white/90 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-700 dark:text-white/90 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-700 dark:text-white/90 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading logs...
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {log.userName || log.user?.email || "System"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{log.module || "—"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                        {log.action || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {log.description || `${log.action || ""}${log.module ? ` in ${log.module}` : ""}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleViewAll}
              className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm py-2.5 px-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              View All Logs
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="flex-1 rounded-xl bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm py-2.5 px-4 border border-primary-200 dark:border-primary-800 hover:bg-primary-200 dark:hover:bg-primary-900/30 transition-colors"
            >
              Filter Logs
            </button>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 pb-6">
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={(p) => setPage(p)}
            onItemsPerPageChange={(s) => {
              setLimit(s);
              setPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}

