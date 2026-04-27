"use client";
import React, { useState, useEffect } from "react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";
import {
    Award,
    MessageSquare,
    TrendingUp,
    Star,
    Calendar,
    Layers,
    Upload,
    FileCheck,
    X,
    FolderOpen,
    Users,
    Loader2,
    CheckCircle2,
    ExternalLink,
    Activity,
    Target
} from "lucide-react";

const EmployeeMyReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [certificates, setCertificates] = useState([]);
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [certForm, setCertForm] = useState({
        title: "",
        issuer: "",
        completionDate: "",
        quarter: "Q1",
        year: new Date().getFullYear(),
        certificateUrl: "",
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMyReviews();
        fetchCertificates();
    }, []);

    const fetchMyReviews = async () => {
        setLoading(true);
        try {
            const data = await performanceManagementService.getQuarterlyReviews();
            setReviews(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCertificates = async () => {
        try {
            const data = await performanceManagementService.getCertificates();
            setCertificates(data);
        } catch (error) {
            console.error("Failed to load certificates", error);
        }
    };

    const handleCertSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            await performanceManagementService.uploadCertificate(certForm);
            toast.success("Certificate uploaded and added to your profile!");
            setIsCertModalOpen(false);
            setCertForm({ title: "", issuer: "", completionDate: "", quarter: "Q1", year: new Date().getFullYear(), certificateUrl: "" });
            fetchCertificates();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const getNumericRating = (rating) => {
        if (typeof rating === 'number') return rating;
        if (rating === "Above Expectations") return 5;
        if (rating === "Meets Expectations") return 3;
        if (rating === "Below Expectations") return 1;
        return 0;
    };

    const getRatingConfig = (rating) => {
        if (rating === "Above Expectations" || rating >= 4.0) return { label: "Outstanding", color: "text-violet-700", bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-200 dark:border-violet-800" };
        if (rating === "Meets Expectations" || rating >= 3.0) return { label: "Meets Expectations", color: "text-amber-700", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" };
        if (rating === "Below Expectations" || rating < 3.0) return { label: "Needs Improvement", color: "text-red-700", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800" };
        return { label: "Not Rated", color: "text-gray-700", bg: "bg-gray-50 dark:bg-gray-900/20", border: "border-gray-200 dark:border-gray-800" };
    };

    const getRatingStars = (rating) => {
        const numRating = getNumericRating(rating);
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(numRating) ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">

            {/* ── Page Header ──────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">
                            Performance Management
                        </p>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Performance Journey
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Quarterly reviews, achievements &amp; certifications
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCertModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-primary-500/20 transition-all flex-shrink-0"
                    >
                        <Upload size={16} />
                        Upload Certificate
                    </button>
                </div>
            </div>

            {/* ── Quick Stats ───────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Reviews", value: reviews.length, icon: <Activity size={18} />, color: "text-primary-600", bg: "bg-primary-50 dark:bg-primary-900/20" },
                    { label: "Certifications", value: certificates.length, icon: <Award size={18} />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                    {
                        label: "Avg. Rating",
                        value: reviews.length
                            ? (reviews.reduce((s, r) => s + getNumericRating(r.rating), 0) / reviews.length).toFixed(1) + " / 5"
                            : "—",
                        icon: <Star size={18} />, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20"
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                        <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Reviews List ──────────────────────────────── */}
            <div className="space-y-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary-500" />
                    Quarterly Reviews
                </h2>

                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-16 flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-primary-600" size={32} />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your performance record...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600 p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                            <Layers size={32} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">No Reviews Published Yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            Once your manager submits a quarterly review, it will appear here with detailed feedback and ratings.
                        </p>
                    </div>
                ) : (
                    reviews.map((review) => {
                        const ratingCfg = getRatingConfig(review.rating);
                        return (
                            <div
                                key={review.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                            >
                                {/* Card Header */}
                                <div className="flex flex-col sm:flex-row">

                                    {/* Rating Panel */}
                                    <div className={`sm:w-44 p-6 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 ${ratingCfg.bg}`}>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Overall Rating
                                        </p>
                                        <p className={`text-2xl font-black ${ratingCfg.color} leading-tight mb-2 px-2`}>
                                            {typeof review.rating === 'number' ? review.rating : (review.rating?.split(' ')[0] || review.rating)}
                                        </p>
                                        {getRatingStars(review.rating)}
                                        <span className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${ratingCfg.bg} ${ratingCfg.color} ${ratingCfg.border}`}>
                                            {ratingCfg.label}
                                        </span>
                                    </div>

                                    {/* Content Panel */}
                                    <div className="flex-1 p-6">
                                        {/* Title row */}
                                        <div className="flex items-start justify-between mb-4 gap-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {review.quarter} Review
                                                    <span className="text-gray-400 dark:text-gray-500 font-normal text-base ml-2">
                                                        / {review.appraisalCycle?.name}
                                                    </span>
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Users size={13} className="text-primary-500" />
                                                        {review.manager?.firstName} {review.manager?.lastName}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-primary-500" />
                                                        {new Date(review.submittedAt || review.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-semibold border border-primary-100 dark:border-primary-800">
                                                <CheckCircle2 size={12} />
                                                Official Record
                                            </span>
                                        </div>

                                        {/* Achievements + Growth */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                                                <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                                                    <Award size={14} />
                                                    Top Achievements
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {review.achievements || "No achievements recorded."}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800">
                                                <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400 font-semibold text-xs uppercase tracking-wider">
                                                    <TrendingUp size={14} />
                                                    Growth Areas
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {review.areasForImprovement || "No specific areas for improvement recorded."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Manager Feedback */}
                                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 relative">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                                                <MessageSquare size={12} />
                                                Manager Feedback
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                                                "{review.feedback}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Training & Certifications ─────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award size={18} className="text-primary-500" />
                        Training &amp; Certifications
                    </h2>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        {certificates.length} record{certificates.length !== 1 ? "s" : ""} found
                    </span>
                </div>

                {certificates.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600 p-10 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                            No certificates uploaded yet. Use the button above to add your professional achievements.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {certificates.map((cert) => (
                            <div
                                key={cert.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all"
                            >
                                <div className="mb-4">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                                        <Award size={18} />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">
                                        {cert.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                                        {cert.issuer}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <Calendar size={12} className="text-primary-500" />
                                        <span>{new Date(cert.completionDate).toLocaleDateString("en-GB").replace(/\//g, "-")}</span>
                                        <span className="text-gray-300 dark:text-gray-600">|</span>
                                        <span className="font-bold">{cert.quarter} {cert.year}</span>
                                    </div>
                                </div>
                                <a
                                    href={cert.certificateUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-700 text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 rounded-xl text-xs font-semibold transition-all"
                                >
                                    <ExternalLink size={14} />
                                    View Certificate
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Upload Certificate Modal ──────────────────── */}
            {isCertModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Upload size={18} className="text-primary-500" />
                                Add Achievement
                            </h2>
                            <button
                                onClick={() => setIsCertModalOpen(false)}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCertSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                    Certification Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. AWS Certified Developer"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    value={certForm.title}
                                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                    Issuing Authority
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Amazon Web Services"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    value={certForm.issuer}
                                    onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                        Completion Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        value={certForm.completionDate}
                                        onChange={(e) => setCertForm({ ...certForm, completionDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                        Quarter
                                    </label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                        value={certForm.quarter}
                                        onChange={(e) => setCertForm({ ...certForm, quarter: e.target.value })}
                                    >
                                        <option value="Q1">Q1</option>
                                        <option value="Q2">Q2</option>
                                        <option value="Q3">Q3</option>
                                        <option value="Q4">Q4</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                    Certificate Link / URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="Paste your badge or certificate link here"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                                    value={certForm.certificateUrl}
                                    onChange={(e) => setCertForm({ ...certForm, certificateUrl: e.target.value })}
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCertModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm shadow-sm shadow-primary-500/20 transition-all"
                                >
                                    {uploading ? (
                                        <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                                    ) : (
                                        <><FileCheck size={16} /> Save Achievement</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeMyReviewsPage;
