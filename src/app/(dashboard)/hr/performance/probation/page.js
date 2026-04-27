"use client";

import { useEffect, useState } from "react";
import { hrProbationService } from "@/services/hr-services/probation.service";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import {
    FileText,
    Filter,
    Users,
    AlertTriangle,
    UserCheck,
    Search
} from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "@/components/common/Pagination";

export default function HRProbationPage() {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10
    });
    const [filters, setFilters] = useState({
        status: "",
        department: "",
        search: "",
        page: 1,
        limit: 10
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [response, statsData] = await Promise.all([
                hrProbationService.getAll({
                    status: filters.status,
                    departmentId: filters.department,
                    employeeName: filters.search,
                    page: filters.page,
                    limit: filters.limit
                }),
                hrProbationService.getStats()
            ]);

            if (response && response.records) {
                setData(response.records);
                setPagination(response.pagination);
            } else {
                setData(Array.isArray(response) ? response : []);
            }

            setStats(statsData);
        } catch (err) {
            toast.error("Failed to load probation data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleStatusFilter = (status) => {
        setFilters(prev => ({ ...prev, status, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleLimitChange = (limit) => {
        setFilters(prev => ({ ...prev, limit, page: 1 }));
    };

    const breadcrumbItems = [
        { label: "Performance", href: "/hr/performance-management" },
        { label: "Probation Management", href: "/hr/performance/probation" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Probation Management</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatusCard title="Active" count={stats.ACTIVE || 0} icon={<Users size={20} />} color="blue" onClick={() => handleStatusFilter('ACTIVE')} active={filters.status === 'ACTIVE'} />
                <StatusCard title="Extended" count={stats.EXTENDED || 0} icon={<AlertTriangle size={20} />} color="amber" onClick={() => handleStatusFilter('EXTENDED')} active={filters.status === 'EXTENDED'} />
                <StatusCard title="Confirmed" count={stats.COMPLETED || 0} icon={<UserCheck size={20} />} color="emerald" onClick={() => handleStatusFilter('COMPLETED')} active={filters.status === 'COMPLETED'} />
                <StatusCard title="Terminated" count={stats.REJECTED || stats.TERMINATED || 0} icon={<AlertTriangle size={20} />} color="rose" onClick={() => handleStatusFilter('REJECTED')} active={filters.status === 'REJECTED'} />
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search employee..."
                        value={filters.search}
                        className="pl-10 pr-4 py-1.5 w-full border rounded-lg text-xs bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all"
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                    />
                </div>

                <select
                    className="border rounded-lg px-4 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all"
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value, page: 1 }))}
                >
                    <option value="">All Departments</option>
                    {/* Ideally fetch departments dynamically */}
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                </select>

                <button
                    onClick={() => setFilters({ status: "", department: "", search: "", page: 1, limit: 10 })}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                    <Filter size={14} />
                    Clear Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gradient-to-r from-[var(--color-primary-hover)]/80 to-[var(--color-secondary)]/40 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/5 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300">Employee</th>
                            <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300">Department</th>
                            <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300">Start Date</th>
                            <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300">Stage</th>
                            <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300">Status</th>
                            <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300">Progress</th>
                            <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading records...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No probation records found.</td></tr>
                        ) : (
                            data.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.employeeName}</td>
                                    <td className="px-6 py-4 text-gray-500">{row.department || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(row.startDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-[var(--color-primary-hover)] text-[#0b1220] rounded text-xs font-semibold">
                                            {row.currentStage?.replace('DAYS_', '')} Days
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={row.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {row.reviewsCompleted} / 3 Reviews
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/hr/performance/probation/${row.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium text-xs">View Data</Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Below Table */}
            <Pagination
                currentPage={pagination.page}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleLimitChange}
                showWhenEmpty={true}
            />
        </div>
    );
}

function StatusCard({ title, count, icon, color, onClick, active }) {
    const activeClass = active ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900" : "";
    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-all ${activeClass}`}
        >
            <div className={`text-${color}-500 mb-2 p-2 bg-${color}-50 rounded-lg w-fit`}>{icon}</div>
            <p className="text-gray-500 text-xs uppercase font-semibold">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        ACTIVE: "bg-blue-50 text-blue-700 border-blue-100",
        EXTENDED: "bg-amber-50 text-amber-700 border-amber-100",
        COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
        REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
        TERMINATED: "bg-rose-50 text-rose-700 border-rose-100"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
}
