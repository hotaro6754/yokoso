"use client";
import { Clock, FileText, ChevronRight, LifeBuoy } from "lucide-react";
import Link from "next/link";

export default function PendingRequestsWidget({ data }) {
    if (!data) return <div className="animate-pulse h-full bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-primary-100/50 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
                    <Clock size={18} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Pending Actions</h3>
            </div>

            <div className="flex-1 flex flex-col space-y-2.5">
                <Link
                    href="/employee/requests?type=leave"
                    className="flex items-center justify-between p-3.5 bg-primary-50/30 dark:bg-primary-500/5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all duration-200 group border border-primary-100/50 dark:border-primary-500/20 hover:border-primary-200 dark:hover:border-primary-500/30"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors">
                            <FileText size={16} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Requests</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {data.leaveRequests > 0 && (
                            <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">{data.leaveRequests}</span>
                        )}
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                    </div>
                </Link>

                <Link
                    href="/employee/attendance/regularization"
                    className="flex items-center justify-between p-3.5 bg-primary-50/30 dark:bg-primary-500/5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all duration-200 group border border-primary-100/50 dark:border-primary-500/20 hover:border-primary-200 dark:hover:border-primary-500/30"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors">
                            <Clock size={16} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance Corrections</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {data.attendanceRequests > 0 && (
                            <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">{data.attendanceRequests}</span>
                        )}
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                    </div>
                </Link>

                <Link
                    href="/employee/requests?type=ticket"
                    className="flex items-center justify-between p-3.5 bg-primary-50/30 dark:bg-primary-500/5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all duration-200 group border border-primary-100/50 dark:border-primary-500/20 hover:border-primary-200 dark:hover:border-primary-500/30"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors">
                            <LifeBuoy size={16} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HR Tickets Open</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {data.hrTickets > 0 && (
                            <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">{data.hrTickets}</span>
                        )}
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
