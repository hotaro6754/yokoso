"use client";
import React, { useState, useEffect } from "react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { managerTeamService } from "@/services/manager-services/team.service";
import { toast } from "react-hot-toast";
import {
    Users, Calendar, CheckCircle, Clock, PlusCircle,
    X, Save, Folder, Search, Filter, Star,
    AlertCircle, Edit, TrendingUp, Loader2
} from "lucide-react";

const ManagerTeamReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterQuarter, setFilterQuarter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [employeeCertificates, setEmployeeCertificates] = useState([]);
    const [editingReview, setEditingReview] = useState(null);

    const [formData, setFormData] = useState({
        employeeId: "",
        appraisalCycleId: "",
        quarter: "Q1",
        rating: "Meets Expectations",
        potentialRating: "Moderate",
        achievements: "",
        areasForImprovement: "",
        feedback: "",
        potentialFeedback: "",
        status: "DRAFT"
    });

    useEffect(() => {
        fetchReviews();
        fetchMetadata();
    }, [filterQuarter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (filterQuarter !== "all") filters.quarter = filterQuarter;
            const data = await performanceManagementService.getQuarterlyReviews(filters);
            setReviews(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const teamData = await managerTeamService.getTeamOverview();
            setTeamMembers(teamData.teamMembers || []);
            const cyclesData = await performanceManagementService.getAppraisalCycles();
            setCycles(cyclesData);
            if (cyclesData.length > 0) {
                setFormData(prev => ({ ...prev, appraisalCycleId: cyclesData[0].id }));
            }
        } catch (error) {
            console.error("Failed to load metadata", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.employeeId || !formData.appraisalCycleId) {
            toast.error("Please select an employee and appraisal cycle");
            return;
        }
        setSubmitting(true);
        try {
            if (editingReview) {
                await performanceManagementService.updateQuarterlyReview(editingReview.id, {
                    ...formData,
                    rating: formData.rating,
                    potentialRating: formData.potentialRating
                });
                toast.success("Review updated successfully!");
            } else {
                await performanceManagementService.createQuarterlyReview({
                    ...formData,
                    employeeId: parseInt(formData.employeeId),
                    appraisalCycleId: parseInt(formData.appraisalCycleId),
                    rating: formData.rating,
                    potentialRating: formData.potentialRating
                });
                toast.success("Review created successfully!");
            }
            setIsModalOpen(false);
            setEditingReview(null);
            setFormData({
                employeeId: "",
                appraisalCycleId: cycles.length > 0 ? cycles[0].id : "",
                quarter: "Q1",
                rating: "Meets Expectations",
                potentialRating: "Moderate",
                achievements: "",
                areasForImprovement: "",
                feedback: "",
                potentialFeedback: "",
                status: "DRAFT"
            });
            fetchReviews();
        } catch (error) {
            toast.error(error.message || "Failed to save review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setFormData({
            employeeId: review.employeeId,
            appraisalCycleId: review.appraisalCycleId,
            quarter: review.quarter,
            rating: review.rating || "Meets Expectations",
            potentialRating: review.potentialRating || "Moderate",
            achievements: review.achievements || "",
            areasForImprovement: review.areasForImprovement || "",
            feedback: review.feedback || "",
            potentialFeedback: review.potentialFeedback || "",
            status: review.status || "DRAFT"
        });
        fetchEmployeeCertificates(review.employeeId, review.quarter);
        setIsModalOpen(true);
    };

    const fetchEmployeeCertificates = async (employeeId, quarter) => {
        try {
            const certs = await performanceManagementService.getCertificates({ employeeId, quarter });
            setEmployeeCertificates(certs);
        } catch (error) {
            console.error("Failed to fetch employee certificates", error);
        }
    };

    const handleNewReviewClick = () => {
        setEditingReview(null);
        setEmployeeCertificates([]);
        setFormData({
            employeeId: "",
            appraisalCycleId: cycles.length > 0 ? cycles[0].id : "",
            quarter: "Q1",
            rating: "Meets Expectations",
            potentialRating: "Moderate",
            achievements: "",
            areasForImprovement: "",
            feedback: "",
            potentialFeedback: "",
            status: "DRAFT"
        });
        setIsModalOpen(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            SUBMITTED: { color: "green", icon: CheckCircle, text: "Submitted" },
            DRAFT: { color: "yellow", icon: Clock, text: "Draft" },
        };
        const config = statusConfig[status] || { color: "gray", icon: Clock, text: status || "Draft" };
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/20 dark:text-${config.color}-300`}>
                <Icon size={12} />
                {config.text}
            </span>
        );
    };

    const getRatingBadge = (rating) => {
        if (!rating) return <span className="text-gray-400 text-sm">Not rated</span>;
        if (rating === "Above Expectations" || rating >= 4) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Excellent ({rating})</span>;
        if (rating === "Meets Expectations" || rating >= 3) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Good ({rating})</span>;
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Needs Focus ({rating})</span>;
    };

    const filteredReviews = reviews.filter(r =>
        searchTerm === "" ||
        `${r.employee.firstName} ${r.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.employee.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: reviews.length,
        submitted: reviews.filter(r => r.status === "SUBMITTED").length,
        draft: reviews.filter(r => r.status === "DRAFT").length,
        q1: reviews.filter(r => r.quarter === "Q1").length,
        q2: reviews.filter(r => r.quarter === "Q2").length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header — matches Team Appraisals */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Team Performance Reviews</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage and submit quarterly appraisals for your direct reports.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Users className="text-primary-600" size={24} />
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {filteredReviews.length}
                                </span>
                            </div>
                            <button
                                onClick={handleNewReviewClick}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                            >
                                <PlusCircle size={16} /> New Review
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards — matches Team Appraisals style */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                            <Star className="text-blue-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                                <p className="text-2xl font-bold text-green-600">{stats.submitted}</p>
                            </div>
                            <CheckCircle className="text-green-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
                            </div>
                            <Clock className="text-yellow-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Q1 Reviews</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.q1}</p>
                            </div>
                            <Calendar className="text-blue-500" size={20} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Q2 Reviews</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.q2}</p>
                            </div>
                            <TrendingUp className="text-gray-400" size={20} />
                        </div>
                    </div>
                </div>

                {/* Filters — matches Team Appraisals */}
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
                                value={filterQuarter}
                                onChange={(e) => setFilterQuarter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Quarters</option>
                                <option value="Q1">Q1 (Jan–Mar)</option>
                                <option value="Q2">Q2 (Apr–Jun)</option>
                                <option value="Q3">Q3 (Jul–Sep)</option>
                                <option value="Q4">Q4 (Oct–Dec)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table — matches Team Appraisals */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100 border-b border-primary-100 dark:border-primary-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Quarter</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={32} className="animate-spin text-primary-400" />
                                                <p className="text-sm">Loading team reviews...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredReviews.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={48} className="text-gray-300 dark:text-gray-600" />
                                                <p className="text-lg font-medium">No reviews found</p>
                                                <p className="text-sm">
                                                    {searchTerm || filterQuarter !== "all"
                                                        ? "Try adjusting your filters"
                                                        : "Start a new review to see it here"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {/* Employee */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {review.employee.firstName} {review.employee.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {review.employee.designation?.name}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    {review.employee.email}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Quarter */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{review.quarter}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{review?.appraisalCycle?.name}</div>
                                        </td>
                                        {/* Rating */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRatingBadge(review.rating)}
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(review.status)}
                                        </td>
                                        {/* Date */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {new Date(review.submittedAt || review.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric", month: "short", day: "numeric"
                                                })}
                                            </div>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(review)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingReview ? "Edit Performance Review" : "New Performance Review"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Member</label>
                                    <select
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleInputChange}
                                        disabled={!!editingReview}
                                        required
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none disabled:opacity-60"
                                    >
                                        <option value="">Select Employee</option>
                                        {teamMembers.map(emp => (
                                            <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Appraisal Cycle</label>
                                    <select
                                        name="appraisalCycleId"
                                        value={formData.appraisalCycleId}
                                        onChange={handleInputChange}
                                        disabled={!!editingReview}
                                        required
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none disabled:opacity-60"
                                    >
                                        <option value="">Select Cycle</option>
                                        {cycles.map(cycle => (
                                            <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quarter</label>
                                    <select
                                        name="quarter"
                                        value={formData.quarter}
                                        onChange={handleInputChange}
                                        disabled={!!editingReview}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none disabled:opacity-60"
                                    >
                                        <option value="Q1">Q1 (Jan–Mar)</option>
                                        <option value="Q2">Q2 (Apr–Jun)</option>
                                        <option value="Q3">Q3 (Jul–Sep)</option>
                                        <option value="Q4">Q4 (Oct–Dec)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance Rating</label>
                                    <select
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none"
                                    >
                                        <option value="Below Expectations">Below Expectations</option>
                                        <option value="Meets Expectations">Meets Expectations</option>
                                        <option value="Above Expectations">Above Expectations</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Potential Rating</label>
                                    <select
                                        name="potentialRating"
                                        value={formData.potentialRating}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance Feedback</label>
                                <textarea
                                    name="feedback"
                                    value={formData.feedback}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    placeholder="Manager's performance feedback..."
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Potential Feedback</label>
                                <textarea
                                    name="potentialFeedback"
                                    value={formData.potentialFeedback}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Manager's feedback on potential and growth..."
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Achievements</label>
                                    <textarea
                                        name="achievements"
                                        value={formData.achievements}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Key accomplishments this quarter..."
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none resize-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Areas for Improvement</label>
                                    <textarea
                                        name="areasForImprovement"
                                        value={formData.areasForImprovement}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Skills or behaviors to develop..."
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Certificates */}
                            {employeeCertificates.length > 0 && (
                                <div className="space-y-3 bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-800">
                                    <h4 className="text-sm font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-2">
                                        <Folder size={16} /> Training Certificates
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {employeeCertificates.map(cert => (
                                            <div key={cert.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-primary-100 dark:border-primary-800 flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cert.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(cert.completionDate).toLocaleDateString()}</p>
                                                </div>
                                                <a href={cert.certificateUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800 dark:text-primary-400">
                                                    <Folder size={14} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                                >
                                    {submitting
                                        ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                        : <><Save size={16} /> Save & Submit</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerTeamReviewsPage;
