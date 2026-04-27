"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ArrowLeft, Calendar, Clock, Briefcase, User, FileText, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { managerTimesheetApprovalsService } from "@/services/manager-services/timesheet-approvals.service";

export default function TimesheetViewPage({ params }) {
    const router = useRouter();
    const [timesheet, setTimesheet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [id, setId] = useState(null);

    // Unwrap params promise
    const resolvedParams = use(params);
    const timesheetId = resolvedParams.id;

    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Timesheet Management", href: "/attendance/timesheets" },
        { label: "Timesheet Approvals", href: "/timesheet-approvals" },
        { label: "Timesheet Details", href: `/timesheet-approvals/${timesheetId}` },
    ];

    useEffect(() => {
        const fetchTimesheet = async () => {
            try {
                console.log("Fetching timesheet details for ID:", timesheetId);
                const timesheetData = await managerTimesheetApprovalsService.getTimesheetById(timesheetId);
                console.log("Timesheet data received:", timesheetData);
                
                setTimesheet(timesheetData);
                setId(timesheetId);
            } catch (err) {
                console.error("Error fetching timesheet:", err);
                setError(err?.message || "Unable to load timesheet details");
            } finally {
                setLoading(false);
            }
        };

        if (timesheetId) {
            fetchTimesheet();
        }
    }, [timesheetId]);

    const handleApprove = async () => {
        try {
            await managerTimesheetApprovalsService.approveTimesheet(timesheetId, "Approved by manager");
            toast.success("Timesheet approved successfully");
            router.push("/timesheet-approvals");
        } catch (err) {
            console.error("Error approving timesheet:", err);
            toast.error("Failed to approve timesheet");
        }
    };

    const handleReject = async () => {
        try {
            await managerTimesheetApprovalsService.rejectTimesheet(timesheetId, "Rejected by manager");
            toast.success("Timesheet rejected successfully");
            router.push("/timesheet-approvals");
        } catch (err) {
            console.error("Error rejecting timesheet:", err);
            toast.error("Failed to reject timesheet");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="animate-pulse">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 border-t-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!timesheet) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        Timesheet not found
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <Breadcrumb items={breadcrumbItems} />

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-white/20 dark:hover:bg-gray-700/20 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-primary-600 dark:text-primary-400" />
                                </button>
                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center">
                                    <FileText className="text-primary-600 dark:text-primary-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Timesheet Details</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Review and manage timesheet information
                                </p>
                            </div>
                        </div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Timesheet Details</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Review and manage timesheet information
                                </p>
                            </div>
                        </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Employee Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <User size={18} className="text-primary-600 dark:text-primary-400" />
                                    Employee Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</p>
                                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {timesheet.employee?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                                                <p className="text-base text-gray-700 dark:text-gray-300">
                                                    {timesheet.employee?.email || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employee ID</p>
                                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {timesheet.employee?.employeeCode || timesheet.id || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Briefcase size={18} className="text-primary-600 dark:text-primary-400" />
                                    Project Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Name</p>
                                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {timesheet.project || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</p>
                                                <p className="text-base text-gray-700 dark:text-gray-300">
                                                    {timesheet.description || 'No description available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timesheet Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Calendar size={18} className="text-primary-600 dark:text-primary-400" />
                                    Timesheet Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Task Description</p>
                                                <p className="text-base text-gray-700 dark:text-gray-300">
                                                    {timesheet.task || timesheet.description || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hours Worked</p>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-primary-600 dark:text-primary-400" />
                                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {timesheet.hours || 0}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">hours</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</p>
                                                <p className="text-base text-gray-700 dark:text-gray-300">
                                                    {timesheet.date ? new Date(timesheet.date).toLocaleDateString('en-GB', { 
                                                        weekday: 'long', 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    }) : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Billing</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    timesheet.billable === false
                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                }`}>
                                                    {timesheet.billable === false ? 'Non Billable' : 'Billable'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    timesheet.status === 'APPROVED' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : timesheet.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                }`}>
                                                    {timesheet.status || 'DRAFT'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-primary-600 dark:text-primary-400" />
                                    Comments & History
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted Date</p>
                                            <p className="text-base text-gray-700 dark:text-gray-300">
                                                {timesheet.submittedDate ? new Date(timesheet.submittedDate).toLocaleDateString('en-GB', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approver Comments</p>
                                            <div className="space-y-2">
                                                {timesheet.approverComments && timesheet.approverComments.length > 0 ? (
                                                    timesheet.approverComments.map((comment, index) => (
                                                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                {comment}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                        No comments yet
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => router.back()}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Back to List
                            </button>
                            {timesheet.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={16} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-2"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>
                </div>
            </div>
        </div>
    );
}
