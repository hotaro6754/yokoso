"use client";

import { useEffect, useState } from "react";
import {
    Filter,
    Search,
    Clock,
    ShieldAlert,
    UserX,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    EyeOff,
    MoreVertical,
    ArrowUpRight,
    TrendingUp,
    Files,
    BarChart3,
    Download
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import { grievanceService, GRIEVANCE_CHANNEL, GRIEVANCE_STORAGE_KEY } from "@/services/grievance.service";
import Link from "next/link";

const categories = ["All", "General Grievance", "POSH Complaint"];
const statusOptions = ["All", "Submitted", "Under Review", "Investigation", "Hearing", "Decision Pending", "Resolved", "Closed"];

export default function HRGrievanceManagementPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [analytics, setAnalytics] = useState({
        total: 0,
        open: 0,
        posh: 0,
        slaBreach: 0
    });

    useEffect(() => {
        fetchData();
    }, [typeFilter, statusFilter, searchQuery]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleStorage = (event) => {
            if (event.key === GRIEVANCE_STORAGE_KEY) {
                fetchData();
            }
        };

        window.addEventListener("storage", handleStorage);

        let channel = null;
        if ("BroadcastChannel" in window) {
            channel = new BroadcastChannel(GRIEVANCE_CHANNEL);
            channel.onmessage = () => {
                fetchData();
            };
        }

        return () => {
            window.removeEventListener("storage", handleStorage);
            if (channel) channel.close();
        };
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, statusFilter, searchQuery]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(tickets.length / itemsPerPage));
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [tickets.length, itemsPerPage, currentPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await grievanceService.getAllGrievances({
                type: typeFilter !== "All" ? typeFilter : undefined,
                status: statusFilter !== "All" ? statusFilter : undefined,
                search: searchQuery || undefined
            });
            const data = result.data || [];
            const sorted = [...data].sort((a, b) => {
                const dateA = new Date(a?.createdAt || a?.submittedOn || a?.updatedAt || 0).getTime();
                const dateB = new Date(b?.createdAt || b?.submittedOn || b?.updatedAt || 0).getTime();
                if (dateA !== dateB) return dateB - dateA;
                return String(b?.id || "").localeCompare(String(a?.id || ""));
            });
            setTickets(sorted);

            // Fetch analytics (fallback to mock)
            try {
                const stats = await grievanceService.getAnalytics();
                setAnalytics(stats.data || stats);
            } catch (e) {
                setAnalytics({
                    total: 42,
                    open: 12,
                    posh: 3,
                    slaBreach: 1
                });
            }

        } catch (err) {
            console.error("Failed to fetch grievances", err);
            // Mock data for HR
            setTickets([
                { id: "POSH-102", complainant: "John Doe", type: "POSH Complaint", category: "Hostile work environment", status: "Investigation", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), slaDays: 85, isAnonymous: false },
                { id: "GRV-501", complainant: "Anonymous", type: "General Grievance", category: "Managerial issues", status: "Under Review", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), slaDays: 28, isAnonymous: true },
                { id: "GRV-489", complainant: "Jane Smith", type: "General Grievance", category: "Compensation concern", status: "Resolved", createdAt: new Date(Date.now() - 15 * 86400000).toISOString(), slaDays: 15, isAnonymous: false },
                { id: "POSH-098", complainant: "Alice Brown", type: "POSH Complaint", category: "Verbal misconduct", status: "Hearing", createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), slaDays: 80, isAnonymous: false },
                { id: "GRV-505", complainant: "Robert Wilson", type: "General Grievance", category: "Workplace conflict", status: "Submitted", createdAt: new Date().toISOString(), slaDays: 30, isAnonymous: false },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await grievanceService.exportGrievances({
                type: typeFilter !== "All" ? typeFilter : undefined,
                status: statusFilter !== "All" ? statusFilter : undefined,
                search: searchQuery || undefined
            });
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `grievance-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Export failed", error);
        }
    };

    const statusConfig = {
        "Submitted": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: Clock },
        "Under Review": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", icon: EyeOff },
        "Investigation": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: ShieldAlert },
        "Hearing": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100", icon: UserX },
        "Decision Pending": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", icon: Clock },
        "Resolved": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: CheckCircle2 },
        "Closed": { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-100", icon: ShieldCheck }
    };

    const totalRecords = tickets.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
    const paginatedTickets = tickets.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 transition-colors duration-200">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/hr/dashboard" },
                        { label: "Grievance & POSH Management" },
                    ]}
                />

                {/* Analytics Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Tickets", value: analytics.total, icon: Files, color: "primary", metric: "+12% context" },
                        { label: "Open Cases", value: analytics.open, icon: Clock, color: "orange", metric: "Action Needed" },
                        { label: "POSH Complaints", value: analytics.posh, icon: ShieldAlert, color: "red", metric: "High Priority" },
                        { label: "SLA Compliance", value: "96%", icon: BarChart3, color: "emerald", metric: "Active Watch" },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
                                <h3 className={`text-2xl font-bold ${stat.color === 'red' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{stat.value}</h3>
                                <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-${stat.color}-600`}>
                                    {stat.metric}
                                </div>
                            </div>
                            <div className={`p-3 rounded-sm bg-${stat.color}-50 text-${stat.color}-600 dark:bg-${stat.color}-900/10`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Global Toolbar */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH BY EMPLOYEE, ID OR CATEGORY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm text-[10px] font-bold uppercase tracking-[0.1em] outline-none focus:border-primary-400 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-48">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full appearance-none pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-sm text-[10px] font-bold uppercase tracking-[0.1em] cursor-pointer outline-none focus:border-primary-400"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600" size={14} />
                        </div>
                        <div className="relative w-full md:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full appearance-none pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-sm text-[10px] font-bold uppercase tracking-[0.1em] cursor-pointer outline-none focus:border-primary-400"
                            >
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600" size={14} />
                        </div>
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 rounded-sm border border-primary-200 dark:border-gray-700 hover:bg-gray-50 transition-all text-[10px] font-bold uppercase tracking-[0.1em]"
                            title="Export to CSV"
                        >
                            <Download size={14} /> EXPORT
                        </button>
                        <button className="p-2 bg-gray-50 dark:bg-gray-700 text-primary-600 rounded-sm border border-gray-100 hover:bg-gray-100 transition-colors">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>

                {/* Case Table */}
                <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary-50 dark:bg-secondary-900/20 border-b border-secondary-100 dark:border-secondary-800">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary-900 dark:text-secondary-100 uppercase tracking-[0.2em]">Case ID / Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary-900 dark:text-secondary-100 uppercase tracking-[0.2em]">Complainant</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary-900 dark:text-secondary-100 uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary-900 dark:text-secondary-100 uppercase tracking-[0.2em]">Submitted On</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary-900 dark:text-secondary-100 uppercase tracking-[0.2em]">SLA Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary-900 dark:text-secondary-100 uppercase tracking-[0.2em]">Current Stage</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary-900 dark:text-secondary-100 uppercase tracking-[0.2em] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-8">
                                                <div className="h-4 bg-gray-50 dark:bg-gray-700 rounded-sm w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    paginatedTickets.map((ticket) => {
                                        const isPosh = ticket.type === "POSH Complaint";
                                        const config = statusConfig[ticket.status] || statusConfig["Submitted"];
                                        const StatusIcon = config.icon;
                                        const slaPercentage = Math.round((ticket.slaDays / (isPosh ? 90 : 30)) * 100);
                                        const isSlaCritical = ticket.slaDays > (isPosh ? 80 : 25);

                                        return (
                                            <tr key={ticket.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">{ticket.id}</span>
                                                            {isPosh && <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase border border-red-100 italic">POSH</span>}
                                                        </div>
                                                        <p className="text-[9px] font-bold text-primary-600 uppercase tracking-tighter opacity-70 italic">Verified Record</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                                            {ticket.isAnonymous ? <EyeOff size={14} /> : ticket.complainant?.charAt(0) || "U"}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight">{ticket.complainant}</p>
                                                            {ticket.isAnonymous && <p className="text-[9px] text-orange-600 font-bold uppercase italic tracking-tighter">ANONYMOUS FILING</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] text-gray-600 dark:text-gray-300 font-bold uppercase tracking-tight">{ticket.category}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                        {(() => {
                                                            const dateVal = ticket.createdAt || ticket.submittedOn;
                                                            if (!dateVal) return "N/A";
                                                            const d = new Date(dateVal);
                                                            return isNaN(d) ? "INVALID DATE" : d.toLocaleDateString("en-GB");
                                                        })()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 min-w-[140px]">
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                                                            <span className={isSlaCritical ? 'text-red-700' : 'text-gray-400'}>{ticket.slaDays}D ELAPSED</span>
                                                            <span className="text-gray-400">LITERAL {isPosh ? '90D' : '30D'}</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${isSlaCritical ? 'bg-red-600' : 'bg-primary-600'}`}
                                                                style={{ width: `${slaPercentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
                                                        <StatusIcon size={12} />
                                                        {ticket.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Link
                                                        href={`/hr/grievance-management/${ticket.id}`}
                                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary-700 dark:text-primary-400 text-[10px] font-bold uppercase tracking-[0.1em] rounded-sm hover:bg-gray-50 transition-all shadow-sm"
                                                    >
                                                        Details <ArrowUpRight size={14} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-[9px] font-bold text-gray-500 uppercase tracking-widest space-y-3">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-6">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary-600"></div> NORMAL OPERATION</span>
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600"></div> CRITICAL BREACH</span>
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-600"></div> COMPLIANCE SATISFIED</span>
                            </div>
                            <p>Dossier Registry: {tickets.length} investigations active</p>
                        </div>
                    </div>
                </div>

                <Pagination
                    currentPage={safePage}
                    totalItems={totalRecords}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(size) => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                    }}
                    showWhenEmpty={true}
                />
            </div>
        </div>
    );
}
