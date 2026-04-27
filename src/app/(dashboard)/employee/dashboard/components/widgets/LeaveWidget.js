"use client";
import { Calendar, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeaveWidget({ data }) {
    const router = useRouter();

    if (!data) return <div className="animate-pulse h-full bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-primary-100/50 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
                    <Briefcase size={18} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Leave Summary</h3>
            </div>

            <div className="flex-1 flex flex-col space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                    {data.balances?.map((leave, idx) => (
                        <div key={idx} className="bg-primary-50/50 dark:bg-primary-500/5 p-3 rounded-xl text-center border border-primary-100/50 dark:border-primary-500/20">
                            <span className="block text-2xl font-bold text-primary-700 dark:text-primary-400 mb-1">{leave.balance}</span>
                            <span className="text-[10px] uppercase text-gray-600 dark:text-gray-400 font-medium tracking-wide">{leave.type}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between rounded-xl bg-primary-50/40 dark:bg-primary-500/10 border border-primary-100/60 dark:border-primary-500/20 px-3 py-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-300">Pending approvals</span>
                    <span className="font-semibold text-primary-700 dark:text-primary-300">{data.pendingApprovals || 0}</span>
                </div>

                <div className="pt-3 border-t border-primary-100/50 dark:border-gray-700 flex-1 flex flex-col">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wider">Upcoming</h4>
                    {data.upcomingLeaves?.length > 0 ? (
                        <div className="space-y-2 flex-1">
                            {data.upcomingLeaves.map((leave, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm bg-primary-50/50 dark:bg-primary-500/10 p-2.5 rounded-lg border border-primary-100 dark:border-primary-500/20">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={13} className="text-primary-600 dark:text-primary-400" />
                                        <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">{leave.date}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">{leave.type}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No upcoming leaves</p>
                    )}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    onClick={() => router.push("/employee/leave/request-leave")}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                    Apply Leave
                </button>
                <button
                    onClick={() => router.push("/employee/leave/leave-balance")}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-primary-200/60 dark:border-primary-500/20 text-primary-700 dark:text-primary-300 hover:bg-primary-50/60 dark:hover:bg-primary-500/10 transition-colors"
                >
                    Leave Calendar
                </button>
                <button
                    onClick={() => router.push("/employee/leave/leave-history")}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors sm:col-span-2"
                >
                    View Leave History
                </button>
            </div>
        </div>
    );
}
