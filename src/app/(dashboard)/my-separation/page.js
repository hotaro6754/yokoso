"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { separationService } from "@/services/hr-services/separation-new.service";
import { toast } from "react-hot-toast";
import {
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    Upload,
    History,
    AlertCircle,
    Loader2,
    HeartHandshake,
    Target,
    Calendar,
    RefreshCw,
    ShieldCheck,
    Eye,
    UserCheck,
    BadgeCheck,
    Download
} from "lucide-react";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function MySeparationPage() {
    const [resignation, setResignation] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        reason: "",
        reasonDetails: "",
        lastWorkingDate: "", // Requested Relieving Date
        appliedDate: new Date().toISOString().split('T')[0],
        actualLwd: "",
        shortfall: 0,
        q_primary: "",
        q_enjoy: "",
        q_suggest: ""
    });
    const [ktUpdate, setKtUpdate] = useState("");
    const [feedback, setFeedback] = useState("");
    const [rating, setRating] = useState(5);

    useEffect(() => {
        fetchResignationStatus();
    }, []);

    // Calculate Actual LWD and Shortfall when component mounts or notice period is available
    useEffect(() => {
        if (user) {
            const rawNotice = user.employee?.noticePeriod ?? 30;
            const parsedNotice = parseInt(rawNotice, 10);
            const noticePeriod = Number.isFinite(parsedNotice) ? Math.max(0, parsedNotice) : 30;
            const applied = new Date();
            const actual = new Date(applied);
            actual.setDate(applied.getDate() + noticePeriod);
            
            setFormData(prev => ({
                ...prev,
                actualLwd: actual.toISOString().split('T')[0]
            }));
        }
    }, [user]);

    // Update shortfall when user selects a date
    useEffect(() => {
        if (formData.lastWorkingDate && formData.actualLwd) {
            const requested = new Date(formData.lastWorkingDate);
            const actual = new Date(formData.actualLwd);
            
            if (requested < actual) {
                const diffTime = Math.abs(actual - requested);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setFormData(prev => ({ ...prev, shortfall: diffDays }));
            } else {
                setFormData(prev => ({ ...prev, shortfall: 0 }));
            }
        }
    }, [formData.lastWorkingDate, formData.actualLwd]);

    const fetchResignationStatus = async () => {
        try {
            setLoading(true);
            const response = await separationService.getDashboard({ employeeId: "my" });
            if (response.success && response.data.length > 0) {
                const latestResignation = response.data[0];
                const isRejected = ["MANAGER_REJECTED", "HR_REJECTED"].includes(latestResignation.status);
                setResignation(latestResignation);
            }
        } catch (error) {
            console.error("Error fetching resignation:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.reasonDetails?.trim()) {
            toast.error("Detailed reason is required");
            return;
        }
        try {
            setSubmitting(true);
            // lastWorkingDate is the Requested Relieving Date
            // Combine questions into reasonDetails
            const combinedDetails = `
Primary Reason: ${formData.q_primary}
What I enjoyed: ${formData.q_enjoy}
Suggestions: ${formData.q_suggest}
Additional Notes: ${formData.reasonDetails}
            `.trim();

            const response = await separationService.submitResignation({
                ...formData,
                reasonDetails: combinedDetails
            });
            if (response.success) {
                toast.success("Resignation submitted successfully!");
                setResignation(response.data);
            }
        } catch (error) {
            toast.error(error.message || "Failed to submit resignation");
        } finally {
            setSubmitting(false);
        }
    };

    const handleKtUpdate = async () => {
        if (!ktUpdate.trim()) return;
        try {
            await separationService.updateKtProgress(resignation.id, { text: ktUpdate });
            toast.success("KT Update submitted!");
            setKtUpdate("");
            fetchResignationStatus();
        } catch (error) {
            toast.error("Failed to submit update");
        }
    };

    const handleFeedbackSubmit = async () => {
        if (!feedback.trim()) return;
        try {
            setSubmitting(true);
            await separationService.submitExitFeedback(resignation.id, {
                rating,
                comments: feedback,
                reason: resignation.reason,
                recommend: true
            });
            toast.success("Thank you for your feedback!");
            fetchResignationStatus();
        } catch (error) {
            toast.error(error.message || "Failed to submit feedback");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcknowledgeKt = async () => {
        try {
            setSubmitting(true);
            await separationService.acknowledgeKTPlan(resignation.id);
            toast.success("KT Plan acknowledged!");
            fetchResignationStatus();
        } catch (error) {
            toast.error(error.message || "Failed to acknowledge");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12 text-brand-500"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="w-full mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Separation Management</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your resignation and exit process.</p>
            </div>

            {!resignation ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-brand-600 dark:text-brand-400">
                        <Send className="w-5 h-5" />
                        Submit Resignation
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resignation Applied Date</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full p-2.5 rounded-lg border bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed"
                                    value={formData.appliedDate}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Actual Last Working Date</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full p-2.5 rounded-lg border bg-blue-50 dark:bg-blue-900/10 text-blue-600 font-medium cursor-not-allowed"
                                    value={formData.actualLwd}
                                />
                                <p className="text-[10px] text-gray-400 italic">Based on {user?.employee?.noticePeriod ?? 30} days notice period</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 underline decoration-brand-300">Requested Relieving Date</label>
                                <DatePickerField
                                    id="lastWorkingDate"
                                    name="lastWorkingDate"
                                    required
                                    value={formData.lastWorkingDate}
                                    onChange={(val) => setFormData({ ...formData, lastWorkingDate: val })}
                                    placeholder="Select your LWD"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reason for Resignation</label>
                                <select
                                    required
                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-700 focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                >
                                    <option value="">Select Reason</option>
                                    <option value="Better Opportunity">Better Opportunity</option>
                                    <option value="Personal Reasons">Personal Reasons</option>
                                    <option value="Higher Studies">Higher Studies</option>
                                    <option value="Career Change">Career Change</option>
                                    <option value="Relocation">Relocation</option>
                                    <option value="Health Issues">Health Issues</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notice Period Shortfall (Days)</label>
                                <div className={`p-2.5 rounded-lg border flex items-center gap-2 font-bold ${formData.shortfall > 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}>
                                    {formData.shortfall > 0 ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                    {formData.shortfall} Days
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Detailed Feedback</label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500">What is the primary factor for your decision? <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        className="w-full p-2.5 rounded-lg border dark:bg-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        placeholder="e.g. Higher compensation, closer to home"
                                        value={formData.q_primary}
                                        onChange={(e) => setFormData({ ...formData, q_primary: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500">What did you enjoy most during your tenure?</label>
                                    <input
                                        className="w-full p-2.5 rounded-lg border dark:bg-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        placeholder="e.g. Work culture, Supportive team"
                                        value={formData.q_enjoy}
                                        onChange={(e) => setFormData({ ...formData, q_enjoy: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500">Do you have any suggestions for the company?</label>
                                <textarea
                                    rows={2}
                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Your feedback helps us improve..."
                                    value={formData.q_suggest}
                                    onChange={(e) => setFormData({ ...formData, q_suggest: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500">Other Comments</label>
                                <textarea
                                    rows={2}
                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Anything else you'd like to share..."
                                    value={formData.reasonDetails}
                                    onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex gap-3 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">
                                Note: Once submitted, your manager and HR will be notified. You can withdraw your resignation before manager approval.
                            </p>
                        </div>
                        <button
                            disabled={submitting}
                            type="submit"
                            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-brand-200 dark:shadow-none active:scale-[0.98]"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    Submitting Request...
                                </span>
                            ) : "Submit Resignation Request"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Status Tracker */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                        <div className="flex justify-between items-center max-w-2xl mx-auto relative px-10">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0"></div>

                            {[
                                { step: 'SUBMITTED', label: 'Submitted', done: true },
                                { step: 'MANAGER', label: 'Manager Review', active: resignation.status === 'PENDING', done: ['MANAGER_APPROVED', 'HR_APPROVED'].includes(resignation.status) },
                                { step: 'KT', label: 'KT Plan', active: resignation.status === 'MANAGER_APPROVED' && resignation.ktStatus !== 'ACKNOWLEDGED', done: resignation.ktStatus === 'ACKNOWLEDGED' || resignation.status === 'HR_APPROVED' },
                                { step: 'HR', label: 'HR Final', active: resignation.status === 'MANAGER_APPROVED' && resignation.ktStatus === 'ACKNOWLEDGED', done: resignation.status === 'HR_APPROVED' },
                                { step: 'EXIT', label: 'Exit Process', active: resignation.status === 'HR_APPROVED' }
                            ].map((step, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${step.done ? "bg-green-500 border-green-200 text-white shadow-lg shadow-green-100 dark:shadow-none" :
                                        step.active ? "bg-brand-500 border-brand-100 text-white animate-pulse" :
                                            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400"
                                        }`}>
                                        {step.done ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Card for KT Acknowledgment */}
                    {resignation.status === 'MANAGER_APPROVED' && resignation.ktStatus !== 'ACKNOWLEDGED' && (
                        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl p-8 text-white shadow-xl animate-in fade-in zoom-in duration-500">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                    <FileText className="w-12 h-12" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-bold mb-2">KT Plan Approved - Action Required</h3>
                                    <p className="opacity-90 mb-6">Your manager has approved your resignation and uploaded the KT (Knowledge Transfer) plan. Please review the plan and acknowledge it to move to HR approval.</p>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        <a 
                                            href={resignation.ktPlanUrl} 
                                            target="_blank" 
                                            className="px-6 py-3 bg-white text-brand-600 rounded-lg font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Review KT Plan
                                        </a>
                                        <button 
                                            onClick={handleAcknowledgeKt}
                                            disabled={submitting}
                                            className="px-6 py-3 bg-brand-400 text-white rounded-lg font-bold hover:bg-brand-300 transition-all border border-brand-300 flex items-center gap-2"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                            Acknowledge & Proceed
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            {/* Resignation Info */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold mb-4 text-brand-600 dark:text-brand-400">Request Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-500 flex items-center gap-1.5"><Calendar size={14} /> Applied On</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {resignation.resignationDate ? new Date(resignation.resignationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 flex items-center gap-1.5"><Clock size={14} /> Actual LWD</p>
                                        <p className="font-semibold text-blue-600">
                                            {resignation.actualLwd ? new Date(resignation.actualLwd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 flex items-center gap-1.5"><Send size={14} /> Requested Relieving Date</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {resignation.requestedRelievingDate ? new Date(resignation.requestedRelievingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(resignation.lastWorkingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 flex items-center gap-1.5"><AlertCircle size={14} /> Shortfall (Days)</p>
                                        <p className={`font-bold ${resignation.noticePeriodShortfall > 0 ? "text-red-600" : "text-green-600"}`}>
                                            {resignation.noticePeriodShortfall || 0} Days
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 flex items-center gap-1.5"><Target size={14} /> Reason</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{resignation.reason}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 flex items-center gap-1.5"><FileText size={14} /> Status</p>
                                        <p className={`font-bold px-2 py-0.5 rounded-full inline-block text-[10px] uppercase ${resignation.status.includes('APPROVED') ? "bg-green-100 text-green-700" :
                                            resignation.status.includes('REJECTED') ? "bg-red-100 text-red-700" :
                                                "bg-amber-100 text-amber-700"
                                            }`}>
                                            {resignation.status.replace('_', ' ')}
                                        </p>
                                    </div>
                                    {resignation.rejectionReason && (
                                        <div className="md:col-span-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-lg text-xs">
                                            <p className="font-bold text-red-800 dark:text-red-400 mb-1">Rejection Reason:</p>
                                            <p className="text-red-700 dark:text-red-300">{resignation.rejectionReason}</p>
                                        </div>
                                    )}
                                    {(resignation.status === 'MANAGER_REJECTED' || resignation.status === 'HR_REJECTED') && (
                                        <div className="md:col-span-3 pt-2">
                                            <button 
                                                onClick={() => setResignation(null)}
                                                className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-lg text-sm font-bold border border-brand-100 hover:bg-brand-100 transition-all"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Apply Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* KT Progress */}
                            {resignation.status === 'HR_APPROVED' && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <History className="w-5 h-5 text-brand-500" />
                                        Weekly KT Tracking
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="What did you handover this week?"
                                                className="flex-1 p-2 rounded-lg border dark:bg-gray-700 text-sm"
                                                value={ktUpdate}
                                                onChange={(e) => setKtUpdate(e.target.value)}
                                            />
                                            <button
                                                onClick={handleKtUpdate}
                                                className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {resignation.ktUpdates?.map((up, i) => (
                                                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border-l-4 border-brand-500">
                                                    <p className="text-gray-400 text-xs mb-1">{new Date(up.createdAt).toLocaleDateString()}</p>
                                                    <p>{up.updateText}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Exit Feedback */}
                            {resignation.status === 'HR_APPROVED' && !resignation.exitSurvey && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-500">
                                        <HeartHandshake className="w-5 h-5" />
                                        Exit Feedback (Survey)
                                    </h3>
                                    <p className="text-sm text-gray-500 italic">&quot;We value your experience at our company. Please let us know how we can improve.&quot;</p>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400">Would you recommend us?</label>
                                            <div className="flex gap-4">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => setRating(v)}
                                                        className={`w-10 h-10 rounded-full border transition-all ${rating === v ? "bg-rose-500 text-white border-rose-500 shadow-md scale-110" : "hover:bg-rose-50 dark:hover:bg-rose-900/20"}`}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400">What did you like most?</label>
                                            <textarea
                                                className="w-full p-3 rounded-lg border dark:bg-gray-900 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                                                placeholder="Culture, Benefits, Team, etc..."
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            disabled={submitting || !feedback.trim()}
                                            onClick={handleFeedbackSubmit}
                                            className="w-full py-3 bg-rose-500 text-white rounded-lg font-bold shadow-lg hover:bg-rose-600 transition-all disabled:opacity-50"
                                        >
                                            {submitting ? "Submitting..." : "Submit Feedback"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Side cards */}
                            <div className="bg-brand-50 dark:bg-brand-900/20 p-6 rounded-xl border border-brand-100 dark:border-brand-800">
                                <h4 className="font-semibold mb-2">Notice Period Policy</h4>
                                <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
                                    As per company policy, your notice period is {resignation.employee?.noticePeriod ?? 30} days. During this period, salary hikes and leave applications are restricted.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h4 className="font-semibold mb-4">KT Resources</h4>
                                {resignation.ktPlanUrl ? (
                                    <a
                                        href={resignation.ktPlanUrl}
                                        target="_blank"
                                        className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm border border-blue-100 dark:border-blue-800"
                                    >
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        View KT Plan
                                    </a>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">KT plan will be uploaded by your manager after approval.</p>
                                )}
                            </div>

                            {/* Document Release */}
                            {resignation.status === 'HR_APPROVED' && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        Documents & Certificates
                                    </h4>
                                    <div className="space-y-3">
                                        <button
                                            disabled={!resignation.clearances?.every(c => c.status === 'CLEAR')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm border-2 border-gray-100 dark:border-gray-700 group disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-500 transition-all font-bold"
                                        >
                                            <div className="flex items-center gap-3">
                                                <BadgeCheck className={`w-6 h-6 ${resignation.clearances?.every(c => c.status === 'CLEAR') ? 'text-emerald-500' : 'text-gray-300'}`} />
                                                <span>Relieving Letter</span>
                                            </div>
                                            <Download className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                        </button>
                                        {!resignation.clearances?.every(c => c.status === 'CLEAR') && (
                                            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-[10px] text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800 italic">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <p>Document generation is blocked until all 4 administrative clearances (IT, Finance, Admin, HR) are marked "CLEAR".</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
