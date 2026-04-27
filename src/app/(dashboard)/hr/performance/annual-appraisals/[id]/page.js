"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
    ArrowLeft, Award, Calendar, User, FileText,
    CheckCircle2, Clock, MapPin, Briefcase, Loader2, BarChart3,
    Plus, Trash2, Star, Save, MessageSquare, Target, Settings
} from "lucide-react";

export default function AnnualAppraisalDetailPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const appraisalId = resolvedParams.id;

    const [appraisal, setAppraisal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [metrics, setMetrics] = useState([]);
    const [showAddMetric, setShowAddMetric] = useState(false);
    const [newMetric, setNewMetric] = useState({ name: "", rating: 0, feedback: "" });

    const breadcrumbItems = [
        { label: "HR", href: "/hr" },
        { label: "Performance", href: "/hr/performance" },
        { label: "Annual Appraisals", href: "/hr/performance/annual-appraisals" },
        { label: "Details" },
    ];

    useEffect(() => {
        fetchDetails();
    }, [appraisalId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const data = await performanceManagementService.getAnnualAppraisalDetails(appraisalId);
            setAppraisal(data);
            
            // Parse metrics from managerReview or cycle defaults
            const existingMetrics = data.managerReview?.metrics || data.appraisalCycle?.evaluationParameters || [];
            setMetrics(existingMetrics);
        } catch (error) {
            toast.error("Failed to load appraisal details");
            router.push("/hr/performance/annual-appraisals");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        try {
            setUpdating(true);
            const updateData = { status };
            // Auto-calculate final rating if metrics exist and finalRating is null
            if (metrics.length > 0 && !appraisal.finalRating) {
                const total = metrics.reduce((acc, m) => acc + (parseFloat(m.rating) || 0), 0);
                updateData.finalRating = (total / metrics.length).toFixed(1);
            }
            await performanceManagementService.updateAnnualAppraisal(appraisalId, updateData);
            toast.success(`Appraisal ${status.toLowerCase()} successfully!`);
            setAppraisal((prev) => ({ ...prev, ...updateData }));
        } catch (error) {
            toast.error(error.message || "Failed to update appraisal");
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveMetrics = async () => {
        try {
            setUpdating(true);
            const managerReview = { ...appraisal.managerReview, metrics };
            await performanceManagementService.updateAnnualAppraisal(appraisalId, { managerReview });
            toast.success("Metrics updated successfully!");
            setAppraisal(prev => ({ ...prev, managerReview }));
        } catch (error) {
            toast.error("Failed to save metrics");
        } finally {
            setUpdating(false);
        }
    };

    const addMetric = () => {
        if (!newMetric.name) {
            toast.error("Metric name is required");
            return;
        }
        setMetrics([...metrics, { ...newMetric, id: Date.now() }]);
        setNewMetric({ name: "", rating: 0, feedback: "" });
        setShowAddMetric(false);
    };

    const removeMetric = (id) => {
        setMetrics(metrics.filter(m => m.id !== id));
    };

    const updateMetricRating = (id, rating) => {
        setMetrics(metrics.map(m => m.id === id ? { ...m, rating } : m));
    };

    const updateMetricFeedback = (id, feedback) => {
        setMetrics(metrics.map(m => m.id === id ? { ...m, feedback } : m));
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
            APPROVED: { cls: "bg-success/10 text-success border-success/20", label: "Approved" },
            SUBMITTED: { cls: "bg-primary/10 text-primary border-primary/20", label: "Review Pending" },
            REVIEWED: { cls: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300", label: "Manager Reviewed" },
        };
        const s = map[status] || { cls: "bg-muted text-muted-foreground border-border", label: "Pending" };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
                {s.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading appraisal details...</p>
                </div>
            </div>
        );
    }

    if (!appraisal) return null;

    const emp = appraisal.employee;
    const quarterColors = {
        Q1: "bg-primary/10 text-primary border-primary/20",
        Q2: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300",
        Q3: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
        Q4: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 premium-shadow"
            >
                <div className="flex items-center gap-4">
                    {/* Back */}
                    <button
                        onClick={() => router.push("/hr/performance/annual-appraisals")}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {emp.firstName[0]}{emp.lastName[0]}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-extrabold text-foreground leading-none">
                            {emp.firstName} {emp.lastName}
                        </h1>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {emp.designation?.name || "N/A"}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {emp.department?.name || "N/A"}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-border flex-shrink-0" />

                    {/* Status + actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {getStatusBadge(appraisal.status)}
                        {appraisal.status !== "APPROVED" && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleUpdateStatus("APPROVED")}
                                disabled={updating}
                                className="flex items-center gap-2 px-4 py-2 bg-success hover:bg-success/90 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Approve & Finalize
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toast.success("Appraisal letter generated!")}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-all"
                        >
                            <FileText className="w-4 h-4" />
                            Generate Letter
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Performance Metrics Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="glass-card rounded-2xl p-6 premium-shadow"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" /> Evaluation Metrics & Parameters
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Define and rate specific performance criteria for this employee.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddMetric(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-semibold transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Metric
                        </button>
                        <button
                            onClick={handleSaveMetrics}
                            disabled={updating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" /> Save Evaluation
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {metrics.length === 0 ? (
                        <div className="py-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Target className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold text-muted-foreground">No evaluation metrics added yet</p>
                            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">Start by adding metrics like 'Quality of Work', 'Teamwork', or 'Punctuality'.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {metrics.map((metric) => (
                                <div key={metric.id || metric.name} className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-all group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-foreground">{metric.name}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-3.5 h-3.5 cursor-pointer transition-all ${star <= (metric.rating || 0) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                                                        onClick={() => updateMetricRating(metric.id || metric.name, star)}
                                                    />
                                                ))}
                                                <span className="text-[10px] font-bold text-muted-foreground ml-1">({metric.rating || 0}/5)</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeMetric(metric.id || metric.name)}
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <textarea
                                        value={metric.feedback || ""}
                                        onChange={(e) => updateMetricFeedback(metric.id || metric.name, e.target.value)}
                                        placeholder="Add specific feedback for this metric..."
                                        className="w-full h-16 bg-muted/30 hover:bg-muted/50 focus:bg-background rounded-lg border border-transparent focus:border-primary/20 text-xs p-2.5 outline-none transition-all resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inline Add Metric Form */}
                {showAddMetric && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 p-5 rounded-2xl border-2 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add New Metric
                            </h4>
                            <button onClick={() => setShowAddMetric(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">Metric Name</label>
                                <input
                                    type="text"
                                    value={newMetric.name}
                                    onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                                    placeholder="e.g., Coding Standards, Leadership, Attendance"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 block">Initial Rating</label>
                                <div className="flex items-center gap-2 h-9">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 cursor-pointer transition-all ${star <= newMetric.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground hover:text-amber-400"}`}
                                            onClick={() => setNewMetric({ ...newMetric, rating: star })}
                                        />
                                    ))}
                                    <span className="text-xs font-bold text-muted-foreground ml-2">{newMetric.rating}/5</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                            <button
                                onClick={() => setShowAddMetric(false)}
                                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addMetric}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                Add Metric
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Quarterly Timeline */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6 premium-shadow"
            >
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> Annual Performance Timeline
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Q1", "Q2", "Q3", "Q4"].map((q) => {
                        const review = appraisal.quarterlyReviews?.find((r) => r.quarter === q);
                        return (
                            <div
                                key={q}
                                className={`p-4 rounded-xl border ${review ? "bg-card border-border" : "bg-muted/30 border-dashed border-border"}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${review ? quarterColors[q] : "bg-muted text-muted-foreground border-border"}`}>
                                        {q}
                                    </span>
                                    {review && (
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.submittedAt).getFullYear()}
                                        </span>
                                    )}
                                </div>
                                {review ? (
                                    <>
                                        <p className="text-2xl font-bold text-foreground">
                                            {review.rating}
                                            <span className="text-xs text-muted-foreground font-normal"> / 5</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {review.feedback || review.achievements || "Data recorded for this period."}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Not yet recorded</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Comments + Decisions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appraisal Comments */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass-card rounded-2xl p-6 premium-shadow space-y-3"
                >
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> Appraisal Comments
                    </h3>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Self-Appraisal</p>
                        <p className="text-sm text-foreground">
                            {appraisal.selfAppraisal?.comments || "No self-appraisal comments submitted."}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Manager Review</p>
                        <p className="text-sm text-foreground">
                            {appraisal.managerReview?.comments || "Manager review is pending."}
                        </p>
                    </div>
                </motion.div>

                {/* Decisions & Outcomes */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl p-6 premium-shadow space-y-3"
                >
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" /> Decisions & Outcomes
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground">Matrix Positioning</p>
                            <span className="text-sm font-bold text-foreground">
                                {appraisal.nineBoxPosition
                                    ? getNineBoxLabel(appraisal.nineBoxPosition.boxRow, appraisal.nineBoxPosition.boxCol)
                                    : "Not mapped"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground">Final Annual Rating</p>
                            <span className="text-lg font-bold text-foreground">
                                {appraisal.finalRating || "—"}
                                <span className="text-xs font-normal text-muted-foreground"> / 5.0</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-xs font-semibold text-muted-foreground">Hike Recommendation</p>
                            <span className="text-lg font-bold text-primary">{appraisal.hikePercentage || "0"}%</span>
                        </div>
                    </div>

                    {appraisal.finalRating < 3 && appraisal.status === "APPROVED" && (
                        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                            <p className="text-xs font-semibold text-destructive mb-1">System Notice</p>
                            <p className="text-xs text-destructive/80">
                                Rating is below expectations. PIP workflow has been automatically initiated.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
