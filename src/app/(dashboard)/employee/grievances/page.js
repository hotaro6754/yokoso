"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Filter,
    Search,
    Clock,
    ShieldAlert,
    Plus,
    UserX,
    MessageSquare,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Calendar,
    EyeOff
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { grievanceService } from "@/services/grievance.service";
import { toast } from "react-hot-toast";

const statusOptions = ["All", "Submitted", "Under Review", "Investigation", "Hearing", "Decision Pending", "Resolved", "Closed"];
const typeOptions = ["All", "General Grievance", "POSH Complaint"];

export default function EmployeeGrievancesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, [statusFilter, typeFilter, searchQuery]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const result = await grievanceService.getMyGrievances({
                status: statusFilter !== "All" ? statusFilter : undefined,
                type: typeFilter !== "All" ? typeFilter : undefined,
                search: searchQuery || undefined
            });
            setTickets(result.data || []);
        } catch (err) {
            console.error("Failed to fetch grievances", err);
            toast.error("Failed to load grievances");
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        "Submitted": { color: "blue", icon: Clock },
        "Under Review": { color: "indigo", icon: EyeOff },
        "Investigation": { color: "amber", icon: ShieldAlert },
        "In Investigation": { color: "amber", icon: ShieldAlert },
        "Hearing": { color: "purple", icon: UserX },
        "Decision Pending": { color: "orange", icon: Clock },
        "Resolved": { color: "emerald", icon: CheckCircle2 },
        "Closed": { color: "gray", icon: ShieldCheck },
        "Panel Assigned": { color: "indigo", icon: UserX },
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 transition-colors duration-200">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/employee/dashboard" },
                        { label: "Grievance & POSH" },
                    ]}
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="rounded-sm border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20 shadow-sm flex-1">
                        <div className="flex gap-2 text-[10px] text-blue-800 dark:text-blue-300">
                            <span className="font-bold uppercase tracking-[0.2em] bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">Security Note:</span>
                            <span className="font-bold uppercase tracking-tight">This is a confidential portal. All submissions are handled as per company ethics policy and POSH Act 2013 where applicable.</span>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Link
                            href="/employee/grievances/create?type=general"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-700 rounded-sm text-primary-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all shadow-sm"
                        >
                            <Plus size={16} />
                            Raise Grievance
                        </Link>
                        <Link
                            href="/employee/grievances/create?type=posh"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] transition-all shadow-sm"
                        >
                            <ShieldAlert size={16} />
                            Lodge POSH
                        </Link>
                    </div>
                </div>

                {/* Stats Summary - Clean Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Active Cases", value: tickets.filter(t => !["Resolved", "Closed"].includes(t.status)).length, icon: AlertCircle, color: "blue" },
                        { label: "Resolved", value: tickets.filter(t => ["Resolved", "Closed"].includes(t.status)).length, icon: CheckCircle2, color: "emerald" },
                        { label: "POSH Cases", value: tickets.filter(t => t.type === "POSH Complaint").length, icon: ShieldAlert, color: "red" },
                        { label: "Avg Resolution", value: "8 Days", icon: Clock, color: "orange" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                            <div className={`p-2 rounded-sm bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tools - Filters & Search */}
                <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm p-3">
                    <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="SEARCH BY SUBJECT OR TICKET ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-sm text-[10px] font-bold uppercase tracking-widest focus:ring-0 focus:border-primary-400 transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-40">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full pl-9 pr-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-sm text-[10px] font-bold uppercase tracking-widest appearance-none cursor-pointer outline-none"
                                >
                                    {typeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="relative flex-1 md:w-40">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-9 pr-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-sm text-[10px] font-bold uppercase tracking-widest appearance-none cursor-pointer outline-none"
                                >
                                    {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tickets Grid - Clean Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm h-40 animate-pulse"></div>
                        ))
                    ) : tickets.length > 0 ? (
                        tickets.map((ticket) => {
                            const config = statusConfig[ticket.status] || { color: "gray", icon: Clock };
                            const StatusIcon = config.icon;
                            // Fix date handling
                            const displayDate = ticket.submittedOn || ticket.updatedAt || new Date().toISOString();

                            return (
                                <Link
                                    key={ticket.id}
                                    href={`/employee/grievances/${ticket.id}`}
                                    className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all flex flex-col group overflow-hidden"
                                >
                                    <div className="p-5 flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">
                                                    {ticket.id}
                                                </span>
                                            </div>
                                            {ticket.anonymous && (
                                                <span className="px-2 py-0.5 rounded-sm bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 text-[9px] font-bold uppercase tracking-tight border border-orange-100 dark:border-orange-900/30">
                                                    Anonymous
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-h-[3rem]">
                                            <h4 className="text-sm font-bold text-gray-800 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
                                                {ticket.subject}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${ticket.type === 'POSH Complaint' ? 'text-red-600' : 'text-primary-600'}`}>
                                                    {ticket.type}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{ticket.category}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium uppercase tracking-tight">
                                                <Calendar size={12} className="text-gray-400" />
                                                {new Date(displayDate).toLocaleDateString("en-GB")}
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-${config.color}-50 dark:bg-${config.color}-900/10 text-${config.color}-600 dark:text-${config.color}-400 text-[10px] font-bold border border-${config.color}-100 dark:border-${config.color}-900/30`}>
                                                <StatusIcon size={12} />
                                                {ticket.status}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-sm inline-block">
                                <MessageSquare size={32} className="text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide">No Tickets Found</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You haven't raised any concerns yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
