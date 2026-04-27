"use client";

import React, { useState } from "react";
import { X, CheckCircle, XCircle, FileText, Calendar, User, Tag, IndianRupee, MessageSquare, Clock, Paperclip, ChevronRight, Download } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ViewExpenseClaimModal({ isOpen, onClose, item, onActionSuccess }) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !item) return null;

    const handleAction = async (newStatus) => {
        try {
            setLoading(true);
            const comments = newStatus === 'REJECTED' ? "Claim rejected by manager" : "Claim approved by manager";

            await api.patch(`/expense-management/claims/${item.id}/status`, {
                status: newStatus,
                comments
            });

            toast.success(`Claim ${newStatus.toLowerCase().replace('_', ' ')} successfully`);
            onActionSuccess();
            onClose();
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case "APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400";
            case "PAID": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400";
            case "REJECTED": return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400";
            default: return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400";
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500 rounded-lg shrink-0">
                            <FileText size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">{item.claimNo}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Expense Claim Details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Total Amount</p>
                            <h3 className="text-xl font-black text-brand-600">₹{item.totalAmount.toLocaleString()}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition text-gray-400">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Status Banner */}
                    <div className={`flex items-center justify-between px-6 py-4 rounded-2xl border ${getStatusStyles(item.status)}`}>
                        <div className="flex items-center gap-3 font-black uppercase tracking-widest text-sm">
                            <Clock size={20} /> {item.status.replace('_', ' ')}
                        </div>
                        <div className="flex items-center gap-6 text-xs font-semibold uppercase">
                            <div>Submitted on {new Date(item.claimDate).toLocaleDateString()}</div>
                            <div className="h-4 w-px bg-current opacity-20"></div>
                            <div>{item.claimType.replace('_', ' ')}</div>
                        </div>
                    </div>

                    {/* Employee Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <User size={18} className="text-gray-400" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-gray-500 font-medium">Claimant</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{item.employee?.firstName} {item.employee?.lastName}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {item.preApproval && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-brand-600">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-gray-500 font-medium">Linked Pre-Approval</p>
                                        <p className="font-bold text-gray-900 dark:text-white">{item.preApproval.preApprovalId}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            Line Items ({item.items?.length || 0})
                        </h3>
                        <div className="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-2xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Receipt No</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Details</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {item.items?.map((li, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                                            <td className="px-4 py-4 font-medium text-brand-600 font-mono">{li.receiptNo}</td>
                                            <td className="px-4 py-4 dark:text-gray-300">{new Date(li.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-4 max-w-xs">
                                                <div className="text-gray-900 dark:text-white font-semibold truncate">{li.comments || "No description"}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 space-x-2">
                                                    {li.travellingFrom && <span>{li.travellingFrom} → {li.travellingTo}</span>}
                                                    {li.teamName && <span>Team: {li.teamName}</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-bold dark:text-white">₹{li.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Audit Trail */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Processing History</h3>
                        <div className="space-y-4 ml-2">
                            {item.auditTrail?.map((log, i) => (
                                <div key={i} className="relative pl-6 pb-4 border-l-2 border-gray-100 dark:border-gray-700 last:border-0">
                                    <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-brand-500"></div>
                                    <div className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <span>{log.actionByName}</span>
                                        <ChevronRight size={12} />
                                        <span className="text-brand-600">{log.toStatus.replace('_', ' ')}</span>
                                        <span className="ml-auto font-medium lowercase tracking-normal">{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{log.comments}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition font-bold dark:text-gray-300"
                    >
                        Close
                    </button>
                    {(item.status === 'PENDING_MANAGER' || item.status === 'PENDING_FINANCE') && (
                        <>
                            <button
                                disabled={loading}
                                onClick={() => handleAction('REJECTED')}
                                className="flex-1 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition font-bold"
                            >
                                Reject Claim
                            </button>
                            <button
                                disabled={loading}
                                onClick={() => handleAction('APPROVED')}
                                className="flex-1 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-bold shadow-lg shadow-brand-500/20"
                            >
                                {loading ? "Processing..." : "Approve Claim"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
