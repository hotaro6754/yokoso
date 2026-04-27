"use client";
import React, { useState, useEffect } from "react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";
import {
    Award,
    Calendar,
    MessageSquare,
    Save,
    Star,
    TrendingUp,
    Download,
    Trophy,
    Target,
    Activity,
    ShieldCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    BarChart3,
    FileText
} from "lucide-react";

const EmployeeAnnualAppraisalPage = () => {
    const [appraisals, setAppraisals] = useState([]);
    const [selectedAppraisal, setSelectedAppraisal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState("");

    useEffect(() => {
        fetchAppraisals();
    }, []);

    const fetchAppraisals = async () => {
        setLoading(true);
        try {
            const data = await performanceManagementService.getAnnualAppraisals();
            setAppraisals(data);
            if (data.length > 0) {
                const currentId = selectedAppraisal?.id || data[0].id;
                await loadDetails(currentId);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadDetails = async (id) => {
        try {
            const data = await performanceManagementService.getAnnualAppraisalDetails(id);
            setSelectedAppraisal(data);
            setComments(data.selfAppraisal?.comments || "");
        } catch (error) {
            toast.error("Failed to load details");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAppraisal) return;
        setSubmitting(true);
        try {
            await performanceManagementService.updateAnnualAppraisal(selectedAppraisal.id, {
                selfAppraisal: { ...selectedAppraisal.selfAppraisal, comments },
                status: selectedAppraisal.status === "PENDING" ? "SUBMITTED" : selectedAppraisal.status,
            });
            toast.success("Self-appraisal submitted successfully!");
            fetchAppraisals();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusConfig = (status) => {
        const map = {
            APPROVED: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} /> },
            SUBMITTED: { label: "Under Review", cls: "bg-blue-50 text-blue-700 border-blue-200", icon: <Clock size={14} /> },
            REVIEWED: { label: "Manager Reviewed", cls: "bg-violet-50 text-violet-700 border-violet-200", icon: <ShieldCheck size={14} /> },
            PENDING: { label: "Action Required", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: <AlertCircle size={14} /> },
        };
        return map[status] || map.PENDING;
    };

    const quarterColors = {
        Q1: { bg: "bg-primary-50", border: "border-primary-200", text: "text-primary-700", badge: "bg-primary-100 text-primary-700 border-primary-200" },
        Q2: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", badge: "bg-violet-100 text-violet-700 border-violet-200" },
        Q3: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700 border-amber-200" },
        Q4: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    };

    // ── Loading ──────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="animate-spin text-primary-600 mb-3" size={40} />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading your appraisal...</p>
        </div>
    );

    // ── Empty ────────────────────────────────────────────────
    if (appraisals.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-5 mx-auto">
                <Trophy size={40} className="text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Annual Cycle Detected</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mt-2">
                Your annual performance cycle hasn't been initiated yet. Please check back later or contact HR.
            </p>
        </div>
    );

    const statusCfg = getStatusConfig(selectedAppraisal?.status);
    const completedQuarters = selectedAppraisal?.quarterlyReviews?.length || 0;

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">

            {/* ── Page Header Card ─────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">
                            Performance Management
                        </p>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Annual Performance Review
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Cycle: {selectedAppraisal?.appraisalCycle?.name || "Current Cycle"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusCfg.cls}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                        </span>
                        {/* Download letter if available */}
                        {selectedAppraisal?.letterUrl && (
                            <a
                                href={selectedAppraisal.letterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                <Download size={16} /> Appraisal Letter
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ───────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Quarters Completed", value: `${completedQuarters} / 4`, icon: <Calendar size={18} />, color: "text-primary-600", bg: "bg-primary-50 dark:bg-primary-900/20" },
                    { label: "Final Rating", value: selectedAppraisal?.finalRating ? `${selectedAppraisal.finalRating} / 5` : "—", icon: <Star size={18} />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                    { label: "Hike Recommendation", value: `${selectedAppraisal?.hikePercentage || 0}%`, icon: <TrendingUp size={18} />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                    { label: "9-Box Position", value: selectedAppraisal?.nineBoxPosition ? getNineBoxLabel(selectedAppraisal.nineBoxPosition.boxRow, selectedAppraisal.nineBoxPosition.boxCol) : "Pending", icon: <BarChart3 size={18} />, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                        <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left: Quarterly + Self-Appraisal ──────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Quarterly Snapshot */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar size={18} className="text-primary-500" />
                                Quarterly Snapshot
                            </h2>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                                Consolidated Data
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {["Q1", "Q2", "Q3", "Q4"].map((q) => {
                                const rev = selectedAppraisal?.quarterlyReviews?.find((r) => r.quarter === q);
                                const qc = quarterColors[q];
                                return (
                                    <div
                                        key={q}
                                        className={`p-5 rounded-xl border transition-all ${rev
                                            ? `bg-white dark:bg-gray-700/50 border-gray-100 dark:border-gray-600 shadow-sm`
                                            : `bg-gray-50 dark:bg-gray-800/50 border-dashed border-gray-200 dark:border-gray-600`
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${rev ? qc.badge : "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"}`}>
                                                {q} Review
                                            </span>
                                            {rev && (
                                                <div className="flex items-center gap-1">
                                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{rev.rating} / 5</span>
                                                </div>
                                            )}
                                        </div>
                                        {rev ? (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                                                    {rev.feedback || rev.achievements || "Performance data recorded for this period."}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                                    Manager Assessment
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="py-4 flex flex-col items-center text-gray-300 dark:text-gray-600">
                                                <Clock size={24} className="mb-1.5" />
                                                <p className="text-xs font-semibold uppercase tracking-wider">Data Awaited</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Self-Appraisal Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MessageSquare size={18} className="text-primary-500" />
                                Year-End Self Reflection
                            </h2>
                            {selectedAppraisal?.status !== "PENDING" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 size={12} /> Submitted
                                </span>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all min-h-[200px] leading-relaxed resize-none"
                                placeholder="Reflect on your achievements, growth, and challenges faced throughout the year..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                readOnly={selectedAppraisal?.status !== "PENDING"}
                            />
                            {selectedAppraisal?.status === "PENDING" && (
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm shadow-sm shadow-primary-500/20 transition-all"
                                    >
                                        {submitting ? (
                                            <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                                        ) : (
                                            <><FileText size={16} /> Submit Assessment</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* ── Right: Outcomes + Summary ─────────────── */}
                <div className="space-y-6">

                    {/* Final Outcomes Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck size={18} className="text-primary-500" />
                            Final Outcomes
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Performance Score</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                                        {selectedAppraisal?.finalRating || "—"}
                                        <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> / 5</span>
                                    </p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                    <Star size={18} className="text-amber-500 fill-amber-500" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Hike Recommendation</p>
                                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                                        {selectedAppraisal?.hikePercentage || "0"}%
                                    </p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <TrendingUp size={18} className="text-primary-600 dark:text-primary-400" />
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">9-Box Matrix Position</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {selectedAppraisal?.nineBoxPosition
                                        ? getNineBoxLabel(selectedAppraisal.nineBoxPosition.boxRow, selectedAppraisal.nineBoxPosition.boxCol)
                                        : "Assessment in Progress"}
                                </p>
                            </div>
                        </div>

                        {/* Low rating PIP notice */}
                        {selectedAppraisal?.finalRating < 3 && selectedAppraisal?.status === "APPROVED" && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-0.5">System Notice</p>
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    Rating is below expectations. PIP workflow has been automatically initiated.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Annual Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Award size={18} className="text-primary-500" />
                            Annual Summary
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-100 transition-colors">
                                <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                                    <Target size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Cycle Contribution</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                        {completedQuarters} / 4 Quarters Captured
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                                <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                    <TrendingUp size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Growth Status</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                                        {selectedAppraisal?.finalRating >= 4
                                            ? "Exceeding Expectations"
                                            : selectedAppraisal?.finalRating
                                                ? "Stable Performance"
                                                : "Pending Verification"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cycle selector (if multiple) */}
                    {appraisals.length > 1 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Past Cycles</h3>
                            <div className="space-y-2">
                                {appraisals.map((a) => (
                                    <button
                                        key={a.id}
                                        onClick={() => loadDetails(a.id)}
                                        className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${selectedAppraisal?.id === a.id
                                            ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300"
                                            : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {a.appraisalCycle?.name || `Cycle #${a.id}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const getNineBoxLabel = (row, col) => {
    if (row === 0 && col === 0) return "Star — High Potential, High Performer";
    if (row === 0 && col === 1) return "Future Leader";
    if (row === 0 && col === 2) return "Rough Diamond";
    if (row === 1 && col === 0) return "High Flyer";
    if (row === 1 && col === 1) return "Core Asset";
    if (row === 1 && col === 2) return "Inconsistent Player";
    if (row === 2 && col === 0) return "Trusted Professional";
    if (row === 2 && col === 1) return "Solid Performer";
    return "Talent Risk — Needs Improvement";
};

export default EmployeeAnnualAppraisalPage;
