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
    XCircle,
    Plus,
    Users,
    Search,
    Lock,
    History,
    FileDown,
    CheckCircle2,
    AlertCircle,
    Scale,
    Gavel,
    Loader2,
    MapPin,
    ArrowUpRight
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { grievanceService } from "@/services/grievance.service";
import { toast } from "react-hot-toast";

const statusSteps = ["Submitted", "Under Review", "Investigation", "Hearing", "Decision Pending", "Resolved", "Closed"];

export default function HRGrievanceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [internalNote, setInternalNote] = useState("");
    const [submittingNote, setSubmittingNote] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");

    // Resolution form state
    const [resolution, setResolution] = useState({
        decision: "",
        actionTaken: "",
        policyReference: "",
        closureRemarks: ""
    });

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const data = await grievanceService.getGrievanceDetails(id);
            const resData = data.data || data;
            setTicket(resData);
            setSelectedStatus(resData.status);
        } catch (err) {
            console.error("Failed to fetch details", err);
            toast.error("Resource fetch failed - falling back to redundancy");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await grievanceService.updateGrievanceStatus(id, newStatus, "Status updated via HR dashboard");
            toast.success(`Status updated to ${newStatus}`);
            fetchDetails();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleAddInternalNote = async (e) => {
        e.preventDefault();
        if (!internalNote.trim()) return;
        try {
            setSubmittingNote(true);
            await grievanceService.addComment(id, internalNote, []);
            setInternalNote("");
            toast.success("Internal note added");
            fetchDetails();
        } catch (err) {
            toast.error("Failed to add note");
        } finally {
            setSubmittingNote(false);
        }
    };

    const handlePanelAssign = async () => {
        try {
            await grievanceService.assignPanel(id, [" Sarah", "Dr. Ananya", "Mark"]);
            setIsPanelModalOpen(false);
            toast.success("Panel Assigned Successfully");
            fetchDetails();
        } catch (e) {
            toast.error("Failed to assign panel");
        }
    };

    const handleResolve = async () => {
        try {
            await grievanceService.recordDecision(id, resolution.decision, resolution.actionTaken, resolution.policyReference);
            toast.success("Case Resolved Successfully");
            setIsResolveModalOpen(false);
            fetchDetails();
        } catch (err) {
            toast.error("Failed to resolve case");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary-600" size={32} />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Syncing Ethical Repository...</p>
            </div>
        </div>
    );

    if (!ticket) return <div className="p-8 text-center text-red-500 font-bold uppercase tracking-widest text-xs">Record Null: Access Restricted or Missing</div>;

    const isPosh = ticket.type === "POSH Complaint";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/hr/dashboard" },
                        { label: "Management", href: "/hr/grievance-management" },
                        { label: `Case Dossier ${ticket.id}` },
                    ]}
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <button
                        onClick={() => router.push("/hr/grievance-management")}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                        <ChevronLeft size={16} />
                        Back to Repository
                    </button>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-sm text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                            <FileDown size={14} /> Export Dossier
                        </button>
                        <button className="flex-1 md:flex-none px-4 py-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-sm text-sm font-medium flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors">
                            <History size={14} /> Full Audit Log
                        </button>
                    </div>
                </div>

                {/* Status Tracker and Action Cell */}
                <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col lg:flex-row items-stretch">
                    <div className="flex-1 p-6 overflow-x-auto border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700">
                        <div className="min-w-[700px] flex items-center px-4 relative pt-1 pb-4">
                            <div className="absolute top-[14px] left-0 w-full h-[1px] bg-gray-100 dark:bg-gray-700 -z-0"></div>
                            {statusSteps.map((step, idx) => {
                                const currentIdx = statusSteps.indexOf(ticket.status);
                                const isCompleted = idx < currentIdx;
                                const isCurrent = idx === currentIdx;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-3 relative z-10">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' :
                                            isCurrent ? 'bg-white border-primary-600 text-primary-600 dark:bg-gray-800' :
                                                'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-300'
                                            } transition-all duration-300 shadow-sm`}>
                                            {isCompleted ? <CheckCircle size={14} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                                        </div>
                                        <span className={`text-[11px] font-medium text-center ${isCurrent ? 'text-primary-700 dark:text-primary-400' : 'text-gray-400'}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-gray-900/10 p-6 flex flex-col justify-center gap-1.5 md:min-w-[280px]">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Transition Stage</p>
                        <select
                            value={selectedStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-sm font-medium text-gray-800 dark:text-gray-200 outline-none focus:border-primary-400 transition-colors"
                        >
                            {statusSteps.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                            <div className={`p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between ${isPosh ? 'bg-rose-50/40' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-sm ${isPosh ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-brand-50 text-brand-700 border border-brand-100'}`}>
                                        {isPosh ? <ShieldAlert size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{ticket.id}</h2>
                                            {ticket.isAnonymous && <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-sm font-medium border border-amber-100">Anonymous</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{ticket.category}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                                            <span className="text-emerald-600">Encrypted secure record</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs text-gray-500">Record Owner</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.complainant}</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="md:col-span-2 space-y-8">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                                <AlertCircle size={14} className="text-brand-500" /> Case Subject
                                            </h4>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">"{ticket.subject}"</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">Detailed Statement</h4>
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-sm text-sm text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-800">
                                                {ticket.description}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">Evidence Registry</h4>
                                            <div className="space-y-2">
                                                {ticket.documents?.map((doc, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 hover:border-primary-400 transition-all cursor-pointer group shadow-sm">
                                                        <div className="p-2 bg-gray-50 dark:bg-gray-900 text-gray-500 rounded-sm"><Files size={16} /></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-300 truncate">{doc.name}</p>
                                                            <p className="text-xs text-gray-400">{doc.size} • {doc.date}</p>
                                                        </div>
                                                        <ArrowUpRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                                                    </div>
                                                ))}
                                                <button className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-sm text-xs font-medium text-gray-500 hover:text-primary-600 hover:border-primary-400 transition-colors">
                                                    <Plus size={14} /> Add Registry Entry
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-5 space-y-4 shadow-sm">
                                            <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-1">
                                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                    Committee
                                                </h4>
                                                <Users size={14} className="text-primary-500" />
                                            </div>
                                            {ticket.panel?.length > 0 ? (
                                                <div className="space-y-4">
                                                    {ticket.panel.map((m, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className="w-7 h-7 rounded-sm bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center text-[10px] font-semibold">{m.name?.charAt(0) || "P"}</div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.name}</p>
                                                                <p className="text-xs text-gray-400">{m.role}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 space-y-3">
                                                    <p className="text-xs text-gray-500">No committee panel</p>
                                                    <button
                                                        onClick={() => setIsPanelModalOpen(true)}
                                                        className="w-full py-2 bg-primary-600 text-white rounded-sm text-xs font-medium hover:bg-primary-700 transition-colors"
                                                    >
                                                        Form Committee
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-700" />

                                {/* Internal Notes Registry */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                                <Lock size={14} className="text-amber-500" /> Confidential Notes
                                            </h4>
                                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-sm font-medium">HR Privileged</span>
                                        </div>

                                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200">
                                            {ticket.comments?.filter(c => c.role !== 'Employee').length === 0 && (
                                                <div className="py-12 text-center opacity-40 italic text-[10px] font-bold uppercase tracking-[0.2em]">No registry entries logged</div>
                                            )}
                                            {ticket.comments?.filter(c => c.role !== 'Employee').map((note, i) => (
                                                <div key={i} className="bg-gray-50 dark:bg-gray-950 p-5 rounded-sm border border-gray-100 dark:border-gray-800 relative group shadow-sm">
                                                    <div className="flex items-center justify-between mb-3 border-b border-gray-100/50 pb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-sm bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center text-[9px] font-bold uppercase">{note.sender?.charAt(0) || "U"}</div>
                                                            <span className="text-[9px] font-bold text-gray-900 dark:text-white uppercase tracking-[0.1em]">{note.sender}</span>
                                                        </div>
                                                        <span className="text-[8px] text-gray-400 font-bold tracking-widest">{new Date(note.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-bold uppercase tracking-tight italic opacity-90">"{note.message}"</p>
                                                </div>
                                            ))}
                                        </div>

                                        <form onSubmit={handleAddInternalNote} className="relative pt-2">
                                            <textarea
                                                value={internalNote}
                                                onChange={(e) => setInternalNote(e.target.value)}
                                                placeholder="Record a confidential investigation note..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-sm focus:border-primary-400 outline-none transition-colors resize-none"
                                            />
                                            <button
                                                disabled={submittingNote || !internalNote.trim()}
                                                className="absolute right-3 bottom-4 p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-sm disabled:opacity-50 transition-colors"
                                            >
                                                {submittingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                            </button>
                                        </form>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
                                            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                                                Audit Trail History
                                                <ShieldCheck size={14} className="text-emerald-500" />
                                            </h3>
                                            <div className="space-y-6 relative ml-1">
                                                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-100 dark:bg-gray-700"></div>
                                                {ticket.internalAudit?.map((log, i) => (
                                                    <div key={i} className="flex gap-4 relative z-10 transition-transform hover:translate-x-1">
                                                        <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-primary-500 shadow-sm flex-shrink-0"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{log.action}</p>
                                                            <p className="text-[11px] text-gray-400">{log.user} • {new Date(log.date).toLocaleDateString("en-GB")}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
                                            <button
                                                onClick={() => setIsResolveModalOpen(true)}
                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Gavel size={18} />
                                                Seal & Record Findings
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-sm text-gray-400"><Clock size={16} /></div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs text-gray-500">SLA Lifecycle</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Active (3/90 cal days)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-sm text-gray-400"><Calendar size={16} /></div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs text-gray-500">Incident Timestamp</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.incidentDate ? new Date(ticket.incidentDate).toLocaleDateString("en-GB") : "TBD"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-sm text-gray-400"><MapPin size={16} /></div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs text-gray-500">Accused Entity</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.accused || "Unidentified"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-sm border border-amber-200 dark:border-amber-900/30 space-y-3">
                                <div className="flex items-center gap-2 text-amber-700">
                                    <Scale size={16} />
                                    <h4 className="text-xs font-semibold leading-none">Compliant Privilege</h4>
                                </div>
                                <p className="text-xs text-amber-800/80 dark:text-amber-400 leading-relaxed">
                                    ALL RECORDED TESTIMONY AND NOTES IN THIS DOSSIER ARE SUBJECT TO SUBPOENA AND MUST ADHERE TO PROFESSIONAL CONDUCT STANDARDS.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white p-6 rounded-sm space-y-5 shadow-sm border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-[0.03] rotate-45 -mr-8 -mt-8 px-10"></div>
                            <div className="flex items-center gap-2 relative z-10">
                                <ShieldCheck size={18} className="text-primary-300" />
                                <h4 className="font-semibold text-xs">High Fidelity Cryptography</h4>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2 opacity-80">
                                    <span className="text-gray-400">ENCRYPTION PROTOCOL</span>
                                    <span className="text-emerald-400">FIPS-140-2</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2 opacity-80">
                                    <span className="text-gray-400">AUDIT LOCK</span>
                                    <span className="text-emerald-400">ENABLED</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] opacity-80">
                                    <span className="text-gray-400">RECORD HASHING</span>
                                    <span className="text-emerald-400">SHA-256</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel Assignment Modal */}
            {isPanelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-sm p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-primary-100 text-primary-700 border border-primary-200 rounded-sm"><Users size={24} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">Committee Architecture</h3>
                                <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold">{isPosh ? 'POSH-IC CONFORMATION' : 'GRIEVANCE PANEL'}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" placeholder="SEARCH ENTITIES TO ENROLL..." className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm text-[10px] font-bold uppercase tracking-widest focus:border-primary-400 outline-none transition-all" />
                            </div>

                            <div className="space-y-3">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 opacity-70">Suggested Enrollment</p>
                                <div className="space-y-2">
                                    {["SARAH (INTERNAL - CHAIR)", "DR. ANANYA (EXTERNAL SPECIALIST)", "MARK WILSON (HR LOGISTICS)"].map((m, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800">
                                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-tight">{m}</span>
                                            <button className="text-primary-600 font-bold text-[9px] uppercase tracking-widest hover:text-primary-700">Enroll</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {isPosh && (
                                <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-sm space-y-3 shadow-sm">
                                    <p className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"><AlertCircle size={14} /> POSH Compliance Constraint</p>
                                    <ul className="text-[8px] font-bold list-disc list-inside space-y-1 opacity-80 uppercase tracking-widest">
                                        <li>Chair must be a Senior Woman Employee</li>
                                        <li>Must include one External Specialist</li>
                                        <li>50% Minimum Female Representation Required</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4 mt-10">
                            <button onClick={() => setIsPanelModalOpen(false)} className="px-6 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cancel</button>
                            <button onClick={handlePanelAssign} className="px-8 py-3 bg-primary-600 text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm hover:bg-primary-700 transition-all">Authorize Panel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resolution Modal */}
            {isResolveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-sm p-10 max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-sm shadow-sm"><Scale size={28} /></div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">Ethical Resolution Closure</h3>
                                <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold">Formal Decision & Record Sealing</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Inquiry Findings Summary</label>
                                <textarea
                                    value={resolution.decision}
                                    onChange={(e) => setResolution({ ...resolution, decision: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm text-[10px] font-bold uppercase tracking-widest outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed"
                                    placeholder="SYNCHRONIZE INVESTIGATION SUMMARY..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Corrective Actions Taken</label>
                                <textarea
                                    value={resolution.actionTaken}
                                    onChange={(e) => setResolution({ ...resolution, actionTaken: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm text-[10px] font-bold uppercase tracking-widest outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed"
                                    placeholder="SPECIFY DISCIPLINARY OR REMEDIAL STEPS..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Compliance Policy Hook</label>
                                <input
                                    type="text"
                                    value={resolution.policyReference}
                                    onChange={(e) => setResolution({ ...resolution, policyReference: e.target.value })}
                                    placeholder="E.G. ARTICLE 4.0 CODE OF ETHICS"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-sm text-[10px] font-bold uppercase tracking-widest focus:border-emerald-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Post-Closure Automation</label>
                                <div className="flex items-center gap-2 p-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-sm border border-emerald-100 dark:border-emerald-900/40">
                                    <CheckCircle2 size={16} className="text-emerald-700" />
                                    <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-widest">Notify Complainant & IC Panel Head</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-12 pt-6 border-t border-gray-50 dark:border-gray-800">
                            <button onClick={() => setIsResolveModalOpen(false)} className="px-6 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cancel</button>
                            <button onClick={handleResolve} className="px-10 py-3 bg-emerald-600 text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:bg-emerald-700 transition-all">
                                <ShieldCheck size={18} /> Seal Case Dossier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
