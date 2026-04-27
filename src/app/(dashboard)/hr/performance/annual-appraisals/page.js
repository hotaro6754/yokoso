"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
    Award, Search, FileText, TrendingUp, CheckCircle2,
    Clock, RefreshCw, ChevronRight,
    Briefcase, MapPin, BarChart3, Loader2, Play
} from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";

const AnnualAppraisalsHRPage = () => {
    const router = useRouter();
    const [appraisals, setAppraisals] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ appraisalCycleId: "all", status: "all" });
    const [searchTerm, setSearchTerm] = useState("");
    const [showInitiateModal, setShowInitiateModal] = useState(false);

    const breadcrumbItems = [
        { label: "HR", href: "/hr" },
        { label: "Performance Management", href: "/hr/performance-management" },
        { label: "Annual Appraisals" },
    ];

    useEffect(() => {
        fetchMetadata();
        fetchAppraisals();
    }, [filters]);

    const fetchMetadata = async () => {
        try {
            const data = await performanceManagementService.getAppraisalCycles();
            setCycles(data);
        } catch (error) {
            console.error("Failed to fetch cycles", error);
        }
    };

    const fetchAppraisals = async () => {
        setLoading(true);
        try {
            const data = await performanceManagementService.getAnnualAppraisals(filters);
            setAppraisals(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiate = async () => {
        if (!filters.appraisalCycleId || filters.appraisalCycleId === "all") {
            toast.error("Please select a specific Appraisal Cycle first.");
            return;
        }
        setShowInitiateModal(true);
    };

    const confirmInitiate = async () => {
        setShowInitiateModal(false);
        try {
            setLoading(true);
            await performanceManagementService.initiateAnnualAppraisals(filters.appraisalCycleId);
            toast.success("Annual appraisals initiated successfully!");
            fetchAppraisals();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };


    const handleUpdateStatus = async (id, status) => {
        try {
            setLoading(true);
            await performanceManagementService.updateAnnualAppraisal(id, { status });
            toast.success(`Appraisal ${status.toLowerCase()} successfully!`);
            if (selectedAppraisal?.id === id) setSelectedAppraisal({ ...selectedAppraisal, status });
            fetchAppraisals();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getNineBoxLabel = (row, col) => {
        const labels = {
            "1,1": "Star / Top Talent", "1,2": "High Performer", "1,3": "Solid Performer",
            "2,1": "High Potential", "2,2": "Core Performer", "2,3": "Average Performer",
            "3,1": "Dilemma", "3,2": "Underperformer", "3,3": "Poor Performer",
        };
        return labels[`${row},${col}`] || "Unmapped";
    };

    const getStatusBadge = (status) => {
        const map = {
            APPROVED: { cls: "bg-success/10 text-success border-success/20", icon: <CheckCircle2 className="w-3 h-3" />, label: "Approved" },
            SUBMITTED: { cls: "bg-primary/10 text-primary border-primary/20", icon: <Clock className="w-3 h-3" />, label: "Review Pending" },
            REVIEWED: { cls: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300", icon: <CheckCircle2 className="w-3 h-3" />, label: "Manager Reviewed" },
        };
        const s = map[status] || { cls: "bg-muted text-muted-foreground border-border", icon: <Clock className="w-3 h-3" />, label: "Pending" };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
                {s.icon} {s.label}
            </span>
        );
    };

    const filteredAppraisals = appraisals.filter(a =>
        searchTerm === "" ||
        `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: appraisals.length,
        completed: appraisals.filter(a => a.status === "APPROVED").length,
        avgRating: appraisals.length > 0
            ? (appraisals.reduce((s, a) => s + (a.finalRating || 0), 0) / (appraisals.filter(a => a.finalRating).length || 1)).toFixed(1)
            : "0.0",
        hikeEstimate: appraisals.reduce((s, a) => s + (a.hikePercentage || 0), 0).toFixed(1),
    };

    const statCards = [
        { label: "Total Appraisals", value: stats.total, sub: "Generated", icon: Award, color: "text-primary", bg: "from-primary/20 to-primary/5" },
        { label: "Released Letters", value: stats.completed, sub: `${((stats.completed / (stats.total || 1)) * 100).toFixed(0)}% complete`, icon: CheckCircle2, color: "text-success", bg: "from-success/20 to-success/5" },
        { label: "Avg Final Rating", value: stats.avgRating, sub: "out of 5.0", icon: TrendingUp, color: "text-violet-600 dark:text-violet-400", bg: "from-violet-500/20 to-violet-500/5" },
        { label: "Total Hike Estimate", value: `${stats.hikeEstimate}%`, sub: "Aggregated for cycle", icon: BarChart3, color: "text-amber-600 dark:text-amber-400", bg: "from-amber-500/20 to-amber-500/5" },
    ];

    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <Breadcrumb items={breadcrumbItems} />

                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-5 premium-shadow"
                >
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 3 }}
                            className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 flex-shrink-0"
                        >
                            <Award className="w-5 h-5" />
                        </motion.div>

                        {/* Title + subtitle */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-extrabold text-foreground tracking-tight leading-none">Annual Appraisals</h1>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">Finalize annual reviews, performance mapping, and hike disbursements.</p>
                        </div>

                        {/* Divider */}
                        <div className="h-8 w-px bg-border flex-shrink-0" />

                        {/* Controls */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <select
                                value={filters.appraisalCycleId}
                                onChange={(e) => setFilters({ ...filters, appraisalCycleId: e.target.value })}
                                className="px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">Select Cycle</option>
                                {cycles.map(c => {
                                    const isAnnual = c.name?.toLowerCase().includes('annual') || c.quarter?.toString().toUpperCase() === 'ANNUAL';
                                    return (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {isAnnual ? '(Annually)' : `(${c.quarter || 'Quarterly'})`}
                                        </option>
                                    );
                                })}
                            </select>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleInitiate}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg font-semibold text-sm shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                Initiate Year-End Process
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="glass-card rounded-2xl p-5 premium-shadow flex items-center gap-4"
                            >
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.bg} ${card.color} flex-shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">{card.label}</p>
                                    <p className="text-2xl font-extrabold text-foreground leading-none">{card.value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Main Table Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-6 premium-shadow"
                >
                    {/* Table header row */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-md border border-primary/10"
                            >
                                <FileText className="w-5 h-5" />
                            </motion.div>
                            <h3 className="text-base font-bold text-foreground whitespace-nowrap">Employee Appraisal Matrix</h3>
                        </div>

                        <div className="h-6 w-px bg-border flex-shrink-0" />
                        <div className="flex-1" />

                        {/* Search */}
                        <div className="relative flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by name, email or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-60 pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary-50 dark:bg-secondary-900/20 text-secondary-900 dark:text-secondary-100 text-xs font-bold uppercase tracking-wider border-b border-secondary-100 dark:border-secondary-800">
                                <tr>
                                    <th className="text-left py-3 px-4 rounded-tl-lg">Employee</th>
                                    <th className="text-left py-3 px-4">Department</th>
                                    <th className="text-center py-3 px-4">Quarterly Snapshot</th>
                                    <th className="text-center py-3 px-4">Avg Quarterly Rating</th>
                                    <th className="text-center py-3 px-4">Annual Score</th>
                                    <th className="text-center py-3 px-4">Status</th>
                                    <th className="text-right py-3 px-4 rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                            <p className="text-sm text-muted-foreground mt-3">Loading appraisal data...</p>
                                        </td>
                                    </tr>
                                ) : filteredAppraisals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                                                    <BarChart3 className="w-8 h-8 text-muted-foreground/50" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">No appraisal records found</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Initiate the cycle or adjust your search parameters.</p>
                                                </div>
                                            </motion.div>
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence>
                                        {filteredAppraisals.map((appraisal, index) => {
                                            const avgQ = appraisal.quarterlyReviews?.length > 0
                                                ? (appraisal.quarterlyReviews.reduce((s, r) => s + (r.rating || 0), 0) / (appraisal.quarterlyReviews.filter(r => r.rating).length || 1)).toFixed(1)
                                                : "N/A";
                                            return (
                                                <motion.tr
                                                    key={appraisal.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    transition={{ delay: index * 0.04 }}
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    {/* Employee */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                                {appraisal.employee.firstName[0]}{appraisal.employee.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">{appraisal.employee.firstName} {appraisal.employee.lastName}</p>
                                                                <p className="text-xs text-muted-foreground">{appraisal.employee.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Department */}
                                                    <td className="py-3.5 px-4">
                                                        <p className="text-sm font-medium text-foreground">{appraisal.employee.department?.name || "N/A"}</p>
                                                        <p className="text-xs text-muted-foreground">{appraisal.employee.designation?.name}</p>
                                                    </td>
                                                    {/* Quarterly Snapshot */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {["Q1", "Q2", "Q3", "Q4"].map(q => {
                                                                const rev = appraisal.quarterlyReviews?.find(r => r.quarter === q);
                                                                return (
                                                                    <div key={q} className="flex flex-col items-center gap-1">
                                                                        <div className={`w-7 h-1.5 rounded-full ${rev ? "bg-success" : "bg-border"}`} title={`${q}: ${rev ? rev.status : "Pending"}`} />
                                                                        <span className="text-[9px] font-bold text-muted-foreground">{q}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    {/* Avg Quarterly Rating */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className="text-sm font-semibold text-foreground">{avgQ}</span>
                                                    </td>
                                                    {/* Annual Score */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className="text-sm font-bold text-foreground">{appraisal.finalRating || "—"}</span>
                                                        {appraisal.finalRating && <span className="text-xs text-muted-foreground"> / 5</span>}
                                                    </td>
                                                    {/* Status */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        {getStatusBadge(appraisal.status)}
                                                    </td>
                                                    {/* Actions */}
                                                    <td className="py-3.5 px-4 text-right">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => router.push(`/hr/performance/annual-appraisals/${appraisal.id}`)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-semibold transition-all"
                                                        >
                                                            <ChevronRight className="w-3.5 h-3.5" /> View
                                                        </motion.button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            <ConfirmModal
                isOpen={showInitiateModal}
                title="Initiate Annual Appraisal"
                description="This will initiate the Annual Appraisal process for all active employees in this cycle. This will generate appraisal records and notify employees. Proceed?"
                confirmText="Initiate Now"
                cancelText="Cancel"
                onConfirm={confirmInitiate}
                onCancel={() => setShowInitiateModal(false)}
                confirmButtonClassName="bg-primary hover:bg-primary/90"
            />
        </div>
    );
};

export default AnnualAppraisalsHRPage;
