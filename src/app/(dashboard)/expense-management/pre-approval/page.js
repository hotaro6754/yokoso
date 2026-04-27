"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Search, Filter, MoreVertical, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import PreApprovalModal from "./components/PreApprovalModal";
import ViewPreApprovalModal from "./components/ViewPreApprovalModal";

export default function PreApprovalPage() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get("/expense-management/pre-approval");
            setItems(res.data.items);
        } catch (error) {
            toast.error("Failed to fetch pre-approvals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAction = async (id, action, reason = "") => {
        try {
            if (action === "approve") {
                await api.patch(`/expense-management/pre-approval/${id}/approve`);
                toast.success("Pre-approval approved");
            } else {
                await api.patch(`/expense-management/pre-approval/${id}/reject`, { reason });
                toast.success("Pre-approval rejected");
            }
            fetchItems();
        } catch (error) {
            toast.error(`Action failed: ${error.message}`);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PRE_APPROVED": return "success";
            case "REJECTED": return "danger";
            case "PENDING": return "warning";
            default: return "secondary";
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Breadcrumb
                rightContent={
                    <button
                        onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-lg shadow-brand-500/20"
                    >
                        <PlusCircle size={18} /> New Request
                    </button>
                }
            />

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Requests", value: items.length, icon: <Clock className="text-blue-500" /> },
                    { label: "Pending", value: items.filter(i => i.status === "PENDING").length, icon: <Clock className="text-orange-500" /> },
                    { label: "Approved", value: items.filter(i => i.status === "PRE_APPROVED").length, icon: <CheckCircle className="text-green-500" /> },
                    { label: "Rejected", value: items.filter(i => i.status === "REJECTED").length, icon: <XCircle className="text-red-500" /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{stat.icon}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID or Purpose..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:text-gray-300">
                            <Filter size={18} /> Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Request ID</th>
                                <th className="px-6 py-4">Purpose</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Estimated Cost</th>
                                <th className="px-6 py-4">Timeline</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No pre-approval requests found.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="px-6 py-4 font-medium text-brand-600">{item.preApprovalId}</td>
                                        <td className="px-6 py-4 dark:text-gray-200">{item.purpose}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${item.expenseType === 'Budgeted' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'bg-purple-100 text-purple-600 shadow-sm'}`}>
                                                {item.expenseType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold dark:text-white">₹{item.estimatedCost.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(item.timeline).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-sm text-xs font-semibold ${item.status === 'PRE_APPROVED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200' :
                                                item.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200' :
                                                    'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200'
                                                }`}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-gray-400">
                                                <button
                                                    onClick={() => { setSelectedItem(item); setIsViewOpen(true); }}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {item.status === 'PENDING' && (user.systemRole === 'MANAGER' || user.systemRole === 'FINANCE' || user.systemRole === 'HR_ADMIN') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(item.id, 'approve')}
                                                            className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition" title="Approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(item.id, 'reject', "Request rejected by manager")}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PreApprovalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchItems}
                item={selectedItem}
            />

            <ViewPreApprovalModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                item={selectedItem}
                onActionSuccess={fetchItems}
            />
        </div>
    );
}
