// src/app/(dashboard)/hr/probation-notice-period/components/NoticePeriodTable.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table";
import Pagination from "@/components/common/Pagination";
import ActionDropdown from "../../../master-admin/components/ActionDropdown";
import { CheckCircle, Plus, X, Calendar, AlertCircle, Eye } from "lucide-react";
import { probationNoticeService } from "@/services/hr/probationNoticeService";
import { differenceInDays, format, addDays } from "date-fns";
import { toast } from "react-hot-toast";
import employeeService from "@/services/hr-services/employeeService";

export default function NoticePeriodTable() {
    const router = useRouter();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const basePath = pathname.startsWith('/finance-role')
        ? '/finance-role'
        : pathname.startsWith('/payroll')
            ? '/payroll'
            : pathname.startsWith('/company-admin')
                ? '/company-admin'
                : '/hr';
    const isCrudAllowed = pathname.startsWith('/hr') || pathname.startsWith('/company-admin');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ active: 0 });

    // Modal states
    const [extendsModal, setExtendsModal] = useState({ show: false, id: null, name: "" });
    const [rejectModal, setRejectModal] = useState({ show: false, id: null, name: "" });
    const [extendDays, setExtendDays] = useState(30);
    const [reason, setReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await probationNoticeService.getNoticePeriods();
            // The service returns the data array directly in response.data or response
            const noticePeriods = response.success ? response.data : (Array.isArray(response) ? response : []);

            const activeNotices = noticePeriods.filter(n => ['ACTIVE', 'EXTENDED'].includes(n.status)).map(item => ({
                id: item.id,
                employeeId: item.employee?.employeeId || "N/A",
                employeeName: item.employeeName || `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`.trim(),
                designation: item.designation || "-",
                department: item.department || "-",
                resignationDate: item.resignationDate,
                endDate: item.endDate,
                status: item.status,
                daysRemaining: item.daysRemaining,
                profileImage: item.employee?.profileImage,
                original: item
            }));

            setData(activeNotices);
            setStats({ active: activeNotices.length, total: activeNotices.length });
        } catch (error) {
            console.error("Error fetching notice period data:", error);
            setData([]);
            toast.error("Failed to load notice periods");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleComplete = async (id) => {
        try {
            setActionLoading(true);
            await probationNoticeService.completeNoticePeriod(id);
            toast.success("Notice period completed successfully");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to complete notice period");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExtend = async () => {
        if (!extendDays || extendDays <= 0) {
            toast.error("Please enter valid days");
            return;
        }
        try {
            setActionLoading(true);
            await probationNoticeService.extendNoticePeriod(extendsModal.id, { days: extendDays, reason });
            toast.success("Notice period extended successfully");
            setExtendsModal({ show: false, id: null, name: "" });
            setReason("");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to extend notice period");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!reason) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        try {
            setActionLoading(true);
            await probationNoticeService.rejectNoticePeriod(rejectModal.id, { reason });
            toast.success("Resignation cancelled. Employee is now active.");
            setRejectModal({ show: false, id: null, name: "" });
            setReason("");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject notice period");
        } finally {
            setActionLoading(false);
        }
    };

    // =============================
    // COLUMNS
    // =============================
    const columns = useMemo(
        () => [
            {
                accessorKey: "employeeId",
                header: "Employee ID",
                cell: info => (
                    <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                        {info.getValue()}
                    </span>
                ),
            },
            {
                accessorKey: "employeeName",
                header: "Name",
                cell: info => (
                    <div className="flex items-center gap-3">
                        {info.row.original.profileImage ? (
                            <img
                                src={info.row.original.profileImage}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs uppercase">
                                {info.getValue()?.charAt(0)}
                            </div>
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {info.getValue()}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "designation",
                header: "Designation",
            },
            {
                accessorKey: "department",
                header: "Department",
            },
            {
                accessorKey: "resignationDate",
                header: "Resignation Date",
                cell: info => (
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {info.getValue() ? format(new Date(info.getValue()), "dd MMM, yyyy") : "N/A"}
                    </span>
                ),
            },
            {
                accessorKey: "endDate",
                header: "Last Working Day",
                cell: info => (
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {info.getValue() ? format(new Date(info.getValue()), "dd MMM, yyyy") : "N/A"}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: info => {
                    const status = info.getValue();
                    const styles = {
                        ACTIVE: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-100',
                        EXTENDED: 'bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-100',
                        COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-100',
                        REJECTED: 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-100'
                    };
                    return (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[status] || styles.ACTIVE}`}>
                            {status}
                        </span>
                    );
                }
            },
            {
                accessorKey: "daysRemaining",
                header: "Days Remaining",
                cell: info => {
                    const days = info.getValue();
                    const statusStyle = days < 0
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                        : days <= 7
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';

                    return (
                        <span className={`px-2.5 py-1 rounded-sm text-xs font-semibold ${statusStyle}`}>
                            {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days`}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                cell: info => {
                    return (
                        <div className="relative flex items-center justify-center">
                            <ActionDropdown
                                customActions={[
                                    {
                                        label: "View Details",
                                        icon: Eye,
                                        onClick: () => router.push(`${basePath}/employees/${info.row.original.original.employee?.id}`),
                                        className: "text-gray-700 dark:text-gray-200",
                                        iconClassName: "text-blue-500 dark:text-blue-400",
                                    },
                                    ...(isCrudAllowed ? [
                                        {
                                            label: "Complete",
                                            icon: CheckCircle,
                                            onClick: () => handleComplete(info.row.original.id),
                                            className: "text-gray-700 dark:text-gray-200",
                                            iconClassName: "text-emerald-600 dark:text-emerald-400",
                                        },
                                        {
                                            label: "Extend",
                                            icon: Plus,
                                            onClick: () => setExtendsModal({
                                                show: true,
                                                id: info.row.original.id,
                                                name: info.row.original.employeeName
                                            }),
                                            className: "text-gray-700 dark:text-gray-200",
                                            iconClassName: "text-brand-600 dark:text-brand-400",
                                        },
                                        {
                                            label: "Cancel/Reject",
                                            icon: X,
                                            onClick: () => setRejectModal({
                                                show: true,
                                                id: info.row.original.id,
                                                name: info.row.original.employeeName
                                            }),
                                            className: "text-red-700 dark:text-red-300",
                                            iconClassName: "text-red-600 dark:text-red-400",
                                            hoverClassName: "hover:bg-red-50 dark:hover:bg-red-900/20",
                                        },
                                    ] : []),
                                ]}
                            />
                        </div>
                    );
                },
            },
        ],
        []
    );

    // =============================
    // TABLE
    // =============================
    const table = useReactTable({
        data: data,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // =============================
    // UI
    // =============================
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium anim-pulse">Loading notice period records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notice Period Management
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage employees currently serving their notice period
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-sm text-sm font-semibold border border-amber-200 dark:border-amber-500/30">
                        {stats.total} Total Records
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-sm text-sm font-semibold border border-emerald-200 dark:border-emerald-500/30">
                        {stats.active} Serving Notice
                    </span>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
                    <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">No employees in notice period</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Everything looks stable for now.</p>
                </div>
            ) : (
                <div className="relative rounded-sm border border-gray-200 dark:border-gray-700 overflow-visible bg-white dark:bg-gray-800 shadow-sm transition-all duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 border-b border-amber-200 dark:border-amber-500/20">
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id}>
                                        {hg.headers.map(header => (
                                            <th key={header.id} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-500/5 transition-colors duration-200">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={pagination.pageIndex + 1}
                        totalItems={data.length}
                        totalPages={Math.ceil(data.length / pagination.pageSize)}
                        itemsPerPage={pagination.pageSize}
                        onPageChange={page => {
                            setPagination(prev => ({ ...prev, pageIndex: page - 1 }));
                        }}
                        onItemsPerPageChange={size => {
                            setPagination({ pageIndex: 0, pageSize: size });
                        }}
                        className="p-4 border-t border-gray-100 dark:border-gray-700"
                    />
                </div>
            )}

            {/* Extend Notice Period Modal */}
            {isCrudAllowed && extendsModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-sm shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-sm">
                                    <Plus className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Extend Notice Period</h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
                                Extend notice for <span className="text-brand-600 dark:text-brand-400 font-bold">{extendsModal.name}</span>
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-tight">
                                        Days to Extend
                                    </label>
                                    <input
                                        type="number"
                                        value={extendDays}
                                        onChange={(e) => setExtendDays(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="Enter number of days (e.g. 15)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-tight">
                                        Reason
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                                        rows={3}
                                        placeholder="Explain why the notice period is being extended..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setExtendsModal({ show: false, id: null, name: "" })}
                                    className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all uppercase tracking-wide"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExtend}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-sm shadow-md shadow-brand-500/20 transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : "Extend"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel/Reject Resignation Modal */}
            {isCrudAllowed && rejectModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-sm shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-sm">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cancel Resignation</h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
                                Are you sure you want to cancel the resignation for <span className="text-red-600 dark:text-red-400 font-bold">{rejectModal.name}</span>? They will be marked as ACTIVE.
                            </p>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-tight">
                                    Reason for Cancellation
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-gray-400"
                                    rows={4}
                                    placeholder="Provide a reason for cancelling this notice period..."
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setRejectModal({ show: false, id: null, name: "" })}
                                    className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all uppercase tracking-wide"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-sm shadow-md shadow-red-500/20 transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : "Cancel Resignation"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
