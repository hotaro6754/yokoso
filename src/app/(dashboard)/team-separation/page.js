"use client";

import { useState, useEffect } from "react";
import { separationService } from "@/services/hr-services/separation-new.service";
import { toast } from "react-hot-toast";
import {
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Eye,
    MessageSquare,
    Loader2,
    FileText,
    UserX,
    Upload,
    Clock
} from "lucide-react";

const CountdownTimer = ({ createdAt }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const updateTimer = () => {
            const created = new Date(createdAt);
            const target = new Date(created.getTime() + 48 * 60 * 60 * 1000);
            const now = new Date();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("OVERDUE");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        const timer = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(timer);
    }, [createdAt]);

    if (timeLeft === "OVERDUE") {
        return <span className="text-red-600 font-bold animate-pulse">ESCALATED TO HR</span>;
    }

    return (
        <div className="flex items-center gap-1.5 text-amber-600 font-mono font-bold bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
            <Clock className="w-4 h-4 animate-spin-slow" />
            <span className="text-xs">Escalation in: {timeLeft}</span>
        </div>
    );
};

const MiniCountdown = ({ createdAt }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const updateTimer = () => {
            const created = new Date(createdAt);
            const target = new Date(created.getTime() + 48 * 60 * 60 * 1000);
            const now = new Date();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("0h");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${hours}h ${minutes}m`);
        };

        const timer = setInterval(updateTimer, 60000);
        updateTimer();
        return () => clearInterval(timer);
    }, [createdAt]);

    return <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">Ends in: {timeLeft}</span>;
};

export default function TeamSeparationPage() {
    const [resignations, setResignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewData, setReviewData] = useState({
        approved: true,
        ktPlanUrl: "",
        retentionNotes: "",
        notes: "",
        reason: ""
    });

    const resignationReasons = [
        "Better Opportunity", "Better Compensation", "Better Role", "Health Issues", 
        "Marriage", "Relocation", "Onsite opportunity", "Family Issues", 
        "Cultural Challenge", "Personal Reasons", "Manager issues", "Higher Studies", "Career Change"
    ];

    useEffect(() => {
        if (selectedRequest) {
            setReviewData({
                approved: true,
                ktPlanUrl: selectedRequest.ktPlanUrl || "",
                retentionNotes: selectedRequest.retentionNotes || "",
                notes: "",
                reason: selectedRequest.reason || ""
            });
        }
    }, [selectedRequest]);

    useEffect(() => {
        fetchTeamResignations();
    }, []);

    const fetchTeamResignations = async () => {
        try {
            setLoading(true);
            const response = await separationService.getDashboard({ status: 'PENDING' });
            if (response.success) {
                setResignations(response.data);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async () => {
        try {
            await separationService.managerReview(selectedRequest.id, reviewData);
            toast.success(`Request ${reviewData.approved ? 'Approved' : 'Rejected'}`);
            setSelectedRequest(null);
            fetchTeamResignations();
        } catch (error) {
            toast.error(error.message || "Action failed");
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Separation Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Review and manage resignation requests from your team.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* List of Resignations */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">Pending Requests</span>
                        </div>
                        <div className="divide-y dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                            {resignations.length > 0 ? resignations.map((req) => (
                                <button
                                    key={req.id}
                                    onClick={() => setSelectedRequest(req)}
                                    className={`w-full p-4 flex gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedRequest?.id === req.id ? "bg-brand-50/50 dark:bg-brand-900/20 border-l-4 border-brand-500" : ""}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center shrink-0">
                                        <UserX className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-sm truncate">{req.employee?.firstName} {req.employee?.lastName}</p>
                                                <p className="text-xs text-gray-500 truncate">{req.employee?.designation?.name || 'Employee'}</p>
                                            </div>
                                            {req.isEscalated ? (
                                                <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">ESCALATED</span>
                                            ) : (
                                                <MiniCountdown createdAt={req.createdAt} />
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">Resigned {new Date(req.resignationDate).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-medium text-gray-400">LWD: {new Date(req.lastWorkingDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </button>
                            )) : (
                                <div className="p-8 text-center text-gray-500">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No pending resignations</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed View & Action */}
                <div className="md:col-span-2">
                    {selectedRequest ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center">
                                        <UserX className="w-6 h-6 text-brand-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}</h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-sm text-gray-500">{selectedRequest.employee?.employeeId} | {selectedRequest.employee?.department?.name}</p>
                                            <CountdownTimer createdAt={selectedRequest.createdAt} />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-semibold">LWD Requested</p>
                                    <p className="text-lg font-bold text-brand-500">{new Date(selectedRequest.lastWorkingDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-brand-500" />
                                            Retention Summary
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold uppercase text-gray-500">Reason for Resignation <span className="text-red-500">*</span></label>
                                                <select
                                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-700 text-sm"
                                                    value={reviewData.reason}
                                                    onChange={(e) => setReviewData({ ...reviewData, reason: e.target.value })}
                                                >
                                                    <option value="">Select Reason</option>
                                                    {resignationReasons.map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold uppercase text-gray-500">Manager Retention Notes <span className="text-red-500">*</span></label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Summary of your retention discussion with the employee (min 10 chars)..."
                                                    className="w-full p-3 rounded-lg border dark:bg-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                    value={reviewData.retentionNotes}
                                                    onChange={(e) => setReviewData({ ...reviewData, retentionNotes: e.target.value })}
                                                />
                                                <p className="text-[10px] text-gray-400 italic">This is mandatory for approval.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-brand-500" />
                                            Approval Action
                                        </h3>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setReviewData({ ...reviewData, approved: true })}
                                                className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${reviewData.approved ? "bg-green-50 border-green-500 text-green-700 ring-4 ring-green-100 dark:bg-green-900/20" : "bg-white dark:bg-gray-800"}`}
                                            >
                                                <CheckCircle2 className="w-6 h-6" />
                                                <span className="font-bold">Approve</span>
                                            </button>
                                            <button
                                                onClick={() => setReviewData({ ...reviewData, approved: false })}
                                                className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${!reviewData.approved ? "bg-red-50 border-red-500 text-red-700 ring-4 ring-red-100 dark:bg-red-900/20" : "bg-white dark:bg-gray-800"}`}
                                            >
                                                <XCircle className="w-6 h-6" />
                                                <span className="font-bold">Reject</span>
                                            </button>
                                        </div>

                                        {reviewData.approved ? (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-2">
                                                    <Upload className="w-3 h-3" />
                                                    KT Plan URL <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="url"
                                                    placeholder="Link to KT doc / folder (Link is mandatory)"
                                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                    value={reviewData.ktPlanUrl}
                                                    onChange={(e) => setReviewData({ ...reviewData, ktPlanUrl: e.target.value })}
                                                />
                                                <p className="text-[10px] text-gray-400 italic">Upload KT plan to Drive/Sharepoint & paste link here.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-xs font-semibold uppercase text-gray-500">Rejection Reason</label>
                                                <textarea
                                                    placeholder="Why is this resignation being rejected?"
                                                    className="w-full p-2.5 rounded-lg border dark:bg-gray-700 text-sm"
                                                    value={reviewData.notes}
                                                    onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t dark:border-gray-700">
                                    <button
                                        onClick={handleReview}
                                        disabled={reviewData.approved && (!reviewData.retentionNotes?.trim() || !reviewData.ktPlanUrl?.trim() || !reviewData.reason)}
                                        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed ${reviewData.approved ? "bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none" : "bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none"}`}
                                    >
                                        {reviewData.approved && (!reviewData.retentionNotes?.trim() || !reviewData.ktPlanUrl?.trim() || !reviewData.reason) 
                                            ? "Complete All Fields to Approve" 
                                            : `Confirm ${reviewData.approved ? 'Approval' : 'Rejection'}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
                            <Eye className="w-16 h-16 mb-4 opacity-10" />
                            <p className="font-medium text-lg italic">Select a request to view details and take action.</p>
                            <p className="text-xs mt-2">You have 48 hours from submission to review the request.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
