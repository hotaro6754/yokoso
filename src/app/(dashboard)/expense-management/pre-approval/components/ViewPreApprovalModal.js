"use client";

import React, { useState } from "react";
import { X, CheckCircle, XCircle, FileText, Calendar, User, Tag, IndianRupee, MessageSquare, Clock } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ViewPreApprovalModal({ isOpen, onClose, item, onActionSuccess }) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !item) return null;

    const handleAction = async (action, reason = "") => {
        try {
            setLoading(true);
            if (action === "approve") {
                await api.patch(`/expense-management/pre-approval/${item.id}/approve`);
                toast.success("Pre-approval approved");
            } else {
                await api.patch(`/expense-management/pre-approval/${item.id}/reject`, { reason });
                toast.success("Pre-approval rejected");
            }
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
            case "PRE_APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400";
            case "REJECTED": return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400";
            default: return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400";
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500 rounded-lg shrink-0">
                            <FileText size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">{item.preApprovalId}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Request Details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Status Banner */}
                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${getStatusStyles(item.status)}`}>
                        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                            <Clock size={16} /> {item.status.replace('_', ' ')}
                        </div>
                        <div className="text-xs font-medium">Submitted on {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="text-gray-400 mt-1" size={18} />
                                <div>
                                    <p className="text-gray-500 font-medium">Purpose</p>
                                    <p className="font-semibold text-gray-900 dark:text-white mt-1">{item.purpose}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Tag className="text-gray-400 mt-1" size={18} />
                                <div>
                                    <p className="text-gray-500 font-medium">Expense Type</p>
                                    <p className="font-semibold text-gray-900 dark:text-white mt-1">{item.expenseType}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <IndianRupee className="text-gray-400 mt-1" size={18} />
                                <div>
                                    <p className="text-gray-500 font-medium">Estimated Cost</p>
                                    <p className="font-bold text-xl text-brand-600 mt-1">₹{item.estimatedCost.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="text-gray-400 mt-1" size={18} />
                                <div>
                                    <p className="text-gray-500 font-medium">Required By</p>
                                    <p className="font-semibold text-gray-900 dark:text-white mt-1">{new Date(item.timeline).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {item.rejectReason && (
                        <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
                            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">Rejection Reason</h4>
                            <p className="text-sm text-rose-600 dark:text-rose-300">{item.rejectReason}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition font-bold dark:text-gray-300"
                    >
                        Close
                    </button>
                    {item.status === 'PENDING' && (
                        <>
                            <button
                                disabled={loading}
                                onClick={() => handleAction('reject', "Request rejected by manager")}
                                className="flex-1 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition font-bold"
                            >
                                Reject
                            </button>
                            <button
                                disabled={loading}
                                onClick={() => handleAction('approve')}
                                className="flex-1 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-bold shadow-lg shadow-brand-500/20"
                            >
                                {loading ? "Processing..." : "Approve"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
