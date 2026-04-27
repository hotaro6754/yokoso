"use client";

import { useState, useEffect } from "react";
import { separationService } from "@/services/hr-services/separation-new.service";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
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
    HeartHandshake
} from "lucide-react";
import DatePickerField from "@/components/form/input/DatePickerField";

const pad2 = (n) => String(n).padStart(2, "0");
const formatIsoDate = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const parseIsoDate = (value) => {
    if (!value || typeof value !== "string") return null;
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    const dt = new Date(year, month - 1, day);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
};
const addDaysToIsoDate = (isoDate, days) => {
    const base = parseIsoDate(isoDate) || (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    })();
    base.setDate(base.getDate() + (Number.isFinite(days) ? days : 0));
    return formatIsoDate(base);
};
const todayIso = () => {
    const now = new Date();
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return formatIsoDate(dt);
};

export default function EmployeeSeparationPage() {
    const { user } = useAuth();
    const [resignation, setResignation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        reason: "",
        reasonDetails: "",
        lastWorkingDate: ""
    });
    const [ktUpdate, setKtUpdate] = useState("");
    const [feedback, setFeedback] = useState("");
    const [rating, setRating] = useState(5);

    useEffect(() => {
        fetchResignationStatus();
    }, []);

    useEffect(() => {
        // Auto-populate LWD based on user's notice period (default: 30 days)
        if (resignation) return;
        if (formData.lastWorkingDate) return;
        const rawNotice = user?.employee?.noticePeriod ?? 30;
        const noticeDays = parseInt(rawNotice, 10);
        const safeNoticeDays = Number.isFinite(noticeDays) ? Math.max(0, noticeDays) : 30;
        setFormData((prev) => (prev.lastWorkingDate ? prev : { ...prev, lastWorkingDate: addDaysToIsoDate(todayIso(), safeNoticeDays) }));
    }, [user?.employee?.noticePeriod, resignation, formData.lastWorkingDate]);

    const fetchResignationStatus = async () => {
        try {
            setLoading(true);
            const response = await separationService.getDashboard({ employeeId: "my" }); // Backend needs adjustment for "my" or I use current user server side
            // For now assume list and take first
            if (response.success && response.data.length > 0) {
                const latestResignation = response.data[0];
                const isRejected = ["MANAGER_REJECTED", "HR_REJECTED"].includes(latestResignation.status);

                if (isRejected) {
                    const updatedAt = new Date(latestResignation.updatedAt);
                    const now = new Date();
                    const diffInDays = (now - updatedAt) / (1000 * 60 * 60 * 24);

                    if (diffInDays >= 5) {
                        setResignation(null);
                        return;
                    }
                }
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
            const response = await separationService.submitResignation(formData);
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

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Separation Management</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your resignation and exit process.</p>
            </div>

            {!resignation ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Send className="w-5 h-5 text-brand-500" />
                        Submit Resignation
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Primary Reason</label>
                                <select
                                    required
                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-700"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                >
                                    <option value="">Select Reason</option>
                                    <option value="Better Opportunity">Better Opportunity</option>
                                    <option value="Personal Reasons">Personal Reasons</option>
                                    <option value="Higher Studies">Higher Studies</option>
                                    <option value="Career Change">Career Change</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Desired Last Working Date</label>
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Detailed Reason</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full p-2.5 rounded-lg border dark:bg-gray-700"
                                placeholder="Tell us more about your decision..."
                                value={formData.reasonDetails}
                                onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })}
                            />
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
                            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Resignation"}
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
                                { step: 'MANAGER', label: 'Manager', active: resignation.status === 'PENDING', done: ['MANAGER_APPROVED', 'HR_APPROVED'].includes(resignation.status) },
                                { step: 'HR', label: 'HR', active: resignation.status === 'MANAGER_APPROVED', done: resignation.status === 'HR_APPROVED' },
                                { step: 'EXIT', label: 'Exit Process', active: resignation.status === 'HR_APPROVED' }
                            ].map((step, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${step.done ? "bg-green-500 border-green-200 text-white" :
                                        step.active ? "bg-brand-500 border-brand-100 text-white animate-pulse" :
                                            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400"
                                        }`}>
                                        {step.done ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                    </div>
                                    <span className="text-xs font-semibold">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            {/* Resignation Info */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Submitted On</p>
                                        <p className="font-medium">{new Date(resignation.resignationDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <p className={`font-medium ${resignation.status.includes('APPROVED') ? "text-green-600" :
                                            resignation.status.includes('REJECTED') ? "text-red-600" :
                                                "text-amber-600"
                                            }`}>
                                            {resignation.status.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Last Working Day</p>
                                        <p className="font-medium">{new Date(resignation.lastWorkingDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Primary Reason</p>
                                        <p className="font-medium">{resignation.reason}</p>
                                    </div>
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
                                    <p className="text-sm text-gray-500 italic">"We value your experience at our company. Please let us know how we can improve."</p>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
