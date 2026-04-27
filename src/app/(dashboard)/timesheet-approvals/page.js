"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerTimesheetApprovalsService } from "@/services/manager-services/timesheet-approvals.service";
import ActionDropdown from "@/app/(dashboard)/master-admin/components/ActionDropdown";
import {
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function TimesheetApprovalsPage() {
    const [timesheets, setTimesheets] = useState([]);
    const [actionState, setActionState] = useState({ open: false, action: null, id: null });
    const [viewState, setViewState] = useState({ open: false, timesheet: null });
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Timesheet Management", href: "/attendance/timesheets" },
        { label: "Timesheet Approvals", href: "/timesheet-approvals" },
    ];

    const summary = useMemo(() => {
        const timesheetPending = timesheets.filter((item) => item.status === "Pending").length;
        return { timesheetPending };
    }, [timesheets]);

    const openAction = (action, id) => {
        setActionState({ open: true, action, id });
        setComment("");
    };

    const handleViewTimesheet = (timesheet) => {
        console.log("View timesheet:", timesheet);
        setViewState({ open: true, timesheet });
    };

    const closeViewModal = () => {
        setViewState({ open: false, timesheet: null });
    };

    const closeAction = () => {
        setActionState({ open: false, action: null, id: null });
        setComment("");
    };

    const confirmAction = async () => {
        try {
            if (actionState.action === "Approve") {
                await managerTimesheetApprovalsService.approveTimesheet(actionState.id, comment);
                toast.success("Timesheet approved successfully");
            } else {
                await managerTimesheetApprovalsService.rejectTimesheet(actionState.id, comment);
                toast.success("Timesheet rejected successfully");
            }

            // Refresh the list
            fetchApprovals();
            closeAction();
        } catch (err) {
            console.error("Error updating timesheet:", err);
            setError(err?.message || "Unable to update timesheet approval");
        }
    };

    const fetchApprovals = async () => {
        try {
            console.log("Fetching timesheet approvals...");
            const response = await managerTimesheetApprovalsService.getApprovals();
            console.log("Timesheet approvals response:", response);
            
            // Handle different response structures
            const approvalsData = response?.timesheets || response?.timesheets || [];
            console.log("Approvals data:", approvalsData);
            
            const pendingTimesheets = Array.isArray(approvalsData)
            ? approvalsData.filter(item => item.status === "PENDING")
            : [];
            setTimesheets(pendingTimesheets);
        } catch (err) {
            console.error("Error fetching timesheet approvals:", err);
            setError(err?.message || "Unable to load timesheet approvals");
            setTimesheets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <Breadcrumb items={breadcrumbItems} />

                {error ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                        {error}
                    </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 p-4 shadow-sm">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pending Timesheets</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{summary.timesheetPending}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-primary)]/40 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-10 w-10 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center">
                            <ClipboardCheck className="text-[#0b1220] fill-[#0b1220]" size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Timesheet Approvals</h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Review and approve team timesheets</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[var(--color-primary-hover)]/70 dark:bg-[var(--color-primary)]/15 text-gray-900 dark:text-white">
                                 <tr className="text-left text-xs uppercase tracking-wide">
                                     <th className="px-4 py-3 font-medium">Employee</th>
                                     <th className="px-4 py-3 font-medium">Project</th>
                                     <th className="px-4 py-3 font-medium">Billing</th>
                                     <th className="px-4 py-3 font-medium">Hours</th>
                                     <th className="px-4 py-3 font-medium">Date</th>
                                     <th className="px-4 py-3 font-medium text-right">Actions</th>
                                 </tr>
                            </thead>
                            <tbody>
                                {timesheets.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        className="border-t border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer transition-colors"
                                        onClick={() => handleViewTimesheet(item)}
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {item.employee?.name || item.employeeName || item.employee || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.id}</p>
                                        </td>
                                         <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                             <p className="font-medium">
                                                 {item.project?.name || item.projectName || item.project || 'N/A'}
                                             </p>
                                             <p className="text-xs text-gray-500 dark:text-gray-400">
                                                 {item.task || item.description || item.taskDescription || 'N/A'}
                                             </p>
                                         </td>
                                         <td className="px-4 py-3">
                                             <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                                 item.billable === false
                                                     ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                                                     : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                                             }`}>
                                                 {item.billable === false ? "Non Billable" : "Billable"}
                                             </span>
                                         </td>
                                         <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                             {item.hours || item.totalHours || 0} hrs
                                         </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {item.date ? new Date(item.date).toLocaleDateString('en-GB', { 
                                                day: 'numeric', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            }) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                                <ActionDropdown
                                                    viewUrl={`/timesheet-approvals/${item.id}`}
                                                    customActions={[
                                                        {
                                                            label: "Approve",
                                                            icon: CheckCircle2,
                                                            onClick: () => openAction("Approve", item.id),
                                                            className: "text-emerald-700 dark:text-emerald-300",
                                                            iconClassName: "text-emerald-600 dark:text-emerald-400",
                                                        },
                                                        {
                                                            label: "Reject",
                                                            icon: XCircle,
                                                            onClick: () => openAction("Reject", item.id),
                                                            className: "text-rose-700 dark:text-rose-300",
                                                            iconClassName: "text-rose-600 dark:text-rose-400",
                                                            hoverClassName: "hover:bg-rose-50 dark:hover:bg-rose-500/10",
                                                        }
                                                    ]}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && timesheets.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                            {loading ? "Loading timesheet approvals..." : "No timesheets pending for approval."}
                                        </td>
                                    </tr>
                                )}
                                {loading && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Loading timesheet approvals...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {actionState.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-6">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                {actionState.action} Timesheet Request
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Add an optional comment for the employee.
                            </p>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                placeholder="Add a short note (optional)"
                                className="mt-4 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 p-3 text-sm"
                            />

                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={closeAction}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 text-sm rounded-lg bg-[var(--color-primary)] text-[#0b1220] hover:bg-[var(--color-primary-hover)]"
                                    onClick={confirmAction}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Timesheet Modal */}
                {viewState.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timesheet Details</h3>
                                <button
                                    onClick={closeViewModal}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <XCircle size={20} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Employee Information */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Employee Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {viewState.timesheet?.employee?.name || viewState.timesheet?.employeeName || viewState.timesheet?.employee || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">ID:</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {viewState.timesheet?.id || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                viewState.timesheet?.status === 'APPROVED' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : viewState.timesheet?.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                            }`}>
                                                {viewState.timesheet?.status || 'DRAFT'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Project & Task Information */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Project & Task Details</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Project:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {viewState.timesheet?.project?.name || viewState.timesheet?.projectName || viewState.timesheet?.project || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Task:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {viewState.timesheet?.task || viewState.timesheet?.description || viewState.timesheet?.taskDescription || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Hours:</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {viewState.timesheet?.hours || viewState.timesheet?.totalHours || 0} hrs
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {viewState.timesheet?.date ? new Date(viewState.timesheet.date).toLocaleDateString('en-GB', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={closeViewModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
