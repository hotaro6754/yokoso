"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FileEdit, Search, Filter, Calendar, Clock, CheckCircle, AlertCircle, ChevronUp, ChevronDown, FileText, Edit, Plus, Info } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import BreadcrumbRightContent from "../components/BreadcrumbRightContent";
import { employeeRegularizationService } from "@/services/employee/regularization.service";
import { employeeAttendanceService } from "@/services/employee/attendance.service";

export default function Regularization() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({ date: "", inTime: "", outTime: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const formatDisplayDate = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDisplayTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const toLocalTimeInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const toIsoDate = (date) => date.toISOString().split("T")[0];

  const combineDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return null;
    return new Date(`${dateValue}T${timeValue}:00`).toISOString();
  };

  const normalizeStatus = (status) => {
    const normalized = String(status || "PENDING").toUpperCase();
    if (normalized === "APPROVED") return "Approved";
    if (normalized === "REJECTED") return "Rejected";
    if (normalized === "REQUEST_CHANGES") return "Rejected";
    return "Pending";
  };

  const fetchAttendanceTimes = async (dateValue) => {
    if (!dateValue) return;
    try {
      const response = await employeeAttendanceService.getMyAttendanceRecords({
        page: 1,
        limit: 1,
        startDate: new Date(`${dateValue}T00:00:00`).toISOString(),
        endDate: new Date(`${dateValue}T23:59:59`).toISOString()
      });

      const record = response?.data?.[0];
      if (!record) {
        setFormData((prev) => ({ ...prev, inTime: "", outTime: "" }));
        return;
      }

      const checkInValue = record.firstPunchIn || record.checkIn;
      const checkOutValue = record.lastPunchOut || record.checkOut;
      setFormData((prev) => ({
        ...prev,
        inTime: toLocalTimeInput(checkInValue),
        outTime: toLocalTimeInput(checkOutValue)
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load attendance times");
    }
  };

  // ─── 5-day regularization window ───────────────────────────────────────
  // Policy: Regularisation is only allowed for dates within the past 5 days.
  const MAX_PAST_DAYS = 5;

  const recentDates = useMemo(() => {
    const dates = [];
    // Only include today + last MAX_PAST_DAYS days (not future, not beyond 5)
    for (let i = 0; i <= MAX_PAST_DAYS; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push({
        value: toIsoDate(date),
        label: formatDisplayDate(date)
      });
    }
    return dates;
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

        const response = await employeeRegularizationService.getMyRequests({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: statusFilter === "All" ? "all" : statusFilter.toUpperCase(),
          search: searchQuery || undefined
        });

        const records = response?.data || [];
        const mapped = records.map((entry) => ({
          id: entry.id,
          dateKey: entry.date,
          date: formatDisplayDate(entry.date),
          inTime: formatDisplayTime(entry.requestedCheckIn),
          outTime: formatDisplayTime(entry.requestedCheckOut),
          reason: entry.reason,
          status: normalizeStatus(entry.status),
          raw: entry
        }));

        setData(mapped);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load regularization requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [selectedDate, statusFilter, searchQuery]);

  // Search + Filter
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter((item) => {
      const matchesSearch =
        !q ||
        item.date.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        enableSorting: true,
        cell: info => (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-brand-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">{info.getValue()}</span>
          </div>
        )
      },
      {
        accessorKey: "inTime",
        header: "In Time",
        enableSorting: true,
        cell: info => (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">{info.getValue()}</span>
          </div>
        )
      },
      {
        accessorKey: "outTime",
        header: "Out Time",
        enableSorting: true,
        cell: info => (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">{info.getValue()}</span>
          </div>
        )
      },
      {
        accessorKey: "reason",
        header: "Reason",
        enableSorting: true,
        cell: info => (
          <span className="text-gray-600 dark:text-gray-400 truncate max-w-[200px] block" title={info.getValue()}>{info.getValue()}</span>
        )
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: (info) => {
          const status = info.getValue();
          const statusConfig = {
            "Approved": { bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-500/30", icon: CheckCircle },
            "Pending": { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-500/30", icon: Clock },
            "Rejected": { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-500/30", icon: AlertCircle },
          };
          const config = statusConfig[status] || { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700", icon: AlertCircle };
          const Icon = config.icon;
          return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wide border ${config.bg} ${config.text} ${config.border}`}>
              <Icon size={12} />
              {status}
            </span>
          );
        },
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <button
            onClick={() => {
              const rawDate = row.original.raw?.date ? toIsoDate(new Date(row.original.raw.date)) : toIsoDate(selectedDate);
              const inValue = toLocalTimeInput(row.original.raw?.requestedCheckIn);
              const outValue = toLocalTimeInput(row.original.raw?.requestedCheckOut);
              setSelectedRow(row.original);
              setFormData({
                date: rawDate,
                inTime: inValue,
                outTime: outValue,
                reason: row.original.reason || ""
              });
              setError("");
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
            title="Edit Request"
          >
            <Edit size={14} />
          </button>
        ),
      },
    ],
    []
  );

  // React Table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
  });

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");

      // ── Frontend 5-day guard ─────────────────────────────────────────
      if (formData.date) {
        const selectedDt = new Date(formData.date);
        selectedDt.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - selectedDt) / (1000 * 60 * 60 * 24));
        if (diffDays > MAX_PAST_DAYS) {
          setError(`Regularization is only allowed for the past ${MAX_PAST_DAYS} days. The selected date is ${diffDays} days ago.`);
          setSubmitting(false);
          return;
        }
        if (selectedDt > today) {
          setError("Regularization cannot be raised for a future date.");
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        date: formData.date,
        requestedCheckIn: combineDateTime(formData.date, formData.inTime),
        requestedCheckOut: combineDateTime(formData.date, formData.outTime),
        reason: formData.reason
      };

      if (selectedRow?.id) {
        await employeeRegularizationService.updateRequest(selectedRow.id, payload);
      } else {
        await employeeRegularizationService.createRequest(payload);
      }

      setIsModalOpen(false);
      setSelectedRow(null);
      setFormData({ date: "", inTime: "", outTime: "", reason: "" });
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      const response = await employeeRegularizationService.getMyRequests({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: statusFilter === "All" ? "all" : statusFilter.toUpperCase(),
        search: searchQuery || undefined
      });
      const records = response?.data || [];
      setData(records.map((entry) => ({
        id: entry.id,
        dateKey: entry.date,
        date: formatDisplayDate(entry.date),
        inTime: formatDisplayTime(entry.requestedCheckIn),
        outTime: formatDisplayTime(entry.requestedCheckOut),
        reason: entry.reason,
        status: normalizeStatus(entry.status),
        raw: entry
      })));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 text-sm">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/employee/dashboard" },
            { label: "Attendance", href: "/employee/attendance" },
            { label: "Regularization" },
          ]}
          rightContent={<BreadcrumbRightContent selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
        />

        {/* Header Section */}
        <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-sm bg-brand-50 p-2 dark:bg-brand-500/20">
                <FileEdit className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Regularization Requests</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage and track your attendance correction requests.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedRow(null);
                setFormData({
                  date: toIsoDate(selectedDate),
                  inTime: "",
                  outTime: "",
                  reason: ""
                });
                setError("");
                setIsModalOpen(true);
                fetchAttendanceTimes(toIsoDate(selectedDate));
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold uppercase tracking-wide transition-colors shadow-sm"
            >
              <Plus size={16} />
              Raise Request
            </button>
          </div>
        </div>

        {/* 5-Day Policy Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-500/30 rounded-sm p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-sm flex-shrink-0">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                Regularization Policy
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 list-disc list-inside">
                <li>Regularization requests can only be raised for <strong>past {MAX_PAST_DAYS} days</strong>.</li>
                <li>Future dates are not allowed.</li>
                <li>Only <strong>Pending</strong> requests can be edited.</li>
                <li>Once submitted, requests go to HR for approval.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="bg-white dark:bg-gray-800 rounded-sm p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all text-xs"
              />
            </div>
            <div className="relative sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 focus:border-brand-500 outline-none text-xs cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm">
          {error && !isModalOpen && (
            <div className="px-5 py-3 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => {
                      const canSort = header.column.getCanSort?.() ?? false;
                      return (
                        <th
                          key={header.id}
                          className={`px-5 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${canSort ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" : ""
                            }`}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <span className="text-gray-400">
                                {header.column.getIsSorted() === 'asc' ? <ChevronUp size={12} /> : header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> : <div className="flex flex-col -space-y-1"><ChevronUp size={8} /><ChevronDown size={8} /></div>}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-brand-600" role="status"></div>
                      <p className="mt-2 text-xs">Loading requests...</p>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3 text-xs">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={24} className="text-gray-300" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No records found</p>
                        <p className="text-xs text-gray-400">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredData.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={pagination.pageIndex + 1}
                totalItems={filteredData.length}
                itemsPerPage={pagination.pageSize}
                onPageChange={(page) => table.setPageIndex(page - 1)}
                onItemsPerPageChange={(size) => {
                  table.setPageSize(size);
                  table.setPageIndex(0);
                  setPagination({ pageIndex: 0, pageSize: size });
                }}
              />
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-sm">
                    <FileEdit size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                      {selectedRow ? "Edit Request" : "New Request"}
                    </h2>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                      Only past {MAX_PAST_DAYS} days are allowed for regularization
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error && (
                  <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {error}
                  </div>
                )}
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Date</label>
                  <select
                    value={formData.date}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      setFormData((prev) => ({ ...prev, date: nextDate }));
                      fetchAttendanceTimes(nextDate);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                    required
                  >
                    {recentDates.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* In Time */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">In Time</label>
                    <input
                      type="time"
                      value={formData.inTime}
                      onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  {/* Out Time */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Out Time</label>
                    <input
                      type="time"
                      value={formData.outTime}
                      onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows={3}
                    placeholder="Why are you requesting this change?"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 uppercase tracking-wide transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-bold bg-brand-600 text-white rounded-sm hover:bg-brand-700 uppercase tracking-wide shadow-sm disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Saving..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
