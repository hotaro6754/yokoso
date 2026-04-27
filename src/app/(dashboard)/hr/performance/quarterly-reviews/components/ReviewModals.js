"use client";
import React, { useState } from "react";
import { 
    X, 
    User, 
    Calendar, 
    Star, 
    Target, 
    MessageSquare, 
    TrendingUp, 
    AlertCircle, 
    Plus, 
    Trash2,
    CheckCircle2,
    Award,
    Lightbulb
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-toastify";

export const ReviewDetailsModal = ({ isOpen, onClose, review }) => {
    if (!isOpen || !review) return null;

    const getRatingColor = (rating) => {
        if (rating === "Above Expectations" || rating >= 4.5) return "bg-emerald-500 text-white";
        if (rating === "Meets Expectations" || rating >= 3) return "bg-blue-500 text-white";
        if (rating === "Below Expectations" || rating >= 2.5) return "bg-orange-500 text-white";
        return "bg-rose-500 text-white";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-md">
                            {review.employee.firstName[0]}{review.employee.lastName[0]}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{review.employee.firstName} {review.employee.lastName}</h2>
                            <p className="text-blue-100 flex items-center gap-1.5 opacity-90">
                                {review.employee.designation?.name || 'Employee'} • {review.quarter} {review.appraisalCycle.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Ratings Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Star size={14} className="text-amber-500" /> Performance Rating
                            </p>
                            <span className={`px-4 py-1 rounded-full text-sm font-bold shadow-lg ${getRatingColor(review.rating)}`}>
                                {review.rating || 'N/A'}
                            </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <TrendingUp size={14} className="text-indigo-500" /> Potential Rating
                            </p>
                            <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-bold">
                                {review.potentialRating || 'Not Assessed'}
                            </span>
                        </div>
                    </div>

                    {/* Main Sections */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Award className="text-blue-500" size={18} /> Major Achievements
                            </h3>
                            <div className="bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                                "{review.achievements || 'No specific achievements recorded for this period.'}"
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Lightbulb className="text-amber-500" size={18} /> Areas for Improvement
                            </h3>
                            <div className="bg-amber-50/30 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/30 text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                                "{review.areasForImprovement || 'No specific areas for improvement identified.'}"
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MessageSquare className="text-purple-500" size={18} /> Manager Feedback
                            </h3>
                            <div className="bg-purple-50/30 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-900/30 text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                                "{review.feedback || 'General positive feedback provided during the sync.'}"
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition-all text-sm"
                    >
                        Close
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all text-sm flex items-center gap-2"
                    >
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export const RaisePIPModal = ({ isOpen, onClose, review, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
        goals: [{ description: '', targetDate: '' }]
    });

    if (!isOpen || !review) return null;

    const handleAddGoal = () => {
        setFormData({ ...formData, goals: [...formData.goals, { description: '', targetDate: '' }] });
    };

    const handleRemoveGoal = (index) => {
        const newGoals = formData.goals.filter((_, i) => i !== index);
        setFormData({ ...formData, goals: newGoals });
    };

    const handleGoalChange = (index, field, value) => {
        const newGoals = [...formData.goals];
        newGoals[index][field] = value;
        setFormData({ ...formData, goals: newGoals });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const pipData = {
                employeeId: review.employeeId,
                managerId: review.managerId,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                reason: formData.reason,
                goals: formData.goals,
                companyId: review.companyId
            };

            await performanceManagementService.createPIP(pipData);
            toast.success("PIP initiated successfully for " + review.employee.firstName);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Initiate Improvement Plan</h2>
                                <p className="text-sm text-gray-500">For {review.employee.firstName} {review.employee.lastName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {/* Period Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <Calendar size={14} /> Start Date
                            </label>
                            <input 
                                type="date" 
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <Calendar size={14} /> End Date
                            </label>
                            <input 
                                type="date" 
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all" 
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                            <MessageSquare size={14} /> Reason for PIP
                        </label>
                        <textarea 
                            required
                            placeholder="Explain why this improvement plan is being initiated..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-sm"
                        />
                    </div>

                    {/* Goals Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <Target size={14} /> Improvement Goals
                            </label>
                            <button 
                                type="button"
                                onClick={handleAddGoal}
                                className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-black transition-all"
                            >
                                <Plus size={14} /> Add Goal
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {formData.goals.map((goal, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 group relative">
                                    <div className="flex gap-3">
                                        <div className="flex-1 space-y-1.5">
                                            <input 
                                                required
                                                placeholder="Goal Description"
                                                value={goal.description}
                                                onChange={(e) => handleGoalChange(idx, 'description', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/10"
                                            />
                                        </div>
                                        <div className="w-40 space-y-1.5">
                                            <input 
                                                type="date"
                                                required
                                                value={goal.targetDate}
                                                onChange={(e) => handleGoalChange(idx, 'targetDate', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/10"
                                            />
                                        </div>
                                        {formData.goals.length > 1 && (
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveGoal(idx)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl font-bold bg-rose-600 text-white shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <CheckCircle2 size={18} />
                                Initiate Plan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AddFeedbackModal = ({ isOpen, onClose, review, onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        rating: "",
        achievements: "",
        areasForImprovement: "",
        feedback: "",
        potentialRating: "",
        potentialFeedback: "",
    });

    React.useEffect(() => {
        if (review) {
            setFormData({
                rating: review.rating || "",
                achievements: review.achievements || "",
                areasForImprovement: review.areasForImprovement || "",
                feedback: review.feedback || "",
                potentialRating: review.potentialRating || "",
                potentialFeedback: review.potentialFeedback || "",
            });
        }
    }, [review]);

    if (!isOpen || !review) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ ...formData, status: 'SUBMITTED' });
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const ratingOptions = [
        "Above Expectations",
        "Meets Expectations",
        "Below Expectations",
        "Needs Improvement",
        "Exceptional",
        "Unsatisfactory"
    ];

    const potentialOptions = [
        "High Potential",
        "Moderate Potential",
        "Low Potential",
        "Core Professional",
        "High Flyer"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-brand-600 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Add Review Feedback</h2>
                                <p className="text-sm text-brand-100">For {review.employee.firstName} {review.employee.lastName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                </div>

                {/* Form Content */}
                <form id="feedback-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <Star size={14} className="text-amber-500" /> Performance Rating
                            </label>
                            <select 
                                required
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                            >
                                <option value="">Select Rating</option>
                                {ratingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <TrendingUp size={14} className="text-indigo-500" /> Potential Rating
                            </label>
                            <select 
                                value={formData.potentialRating}
                                onChange={(e) => setFormData({ ...formData, potentialRating: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                            >
                                <option value="">Select Potential</option>
                                {potentialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                            <Award size={14} className="text-blue-500" /> Achievements
                        </label>
                        <textarea 
                            placeholder="List key achievements during this period..."
                            value={formData.achievements}
                            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                            <Target size={14} className="text-rose-500" /> Areas for Improvement
                        </label>
                        <textarea 
                            placeholder="Identify areas where the employee can grow..."
                            value={formData.areasForImprovement}
                            onChange={(e) => setFormData({ ...formData, areasForImprovement: e.target.value })}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-brand-500" /> Overall Feedback
                        </label>
                        <textarea 
                            required
                            placeholder="Provide comprehensive performance feedback..."
                            value={formData.feedback}
                            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                            rows={4}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-indigo-500" /> Potential Feedback
                        </label>
                        <textarea 
                            placeholder="Notes on employee's growth potential..."
                            value={formData.potentialFeedback}
                            onChange={(e) => setFormData({ ...formData, potentialFeedback: e.target.value })}
                            rows={2}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                        />
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        form="feedback-form"
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl font-bold bg-brand-600 text-white shadow-lg shadow-brand-200 hover:shadow-brand-300 transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : (
                            <>
                                <CheckCircle2 size={18} />
                                Submit Feedback
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
