"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
    Users, CheckCircle2, AlertCircle, Clock, FileText, ChevronRight,
    Target, Star, MessageSquare, Shield, Calendar
} from "lucide-react";
import { managerProbationService } from "@/services/manager-services/probation-confirmations.service";
import HRMSLoader from "@/components/common/HRMSLoader";
import toast from "react-hot-toast";

// --- Sub-Components (Screens) ---

// Screen 2: Goal Setting
const GoalSettingScreen = ({ probation, onBack, onSubmit }) => {
    const [goals, setGoals] = useState([
        { title: "", description: "", kpiType: "QUANTITATIVE", targetValue: "", weightage: "", dueStage: "DAYS_30" }
    ]);

    const handleAddGoal = () => {
        setGoals([...goals, { title: "", description: "", kpiType: "QUANTITATIVE", targetValue: "", weightage: "", dueStage: "DAYS_30" }]);
    };

    const handleGoalChange = (index, field, value) => {
        const newGoals = [...goals];
        newGoals[index][field] = value;
        setGoals(newGoals);
    };

    const handleSubmit = () => {
        // Basic validation
        if (goals.some(g => !g.title || !g.targetValue)) {
            toast.error("Please fill in all required fields (Title, Target)");
            return;
        }
        onSubmit(goals);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Set 30-Day Goals for {probation.name}</h2>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">Back to List</button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                {goals.map((goal, index) => (
                    <div key={index} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 space-y-3 relative">
                        <div className="absolute right-2 top-2 text-xs text-gray-400">Goal #{index + 1}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Goal Title *</label>
                                <input
                                    type="text"
                                    value={goal.title}
                                    onChange={(e) => handleGoalChange(index, "title", e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm"
                                    placeholder="e.g. Complete Onboarding Training"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">KPI Type</label>
                                <select
                                    value={goal.kpiType}
                                    onChange={(e) => handleGoalChange(index, "kpiType", e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm"
                                >
                                    <option value="QUANTITATIVE">Quantitative</option>
                                    <option value="QUALITATIVE">Qualitative</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Target Value *</label>
                                <input
                                    type="text"
                                    value={goal.targetValue}
                                    onChange={(e) => handleGoalChange(index, "targetValue", e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm"
                                    placeholder="e.g. 100% or 5 Modules"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <input
                                    type="text"
                                    value={goal.description}
                                    onChange={(e) => handleGoalChange(index, "description", e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm"
                                    placeholder="Optional details"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <button onClick={handleAddGoal} className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors">
                    + Add Another Goal
                </button>
            </div>

            <div className="flex justify-end gap-3">
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Submit Goals</button>
            </div>
        </div>
    );
};

// Screen 3: Monthly Review
const ReviewFormScreen = ({ probation, onBack, onSubmit }) => {
    const [formData, setFormData] = useState({
        reviewStage: probation.currentStage,
        performanceRating: "MEETS_EXPECTATIONS",
        potentialRating: "MEDIUM",
        comments: ""
    });

    const handleSubmit = () => {
        if (!formData.comments) {
            toast.error("Please add comments");
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {probation.currentStage?.replace('DAYS_', '')}-Day Review for {probation.name}
                </h2>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">Back to List</button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                {/* Rating Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance Rating</label>
                        <select
                            value={formData.performanceRating}
                            onChange={(e) => setFormData({ ...formData, performanceRating: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm dark:bg-gray-900"
                        >
                            <option value="EXCEEDS_EXPECTATIONS">Exceeds Expectations</option>
                            <option value="MEETS_EXPECTATIONS">Meets Expectations</option>
                            <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
                            <option value="BELOW_EXPECTATIONS">Below Expectations</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Potential Rating</label>
                        <select
                            value={formData.potentialRating}
                            onChange={(e) => setFormData({ ...formData, potentialRating: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm dark:bg-gray-900"
                        >
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manager Comments</label>
                    <textarea
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm dark:bg-gray-900"
                        placeholder="Detailed feedback on performance..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Submit Review</button>
            </div>
        </div>
    );
};

// Screen 4: Final Decision
const FinalDecisionScreen = ({ probation, onBack, onSubmit }) => {
    const [action, setAction] = useState("CONFIRM");
    const [extendWeeks, setExtendWeeks] = useState(4);
    const [notes, setNotes] = useState("");

    const handleSubmit = () => {
        if (!notes) {
            toast.error("Please provide justification notes");
            return;
        }
        onSubmit({ action, extendWeeks: action === 'EXTEND' ? extendWeeks : undefined, notes });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Final Probation Decision: {probation.name}</h2>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">Back to List</button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Eligible for Confirmation?</p>
                    {/* In a real app, this would check the backend flag 'autoConfirmationEligible'. 
               We will assume 'Yes' for demo unless flagged otherwise visually. 
           */}
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        Based on previous reviews (30/60/90 days), this employee is recommended for: <strong>Confirmation</strong>
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Decision Action</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => setAction("CONFIRM")}
                            className={`p-4 rounded-xl border text-left transition-all ${action === 'CONFIRM' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-green-300'}`}
                        >
                            <div className="font-semibold text-green-700">Confirm</div>
                            <div className="text-xs text-green-600 mt-1">Complete probation successfully</div>
                        </button>
                        <button
                            onClick={() => setAction("EXTEND")}
                            className={`p-4 rounded-xl border text-left transition-all ${action === 'EXTEND' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-gray-200 hover:border-amber-300'}`}
                        >
                            <div className="font-semibold text-amber-700">Extend</div>
                            <div className="text-xs text-amber-600 mt-1">Extend probation period</div>
                        </button>
                        <button
                            onClick={() => setAction("TERMINATE")}
                            className={`p-4 rounded-xl border text-left transition-all ${action === 'TERMINATE' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-gray-200 hover:border-red-300'}`}
                        >
                            <div className="font-semibold text-red-700">Terminate</div>
                            <div className="text-xs text-red-600 mt-1">End employment contract</div>
                        </button>
                    </div>
                </div>

                {action === 'EXTEND' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Extension Duration (Weeks)</label>
                        <select
                            value={extendWeeks}
                            onChange={(e) => setExtendWeeks(parseInt(e.target.value))}
                            className="w-full max-w-xs rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm dark:bg-gray-900"
                        >
                            <option value={2}>2 Weeks</option>
                            <option value={4}>4 Weeks (1 Month)</option>
                            <option value={8}>8 Weeks (2 Months)</option>
                            <option value={12}>12 Weeks (3 Months)</option>
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes / Justification *</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm dark:bg-gray-900"
                        placeholder="Reason for this decision..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Submit Decision</button>
            </div>
        </div>
    );
};


// --- Main Page Component ---

export default function ProbationReviewsPage() {
    const [view, setView] = useState("DASHBOARD"); // DASHBOARD, GOAL_SETTING, REVIEW, DECISION
    const [selectedProbation, setSelectedProbation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [probationList, setProbationList] = useState([]);

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await managerProbationService.getList();
            setProbationList(data);
        } catch (error) {
            toast.error("Failed to load probation list");
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (probation, actionType) => {
        setSelectedProbation(probation);
        if (actionType === 'INITIATE_GOALS') setView("GOAL_SETTING");
        else if (actionType === 'REVIEW_DUE' || actionType === 'EXTENSION_REVIEW') setView("REVIEW"); // Using same review form for Extension
        else if (actionType === 'FINAL_DECISION') setView("DECISION");
        else toast("No pending actions for this employee.");
    };

    const handleGoalSubmit = async (goals) => {
        try {
            await managerProbationService.initiateGoals(selectedProbation.probationId, goals);
            toast.success("Goals initiated successfully");
            setView("DASHBOARD");
            fetchList();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit goals");
        }
    };

    const handleReviewSubmit = async (data) => {
        try {
            await managerProbationService.submitReview(selectedProbation.probationId, data);
            toast.success("Review submitted successfully");
            setView("DASHBOARD");
            fetchList();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        }
    };

    const handleDecisionSubmit = async (data) => {
        try {
            await managerProbationService.submitDecision(selectedProbation.probationId, data);
            toast.success("Decision submitted successfully");
            setView("DASHBOARD");
            fetchList();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit decision");
        }
    };

    if (loading && view === 'DASHBOARD') return <HRMSLoader />;

    // Render Screens based on view
    if (view === "GOAL_SETTING") return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <GoalSettingScreen probation={selectedProbation} onBack={() => setView("DASHBOARD")} onSubmit={handleGoalSubmit} />
        </div>
    );
    if (view === "REVIEW") return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <ReviewFormScreen probation={selectedProbation} onBack={() => setView("DASHBOARD")} onSubmit={handleReviewSubmit} />
        </div>
    );
    if (view === "DECISION") return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <FinalDecisionScreen probation={selectedProbation} onBack={() => setView("DASHBOARD")} onSubmit={handleDecisionSubmit} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Breadcrumb items={[{ label: "My Team", href: "/manager/my-team" }, { label: "Probation Reviews", href: "#" }]} />

                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Probation Reviews</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage goals, reviews, and confirmations for your team.</p>
                </div>

                {/* Pending Actions Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['INITIATE_GOALS', 'REVIEW_DUE', 'EXTENSION_REVIEW', 'FINAL_DECISION'].map(action => {
                        const count = probationList.filter(p => p.pendingAction === action).length;
                        const labels = {
                            'INITIATE_GOALS': { title: 'Goal Setting Pending', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            'REVIEW_DUE': { title: 'Reviews Due', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                            'EXTENSION_REVIEW': { title: 'Extension Reviews', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
                            'FINAL_DECISION': { title: 'Final Decisions', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' }
                        }[action];

                        return (
                            <div key={action} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{labels.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${labels.bg}`}>
                                    <labels.icon className={labels.color} size={20} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main List Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Team Probation Status</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">Employee</th>
                                    <th className="px-6 py-3 text-left font-medium">Designation</th>
                                    <th className="px-6 py-3 text-left font-medium">Start Date</th>
                                    <th className="px-6 py-3 text-left font-medium">Current Stage</th>
                                    <th className="px-6 py-3 text-left font-medium">Status</th>
                                    <th className="px-6 py-3 text-left font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {probationList.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No active probation records found.</td></tr>
                                ) : (
                                    probationList.map((probation) => {
                                        const isActionable = probation.pendingAction !== 'NONE';
                                        const actionLabel = {
                                            'INITIATE_GOALS': 'Set Goals',
                                            'REVIEW_DUE': 'Start Review',
                                            'EXTENSION_REVIEW': 'Weekly Review',
                                            'FINAL_DECISION': 'Make Decision',
                                            'NONE': 'View Details'
                                        }[probation.pendingAction];

                                        const btnStyle = isActionable
                                            ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-500/30"
                                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50";

                                        return (
                                            <tr key={probation.probationId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{probation.name}</p>
                                                        <p className="text-xs text-gray-500">{probation.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{probation.designation}</td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                    {new Date(probation.startDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                                        {probation.currentStage?.replace('DAYS_', '')} Days
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${probation.status === 'EXTENDED' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'
                                                        }`}>
                                                        {probation.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleActionClick(probation, probation.pendingAction)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${btnStyle}`}
                                                    >
                                                        {actionLabel}
                                                        {isActionable && <ChevronRight size={14} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
