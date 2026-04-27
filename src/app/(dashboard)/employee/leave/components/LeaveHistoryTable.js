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
import EmployeeLeaveService from "@/services/employee/leave.service";
import { format } from "date-fns";
import { Search, Filter, X, Calendar, ChevronUp, ChevronDown, CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";
import Pagination from "@/components/common/Pagination";

export default function LeaveHistoryTable({ limit, compact = false }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: limit || 10 });
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
      const response = await EmployeeLeaveService.getLeaveHistory({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        status: statusFilter
      });
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
        reason: record.reason,
        paidDays: record.paidDays,
        unpaidDays: record.unpaidDays
      }));
      setData(mapped);
      setServerPagination({
        totalItems: response.pagination?.totalItems || records.length,
        totalPages: response.pagination?.totalPages || 1
      });
    } catch (error) {
      console.error("Failed to fetch leave history", error);
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
        accessorKey: "startDate",
        header: "Dates",
        enableSorting: true,
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-gray-900 dark:text-gray-100 font-semibold text-xs">
              {info.getValue() ? format(new Date(info.getValue()), "dd MMM") : "-"}
              {info.row.original.endDate && info.row.original.endDate !== info.getValue() && (
                <span className="text-gray-400 mx-1">- {format(new Date(info.row.original.endDate), "dd MMM")}</span>
              )}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">
              {format(new Date(info.getValue()), "yyyy")}
            </span>
          </div>
        )
      },
      {
        accessorKey: "leaveType",
        header: "Type",
        enableSorting: true,
        cell: info => (
          <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">
            {info.getValue() || info.row.original.leaveType}
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
            <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">
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
            "APPROVED": { bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-500/30", icon: CheckCircle },
            "Approved": { bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-500/30", icon: CheckCircle },
            "PENDING": { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-500/30", icon: Clock },
            "Pending": { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-500/30", icon: Clock },
            "REJECTED": { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-500/30", icon: AlertCircle },
            "Rejected": { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-500/30", icon: AlertCircle },
            "Cancelled": { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700", icon: AlertCircle },
          };
          const config = statusConfig[status] || { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700", icon: AlertCircle };
          const Icon = config.icon;
          return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wide border ${config.bg} ${config.text} ${config.border}`}>
              <Icon size={10} />
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "payment",
        header: "Payment",
        cell: (info) => {
          const paid = info.row.original.paidDays || 0;
          const unpaid = info.row.original.unpaidDays || 0;
          const total = info.row.original.days || (paid + unpaid);

          if (unpaid === 0) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wide border bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30">
                Paid
              </span>
            );
          } else if (paid === 0) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wide border bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30">
                Unpaid
              </span>
            );
          } else {
            return (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-green-600 truncate">{paid} Paid</span>
                <span className="text-[10px] font-bold text-red-600 truncate">{unpaid} Unpaid</span>
              </div>
            );
          }
        }
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
      <div className={`${compact ? 'p-0' : 'bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-6'}`}>
        <div className="animate-pulse space-y-4">
          {!compact && <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-sm w-full"></div>}
          <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-sm w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${compact ? '' : 'bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden'}`}>

      {!compact && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 focus:border-brand-500 outline-none text-xs"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 focus:border-brand-500 outline-none text-xs cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
            {(globalFilter || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setGlobalFilter("");
                  setStatusFilter("all");
                  setPagination({ pageIndex: 0, pageSize: limit || 10 });
                }}
                className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm uppercase tracking-wide transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          {!compact && (
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort?.() ?? false;
                    return (
                      <th
                        key={header.id}
                        className={`px-4 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${canSort ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" : ""
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
          )}
          <tbody className={`divide-y divide-gray-100 dark:divide-gray-700 ${compact ? 'text-xs' : 'text-sm'}`}>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={20} className="text-gray-300" />
                    <p className="text-xs text-gray-400 font-medium">No records found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!compact && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={pagination.pageIndex + 1}
            totalItems={serverPagination.totalItems}
            itemsPerPage={pagination.pageSize}
            onPageChange={(page) => {
              setPagination({ ...pagination, pageIndex: page - 1 });
            }}
            onItemsPerPageChange={(size) => {
              table.setPageIndex(0);
              setPagination({ pageIndex: 0, pageSize: size });
            }}
          />
        </div>
      )}
    </div>
  );
}
