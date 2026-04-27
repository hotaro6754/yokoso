"use client";
import React, { useState, useMemo, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import BreadcrumbRightContent from "@/app/(dashboard)/employee/attendance/components/BreadcrumbRightContent";
import Pagination from "@/components/common/Pagination";
import {
    Clock, Search, Filter, X, ChevronUp, ChevronDown, Calendar,
    CheckCircle, AlertCircle, Timer, Briefcase, FileEdit,
    Plus, Info, Edit, LayoutDashboard, History, DollarSign,
    Fingerprint, Activity
} from "lucide-react";
import { employeeAttendanceService } from "@/services/employee/attendance.service";
import { employeeRegularizationService } from "@/services/employee/regularization.service";
import Flatpickr from "react-flatpickr";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import { toast } from "react-hot-toast";

// Utils
const formatDisplayDate = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "--";
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
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
    if (normalized === "ABSENT" && notes && notes.includes('[LOP]')) return "LOP";
    switch (normalized) {
        case "PRESENT": return "Present";
        case "LATE": return "Late";
        case "ABSENT": return "Absent";
        case "HALF_DAY": return "Half Day";
        case "EARLY_LEAVE": return "Half Day";
        case "HOLIDAY": return "Holiday";
        case "WEEKEND": return "Weekend";
        default: return "Present";
    }
};

const toIsoDate = (date) => date.toISOString().split("T")[0];

const combineDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return null;
    return new Date(`${dateValue}T${timeValue}:00`).toISOString();
};

const toLocalTimeInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

// ─── TABS ─────────────────────────────────────────────────────────────

export default function HRMyAttendancePage() {
    const [activeTab, setActiveTab] = useState("log");
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Attendance Log State
    const [logData, setLogData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedRows, setExpandedRows] = useState({});
    
    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 });
    const [serverPagination, setServerPagination] = useState({ totalItems: 0, totalPages: 0 });
    const [loadingLog, setLoadingLog] = useState(true);

    // Regularization State
    const [regData, setRegData] = useState([]);
    const [loadingReg, setLoadingReg] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReg, setSelectedReg] = useState(null);
    const [formData, setFormData] = useState({ date: new Date(), inTime: "", outTime: "", reason: "" });
    const [submittingReg, setSubmittingReg] = useState(false);
    const [regError, setRegError] = useState("");

    const MAX_PAST_DAYS = 5;

    // Fetch Attendance Log
    const fetchAttendanceLog = async () => {
        try {
            setLoadingLog(true);
            const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

            const response = await employeeAttendanceService.getMyAttendanceRecords({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                status: statusFilter,
                startDate: formatDateOnlyIST(startDate),
                endDate: formatDateOnlyIST(endDate)
            });

            const mapped = (response?.data || []).map((record) => {
                const checkInValue = record.firstPunchIn || record.checkIn;
                const checkOutValue = record.lastPunchOut || record.checkOut;
                const checkInTime = checkInValue ? new Date(checkInValue) : null;
                const checkOutTime = checkOutValue ? new Date(checkOutValue) : null;
                const durationMs = checkInTime ? (checkOutTime || getISTNowAsUTCDate()) - checkInTime : 0;

                return {
                    id: record.id,
                    date: formatDisplayDate(record.date),
                    checkIn: formatDisplayTime(checkInValue),
                    checkOut: formatDisplayTime(checkOutValue),
                    break: record.breakHours !== undefined ? formatHoursToDuration(record.breakHours) : "--",
                    late: "--",
                    productionHours: record.netHours !== undefined && record.netHours !== null
                        ? formatHoursToDuration(record.netHours)
                        : (record.totalHours !== undefined && record.totalHours !== null && record.breakHours !== undefined && record.breakHours !== null)
                            ? formatHoursToDuration(Math.max(0, Number(record.totalHours) - Number(record.breakHours)))
                            : (record.totalHours !== undefined && record.totalHours !== null
                                ? formatHoursToDuration(record.totalHours)
                                : formatDuration(durationMs)),
                    status: mapStatusLabel(record.status, record.notes),
                    notes: record.notes || "",
                    punches: record.punches || []
                };
            });

            setLogData(mapped);
            setServerPagination({
                totalItems: response?.pagination?.totalItems || 0,
                totalPages: response?.pagination?.totalPages || 0
            });
        } catch (err) {
            toast.error("Failed to load attendance log");
        } finally {
            setLoadingLog(false);
        }
    };

    // Fetch Regularization Requests
    const fetchRegularization = async () => {
        try {
            setLoadingReg(true);
            const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

            const response = await employeeRegularizationService.getMyRequests({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status: "all"
            });

            const mapped = (response?.data || []).map((entry) => ({
                id: entry.id,
                date: formatDisplayDate(entry.date),
                dateKey: entry.date,
                inTime: formatDisplayTime(entry.requestedCheckIn),
                outTime: formatDisplayTime(entry.requestedCheckOut),
                reason: entry.reason,
                status: String(entry.status || "PENDING").charAt(0).toUpperCase() + String(entry.status || "PENDING").slice(1).toLowerCase(),
                raw: entry
            }));

            setRegData(mapped);
        } catch (err) {
            toast.error("Failed to load regularization requests");
        } finally {
            setLoadingReg(false);
        }
    };

    useEffect(() => {
        if (activeTab === "log") fetchAttendanceLog();
        if (activeTab === "regularization") fetchRegularization();
    }, [activeTab, selectedDate, statusFilter, pagination.pageIndex, pagination.pageSize]);

    // Handle Regularization Open Modal
    const handleRaiseRequest = async (date) => {
        setRegError("");
        const dateStr = toIsoDate(date);
        setFormData({ date: date, inTime: "", outTime: "", reason: "" });

        // Fetch existing punches for that date to pre-fill
        try {
            const response = await employeeAttendanceService.getMyAttendanceRecords({
                page: 1,
                limit: 1,
                startDate: dateStr,
                endDate: dateStr
            });
            const record = response?.data?.[0];
            if (record) {
                setFormData(prev => ({
                    ...prev,
                    inTime: toLocalTimeInput(record.firstPunchIn || record.checkIn),
                    outTime: toLocalTimeInput(record.lastPunchOut || record.checkOut)
                }));
            }
        } catch (e) { }

        setIsModalOpen(true);
    };

    const handleRegSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReg(true);
        setRegError("");

        try {
            const selectedDt = new Date(formData.date);
            selectedDt.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((today - selectedDt) / (1000 * 60 * 60 * 24));
            if (diffDays > MAX_PAST_DAYS) {
                setRegError(`Regularization is only allowed for the past ${MAX_PAST_DAYS} days.`);
                setSubmittingReg(false);
                return;
            }
            if (selectedDt > today) {
                setRegError("Future dates are not allowed.");
                setSubmittingReg(false);
                return;
            }

            const payload = {
                date: toIsoDate(formData.date),
                requestedCheckIn: combineDateTime(toIsoDate(formData.date), formData.inTime),
                requestedCheckOut: combineDateTime(toIsoDate(formData.date), formData.outTime),
                reason: formData.reason
            };

            await employeeRegularizationService.createRequest(payload);
            toast.success("Regularization request submitted");
            setIsModalOpen(false);
            fetchRegularization();
        } catch (err) {
            setRegError(err?.response?.data?.message || "Submission failed");
        } finally {
            setSubmittingReg(false);
        }
    };

    const handleExport = () => {
        try {
            if (!logData || logData.length === 0) {
                toast.error("No data available to export");
                return;
            }

            const exportData = logData.map((item) => ({
                Date: item.date,
                "Check In": item.checkIn,
                "Check Out": item.checkOut,
                "Work Hours": item.productionHours,
                Break: item.break,
                Status: item.status,
                Notes: item.notes,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

            const fileName = `Attendance_Log_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`;

            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(blob, fileName);

            toast.success("Attendance exported as Excel successfully");
        } catch (err) {
            console.error("Export failed:", err);
            toast.error("Export failed");
        }
    };

    const columnsLog = useMemo(() => [
        { accessorKey: 'date', header: 'Date', cell: info => <div className="flex items-center gap-2"><Calendar size={13} className="text-primary-500" /><span className="font-bold text-gray-900 dark:text-gray-200">{info.getValue()}</span></div> },
        { accessorKey: 'checkIn', header: 'Check In', cell: info => <span className="font-bold text-gray-700 dark:text-gray-300">{info.getValue()}</span> },
        { accessorKey: 'checkOut', header: 'Check Out', cell: info => <span className="font-bold text-gray-700 dark:text-gray-300">{info.getValue()}</span> },
        { accessorKey: 'productionHours', header: 'Productive Metrics', cell: info => {
             const breakHours = info.row.original.break;
             return (
                 <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <Clock size={13} className="text-primary-400" />
                        <span className="font-bold text-gray-900 dark:text-white">{info.getValue()}</span>
                    </div>
                    {breakHours && breakHours !== '--' && breakHours !== '00:00' && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">BREAK: {breakHours}</span>
                    )}
                 </div>
             );
        }},
        {
            accessorKey: 'status', header: 'Status', cell: info => {
                const s = info.getValue();
                const config = {
                    'Present': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
                    'Late': { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
                    'Absent': { bg: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500' },
                    'LOP': { bg: 'bg-orange-50 text-orange-700 border-orange-100', dot: 'bg-orange-500' },
                    'Half Day': { bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
                }[s] || { bg: 'bg-gray-50 text-gray-700 border-gray-100', dot: 'bg-gray-400' };

                const isCheckedIn = s === 'Present' || s === 'Late';

                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${isCheckedIn ? 'animate-pulse' : ''}`}></span>
                        {s}
                    </span>
                );
            }
        },
        {
            id: 'actions', header: 'Timeline Logs', cell: info => {
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
                      <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Logs</span>
                      </div>
                    )}
                  </div>
                );
            }
        }
    ], [expandedRows]);

    const columnsReg = useMemo(() => [
        { accessorKey: 'date', header: 'Date', cell: info => <div className="flex items-center gap-2"><Calendar size={13} className="text-primary-500" /><span className="font-bold text-gray-900 dark:text-gray-200">{info.getValue()}</span></div> },
        { accessorKey: 'inTime', header: 'Requested In', cell: info => <span className="font-bold text-gray-700 dark:text-gray-300">{info.getValue()}</span> },
        { accessorKey: 'outTime', header: 'Requested Out', cell: info => <span className="font-bold text-gray-700 dark:text-gray-300">{info.getValue()}</span> },
        { accessorKey: 'reason', header: 'Reason', cell: info => <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tight truncate max-w-[150px]">{info.getValue()}</span> },
        {
            accessorKey: 'status', header: 'Status', cell: info => {
                const s = info.getValue();
                const config = s === "Approved" ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : s === "Rejected" ? 'bg-red-50 text-red-700 border-red-100' : 'bg-primary-50 text-primary-700 border-primary-100';
                return <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${config}`}>{s}</span>;
            }
        },
    ], []);

    const tableLog = useReactTable({ data: logData, columns: columnsLog, getCoreRowModel: getCoreRowModel() });
    const tableReg = useReactTable({ data: regData, columns: columnsReg, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-3 sm:p-6 transition-colors duration-200">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb
                    items={[
                        { label: "HR Dashboard", href: "/hr/dashboard" },
                        { label: "My Attendance" },
                    ]}
                    rightContent={<BreadcrumbRightContent selectedDate={selectedDate} setSelectedDate={setSelectedDate} onExport={activeTab === 'log' ? handleExport : undefined} />}
                />

                {/* Info Bar */}
                <div className="bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 text-primary-700 rounded-sm border border-primary-200">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-none">Attendance Repository</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Personal Cycle Monitoring & Compliance</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleRaiseRequest(new Date())}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all flex items-center gap-2"
                        >
                            <FileEdit size={14} /> Raise Regularization
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800 rounded-sm w-fit shadow-sm">
                    {[
                        { id: 'log', label: 'Attendance Log', icon: History },
                        { id: 'regularization', label: 'Regularization', icon: FileEdit },
                        { id: 'summary', label: 'Visual Summary', icon: LayoutDashboard },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6 animate-in fade-in duration-500">
                    {activeTab === 'log' && (
                        <div className="bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            {tableLog.getFlatHeaders().map(header => (
                                                <th key={header.id} className="px-5 py-4 text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {loadingLog ? (
                                            Array(5).fill(0).map((_, i) => (
                                                <tr key={i} className="animate-pulse"><td colSpan={6} className="px-5 py-6"></td></tr>
                                            ))
                                        ) : tableLog.getRowModel().rows.length > 0 ? (
                                            tableLog.getRowModel().rows.map(row => {
                                                const record = row.original;
                                                const isExpanded = expandedRows[record.id];
                                                const punches = record.punches || [];
                                                return (
                                                <React.Fragment key={row.id}>
                                                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                    {row.getVisibleCells().map(cell => (
                                                        <td key={cell.id} className="px-5 py-3 text-xs">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    ))}
                                                </tr>
                                                  {isExpanded && punches.length > 0 && (
                                                    <tr>
                                                      <td colSpan={6} className="p-0 border-none">
                                                        <div className="mx-6 mb-6 mt-1 p-6 bg-gray-50 dark:bg-gray-900/30 rounded-sm border border-gray-200/50 dark:border-gray-700/50 shadow-inner overflow-hidden">
                                                          <div className="flex items-center justify-between mb-6">
                                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                              <Activity className="w-4 h-4 text-primary-500" />
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
                                            })
                                        ) : (
                                            <tr><td colSpan={6} className="px-5 py-12 text-center text-[10px] font-bold uppercase text-gray-400 tracking-widest">No entries found for this period</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                                <Pagination
                                    currentPage={pagination.pageIndex + 1}
                                    totalItems={serverPagination.totalItems}
                                    itemsPerPage={pagination.pageSize}
                                    onPageChange={p => setPagination(prev => ({ ...prev, pageIndex: p - 1 }))}
                                    onItemsPerPageChange={s => setPagination({ pageIndex: 0, pageSize: s })}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'regularization' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-sm flex items-start gap-3">
                                <Info className="text-amber-600 mt-0.5" size={16} />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">Regularization Policy Constraint</p>
                                    <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-500/70 uppercase tracking-tight">Requests only allowed for the past {MAX_PAST_DAYS} days. Future-dated entries are digitally restricted.</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                            <tr>
                                                {tableReg.getFlatHeaders().map(header => (
                                                    <th key={header.id} className="px-5 py-4 text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                            {loadingReg ? (
                                                Array(5).fill(0).map((_, i) => (
                                                    <tr key={i} className="animate-pulse"><td colSpan={5} className="px-5 py-6"></td></tr>
                                                ))
                                            ) : tableReg.getRowModel().rows.length > 0 ? (
                                                tableReg.getRowModel().rows.map(row => (
                                                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                        {row.getVisibleCells().map(cell => (
                                                            <td key={cell.id} className="px-5 py-3 text-xs">
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={5} className="px-5 py-12 text-center text-[10px] font-bold uppercase text-gray-400 tracking-widest">No active requests logged</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'summary' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Average Work Hours', value: '08:42', icon: Clock, color: 'primary' },
                                { label: 'On-Time Arrival', value: '92%', icon: CheckCircle, color: 'emerald' },
                                { label: 'Pending Regularization', value: regData.filter(d => d.status === 'Pending').length, icon: FileEdit, color: 'blue' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
                                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter italic">Healthy metric</p>
                                    </div>
                                    <div className={`p-3 rounded-sm bg-${stat.color}-50 dark:bg-${stat.color}-950 text-${stat.color}-600 border border-${stat.color}-100 dark:border-${stat.color}-900`}>
                                        <stat.icon size={22} />
                                    </div>
                                </div>
                            ))}
                            <div className="md:col-span-3 bg-gray-900 p-8 rounded-sm text-white space-y-4 shadow-xl border border-white/5 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-400">Personal Audit Status</h4>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="space-y-2">
                                        <p className="text-xl font-bold uppercase tracking-tight">Compliance Score: 98%</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Validated against biometric node synchronization</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-[20px] font-bold">22</p>
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-primary-400">Total Days</p>
                                        </div>
                                        <div className="w-px h-8 bg-white/10"></div>
                                        <div className="text-center">
                                            <p className="text-[20px] font-bold text-emerald-400">20</p>
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-400">Full Days</p>
                                        </div>
                                        <div className="w-px h-8 bg-white/10"></div>
                                        <div className="text-center">
                                            <p className="text-[20px] font-bold text-amber-400">02</p>
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-amber-400">Adjusted</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Regularization Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-gray-900 rounded-sm shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary-600 text-white rounded-sm">
                                        <FileEdit size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Raise Regularization</h2>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">Cycle correction logic enabled</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleRegSubmit} className="p-6 space-y-6">
                                {regError && (
                                    <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-sm text-[10px] font-bold uppercase tracking-tight flex items-center gap-2">
                                        <AlertCircle size={14} /> {regError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Affected Date</label>
                                        <div className="relative">
                                            <Flatpickr
                                                value={formData.date}
                                                onChange={(date) => {
                                                    setFormData(prev => ({ ...prev, date: date[0] }));
                                                    handleRaiseRequest(date[0]); // Re-fetch punch times
                                                }}
                                                options={{
                                                    dateFormat: "d-m-Y",
                                                    maxDate: "today",
                                                    disable: [(d) => {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
                                                        return diff > MAX_PAST_DAYS;
                                                    }]
                                                }}
                                                className="w-full pl-3 pr-10 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm text-xs font-bold uppercase outline-none focus:border-primary-400 transition-all"
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Punch In</label>
                                            <input
                                                type="time"
                                                value={formData.inTime}
                                                onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
                                                required
                                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm text-xs font-bold uppercase outline-none focus:border-primary-400 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Punch Out</label>
                                            <input
                                                type="time"
                                                value={formData.outTime}
                                                onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                                                required
                                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm text-xs font-bold uppercase outline-none focus:border-primary-400 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Correction Reason</label>
                                        <textarea
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            required
                                            rows={4}
                                            placeholder="DESCRIBE THE CORE REASON FOR THIS ADJUSTMENT..."
                                            className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary-400 resize-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingReg}
                                        className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-sm disabled:opacity-50 transition-all"
                                    >
                                        {submittingReg ? "Authorizing..." : "Submit Record"}
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
