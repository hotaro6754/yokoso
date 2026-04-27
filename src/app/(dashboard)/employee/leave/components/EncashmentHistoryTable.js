"use client";

import { useState, useEffect } from "react";
import {
    Banknote,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    ChevronRight
} from "lucide-react";

export default function EncashmentHistoryTable({ limit, compact = false }) {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        // Mock data for employee encashment history
        const mockRequests = [
            {
                id: "ENC-001",
                date: "2024-02-15",
                days: 5,
                amount: "₹12,500",
                status: "APPROVED",
                appliedOn: "2024-02-10"
            },
            {
                id: "ENC-002",
                date: "2024-03-20",
                days: 3,
                amount: "₹7,500",
                status: "PENDING",
                appliedOn: "2024-03-18"
            }
        ];

        setLoading(true);
        setTimeout(() => {
            setRequests(limit ? mockRequests.slice(0, limit) : mockRequests);
            setLoading(false);
        }, 800);
    }, [limit]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-tighter">
                        <CheckCircle size={10} /> Approved
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-sm border border-red-100 dark:border-red-500/20 uppercase tracking-tighter">
                        <XCircle size={10} /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-100 dark:border-amber-500/20 uppercase tracking-tighter">
                        <Clock size={10} /> Pending
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="space-y-3 p-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-sm"></div>
                ))}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-sm">
                <Banknote size={32} strokeWidth={1.5} className="mb-2 opacity-20" />
                <p className="text-xs font-medium uppercase tracking-widest">No encashment requests</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/100 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Applied</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Est. Amount</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} className="text-gray-400" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {new Date(req.appliedOn).toLocaleDateString()}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">
                                {req.days} Days
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {req.amount}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(req.status)}
                                    <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
