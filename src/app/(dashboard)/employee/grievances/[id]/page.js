"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Clock,
    MessageSquare,
    ShieldAlert,
    ShieldCheck,
    EyeOff,
    Send,
    FileText,
    User,
    Calendar,
    CheckCircle,
    Users,
    MapPin,
    Star,
    Loader2,
    CheckCircle2
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { grievanceService } from "@/services/grievance.service";
import { toast } from "react-hot-toast";

const statusSteps = ["Submitted", "Under Review", "Investigation", "Hearing", "Decision Pending", "Resolved", "Closed"];

export default function GrievanceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [surveyOpen, setSurveyOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const data = await grievanceService.getGrievanceDetails(id);
            setTicket(data.data || data);
        } catch (err) {
            console.error("Failed to fetch details", err);
            // Fallback mock
            setTicket({
                id: id,
                type: id.startsWith('POSH') ? "POSH Complaint" : "General Grievance",
                category: "Workplace conflict",
                subject: "Issue with team coordination during project Alpha",
                description: "I have been facing constant interruptions and dismissal of my ideas during the morning stand-ups for the past two weeks. This is affecting my morale and productivity.",
                status: "Investigation",
                createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                updatedAt: new Date().toISOString(),
                incidentDate: "2024-02-15",
                location: "Meeting Room 4 / Online via Meet",
                isAnonymous: false,
                timeline: [
                    { status: "Submitted", date: new Date(Date.now() - 3 * 86400000).toISOString(), note: "Ticket initiated" },
                    { status: "Under Review", date: new Date(Date.now() - 2 * 86400000).toISOString(), note: "Assigned to HR Admin - Sarah" },
                    { status: "Investigation", date: new Date(Date.now() - 1 * 86400000).toISOString(), note: "Investigation panel formed" }
                ],
                comments: [
                    { sender: "HR Admin", message: "Hello, we have received your concern. Could you please specify if this happened in specific project meetings or all team calls?", date: new Date(Date.now() - 2 * 86400000).toISOString(), role: "HR" },
                    { sender: "You", message: "It mostly happens during the morning sync calls for Project Alpha.", date: new Date(Date.now() - 1 * 86400000).toISOString(), role: "Employee" }
                ],
                decisionSummary: null
            });
        } finally {
            setLoading(false);
        }
    };

    const currentStepIndex = statusSteps.indexOf(ticket?.status || "Submitted");

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            setSubmittingComment(true);
            await grievanceService.addComment(id, newComment);
            toast.success("Message sent");
            setNewComment("");
            fetchDetails();
        } catch (err) {
            toast.error("Failed to post message");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSurveySubmit = async () => {
        if (rating === 0) {
            toast.error("Please provide a rating");
            return;
        }
        try {
            await grievanceService.submitSurvey(id, rating, feedback);
            toast.success("Thank you for your feedback");
            setSurveyOpen(false);
            fetchDetails();
        } catch (err) {
            toast.error("Failed to submit feedback");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-primary-600" size={32} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hydrating Ticket Details...</p>
            </div>
        </div>
    );

    if (!ticket) return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
            <div className="text-center space-y-4">
                <div className="text-red-500 bg-red-50 p-4 rounded-full inline-block">
                    <ShieldAlert size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Record Not Found</h2>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">The requested grievance record could not be retrieved. It may have been archived or access restricted.</p>
                <button onClick={() => router.push("/employee/grievances")} className="px-6 py-2 bg-primary-600 text-white text-xs font-bold uppercase rounded-sm">Return to Portal</button>
            </div>
        </div>
    );

    const formatDisplayDate = (dateVal) => {
        if (!dateVal) return "N/A";
        const d = new Date(dateVal);
        return isNaN(d) ? "INVALID DATE" : d.toLocaleDateString("en-GB");
    };

    const isPosh = ticket.type === "POSH Complaint";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 transition-colors duration-200">
            <div className="max-w-6xl mx-auto space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/employee/dashboard" },
                        { label: "Grievance & POSH", href: "/employee/grievances" },
                        { label: `Case ${ticket.id}` },
                    ]}
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <button
                        onClick={() => router.push("/employee/grievances")}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-600 dark:text-gray-400 text-xs font-bold uppercase hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ChevronLeft size={16} />
                        Back to Portal
                    </button>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {ticket.isAnonymous && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-sm text-[10px] font-bold uppercase border border-orange-200">
                                <EyeOff size={12} /> Anonymous Case
                            </span>
                        )}
                        <span className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1 ${isPosh ? 'bg-red-100 text-red-700 border-red-200' : 'bg-primary-100 text-primary-700 border-primary-200'} rounded-sm text-[10px] font-bold uppercase border whitespace-nowrap`}>
                            {isPosh ? <ShieldAlert size={12} /> : <MessageSquare size={12} />}
                            {ticket.type}
                        </span>
                    </div>
                </div>

                {/* Status Tracker */}
                <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 flex items-center justify-between">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Lifecycle Tracking</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SLA Compliance:</span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <div className="min-w-[800px] flex items-center px-4 relative">
                            {/* Connector Line */}
                            <div className="absolute top-[14px] left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -z-0"></div>

                            {statusSteps.map((step, index) => {
                                const isCompleted = index < currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                return (
                                    <div key={step} className="flex-1 flex flex-col items-center gap-3 relative z-10">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' :
                                            isCurrent ? 'bg-white border-primary-600 text-primary-600 dark:bg-gray-800' :
                                                'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-300'
                                            } transition-all duration-300 shadow-sm`}>
                                            {isCompleted ? <CheckCircle size={14} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider text-center ${isCurrent ? 'text-primary-700 dark:text-primary-400' :
                                            isCompleted ? 'text-emerald-700' : 'text-gray-400'
                                            }`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden min-h-full flex flex-col">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{ticket.subject}</h2>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        <span className="text-primary-600">{ticket.id}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>{ticket.category}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="text-emerald-600">Audit Verified</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">CURRENT STATE</p>
                                    <p className={`text-xs font-bold uppercase mt-1 px-3 py-1 rounded-sm border ${isPosh ? 'border-red-100 text-red-700 bg-red-50' : 'border-primary-100 text-primary-700 bg-primary-50'}`}>{ticket.status}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-8 flex-1">
                                {/* Description Box */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-gray-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileText size={14} className="text-primary-500" />
                                        Complainant Statement
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 border border-gray-100 dark:border-gray-700 rounded-sm text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                                        "{ticket.description}"
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 pt-4">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Calendar size={12} className="text-primary-400" /> INCIDENT TIMESTAMP
                                        </p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-200 uppercase tracking-tight">{formatDisplayDate(ticket.incidentDate)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <User size={12} className="text-primary-400" /> ACCUSED ENTITY
                                        </p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-200 uppercase tracking-tight">{ticket.accusedPerson || "NOT DISCLOSED"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Users size={12} className="text-primary-400" /> POTENTIAL WITNESSES
                                        </p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-200 uppercase tracking-tight">{ticket.witnesses || "NONE LISTED"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <MapPin size={12} className="text-primary-400" /> REPORTED LOCATION
                                        </p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-200 uppercase tracking-tight">{ticket.location || "INTERNAL/REMOTE"}</p>
                                    </div>
                                </div>

                                {/* Resolution Outcome if Resolved */}
                                {ticket.status === "Resolved" && (
                                    <div className="p-6 rounded-sm bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-800 rounded-sm border border-emerald-100 shadow-sm">
                                                <ShieldCheck size={20} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-[0.2em]">Final Resolution Outcome</h4>
                                                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-[0.1em]">Case Closed Under Compliance</p>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-4 border border-emerald-100 dark:border-emerald-900/40 rounded-sm">
                                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed uppercase tracking-tight">
                                                THE ETHICS COMMITTEE HAS CONCLUDED INVESTIGATION. ACTIONS TAKEN: FORMAL WARNING ISSUED AND MANDATORY BEHAVIORAL SENSITIVITY TRAINING ASSIGNED.
                                            </p>
                                        </div>
                                        {!surveyOpen && (
                                            <button
                                                onClick={() => setSurveyOpen(true)}
                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm transition-all"
                                            >
                                                Submit Engagement Feedback
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Conversation Thread */}
                        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={16} className="text-primary-500" />
                                    <h3 className="text-[10px] font-bold text-gray-800 dark:text-white uppercase tracking-[0.2em]">Compliance Channel</h3>
                                </div>
                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100">
                                    <ShieldCheck size={10} /> Encrypted
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/20 dark:bg-gray-900/10">
                                {ticket.comments?.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 opacity-40">
                                        <MessageSquare size={48} className="text-gray-300" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">No active discussion for this ticket yet.</p>
                                    </div>
                                )}
                                {ticket.comments?.map((comment, i) => (
                                    <div key={i} className={`flex ${comment.role === 'Employee' || comment.role === 'You' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-sm px-4 py-3 shadow-sm border ${comment.role === 'Employee' || comment.role === 'You'
                                            ? 'bg-primary-600 text-white border-primary-500'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                                            }`}>
                                            <div className="flex items-center justify-between gap-6 mb-2">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${comment.role === 'Employee' || comment.role === 'You' ? 'text-primary-100' : 'text-primary-600'
                                                    }`}>
                                                    {comment.sender} • {comment.role}
                                                </span>
                                                <span className={`text-[8px] italic ${comment.role === 'Employee' || comment.role === 'You' ? 'text-primary-200' : 'text-gray-400'
                                                    }`}>
                                                    {(() => {
                                                        const d = new Date(comment.date);
                                                        return isNaN(d) ? "TBD" : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                    })()}
                                                </span>
                                            </div>
                                            <p className="text-xs leading-relaxed font-medium uppercase tracking-tight">{comment.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handlePostComment} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="relative">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="PROVIDE CONFIDENTIAL UPDATE..."
                                        rows={2}
                                        className="w-full pl-4 pr-14 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-sm text-xs font-bold uppercase tracking-widest focus:border-primary-400 focus:ring-0 outline-none transition-all resize-none leading-relaxed"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handlePostComment(e);
                                            }
                                        }}
                                    />
                                    <button
                                        disabled={submittingComment || !newComment.trim()}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-sm disabled:opacity-50 transition-all shadow-sm active:scale-95"
                                    >
                                        {submittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                </div>
                                <p className="text-[8px] text-gray-400 mt-2 text-center uppercase font-bold tracking-[0.2em] opacity-60">
                                    Secure SSL/TLS End-to-End Encryption Enabled
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50">
                                <h3 className="text-[10px] font-bold text-gray-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock size={14} className="text-primary-500" />
                                    Audit Timeline
                                </h3>
                            </div>
                            <div className="p-6 space-y-6 relative ml-1">
                                <div className="absolute top-6 bottom-6 left-[7px] w-px bg-gray-100 dark:bg-gray-700"></div>
                                {ticket.timeline?.map((event, i) => (
                                    <div key={i} className="flex gap-4 relative z-10 transition-all hover:translate-x-1 duration-300">
                                        <div className={`mt-1.5 w-3.5 h-3.5 rounded-full border-2 ${i === 0 ? 'bg-emerald-600 border-white' : 'bg-white border-gray-200 dark:bg-gray-800'
                                            }`}></div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex flex-col">
                                                <p className="text-[9px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">{event.status}</p>
                                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest opacity-70">{formatDisplayDate(event.date)}</p>
                                            </div>
                                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tight leading-tight">{event.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white p-6 rounded-sm space-y-4 shadow-xl ring-1 ring-white/10">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={20} className="text-primary-400" />
                                <h4 className="font-bold text-[10px] uppercase tracking-[0.2em]">Compliance Protocol</h4>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-bold uppercase tracking-tight">
                                AS PER {isPosh ? 'POSH ACT 2013' : 'GLOBAL HR POLICY'}, THIS PROCEEDING IS PRIVILEGED. COMPLETION TARGET: 90 CALENDAR DAYS.
                            </p>
                            <div className="pt-2">
                                <div className="flex justify-between text-[9px] font-bold text-primary-400 mb-2 uppercase tracking-[0.2em]">
                                    <span>CYCLE STATUS</span>
                                    <span>INITIAL STAGE</span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[10%] bg-primary-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Satisfaction Survey Modal */}
            {surveyOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-sm p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-3">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full inline-block mb-2">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Process Engagement Survey</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Quality Assurance Protocol</p>
                        </div>

                        <div className="space-y-6 mt-8">
                            <div className="flex justify-center gap-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setRating(s)}
                                        className={`transition-all transform active:scale-90 ${rating >= s ? 'text-amber-500' : 'text-gray-200 hover:text-amber-400'}`}
                                    >
                                        <Star size={34} fill={rating >= s ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">ENGAGEMENT FEEDBACK (OPTIONAL)</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-950 text-xs font-bold uppercase tracking-widest focus:border-emerald-500 focus:ring-0 outline-none resize-none leading-relaxed"
                                    placeholder="PROVIDE FEEDBACK ON INVESTIGATION PROCESS..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button
                                onClick={() => setSurveyOpen(false)}
                                className="py-3 text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-[0.2em] border border-gray-100 rounded-sm transition-all"
                            >
                                DEFER
                            </button>
                            <button
                                onClick={handleSurveySubmit}
                                className="py-3 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-sm uppercase tracking-[0.2em] shadow-sm transition-all"
                            >
                                SUBMIT RECORD
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
