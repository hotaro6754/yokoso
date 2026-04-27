"use client";

import { useState, useEffect } from "react";
import { separationService } from "@/services/hr-services/separation-new.service";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
    Users,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    MoreVertical,
    ChevronRight,
    FileText,
    Edit,
    UserX,
    CreditCard,
    History,
    ShieldCheck,
    Loader2,
    Calendar,
    ExternalLink,
    XCircle,
    CalendarDays,
    X,
    Eye,
    AlertCircle,
    Send,
    UserMinus,
    UserPlus,
    DollarSign,
    Ban,
    Target,
    ChevronDown,
    UserCheck,
    HeartHandshake,
    ThumbsUp,
    ThumbsDown,
    Info
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

export default function HRSeparationPage() {
    const { user: currentUser } = useAuth();
    const [resignations, setResignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("SUBMITTED");
    const [search, setSearch] = useState("");
    const [selectedResignation, setSelectedResignation] = useState(null);
    const [stats, setStats] = useState({ onNotice: 0, exitInterviews: 0, ffProcessing: 0, bulkGeneration: 0 });
    const [recentAlumni, setRecentAlumni] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);

    // Modals
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [isProcessLwdManual, setIsProcessLwdManual] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    // Form States
    const [processData, setProcessData] = useState({
        employeeId: "",
        separationType: "RESIGNATION",
        reason: "",
        reasonDetails: "",
        lastWorkingDate: "",
        appliedDate: todayIso()
    });

    const [approvalData, setApprovalData] = useState({
        approved: true,
        voluntaryInvoluntary: "VOLUNTARY",
        doNotHire: false,
        doNotHireReason: "",
        payrollSalaryHold: false,
        waiveOff: false,
        waiveOffReason: "",
        eligibleForRehire: true,
        lastWorkingDate: "",
        notes: ""
    });

    const [editData, setEditData] = useState({ id: null, lastWorkingDate: "" });
    const [interviewDate, setInterviewDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const reasonsMap = {
        RESIGNATION: [
            "Better Opportunity", "Better Compensation", "Better Role", "Health Issues", 
            "Marriage", "Relocation", "Onsite opportunity", "Family Issues", 
            "Cultural Challenge", "Personal Reasons", "Manager issues"
        ],
        TERMINATION: [
            "Absconding", "No show after DOJ", "Death", "Misconduct", 
            "Disciplinary Issues", "Performance Issues", "Retirement", "Termination"
        ]
    };

    useEffect(() => {
        fetchResignations();
        fetchStats();
        fetchEmployees();
    }, [activeTab]);

    const openProcessModal = () => {
        setProcessData({
            employeeId: "",
            separationType: "RESIGNATION",
            reason: "",
            reasonDetails: "",
            lastWorkingDate: "",
            appliedDate: todayIso()
        });
        setIsProcessLwdManual(false);
        setShowProcessModal(true);
    };

    const closeProcessModal = () => {
        setShowProcessModal(false);
        setProcessData({
            employeeId: "",
            separationType: "RESIGNATION",
            reason: "",
            reasonDetails: "",
            lastWorkingDate: "",
            appliedDate: todayIso()
        });
        setIsProcessLwdManual(false);
    };

    useEffect(() => {
        // Auto-populate Last Working Date based on Applied Date + notice period
        if (!showProcessModal) return;
        if (isProcessLwdManual) return;

        const targetId = processData.employeeId ? Number(processData.employeeId) : NaN;
        const selectedEmployee = Number.isFinite(targetId)
            ? allEmployees.find((emp) => Number(emp.employee?.id || emp.id) === targetId)
            : null;
        const rawNotice = selectedEmployee?.employee?.noticePeriod ?? selectedEmployee?.noticePeriod ?? 30;
        const parsedNotice = parseInt(rawNotice, 10);
        const noticeDays = Number.isFinite(parsedNotice) ? Math.max(0, parsedNotice) : 30;

        const applied = processData.appliedDate || todayIso();
        const computed = addDaysToIsoDate(applied, noticeDays);
        setProcessData((prev) => (prev.lastWorkingDate === computed ? prev : { ...prev, lastWorkingDate: computed }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showProcessModal, isProcessLwdManual, processData.employeeId, processData.appliedDate, allEmployees]);

    const fetchEmployees = async () => {
        try {
            const response = await apiClient.get("/employees/get-employees?limit=1000"); // Corrected Route
            if (response.data?.success) {
                setAllEmployees(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await separationService.getHRDashboardStats();
            if (response && response.success) {
                // Handle cases where data might be nested or top-level depending on interceptors/service
                const dashboardData = response.data || response;
                setStats(dashboardData.counts || { onNotice: 0, exitInterviews: 0, ffProcessing: 0, bulkGeneration: 0 });
                setRecentAlumni(dashboardData.recentAlumni || []);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchResignations = async () => {
        try {
            setLoading(true);
            const statusMap = {
                "SUBMITTED": "PENDING",
                "PENDING_HR": "MANAGER_APPROVED",
                "ACTIVE_NOTICE": "ACTIVE_NOTICE",
                "F&F": "F&F",
                "SETTLED": "COMPLETED"
            };

            const response = await separationService.getDashboard({ status: statusMap[activeTab] });
            if (response && response.success) {
                // Robust extraction: check response.data (array/object) or the object itself
                let dataArray = [];
                if (Array.isArray(response.data)) {
                    dataArray = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    dataArray = response.data.data;
                } else if (Array.isArray(response)) {
                    dataArray = response;
                }
                setResignations(dataArray);
            } else {
                setResignations([]);
            }
        } catch (error) {
            console.error("Error fetching resignations:", error);
            setResignations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessSubmit = async (e) => {
        e.preventDefault();
        try {
            const normalizeDate = (val) => {
                if (!val) return "";
                if (val instanceof Date) {
                    return isNaN(val.getTime()) ? "" : val.toISOString().split("T")[0];
                }
                const str = String(val).trim();
                if (!str) return "";
                if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
                if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
                    const [d, m, y] = str.split("-");
                    return `${y}-${m}-${d}`;
                }
                const parsed = new Date(str);
                return isNaN(parsed.getTime()) ? "" : parsed.toISOString().split("T")[0];
            };

            const appliedDate = normalizeDate(processData.appliedDate);
            const lastWorkingDate = normalizeDate(processData.lastWorkingDate);
            const employeeId = processData.employeeId ? Number(processData.employeeId) : NaN;

            if (!Number.isFinite(employeeId)) {
                toast.error("Please select a valid employee");
                return;
            }
            if (!appliedDate) {
                toast.error("Please select a valid applied date");
                return;
            }
            if (!lastWorkingDate) {
                toast.error("Please select a valid last working date");
                return;
            }

            setSubmitting(true);
            const response = await separationService.submitResignation({
                ...processData,
                employeeId,
                appliedDate,
                lastWorkingDate
            });
            if (response.success) {
                toast.success("Separation processing initiated!");
                closeProcessModal();
                fetchResignations();
            }
        } catch (error) {
            const serverMessage = error?.response?.data?.message;
            toast.error(serverMessage || error.message || "Failed to initiate process");
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprovalSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await separationService.hrApproval(selectedResignation.id, approvalData);
            toast.success(approvalData.approved ? "Resignation Approved by HR" : "Resignation Rejected");
            setShowApprovalModal(false);
            fetchResignations();
            fetchStats();
        } catch (error) {
            toast.error(error.message || "Action failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompleteSettlement = async (id) => {
        try {
            await separationService.completeSeparation(id);
            toast.success("Separation completed and moved to Alumni");
            fetchResignations();
            fetchStats();
        } catch (error) {
            toast.error(error.message || "Failed to complete separation");
        }
    };

    const areAllClearancesDone = (req) => {
        const requiredDepts = ['IT', 'FINANCE', 'ADMIN', 'HR'];
        return requiredDepts.every(dept =>
            req.clearances?.find(c => c.department === dept)?.status === 'CLEAR'
        );
    };

    const handleUpdateResignation = async (e) => {
        e.preventDefault();
        try {
            await separationService.updateResignation(editData.id, { lastWorkingDate: editData.lastWorkingDate });
            toast.success("Last working date updated successfully");
            setShowEditModal(false);
            fetchResignations();
            fetchStats();
        } catch (err) {
            toast.error(err.message || "Update failed");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-500 rounded-lg text-white shadow-sm">
                        <UserMinus className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Separation & Exit Hub</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                             System management for employee transitions, clearances and alumni assets.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <button 
                        onClick={openProcessModal}
                        className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
                    >
                        <UserPlus className="w-4 h-4" />
                        Initiate Separation
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-lg font-semibold text-amber-500">{stats.onNotice}</p>
                            <p className="text-[10px] uppercase text-gray-400">Active Notice</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-blue-500">{stats.ffProcessing}</p>
                            <p className="text-[10px] uppercase text-gray-400">Ongoing Cases</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-2 rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 w-fit">
                {[
                    { id: "SUBMITTED", label: "Resignation Requests", icon: Send, color: "text-indigo-500" },
                    { id: "PENDING_HR", label: "Pending HR Approval", icon: ShieldCheck, color: "text-amber-500" },
                    { id: "ACTIVE_NOTICE", label: "Active Notice Period", icon: Clock, color: "text-blue-500" },
                    { id: "F&F", label: "Settlement Phase", icon: CreditCard, color: "text-purple-500" },
                    { id: "SETTLED", label: "Alumni Archive", icon: History, color: "text-emerald-500" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold transition-all ${activeTab === tab.id 
                            ? "bg-brand-50 text-brand-700 border border-brand-100 dark:bg-brand-900/20 dark:text-brand-200 dark:border-brand-800" 
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                    >
                        <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? "text-brand-600 dark:text-brand-300" : "opacity-40"}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find by Name, ID or Designation..."
                            className="block w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 text-sm focus:border-brand-500 focus:ring-0 outline-none transition-all placeholder:text-gray-400 font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        Live Separation Pulse
                    </div>
                </div>

                {loading ? (
                    <div className="p-40 flex flex-col items-center justify-center gap-6">
                        <div className="relative flex items-center justify-center">
                            <div className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-brand-400 opacity-20"></div>
                            <Loader2 className="animate-spin w-12 h-12 text-brand-600 relative z-10" />
                        </div>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">Synchronizing Records</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase text-gray-500">Employee Identity</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">Exit Reason & Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">Critical Dates</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-500">Clearance Progress</th>
                                    <th className="px-8 py-4 text-right text-xs font-semibold uppercase text-gray-500">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {resignations.filter(r => {
                                    const fullName = `${r.employee?.firstName || ""} ${r.employee?.lastName || ""}`.toLowerCase();
                                    const empCode = (r.employee?.employeeCode || r.employee?.employeeId || "").toString().toLowerCase();
                                    const searchTerm = search.toLowerCase();
                                    return fullName.includes(searchTerm) || empCode.includes(searchTerm);
                                }).map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-100 font-bold text-sm">
                                                        {req.employee?.firstName?.[0]}{req.employee?.lastName?.[0]}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${req.separationType === 'TERMINATION' ? 'bg-rose-500' : 'bg-indigo-500'} flex items-center justify-center shadow-lg`}>
                                                        {req.separationType === 'TERMINATION' ? <Ban className="w-2.5 h-2.5 text-white" /> : <Send className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-extrabold text-gray-900 dark:text-white uppercase tracking-tight text-sm">{req.employee?.firstName} {req.employee?.lastName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-600 font-black px-2 py-0.5 rounded-md border dark:border-gray-700">{req.employee?.employeeCode || req.employee?.employeeId}</span>
                                                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">{req.employee?.designation?.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                                                        req.separationType === 'TERMINATION' 
                                                        ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800"
                                                        : "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800"
                                                    }`}>
                                                        {req.separationType || 'RESIGNATION'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                                        req.status.includes('APPROVED') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {req.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-medium text-gray-500 italic truncate max-w-[180px]">"{req.reason}"</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase w-12">Applied</p>
                                                    <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{new Date(req.resignationDate).toLocaleDateString('en-GB')}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-1 rounded-full bg-rose-400"></div>
                                                    <p className="text-[9px] font-bold text-rose-400 uppercase w-12">Last Day</p>
                                                    <p className="text-[11px] font-black text-rose-600">{new Date(req.lastWorkingDate).toLocaleDateString('en-GB')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center -space-x-1.5">
                                                {['IT', 'FIN', 'ADM', 'HR'].map((dept, i) => {
                                                    const isCleared = req.clearances?.find(c => c.department.startsWith(dept))?.status === 'CLEAR';
                                                    return (
                                                        <div 
                                                            key={i} 
                                                            title={dept} 
                                                            className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[10px] font-black border-2 transition-all duration-300 ${
                                                                isCleared 
                                                                ? "bg-indigo-600 border-indigo-400 text-white z-20 shadow-lg shadow-indigo-200 dark:shadow-none scale-110" 
                                                                : "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 z-10 opacity-70"
                                                            }`}
                                                        >
                                                            {isCleared ? <CheckCircle2 className="w-4 h-4" /> : dept}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {(activeTab === 'PENDING_HR' || activeTab === 'SUBMITTED') && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedResignation(req);
                                                            setApprovalData({
                                                                ...approvalData,
                                                                approved: true,
                                                                voluntaryInvoluntary: req.separationType === 'TERMINATION' ? 'INVOLUNTARY' : 'VOLUNTARY',
                                                                lastWorkingDate: new Date(req.lastWorkingDate).toISOString().split('T')[0]
                                                            });
                                                            setShowApprovalModal(true);
                                                        }}
                                                        className="h-10 w-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-brand-500 hover:text-brand-600 transition-all text-gray-400 shadow-sm"
                                                        title="Manage"
                                                    >
                                                        <UserCheck size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedResignation(req);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="h-10 w-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-brand-500 hover:text-brand-600 transition-all text-gray-400 shadow-sm"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>



            {/* View Modal */}
            {showViewModal && selectedResignation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-sm w-full max-w-3xl shadow-sm overflow-visible max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-100 font-bold text-lg">
                                {selectedResignation.employee?.firstName?.[0]}{selectedResignation.employee?.lastName?.[0]}
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedResignation.employee?.firstName} {selectedResignation.employee?.lastName}</h3>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedResignation.employee?.designation?.name} • {selectedResignation.employee?.employeeCode || selectedResignation.employee?.employeeId}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-gray-800">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Exit Concept", value: selectedResignation.separationType || "RESIGNATION", color: "text-brand-600" },
                                    { label: "Global Status", value: selectedResignation.status?.replace('_', ' '), color: "text-amber-600" },
                                    { label: "Notification Date", value: new Date(selectedResignation.resignationDate).toLocaleDateString('en-GB'), color: "text-gray-900 dark:text-white" },
                                    { label: "Last Working Date", value: new Date(selectedResignation.lastWorkingDate).toLocaleDateString('en-GB'), color: "text-rose-600" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-1">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                        <p className={`font-semibold text-xs truncate ${stat.color}`}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {(selectedResignation.status === 'HR_APPROVED' || selectedResignation.status === 'F&F' || selectedResignation.status === 'COMPLETED') && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-sm border border-gray-200 dark:border-gray-700 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-brand-600" />
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">HR Administrative Insight</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 uppercase">Nature</span>
                                            <span className="text-gray-900 dark:text-white uppercase">{selectedResignation.voluntaryInvoluntary || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 uppercase">Rehire Index</span>
                                            <span className={selectedResignation.eligibleForRehire ? 'text-emerald-600' : 'text-red-600'}>{selectedResignation.eligibleForRehire ? 'Eligible' : 'Restricted'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 uppercase">No-Hire Flag</span>
                                            <span className="text-gray-900 dark:text-white">{selectedResignation.doNotHire ? 'ACTIVE' : 'INACTIVE'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 uppercase">Salary Control</span>
                                            <span className={selectedResignation.payrollSalaryHold ? 'text-amber-600' : 'text-emerald-600'}>{selectedResignation.payrollSalaryHold ? 'HOLD' : 'NO HOLD'}</span>
                                        </div>
                                    </div>
                                    {selectedResignation.doNotHireReason && (
                                        <div className="text-xs text-red-600">Restriction reason: {selectedResignation.doNotHireReason}</div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Departure Manifest</h4>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-sm border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">"{selectedResignation.reason}"</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {selectedResignation.reasonDetails || "No additional context was provided during the application process."}
                                    </p>
                                </div>
                            </div>

                            {/* <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Clearance Matrix</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {['IT', 'FINANCE', 'ADMIN', 'HR'].map((dept) => {
                                        const c = selectedResignation.clearances?.find(item => item.department === dept);
                                        const isCleared = c?.status === 'CLEAR';
                                        return (
                                            <div key={dept} className="p-3 rounded-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                                                <span className="font-semibold text-gray-700 dark:text-gray-200">{dept}</span>
                                                <span className={isCleared ? 'text-emerald-600' : 'text-amber-600'}>{c?.status || 'PENDING'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div> */}

                            <div className="flex items-center justify-end pt-2">
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-6 py-2 rounded-sm border border-gray-200 text-xs font-semibold tracking-widest text-gray-700 uppercase hover:bg-gray-50 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && selectedResignation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-sm w-full max-w-2xl shadow-sm overflow-visible my-auto animate-in fade-in slide-in-from-bottom-8 duration-300 border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-100 dark:bg-brand-900/40 rounded-md text-brand-600">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">HR Adjudication</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Final validation of separation details.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowApprovalModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all"><X size={18} /></button>
                        </div>
                        <form className="p-6 space-y-6" onSubmit={handleApprovalSubmit}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Separation Class</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none focus:border-brand-500 transition-all uppercase"
                                        value={approvalData.voluntaryInvoluntary}
                                        onChange={(e) => setApprovalData({...approvalData, voluntaryInvoluntary: e.target.value})}
                                    >
                                        <option value="VOLUNTARY">Voluntary (Ex: Resigned)</option>
                                        <option value="INVOLUNTARY">Involuntary (Ex: Terminated)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Approved Last Working Date</label>
                                    <DatePickerField
                                        required
                                        name="lastWorkingDate"
                                        value={approvalData.lastWorkingDate}
                                        onChange={(val) => setApprovalData({...approvalData, lastWorkingDate: val})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-900/40 rounded-sm border border-gray-200 dark:border-gray-700">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => setApprovalData({...approvalData, eligibleForRehire: !approvalData.eligibleForRehire})}>
                                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Rehire Index</span>
                                        <div className={`w-12 h-6 rounded-full transition-all relative ${approvalData.eligibleForRehire ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${approvalData.eligibleForRehire ? 'left-7' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => setApprovalData({...approvalData, payrollSalaryHold: !approvalData.payrollSalaryHold})}>
                                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Salary Access Hold</span>
                                        <div className={`w-12 h-6 rounded-full transition-all relative ${approvalData.payrollSalaryHold ? 'bg-amber-500 shadow-lg shadow-amber-100' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${approvalData.payrollSalaryHold ? 'left-7' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => setApprovalData({...approvalData, waiveOff: !approvalData.waiveOff})}>
                                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Waiver Applied</span>
                                        <div className={`w-12 h-6 rounded-full transition-all relative ${approvalData.waiveOff ? 'bg-brand-500 shadow-lg shadow-brand-100' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${approvalData.waiveOff ? 'left-7' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => setApprovalData({...approvalData, doNotHire: !approvalData.doNotHire})}>
                                        <span className="text-[11px] font-semibold text-red-500 uppercase tracking-widest">Global No-Hire</span>
                                        <div className={`w-12 h-6 rounded-full transition-all relative ${approvalData.doNotHire ? 'bg-red-500 shadow-lg shadow-red-100' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${approvalData.doNotHire ? 'left-7' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {approvalData.doNotHire && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <label className="text-[10px] font-semibold uppercase text-red-400 tracking-widest">Restricted Hire Reason</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-red-50/30 dark:bg-red-900/10 rounded-sm border border-red-200 dark:border-red-900 text-xs font-semibold outline-none focus:border-red-500 transition-all"
                                            placeholder="Specify reason for restriction..."
                                            value={approvalData.doNotHireReason}
                                            onChange={(e) => setApprovalData({...approvalData, doNotHireReason: e.target.value})}
                                        />
                                    </div>
                                )}
                                {approvalData.waiveOff && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <label className="text-[10px] font-semibold uppercase text-brand-400 tracking-widest">Waiver Justification</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-brand-50/30 dark:bg-brand-900/10 rounded-sm border border-brand-200 dark:border-brand-900 text-xs font-semibold outline-none focus:border-brand-500 transition-all"
                                            placeholder="Specify reason for notice waiver..."
                                            value={approvalData.waiveOffReason}
                                            onChange={(e) => setApprovalData({...approvalData, waiveOffReason: e.target.value})}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Administrative Notes</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand-500 min-h-[120px] transition-all resize-none"
                                    placeholder="Provide any additional context or retention attempts..."
                                    value={approvalData.notes}
                                    onChange={(e) => setApprovalData({...approvalData, notes: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setApprovalData({...approvalData, approved: false})}
                                    className={`flex-1 py-3 rounded-sm font-semibold text-xs tracking-widest transition-all ${!approvalData.approved ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {!approvalData.approved && <ThumbsDown size={14} className="inline mr-2" />}
                                    REJECT REQUEST
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setApprovalData({...approvalData, approved: true})}
                                    className={`flex-1 py-3 rounded-sm font-semibold text-xs tracking-widest transition-all ${approvalData.approved ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {approvalData.approved && <ThumbsUp size={14} className="inline mr-2" />}
                                    CONFIRM APPROVAL
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-sm font-semibold text-sm tracking-widest shadow-sm hover:bg-gray-800 transition-all disabled:opacity-50 uppercase flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><ShieldCheck size={20} /> EXECUTE DECISION</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modern Separation Modal */}
            {showProcessModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-black/50"
                        onClick={closeProcessModal}
                    />
                    
                    <div className="relative bg-white dark:bg-gray-800 rounded-sm w-full max-w-lg shadow-sm overflow-visible animate-in zoom-in duration-200 border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-100 dark:bg-brand-900/40 rounded-md text-brand-600">
                                    <UserMinus size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Initiate Separation</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrative workflow</p>
                                </div>
                            </div>
                            <button 
                                onClick={closeProcessModal} 
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form className="p-6 space-y-5" onSubmit={handleProcessSubmit}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                    <Users size={12} /> Target Employee
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand-500 transition-all appearance-none"
                                        value={processData.employeeId}
                                        onChange={(e) => setProcessData({...processData, employeeId: e.target.value})}
                                    >
                                        <option value="">Select Identity...</option>
                                        {allEmployees.map(emp => (
                                            <option key={emp.id} value={emp.employee?.id || emp.id}>
                                                {emp.firstName} {emp.lastName} ({emp.employeeCode || emp.employeeId || 'N/A'})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setProcessData({...processData, separationType: 'RESIGNATION', reason: ''})}
                                            className={`flex-1 py-2 rounded-sm text-[10px] font-semibold transition-all ${processData.separationType === 'RESIGNATION' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-white border border-gray-200 text-gray-500'}`}
                                        >
                                            RESIGN
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProcessData({...processData, separationType: 'TERMINATION', reason: ''})}
                                            className={`flex-1 py-2 rounded-sm text-[10px] font-semibold transition-all ${processData.separationType === 'TERMINATION' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-white border border-gray-200 text-gray-500'}`}
                                        >
                                            TERM
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Primary Reason</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none focus:border-brand-500 transition-all appearance-none uppercase"
                                            value={processData.reason}
                                            onChange={(e) => setProcessData({...processData, reason: e.target.value})}
                                        >
                                            <option value="">Select...</option>
                                            {reasonsMap[processData.separationType].map(r => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Applied Date</label>
                                    <DatePickerField
                                        required
                                        name="appliedDate"
                                        value={processData.appliedDate}
                                        onChange={(val) => setProcessData({...processData, appliedDate: val})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Last Working Date</label>
                                    <DatePickerField
                                        required
                                        name="lastWorkingDate"
                                        value={processData.lastWorkingDate}
                                        onChange={(val) => {
                                            setProcessData((prev) => ({ ...prev, lastWorkingDate: val }));
                                            setIsProcessLwdManual(Boolean(val));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Executive Context</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand-500 min-h-[90px] transition-all resize-none"
                                    placeholder="Circumstances for this separation..."
                                    value={processData.reasonDetails}
                                    onChange={(e) => setProcessData({...processData, reasonDetails: e.target.value})}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-brand-600 text-white rounded-sm font-semibold text-xs tracking-widest shadow-sm hover:bg-brand-700 transition-all disabled:opacity-50 uppercase flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <><Send size={16} /> Commit Action</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
