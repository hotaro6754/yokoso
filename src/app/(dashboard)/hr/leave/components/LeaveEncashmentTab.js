"use client";

import { useState, useEffect } from "react";
import {
    Banknote,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    ArrowRight,
    ChevronRight,
    Info
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function LeaveEncashmentTab() {
    const [loading, setLoading] = useState(false);
    const [encashmentRequests, setEncashmentRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Mock data for demonstration
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setEncashmentRequests([
                {
                    id: "ENC001",
                    employeeName: "Aditi S.",
                    employeeId: "EMP045",
                    leaveType: "Earned Leave",
                    daysRequested: 15,
                    amountEstimated: "₹32,500",
                    status: "PENDING",
                    requestDate: "2026-02-15"
                },
                {
                    id: "ENC003",
                    employeeName: "Priya Sharma",
                    employeeId: "EMP012",
                    leaveType: "Earned Leave",
                    daysRequested: 20,
                    amountEstimated: "₹45,000",
                    status: "REJECTED",
                    requestDate: "2026-02-05"
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case "APPROVED":
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Approved</span>;
            case "REJECTED":
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>;
        }
    };

    const filteredRequests = encashmentRequests.filter(req => {
        const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header Info Banner */}
            {/* <div className="rounded-sm border border-brand-100 bg-brand-50 p-4 dark:border-brand-900/50 dark:bg-brand-900/20">
                <div className="flex gap-3">
                    <Info className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                            Leave Encashment Management
                        </h3>
                        <p className="text-sm text-brand-700 dark:text-brand-300 mt-1">
                            Encashment is processed based on the leave policy terms. Usually applying to Earned Leaves (EL) or Privilege Leaves (PL) above a certain threshold.
                        </p>
                    </div>
                </div>
            </div> */}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name or employee ID..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        className="px-3 py-2 border border-gray-200 rounded-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <button className="inline-flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-brand-600 transition shadow-sm">
                        <CheckCircle size={16} /> Process Bulk
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 text-xs">
                                <th className="px-6 py-4">Employee Details</th>
                                <th className="px-6 py-4">Leave Type</th>
                                <th className="px-6 py-4">Days</th>
                                <th className="px-6 py-4">Estimated Amount</th>
                                <th className="px-6 py-4">Request Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Clock className="animate-spin h-6 w-6 text-brand-500" />
                                            <span>Loading encashment requests...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No matching encashment requests found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">{req.employeeName}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {req.employeeId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {req.leaveType}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {req.daysRequested} Days
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            {req.amountEstimated}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-nowrap">
                                            {req.requestDate}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="View Details">
                                                <Eye size={16} className="text-gray-500" />
                                            </button>
                                            {req.status === "PENDING" && (
                                                <>
                                                    <button className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition" title="Approve">
                                                        <CheckCircle size={16} className="text-green-600" />
                                                    </button>
                                                    <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition" title="Reject">
                                                        <XCircle size={16} className="text-red-600" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
