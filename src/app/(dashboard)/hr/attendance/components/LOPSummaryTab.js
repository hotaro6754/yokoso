"use client";

import { useState, useEffect } from "react";
import {
    AlertTriangle,
    Calendar,
    RefreshCw,
    Loader2,
    DollarSign,
    CheckCircle,
    XCircle,
    Info,
    Play,
    User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "@/components/common/Pagination";
import { attendanceService } from "@/services/hr-services/attendace.service";
import DatePickerField from "@/components/form/input/DatePickerField";

const MAX_PAST_DAYS = 5; // Regularisation window – same rule enforced on backend

export default function LOPSummaryTab() {
    // ─── LOP Summary state ───────────────────────────────────────────────────
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // ─── Date filters ────────────────────────────────────────────────────────
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // ─── LOP Processing state ───────────────────────────────────────────────
    const [processDate, setProcessDate] = useState("");
    const [processing, setProcessing] = useState(false);
    const [lastResult, setLastResult] = useState(null);

    // ─── Helpers ─────────────────────────────────────────────────────────────
    const todayStr = () => new Date().toISOString().split("T")[0];
    const maxPastDate = () => {
        const d = new Date();
        d.setDate(d.getDate() - MAX_PAST_DAYS);
        return d.toISOString().split("T")[0];
    };

    // ─── Fetch LOP summary ───────────────────────────────────────────────────
    const fetchLOPSummary = async () => {
        try {
            setLoading(true);
            const response = await attendanceService.getLOPSummary({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
            });

            const data = response?.success ? response.data : response?.data || [];
            const paginationInfo =
                response?.pagination || response?.data?.pagination || {};

            setRecords(Array.isArray(data) ? data : []);
            setTotalItems(paginationInfo.total || data.length || 0);
            setTotalPages(
                paginationInfo.totalPages ||
                Math.ceil((paginationInfo.total || data.length || 0) / pagination.pageSize)
            );
        } catch (error) {
            console.error("Error fetching LOP summary:", error);
            toast.error("Failed to load LOP summary");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLOPSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.pageIndex, pagination.pageSize, startDate, endDate]);

    // ─── Trigger LOP processing ──────────────────────────────────────────────
    const handleProcessLOP = async () => {
        if (!processDate) {
            toast.error("Please select a date to process LOP");
            return;
        }
        try {
            setProcessing(true);
            setLastResult(null);
            const response = await attendanceService.processLOP({ date: processDate });
            const result = response?.data || response;
            setLastResult(result);
            toast.success(
                result?.lopMarked !== undefined
                    ? `LOP processed: ${result.lopMarked} employee(s) marked as LOP`
                    : "LOP processing complete"
            );
            // Refresh summary
            fetchLOPSummary();
        } catch (error) {
            console.error("Error processing LOP:", error);
            toast.error(error?.response?.data?.message || "Failed to process LOP");
        } finally {
            setProcessing(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* ── Info Banner ─────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/15 dark:to-orange-500/10 border-2 border-amber-200 dark:border-amber-500/30 rounded-sm p-4 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-sm flex-shrink-0">
                        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                            Missing Log Logic — LOP (Loss of Pay)
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                            <li>
                                The system integrates directly with the Biometric / Geo-fencing system.
                            </li>
                            <li>
                                If <strong>no biometric/punch log</strong> is found for a working day and
                                there is <strong>no approved Leave or WFH</strong> request, the day is
                                auto-marked as <span className="font-bold text-amber-600">LOP</span> (Loss of Pay).
                            </li>
                            <li>Weekends and company holidays are automatically excluded from LOP processing.</li>
                            <li>
                                Attendance data feeds directly into the{" "}
                                <strong>Timesheet</strong> and <strong>Payroll</strong> modules.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── LOP Processing Trigger ───────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-sm">
                        <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    Process LOP for a Specific Date
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                            Select Date (past days only)
                        </label>
                        <DatePickerField
                            value={processDate}
                            onChange={(value) => setProcessDate(value)}
                            max={todayStr()}
                            placeholder="Select date to process"
                            className="!w-full !px-3 !py-2.5"
                        />
                    </div>
                    <button
                        onClick={handleProcessLOP}
                        disabled={processing || !processDate}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-sm shadow-sm transition-colors uppercase tracking-wide"
                    >
                        {processing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        {processing ? "Processing..." : "Process LOP"}
                    </button>
                </div>

                {/* Processing Result */}
                {lastResult && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-sm border border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                            Processing Result — {lastResult.date}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {lastResult.processed || 0}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Processed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    {lastResult.lopMarked || 0}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">LOP Marked</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {lastResult.skipped || 0}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Skipped</p>
                            </div>
                        </div>
                        {lastResult.message && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                {lastResult.message}
                            </p>
                        )}
                        {lastResult.details && lastResult.details.length > 0 && (
                            <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
                                {lastResult.details.map((d, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between text-xs px-3 py-1.5 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700"
                                    >
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {d.name} ({d.employeeId})
                                        </span>
                                        <span
                                            className={`font-bold ${d.result === "LOP_MARKED"
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-green-600 dark:text-green-400"
                                                }`}
                                        >
                                            {d.result === "LOP_MARKED" ? "LOP" : "OK"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── LOP Records Table ────────────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-sm">
                            <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        LOP-Marked Records
                        {totalItems > 0 && (
                            <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </h3>

                    {/* Date Filters */}
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From</span>
                            <DatePickerField
                                value={startDate}
                                onChange={(value) => {
                                    setStartDate(value);
                                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                                }}
                                placeholder="Start Date"
                                className="!py-1.5 !px-2 !text-[10px] !w-32"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To</span>
                            <DatePickerField
                                value={endDate}
                                onChange={(value) => {
                                    setEndDate(value);
                                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                                }}
                                placeholder="End Date"
                                className="!py-1.5 !px-2 !text-[10px] !w-32"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setStartDate("");
                                setEndDate("");
                                setPagination((p) => ({ ...p, pageIndex: 0 }));
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-700 rounded-sm border border-gray-100 dark:border-gray-600"
                            title="Clear filters"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={fetchLOPSummary}
                            className="p-2 text-gray-400 hover:text-primary-500 transition-colors bg-gray-50 dark:bg-gray-700 rounded-sm border border-gray-100 dark:border-gray-600"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-14">
                            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-500 dark:text-green-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                No LOP-marked records found
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {startDate || endDate
                                    ? "Try adjusting the date filters"
                                    : "All employees have valid attendance or approved leave"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-500/10 dark:to-amber-500/5 border-b border-amber-100 dark:border-amber-500/20">
                                    <tr>
                                        {["Employee", "Emp ID", "Department", "Date", "Status", "Reason"].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {records.map((record) => (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-amber-50/30 dark:hover:bg-amber-500/5 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {record.employee?.name || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                {record.employee?.employeeId || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                                {record.employee?.department || "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {record.date
                                                            ? new Date(record.date).toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                            : "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    LOP
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={record.notes || ""}>
                                                    {record.notes || "Auto-marked LOP"}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={pagination.pageIndex + 1}
                        totalItems={totalItems}
                        totalPages={totalPages}
                        itemsPerPage={pagination.pageSize}
                        onPageChange={(page) =>
                            setPagination((p) => ({ ...p, pageIndex: page - 1 }))
                        }
                        onItemsPerPageChange={(size) =>
                            setPagination({ pageIndex: 0, pageSize: size })
                        }
                    />
                )}
            </div>
        </div>
    );
}
