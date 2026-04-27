"use client";
import React, { useState, useMemo, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import BreadcrumbRightContent from "../components/BreadcrumbRightContent";
import Pagination from "@/components/common/Pagination";
import { Clock, Search, Filter, X, ChevronUp, ChevronDown, Calendar, CheckCircle, AlertCircle, Timer, Briefcase, Activity, Fingerprint } from "lucide-react";
import { employeeAttendanceService } from "@/services/employee/attendance.service";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

const formatDisplayDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDisplayTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDuration = (ms) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatHoursToDuration = (hoursValue) => {
  if (hoursValue === null || hoursValue === undefined || Number.isNaN(Number(hoursValue))) return "--";
  return formatDuration(Number(hoursValue) * 3600000);
};

const formatDateOnlyIST = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;
  return `${year}-${month}-${day}`;
};

const getISTNowAsUTCDate = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year").value);
  const month = Number(parts.find((p) => p.type === "month").value) - 1;
  const day = Number(parts.find((p) => p.type === "day").value);
  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);
  const second = Number(parts.find((p) => p.type === "second").value);
  return new Date(Date.UTC(year, month, day, hour, minute, second));
};

const mapStatusLabel = (status, notes) => {
  const normalized = String(status || "").toUpperCase();
  // LOP is stored as ABSENT with a [LOP] note
  if (normalized === "ABSENT" && notes && notes.includes('[LOP]')) return "LOP";
  switch (normalized) {
    case "PRESENT":
      return "Present";
    case "LATE":
      return "Late";
    case "ABSENT":
      return "Absent";
    case "HALF_DAY":
      return "Half Day";
    case "EARLY_LEAVE":
      return "Half Day";
    case "HOLIDAY":
      return "Holiday";
    case "WEEKEND":
      return "Weekend";
    default:
      return "Present";
  }
};

// Filters component
function AttendanceFilters({ globalFilter, setGlobalFilter, statusFilter, setStatusFilter, statuses, onClearFilters }) {
  const hasActiveFilters = statusFilter !== 'all' || globalFilter;

  const statusConfig = {
    'all': { label: 'All Status', icon: Filter, color: 'gray' },
    'Present': { label: 'Present', icon: CheckCircle, color: 'green' },
    'Late': { label: 'Late', icon: AlertCircle, color: 'yellow' },
    'Absent': { label: 'Absent', icon: X, color: 'red' },
    'Half Day': { label: 'Half Day', icon: Timer, color: 'blue' },
    'LOP': { label: 'LOP (Loss of Pay)', icon: AlertCircle, color: 'amber' },
    'Overtime': { label: 'Overtime', icon: Briefcase, color: 'purple' },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-primary-100/50 dark:border-gray-700 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by date or status..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-initial">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-auto appearance-none pl-10 pr-8 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
            >
              {statuses.map(s => (
                <option key={s} value={s}>
                  {statusConfig[s]?.label || s}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page
export default function MyAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [serverPagination, setServerPagination] = useState({ totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statuses = useMemo(() => ['all', 'Present', 'Late', 'Absent', 'LOP', 'Half Day', 'Overtime', 'Holiday', 'Weekend'], []);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");
        const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

        const response = await employeeAttendanceService.getMyAttendanceRecords({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          status: statusFilter,
          startDate: formatDateOnlyIST(startDate),
          endDate: formatDateOnlyIST(endDate)
        });

        const records = response?.data || [];
        const mapped = records.map((record) => {
          const checkInValue = record.firstPunchIn || record.checkIn;
          const checkOutValue = record.lastPunchOut || record.checkOut;
          const checkInTime = checkInValue ? new Date(checkInValue) : null;
          const checkOutTime = checkOutValue ? new Date(checkOutValue) : null;
          const durationMs = checkInTime ? (checkOutTime || getISTNowAsUTCDate()) - checkInTime : 0;
          const totalHours = record.totalHours;
          const breakHours = record.breakHours;

          return {
            id: record.id,
            date: formatDisplayDate(record.date),
            checkIn: formatDisplayTime(checkInValue),
            checkOut: formatDisplayTime(checkOutValue),
            break: breakHours !== undefined ? formatHoursToDuration(breakHours) : "--",
            late: "--",
            productionHours: record.netHours !== undefined && record.netHours !== null
              ? formatHoursToDuration(record.netHours)
              : (totalHours !== undefined && totalHours !== null && breakHours !== undefined && breakHours !== null)
                ? formatHoursToDuration(Math.max(0, Number(totalHours) - Number(breakHours)))
                : (totalHours !== undefined && totalHours !== null
                  ? formatHoursToDuration(totalHours)
                  : formatDuration(durationMs)),
            status: mapStatusLabel(record.status, record.notes),
            notes: record.notes || "",
            punches: record.punches || []
          };
        });

        setData(mapped);
        setServerPagination({
          totalItems: response?.pagination?.totalItems || 0,
          totalPages: response?.pagination?.totalPages || 0
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load attendance records");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedDate, statusFilter, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [selectedDate, statusFilter]);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (globalFilter) {
      const term = globalFilter.toLowerCase();
      result = result.filter(d =>
        d.date.toLowerCase().includes(term) ||
        d.status.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }
    return result;
  }, [data, globalFilter, statusFilter]);

  const columns = useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      enableSorting: true,
      cell: info => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">{info.getValue()}</span>
        </div>
      )
    },
    {
      accessorKey: 'checkIn',
      header: 'Check In',
      enableSorting: true,
      cell: info => (
        <span className="text-gray-700 dark:text-gray-300 font-medium">{info.getValue()}</span>
      )
    },
    {
      accessorKey: 'checkOut',
      header: 'Check Out',
      enableSorting: true,
      cell: info => (
        <span className="text-gray-700 dark:text-gray-300 font-medium">{info.getValue()}</span>
      )
    },
    {
      accessorKey: 'productionHours',
      header: 'Productive Metrics',
      enableSorting: true,
      cell: info => {
        const breakHours = info.row.original.break;
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary-500" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">{info.getValue()}</span>
            </div>
            {breakHours && breakHours !== '--' && breakHours !== '00:00' && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">
                BREAK: {breakHours}
              </span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: info => {
        const attStatus = info.getValue();
        const statusConfig = {
          'Present': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
          'Late': { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
          'Absent': { bg: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500' },
          'LOP': { bg: 'bg-orange-50 text-orange-700 border-orange-100', dot: 'bg-orange-500' },
          'Half Day': { bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
        }[attStatus] || { bg: 'bg-gray-50 text-gray-700 border-gray-100', dot: 'bg-gray-400' };

        const isCheckedIn = attStatus === 'Present' || attStatus === 'Late';

        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${isCheckedIn ? 'animate-pulse' : ''}`}></span>
            {attStatus}
          </span>
        );
      }
    },
    {
        id: 'actions',
        header: 'Timeline Logs',
        cell: info => {
            const record = info.row.original;
            const punches = record.punches || [];
            const isExpanded = expandedRows[record.id];
            return (
                <div>
                {punches.length > 0 ? (
                    <button 
                    onClick={() => toggleRow(record.id)}
                    className={`group/btn inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isExpanded 
                        ? 'bg-brand-900 text-white shadow-brand-500/20 shadow-lg scale-[1.02]' 
                        : 'bg-[#151b54] text-white hover:bg-brand-800 shadow-md hover:shadow-lg'
                    }`}
                    >
                    {punches.length} Logs
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 group-hover/btn:translate-y-0.5 transition-transform" />}
                    </button>
                ) : (
                    <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Logs</span>
                    </div>
                )}
                </div>
            );
        }
    }
  ], [expandedRows]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: serverPagination.totalPages || 1,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          title="My Attendance"
          subtitle="View your attendance records and track your work hours"
          rightContent={<BreadcrumbRightContent selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
        />

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 dark:border-blue-900/40 dark:bg-blue-900/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex-shrink-0">
              <Info size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Attendance Regularization Policy</p>
              <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">You can request regularization for attendance corrections within the <b>last 5 days</b> only.</p>
            </div>
          </div>
          <a
            href="/employee/attendance/regularization"
            className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-sm"
          >
            Regularize Now
          </a>
        </div>

        <AttendanceFilters
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statuses={statuses}
          onClearFilters={() => {
            setGlobalFilter('');
            setStatusFilter('all');
            setPagination({ pageIndex: 0, pageSize: 10 });
          }}
        />

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-primary-50/50 to-primary-50/30 dark:from-gray-800 dark:to-gray-800 border-b border-primary-100/50 dark:border-gray-700">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${header.column.getCanSort() ? 'cursor-pointer hover:bg-primary-50/50 dark:hover:bg-gray-700/50 transition-colors' : ''
                          }`}
                        {...(header.column.getCanSort() ? { onClick: header.column.getToggleSortingHandler() } : {})}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown size={14} />
                              ) : (
                                <div className="flex flex-col -space-y-1">
                                  <ChevronUp size={10} className="text-gray-300" />
                                  <ChevronDown size={10} className="text-gray-300" />
                                </div>
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-primary-100/30 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map((row, index) => {
                  const record = row.original;
                  const isExpanded = expandedRows[record.id];
                  const punches = record.punches || [];
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        className="hover:bg-primary-50/30 dark:hover:bg-gray-700/30 transition-colors duration-150"
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-5 py-4 text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && punches.length > 0 && (
                        <tr>
                          <td colSpan={columns.length} className="p-0 border-none">
                            <div className="mx-6 mb-6 mt-1 p-6 bg-gray-50 dark:bg-gray-900/30 rounded-sm border border-gray-200/50 dark:border-gray-700/50 shadow-inner overflow-hidden">
                              <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-brand-500" />
                                  Biometric Terminal Timeline
                                </h4>
                                <div className="h-px flex-1 mx-6 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent"></div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4">
                                {punches.map((punch, idx) => {
                                  const punchTimeFormatted = formatDisplayTime(punch.punchedAt);
                                  return (
                                    <div
                                    key={idx} 
                                    className={`relative z-10 flex flex-col items-center group/punch`}
                                  >
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-sm border shadow-sm transition-all hover:scale-105 ${
                                      punch.type === 'IN' 
                                        ? 'bg-white border-emerald-100 text-emerald-900 dark:bg-gray-800 dark:border-emerald-900/30' 
                                        : 'bg-white border-red-100 text-red-900 dark:bg-gray-800 dark:border-red-900/30'
                                    }`}>
                                      <div className={`p-1.5 rounded-sm ${punch.type === 'IN' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                        <Fingerprint className={`w-4 h-4 ${punch.type === 'IN' ? 'text-emerald-500' : 'text-red-500'}`} />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-black tracking-tight leading-none">
                                          {punchTimeFormatted}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase mt-1 tracking-widest ${punch.type === 'IN' ? 'text-emerald-500' : 'text-red-500'}`}>
                                          Punch {punch.type}
                                        </span>
                                      </div>
                                    </div>
                                    {idx < punches.length - 1 && (
                                      <div className="hidden lg:block absolute top-1/2 left-full w-4 h-px bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                                    )}
                                  </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                }) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <Calendar size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No attendance records found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalItems={serverPagination.totalItems}
          itemsPerPage={pagination.pageSize}
          onPageChange={page => table.setPageIndex(page - 1)}
          onItemsPerPageChange={size => {
            table.setPageSize(size);
            table.setPageIndex(0);
            setPagination({ pageIndex: 0, pageSize: size });
          }}
          className="mt-6"
        />
      </div>
    </div>
  );
}
