"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    Search,
    User,
    ArrowRight,
    AlertCircle,
    FileText,
    Calendar,
    Filter,
    RefreshCcw,
    Plus
} from "lucide-react";
import { toast } from "react-hot-toast";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import Pagination from "@/components/common/Pagination";

export default function SalaryStructureHistoryPage() {
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10,
        search: ""
    });
    const [localSearch, setLocalSearch] = useState("");
    const [filters, setFilters] = useState({ employeeId: "" });

    useEffect(() => {
        fetchHistory();
    }, [pagination.currentPage, pagination.limit, pagination.search, filters]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== pagination.search) {
                setPagination(prev => ({ ...prev, search: localSearch, currentPage: 1 }));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, pagination.search]);

    // Sync local search
    useEffect(() => {
        setLocalSearch(pagination.search);
    }, [pagination.search]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await payrollSalaryStructureService.getSalaryHistory({
                page: pagination.currentPage,
                limit: pagination.limit,
                search: pagination.search,
                ...filters
            });

            const resData = response;
            const data = resData.data || resData || {};
            const historyList = data.histories || (Array.isArray(data) ? data : []);
            const meta = data.pagination || data.meta || {};

            setHistories(historyList);
            setPagination(prev => ({
                ...prev,
                totalPages: meta.totalPages || 1,
                totalItems: meta.totalItems || historyList.length
            }));
        } catch (error) {
            toast.error(error.message || "Failed to fetch salary history");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFieldName = (key) => {
        const fieldNames = {
            basicSalary: "ANNUAL BASE CTC",
            hra: "HRA",
            conveyance: "Conveyance",
            medical: "Medical",
            specialAllowance: "Special Allowance",
            pf: "Provident Fund",
            esic: "ESIC",
            pt: "Professional Tax",
            tds: "TDS",
            totalCTC: "Total CTC"
        };
        return fieldNames[key] || key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase());
    };

    const getTypeBadgeColor = (type) => {
        switch (type) {
            case "CREATION":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400";
            case "REVISION":
                return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
            case "UPDATE":
                return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "CREATION":
                return <Plus size={14} />;
            case "REVISION":
                return <RefreshCcw size={14} />;
            default:
                return <Clock size={14} />;
        }
    };

    const filteredHistories = histories; // Backend handles filtering now

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-600" />
                        CTC Change History
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track all modifications to employee salary structures over time.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 transition-all w-64"
                        />
                    </div>
                    <button
                        onClick={fetchHistory}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCcw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium">
                                    Date & Time
                                </th>
                                <th className="text-left py-3 px-4 font-medium">
                                    Employee
                                </th>
                                <th className="text-left py-3 px-4 font-medium">
                                    Action Type
                                </th>
                                <th className="text-left py-3 px-4 font-medium min-w-[300px]">
                                    Changes
                                </th>
                                <th className="text-left py-3 px-4 font-medium">
                                    Performed By
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <AnimatePresence mode="popLayout">
                                {filteredHistories.length > 0 ? (
                                    filteredHistories.map((log, index) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                    <span>{formatDate(log.changedAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">
                                                        {log.employee?.firstName?.[0]}{log.employee?.lastName?.[0]}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {log.employee?.firstName} {log.employee?.lastName}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            ({log.employee?.employeeId})
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(log.type)}`}>
                                                    {getTypeIcon(log.type)}
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    {log.details && Object.keys(log.details).length > 0 ? (
                                                        Object.entries(log.details).map(([field, values]) => (
                                                            <div key={field} className="flex items-center gap-2 text-xs">
                                                                <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0 font-medium">
                                                                    {getFieldName(field)}:
                                                                </span>
                                                                {values.old !== undefined && values.old !== 0 ? (
                                                                    <>
                                                                        <span className="text-red-500 dark:text-red-400 line-through">
                                                                            {formatCurrency(values.old)}
                                                                        </span>
                                                                        <ArrowRight size={12} className="text-gray-400" />
                                                                    </>
                                                                ) : (
                                                                    <span className="text-emerald-500 font-semibold px-1 rounded bg-emerald-50 dark:bg-emerald-900/20">NEW</span>
                                                                )}
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                                    {formatCurrency(values.new)}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No value changes recorded</span>
                                                    )}
                                                    {log.notes && (
                                                        <div className="text-[10px] text-gray-400 italic mt-1 bg-gray-50 dark:bg-gray-900/50 p-1 rounded inline-block">
                                                            Note: {log.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-medium">
                                                        {log.changer?.firstName?.[0]}{log.changer?.lastName?.[0]}
                                                    </div>
                                                    <span>
                                                        {log.changer?.firstName ? `${log.changer.firstName} ${log.changer.lastName}` : "System Agent"}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                            {pagination.search ? "No change history found matching your search" : "No change history found"}
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <Pagination
                    currentPage={pagination.currentPage}
                    totalItems={pagination.totalItems}
                    totalPages={pagination.totalPages}
                    itemsPerPage={pagination.limit}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                    onItemsPerPageChange={(limit) => setPagination(prev => ({ ...prev, limit, currentPage: 1 }))}
                    className="p-6 border-t border-gray-100 dark:border-gray-700"
                />
            </div>
        </div>
    );
}
