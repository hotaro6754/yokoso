"use client";

import { useEffect, useState } from "react";
import { employeeProbationService } from "@/services/employee-services/probation.service";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
    FileText,
    Target,
    BarChart,
    CalendarCheck,
    ClipboardList,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Download,
    Shield,
    X,
    MessageSquare,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function EmployeeProbationPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [acknowledging, setAcknowledging] = useState(false);
    const [submittingResponse, setSubmittingResponse] = useState(false);

    // Response State
    const [activeResponseId, setActiveResponseId] = useState(null);
    const [responseText, setResponseText] = useState("");

    // Survey State
    const [surveyOpen, setSurveyOpen] = useState(false);
    const [activeSurveyStage, setActiveSurveyStage] = useState(null);
    const [surveyForm, setSurveyForm] = useState({
        roleClarityRating: 5,
        managerSupportRating: 5,
        experienceFeedback: "",
        suggestions: ""
    });

    const breadcrumbItems = [
        { label: "Performance", href: "/employee/performance" },
        { label: "My Probation", href: "/employee/performance/probation" },
    ];



    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await employeeProbationService.getStatus();
            setData(res);
        } catch (err) {
            setError(err?.message || "Failed to load probation status");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAcknowledge = async () => {
        if (!data?.probationId) return;
        try {
            setAcknowledging(true);
            await employeeProbationService.acknowledgeGoals(data.probationId);
            toast.success("Goals acknowledged successfully!");
            fetchData();
        } catch (err) {
            toast.error(err?.message || "Failed to acknowledge");
        } finally {
            setAcknowledging(false);
        }
    };

    const handleOpenSurvey = (stage) => {
        setActiveSurveyStage(stage);
        setSurveyOpen(true);
        setSurveyForm({ roleClarityRating: 5, managerSupportRating: 5, experienceFeedback: "", suggestions: "" });
    };

    const handleSubmitSurvey = async () => {
        try {
            await employeeProbationService.submitSurvey(data.probationId, activeSurveyStage, surveyForm);

            toast.success("Survey submitted!");
            setSurveyOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to submit survey");
        }
    };

    const handleAddResponse = async (reviewId) => {
        if (!responseText.trim()) return toast.error("Response cannot be empty");
        try {
            setSubmittingResponse(true);
            await employeeProbationService.addReviewResponse(data.probationId, reviewId, responseText);

            toast.success("Response added successfully");
            setActiveResponseId(null);
            setResponseText("");
            fetchData();
        } catch (error) {
            toast.error("Failed to add response");
        } finally {
            setSubmittingResponse(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

    if (error) return <div className="p-10 text-rose-500 bg-rose-50 rounded m-6 border border-rose-200">{error}</div>;

    if (data?.status === 'NO_RECORD') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <Breadcrumb items={breadcrumbItems} />
                <div className="mt-6 p-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-gray-400" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Active Probation Found</h2>
                    <p className="text-gray-500 mt-2">You don't have an active probation record currently.</p>
                </div>
            </div>
        );
    }

    const pendingGoals = data?.goals?.some(g => g.status === 'PENDING');

    // Calculate Days Completed
    const daysCompleted = data?.startDate
        ? Math.max(0, Math.ceil((new Date() - new Date(data.startDate)) / (1000 * 60 * 60 * 24)))
        : 0;

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            case 'EXTENDED': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
            case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
            case 'TERMINATED': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 space-y-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <Breadcrumb items={breadcrumbItems} />

                {/* Header & Status Card */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold">Probation Overview</h1>
                                <p className="text-primary-100 opacity-90 mt-1">Track your progress and feedback</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold bg-white/20 backdrop-blur-md border border-white/30`}>
                                {data?.status}
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</p>
                                <p className="font-semibold text-gray-900 dark:text-white mt-1">
                                    {data?.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Date</p>
                                <p className="font-semibold text-gray-900 dark:text-white mt-1">
                                    {data?.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Stage</p>
                                <p className="font-semibold text-gray-900 dark:text-white mt-1">
                                    {data?.currentStage?.replace('DAYS_', '')} Days
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Days Completed</p>
                                <p className="font-semibold text-gray-900 dark:text-white mt-1">
                                    {daysCompleted} / {data?.probationDays || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats or Next Action */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Next Milestone</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Upcoming Review</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">60 Days Review</p>
                            <p className="text-xs text-gray-400">Due in approx {Math.max(0, 60 - daysCompleted)} days</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column: Goals & Reviews */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Action Banner: Acknowledge Goals */}
                        {pendingGoals && (
                            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                                <div className="flex gap-3 items-center">
                                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 dark:bg-amber-800 dark:text-amber-100">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Review & Acknowledge Goals</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Your manager has set your probation goals. Please review and acknowledge.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAcknowledge}
                                    disabled={acknowledging}
                                    className="whitespace-nowrap px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-70"
                                >
                                    {acknowledging ? "Processing..." : "I Acknowledge"}
                                </button>
                            </div>
                        )}

                        {/* Goals Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Target className="text-primary-600" size={20} /> Assigned Goals
                                </h3>
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">
                                    {data?.goals?.length || 0} Goals
                                </span>
                            </div>

                            {!data?.goals?.length ? (
                                <p className="text-gray-500 italic text-center py-6">No goals assigned yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {data.goals.map((goal) => (
                                        <div key={goal.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                                                            {goal.stage?.replace('DAYS_', '')} Days
                                                        </span>
                                                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                            Weight: {goal.weight}%
                                                        </span>
                                                    </div>
                                                </div>
                                                {goal.status === 'ACKNOWLEDGED' && (
                                                    <span className="text-emerald-600 text-xs flex items-center gap-1 font-medium bg-emerald-50 px-2 py-1 rounded dark:bg-emerald-900/20 dark:text-emerald-400">
                                                        <CheckCircle2 size={12} /> Acknowledged
                                                    </span>
                                                )}
                                                {goal.status === 'PENDING' && (
                                                    <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded dark:bg-amber-900/20 dark:text-amber-400">
                                                        Pending Acknowledgement
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">{goal.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{goal.desc}</p>
                                            <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                                                <span className="flex items-center gap-1"><BarChart size={12} /> KPI: {goal.kpi}</span>
                                                <span className="flex items-center gap-1"><Target size={12} /> Target: {goal.target}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <ClipboardList className="text-purple-600" size={20} /> Monthly Review Results
                                </h3>
                            </div>

                            {!data?.reviews?.length ? (
                                <p className="text-gray-500 italic text-center py-6">No reviews completed yet.</p>
                            ) : (
                                <div className="space-y-6">
                                    {data.reviews.map((review) => (
                                        <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{review.stage?.replace('DAYS_', '')} Days Review</h4>
                                                    <p className="text-xs text-gray-500">Submitted on {new Date(review.submittedAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-center">
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Rating</p>
                                                        <p className="text-sm font-bold text-purple-600">{review.rating?.replace('_', ' ')}</p>
                                                    </div>
                                                    {review.achievementPercentage && (
                                                        <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-center">
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Achievement</p>
                                                            <p className="text-sm font-bold text-green-600">{review.achievementPercentage}%</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manager Comments</p>
                                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 italic">
                                                        "{review.managerComments || 'No comments provided.'}"
                                                    </div>
                                                </div>

                                                {/* Employee Response Section */}
                                                <div className="pt-2">
                                                    {review.employeeResponse ? (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                                                <MessageSquare size={14} className="text-blue-500" /> Your Response
                                                            </p>
                                                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-blue-100 dark:border-blue-900/30">
                                                                {review.employeeResponse}
                                                                <p className="text-xs text-blue-400 mt-2 text-right">Submitted on {new Date(review.employeeResponseAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            {activeResponseId === review.id ? (
                                                                <div className="space-y-3 animate-in fade-in">
                                                                    <textarea
                                                                        value={responseText}
                                                                        onChange={(e) => setResponseText(e.target.value)}
                                                                        placeholder="Add your comments or feedback..."
                                                                        className="w-full text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                                                        rows={3}
                                                                    />
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => { setActiveResponseId(null); setResponseText(""); }}
                                                                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleAddResponse(review.id)}
                                                                            disabled={submittingResponse || !responseText.trim()}
                                                                            className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                                                        >
                                                                            {submittingResponse ? 'Submitting...' : 'Submit Response'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setActiveResponseId(review.id)}
                                                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                                                >
                                                                    <MessageSquare size={14} /> Add Response (Optional)
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Final Decision Section (Conditional) */}
                        {['CONFIRMED', 'EXTENDED', 'TERMINATED'].includes(data?.status) && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden relative">
                                <div className={`absolute top-0 left-0 w-1 h-full ${data.status === 'CONFIRMED' ? 'bg-green-500' :
                                    data.status === 'EXTENDED' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}></div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Shield className={
                                        data.status === 'CONFIRMED' ? 'text-green-600' :
                                            data.status === 'EXTENDED' ? 'text-amber-600' : 'text-red-600'
                                    } size={20} />
                                    Final Decision: {data.status}
                                </h3>

                                <div className="space-y-4 pl-4">
                                    {data.status === 'CONFIRMED' && (
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                Congratulations! Your probation has been successfully confirmed. You are now a permanent employee.
                                            </p>
                                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                                <Download size={16} /> Download Confirmation Letter
                                            </button>
                                        </div>
                                    )}

                                    {data.status === 'EXTENDED' && (
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                                Your probation period has been extended.
                                            </p>
                                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                                <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-1">Extension Details</h4>
                                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                                    Please refer to your extension letter for details regarding the new end date and focus areas (Weekly Reviews).
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">
                        {/* Experience Surveys */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <ClipboardList className="text-blue-600" size={20} /> Experience Surveys
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">Share your feedback at key milestones.</p>

                            <div className="space-y-3">
                                {['DAYS_30', 'DAYS_60', 'DAYS_90'].filter(stage => {
                                    const days = parseInt(stage.replace('DAYS_', ''));
                                    // If probationDays is null, default to 180 (standard 6 months) to show all
                                    // Or user might want strict filtering. Using user's logic: "if I create employee and set probation like 30 days then employee should only display 30 days details"
                                    // probationDays comes from backend.
                                    return (data?.probationDays || 180) >= days;
                                }).map((stage) => {
                                    const completed = data?.surveys?.some(s => s.stage === stage);
                                    // Determine if available: 
                                    const isAvailable = !completed; // Mock availability logic

                                    return (
                                        <div key={stage} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${completed
                                            ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                                            : "bg-white border-gray-100 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                                            }`}>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{stage.replace('DAYS_', '')} Days Survey</p>
                                                <p className={`text-xs mt-0.5 ${completed ? "text-emerald-600 font-medium" : "text-gray-500"}`}>
                                                    {completed ? "Completed" : "Pending"}
                                                </p>
                                            </div>
                                            {!completed && (
                                                <button
                                                    onClick={() => handleOpenSurvey(stage)}
                                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 shadow-sm font-medium"
                                                >
                                                    Start
                                                </button>
                                            )}
                                            {completed && <CheckCircle2 size={18} className="text-emerald-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white text-center">
                            <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                            <p className="text-indigo-100 text-sm mb-4">Contact HR for any queries regarding your probation process.</p>
                            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all">
                                Contact HR
                            </button>
                        </div>
                    </div>
                </div>

                {/* Survey Modal */}
                {surveyOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 overflow-hidden transform transition-all scale-100">
                            <div className="bg-gray-50 dark:bg-gray-800 p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Complete Survey ({activeSurveyStage?.replace('DAYS_', '')} Days)</h3>
                                <button onClick={() => setSurveyOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            </div>

                            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role Clarity (1-5)</label>
                                    <div className="flex gap-4 mt-2">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => setSurveyForm({ ...surveyForm, roleClarityRating: num })}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${surveyForm.roleClarityRating === num
                                                    ? 'bg-primary-600 text-white shadow-md scale-110'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Manager Support (1-5)</label>
                                    <div className="flex gap-4 mt-2">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => setSurveyForm({ ...surveyForm, managerSupportRating: num })}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${surveyForm.managerSupportRating === num
                                                    ? 'bg-primary-600 text-white shadow-md scale-110'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Feedback on Experience</label>
                                    <textarea
                                        value={surveyForm.experienceFeedback}
                                        onChange={e => setSurveyForm({ ...surveyForm, experienceFeedback: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 h-24 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                        placeholder="Describe your experience so far..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Suggestions for Improvement</label>
                                    <textarea
                                        value={surveyForm.suggestions}
                                        onChange={e => setSurveyForm({ ...surveyForm, suggestions: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 h-24 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                        placeholder="Any suggestions for the team or company?"
                                    />
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                                <button onClick={() => setSurveyOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors">Cancel</button>
                                <button onClick={handleSubmitSurvey} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">Submit Survey</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
