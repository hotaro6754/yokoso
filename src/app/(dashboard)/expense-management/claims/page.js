"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PlusCircle, Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, Download } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import ExpenseClaimModal from "./components/ExpenseClaimModal";
import ViewExpenseClaimModal from "./components/ViewExpenseClaimModal";

export default function ExpenseClaimsPage() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const prevTotalRef = useRef(0);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const fetchItems = async ({ nextPage, nextPageSize, nextSearch } = {}) => {
        try {
            setLoading(true);
            const effectivePage = nextPage ?? page;
            const effectiveLimit = nextPageSize ?? pageSize;
            const effectiveSearch = String(nextSearch ?? debouncedSearch).trim();

            const res = await api.get("/expense-management/claims", {
                params: {
                    page: effectivePage,
                    limit: effectiveLimit,
                    q: effectiveSearch || undefined,
                }
            });

            const nextItems = res?.data?.items || [];
            const nextPagination = res?.data?.pagination || {
                total: Array.isArray(nextItems) ? nextItems.length : 0,
                page: effectivePage,
                limit: effectiveLimit,
                totalPages: 1,
            };

            const rawCounts = res?.data?.statusCounts;
            const mappedCounts = Array.isArray(rawCounts)
                ? rawCounts.reduce((acc, row) => {
                    const key = row?.status;
                    const count = row?._count?._all ?? row?._count ?? 0;
                    if (key) acc[key] = count;
                    return acc;
                }, {})
                : (rawCounts && typeof rawCounts === "object" ? rawCounts : {});

            setItems(Array.isArray(nextItems) ? nextItems : []);
            setPagination(nextPagination);
            setStatusCounts(mappedCounts);

            // If new claims arrive, jump to page 1 so the latest is visible.
            const nextTotal = Number(nextPagination?.total || 0);
            if (nextTotal > prevTotalRef.current) setPage(1);
            prevTotalRef.current = nextTotal;
        } catch (error) {
            toast.error("Failed to fetch expense claims");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, debouncedSearch]);

    const getStatusColor = (status) => {
        switch (status) {
            case "APPROVED": return "success";
            case "PAID": return "info";
            case "REJECTED": return "danger";
            case "PENDING_MANAGER":
            case "PENDING_FINANCE": return "warning";
            case "CLARIFICATION_SOUGHT": return "secondary";
            default: return "secondary";
        }
    };

    const totalClaims = Number(pagination?.total || 0);

    const pendingApprovalCount = useMemo(() => {
        return Object.entries(statusCounts)
            .filter(([status]) => String(status || "").toUpperCase().startsWith("PENDING"))
            .reduce((sum, [, count]) => sum + (Number(count) || 0), 0);
    }, [statusCounts]);

    const approvedCount = useMemo(() => {
        const approved = Number(statusCounts?.APPROVED || 0);
        const paid = Number(statusCounts?.PAID || 0);
        return approved + paid;
    }, [statusCounts]);

    const paidCount = useMemo(() => Number(statusCounts?.PAID || 0), [statusCounts]);

    useEffect(() => {
        const totalPages = Math.max(1, Number(pagination?.totalPages || 1));
        if (page > totalPages) setPage(totalPages);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination?.totalPages]);

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Breadcrumb
                rightContent={
                    <button
                        onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-lg shadow-brand-500/20"
                    >
                        <PlusCircle size={18} /> New Claim
                    </button>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "My Total Claims", value: totalClaims, icon: <FileText className="text-blue-500" /> },
                    { label: "Pending Approval", value: pendingApprovalCount, icon: <Clock className="text-orange-500" /> },
                    { label: "Total Approved", value: approvedCount, icon: <CheckCircle className="text-green-500" /> },
                    { label: "Integrated in Payroll", value: paidCount, icon: <Download className="text-purple-500" /> },
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
                            placeholder="Search by Claim No..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
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
                        <thead className="bg-secondary-50 dark:bg-secondary-900/20 text-secondary-900 dark:text-secondary-100 text-sm font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Claim No</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4">Bills</th>
                                <th className="px-6 py-4">Date</th>
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
                                        No expense claims found.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="px-6 py-4 font-medium text-brand-600">{item.claimNo}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 dark:text-gray-300">{item.claimType.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold dark:text-white text-lg">₹{item.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium dark:text-gray-300">
                                                <FileText size={14} /> {item.billCount} Bills
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(item.claimDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-sm text-xs font-semibold ${item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200' :
                                                item.status === 'PAID' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200' :
                                                    item.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200' :
                                                        'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200'
                                                }`}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.get(`/expense-management/claims/${item.id}`);
                                                        setSelectedItem(res.data.data);
                                                        setIsViewOpen(true);
                                                    } catch (error) {
                                                        toast.error("Failed to load claim details");
                                                    }
                                                }}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-400" title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination (match common screens) */}
            <Pagination
                currentPage={page}
                totalItems={totalClaims}
                itemsPerPage={pageSize}
                itemsPerPageOptions={[5, 10, 20, 50]}
                onPageChange={(next) => setPage(next)}
                onItemsPerPageChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                }}
                className="mt-6"
            />

            <ExpenseClaimModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    if (page !== 1) setPage(1);
                    else fetchItems({ nextPage: 1 });
                }}
            />

            <ViewExpenseClaimModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                item={selectedItem}
                onActionSuccess={fetchItems}
            />
        </div>
    );
}
