"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import ManagerLeaveService from "@/services/manager/leave-requests.service";
import { format } from "date-fns";
import { Search, Filter, X, Calendar, ChevronUp, ChevronDown, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Pagination from "@/components/common/Pagination";

export default function LeaveHistoryTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [serverPagination, setServerPagination] = useState({ totalItems: 0, totalPages: 0 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveHistory();
  }, [pagination.pageIndex, pagination.pageSize, statusFilter]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [statusFilter]);

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const response = await ManagerLeaveService.getLeaveHistory({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        status: statusFilter
      });

      console.log('Leave History Response:', response); // Debug log

      const records = response.data || [];
      const mapped = records.map((record) => ({
        id: record.id,
        createdAt: record.createdAt || null,
        submitted: record.submitted || null,
        leaveType: record.type || record.leaveType?.name || record.leaveType,
        startDate: record.startDate || record.fromDate,
        endDate: record.endDate || record.toDate,
        days: record.days,
        status: record.status,
        reason: record.reason
      }));
      setData(mapped);

      // Ensure pagination data has proper defaults
      const paginationData = response.pagination || {};
      const finalPagination = {
        totalItems: paginationData.totalItems || records.length || 0,
        totalPages: paginationData.totalPages || Math.ceil((records.length || 0) / pagination.pageSize) || 1
      };

      console.log('Setting server pagination:', finalPagination); // Debug log
      setServerPagination(finalPagination);
    } catch (error) {
      console.error("Failed to fetch leave history", error);
      // Set empty data and pagination on error
      setData([]);
      setServerPagination({
        totalItems: 0,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const statuses = useMemo(
    () => [
      { value: "all", label: "All Status" },
      { value: "approved", label: "Approved" },
      { value: "pending", label: "Pending" },
      { value: "rejected", label: "Rejected" },
      { value: "cancelled", label: "Cancelled" }
    ],
    []
  );

  const filteredData = useMemo(() => {
    let result = [...data];
    if (globalFilter) {
      const term = globalFilter.toLowerCase();
      result = result.filter(
        (d) =>
          d.leaveType?.toLowerCase().includes(term) ||
          d.reason?.toLowerCase().includes(term) ||
          d.status?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((d) => String(d.status || "").toLowerCase() === statusFilter);
    }
    return result;
  }, [globalFilter, statusFilter, data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: "Submitted",
        enableSorting: true,
        cell: (info) => {
          const rawValue = info.getValue() || info.row.original.submitted;
          const parsed = rawValue ? new Date(rawValue) : null;
          const display = parsed && !Number.isNaN(parsed.getTime())
            ? format(parsed, "dd-MM-yyyy")
            : rawValue || "-";
          return (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-primary-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {display}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: "leaveType",
        header: "Leave Type",
        enableSorting: true,
        cell: info => (
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {info.getValue() || info.row.original.leaveType}
          </span>
        )
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-600 dark:text-gray-400">
            {info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-"}
          </span>
        )
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-600 dark:text-gray-400">
            {info.getValue() ? format(new Date(info.getValue()), "dd-MM-yyyy") : "-"}
          </span>
        )
      },
      {
        accessorKey: "days",
        header: "Days",
        enableSorting: true,
        cell: (info) => {
          let days = info.row.original.duration;
          if (!days && info.row.original.startDate && info.row.original.endDate) {
            const start = new Date(info.row.original.startDate);
            const end = new Date(info.row.original.endDate);
            const diffTime = Math.abs(end - start);
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          }
          return (
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {days || "-"}
            </span>
          );
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: (info) => {
          const status = info.getValue();
          const statusConfig = {
            "APPROVED": { bg: "bg-primary-50 dark:bg-primary-500/10", text: "text-primary-700 dark:text-primary-400", border: "border-primary-200 dark:border-primary-500/30", icon: CheckCircle },
            "Approved": { bg: "bg-primary-50 dark:bg-primary-500/10", text: "text-primary-700 dark:text-primary-400", border: "border-primary-200 dark:border-primary-500/30", icon: CheckCircle },
            "PENDING": { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/30", icon: Clock },
            "Pending": { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/30", icon: Clock },
            "REJECTED": { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-500/30", icon: AlertCircle },
            "Rejected": { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-500/30", icon: AlertCircle },
            "Cancelled": { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700", icon: AlertCircle },
          };
          const config = statusConfig[status] || { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700", icon: AlertCircle };
          const Icon = config.icon;
          return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
              <Icon size={12} />
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "reason",
        header: "Reason",
        enableSorting: true,
        cell: info => (
          <span className="text-gray-600 dark:text-gray-400">{info.getValue() || "-"}</span>
        )
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: serverPagination.totalPages || 1,
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <input
                type="text"
                placeholder="Search by type, reason, or status..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>
            <div className="relative flex-1 lg:flex-initial min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {(globalFilter || statusFilter !== "all") && (
            <button
              onClick={() => {
                setGlobalFilter("");
                setStatusFilter("all");
              }}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={16} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" && <ChevronUp size={14} />}
                      {header.column.getIsSorted() === "desc" && <ChevronDown size={14} />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalItems={serverPagination.totalItems || 0}
          itemsPerPage={pagination.pageSize}
          totalPages={serverPagination.totalPages || 1}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))}
          onItemsPerPageChange={(newPageSize) => setPagination((prev) => ({ ...prev, pageSize: newPageSize, pageIndex: 0 }))}
        />
      </div>
    </div>
  );
}
