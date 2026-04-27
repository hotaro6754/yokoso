"use client";
import React, { useState, useEffect } from "react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";
import {
    Users, Search, ChevronRight, Award, MessageSquare,
    Star, UserCheck, Clock, Loader2, X, TrendingUp,
    CheckCircle, AlertCircle, Filter, Briefcase
} from "lucide-react";

const ManagerAnnualAppraisalsPage = () => {
    const [appraisals, setAppraisals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedAppraisal, setSelectedAppraisal] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        managerComments: "",
        finalRating: 3.0,
        hikePercentage: 0,
        status: "REVIEWED"
    });

    useEffect(() => {
        fetchTeamAppraisals();
    }, []);

    const fetchTeamAppraisals = async () => {
        setLoading(true);
        try {
            const data = await performanceManagementService.getAnnualAppraisals();
            setAppraisals(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewClick = async (appraisal) => {
        try {
            const details = await performanceManagementService.getAnnualAppraisalDetails(appraisal.id);
            setSelectedAppraisal(details);
            setFormData({
                managerComments: details.managerReview?.comments || "",
                finalRating: details.finalRating || 3.0,
                hikePercentage: details.hikePercentage || 0,
                status: "REVIEWED"
            });
            setIsReviewModalOpen(true);
        } catch (error) {
            toast.error("Failed to load details");
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await performanceManagementService.updateAnnualAppraisal(selectedAppraisal.id, {
                managerReview: { ...selectedAppraisal.managerReview, comments: formData.managerComments },
                finalRating: formData.finalRating,
                hikePercentage: formData.hikePercentage,
                status: formData.status
            });
            toast.success("Annual review submitted successfully!");
            setIsReviewModalOpen(false);
            fetchTeamAppraisals();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            SUBMITTED: { color: "yellow", icon: Clock, text: "Pending Review" },
            REVIEWED: { color: "green", icon: CheckCircle, text: "Reviewed" },
            APPROVED: { color: "green", icon: CheckCircle, text: "Approved" },
        };
        const config = statusConfig[status] || { color: "gray", icon: Clock, text: "Pending" };
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/20 dark:text-${config.color}-300`}>
                <Icon size={12} />
                {config.text}
            </span>
        );
    };

    const filteredAppraisals = appraisals.filter(a => {
        const nameMatch = searchTerm === "" ||
            `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.employee.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === "all" || a.status === statusFilter;
        return nameMatch && statusMatch;
    });

    const stats = {
        total: appraisals.length,
        pending: appraisals.filter(a => a.status === "SUBMITTED").length,
        reviewed: appraisals.filter(a => a.status === "REVIEWED").length,
        approved: appraisals.filter(a => a.status === "APPROVED").length,
        other: appraisals.filter(a => !["SUBMITTED", "REVIEWED", "APPROVED"].includes(a.status)).length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header — matches Team Appraisals exactly */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Annual Team Reviews</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Finalize annual assessments and compensation recommendations for your team.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="text-primary-600" size={24} />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {filteredAppraisals.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards — matches Team Appraisals style */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Team</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                            <Users className="text-blue-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="text-yellow-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Reviewed</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
                            </div>
                            <TrendingUp className="text-blue-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <CheckCircle className="text-green-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting Submit</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.other}</p>
                            </div>
                            <AlertCircle className="text-gray-400" size={20} />
                        </div>
                    </div>
                </div>

                {/* Filters — matches Team Appraisals style */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="text-gray-400" size={20} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Status</option>
                                <option value="SUBMITTED">Pending Review</option>
                                <option value="REVIEWED">Reviewed</option>
                                <option value="APPROVED">Approved</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table — matches Team Appraisals style */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100 border-b border-primary-100 dark:border-primary-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Quarterly Progress</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Self-Appraisal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Final Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={32} className="animate-spin text-primary-400" />
                                                <p className="text-sm">Loading team appraisals...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAppraisals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={48} className="text-gray-300 dark:text-gray-600" />
                                                <p className="text-lg font-medium">No annual appraisals found</p>
                                                <p className="text-sm">
                                                    {searchTerm || statusFilter !== "all"
                                                        ? "Try adjusting your filters"
                                                        : "No active annual cycles for your team yet"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAppraisals.map((appraisal) => (
                                    <tr key={appraisal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {/* Employee */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {appraisal.employee.firstName} {appraisal.employee.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {appraisal.employee.designation?.name}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    {appraisal.employee.email}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Department */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {appraisal.employee.department?.name || "N/A"}
                                            </div>
                                        </td>
                                        {/* Quarterly Progress */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {["Q1", "Q2", "Q3", "Q4"].map(q => {
                                                    const rev = appraisal.quarterlyReviews?.find(r => r.quarter === q);
                                                    return (
                                                        <div key={q} className="flex flex-col items-center gap-0.5">
                                                            <div className={`w-6 h-1.5 rounded-full ${rev ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"}`} title={`${q}: ${rev ? "Completed" : "Pending"}`} />
                                                            <span className="text-[9px] font-medium text-gray-400">{q}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        {/* Self-Appraisal */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {appraisal.selfAppraisal
                                                ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400"><CheckCircle size={12} /> Submitted</span>
                                                : <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400"><Clock size={12} /> Pending</span>
                                            }
                                        </td>
                                        {/* Final Rating */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {appraisal.finalRating
                                                ? <span className="text-sm font-medium text-gray-900 dark:text-white">{appraisal.finalRating} <span className="text-xs text-gray-400">/ 5</span></span>
                                                : <span className="text-gray-400 text-sm">—</span>
                                            }
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(appraisal.status)}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleReviewClick(appraisal)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <ChevronRight size={14} />
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && selectedAppraisal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setIsReviewModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                                    {selectedAppraisal.employee.firstName[0]}{selectedAppraisal.employee.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {selectedAppraisal.employee.firstName} {selectedAppraisal.employee.lastName}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1"><Briefcase size={12} /> {selectedAppraisal.employee.designation?.name}</span>
                                        <span>Cycle: {selectedAppraisal.appraisalCycle?.name}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Quarterly Insights */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Star size={16} className="text-yellow-500" /> Quarterly Aggregated Insights
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {["Q1", "Q2", "Q3", "Q4"].map(q => {
                                        const rev = selectedAppraisal.quarterlyReviews?.find(r => r.quarter === q);
                                        return (
                                            <div key={q} className={`p-4 rounded-xl border ${rev ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" : "bg-gray-50 dark:bg-gray-900 border-dashed border-gray-200 dark:border-gray-700 opacity-60"}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rev ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" : "bg-gray-100 text-gray-500"}`}>{q}</span>
                                                    {rev && <span className="text-sm font-bold text-gray-900 dark:text-white">{rev.rating}<span className="text-xs font-normal text-gray-400">/5</span></span>}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {rev ? (rev.feedback || rev.achievements || "Data recorded.") : "Not yet recorded"}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Comments */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <MessageSquare size={16} className="text-primary-600" /> Manager Review Comments
                                    </h3>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Employee Self-Reflection</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {selectedAppraisal.selfAppraisal?.comments || "Employee has not yet submitted their year-end reflection."}
                                        </p>
                                    </div>
                                    <textarea
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all min-h-[160px] resize-none"
                                        placeholder="Provide holistic annual feedback for this team member..."
                                        value={formData.managerComments}
                                        onChange={(e) => setFormData({ ...formData, managerComments: e.target.value })}
                                    />
                                </div>

                                {/* Decisions */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <TrendingUp size={16} className="text-primary-600" /> Outcome Decisioning
                                    </h3>
                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-4">
                                        {/* Rating Slider */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Final Annual Rating</p>
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {formData.finalRating} <span className="text-xs font-normal text-gray-400">/ 5.0</span>
                                                </span>
                                            </div>
                                            <input
                                                type="range" min="1" max="5" step="0.1"
                                                className="w-full accent-primary-600"
                                                value={formData.finalRating}
                                                onChange={(e) => setFormData({ ...formData, finalRating: parseFloat(e.target.value) })}
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                                <span>1.0 – Poor</span><span>3.0 – Average</span><span>5.0 – Excellent</span>
                                            </div>
                                        </div>

                                        {/* Hike */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Recommended Hike (%)</p>
                                            <input
                                                type="number"
                                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="0.0"
                                                value={formData.hikePercentage}
                                                onChange={(e) => setFormData({ ...formData, hikePercentage: parseFloat(e.target.value) })}
                                            />
                                        </div>

                                        {/* 9-box hint */}
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs flex-shrink-0">9B</div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-900 dark:text-white">High Performer – Future Leader</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Auto-mapped on submission</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        disabled={submitting}
                                        onClick={handleSubmitReview}
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium shadow-sm disabled:opacity-50 transition-colors"
                                    >
                                        {submitting
                                            ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                                            : <><UserCheck size={16} /> Finalize & Submit Review</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerAnnualAppraisalsPage;
