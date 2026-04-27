'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, MoreVertical, Calendar,
    Users, BarChart2, Eye, Trash2, Edit, Send,
    ClipboardList, CheckCircle2, Clock, AlertCircle,
    Brain, PlusCircle, LayoutGrid, List, ChevronRight,
    TrendingUp, Activity, FileText, ArrowUpRight, Info, Download
} from 'lucide-react';
import * as XLSX from "xlsx";
import { toast } from 'react-hot-toast';
import { pulseSurveyService } from '@/services/hr-services/pulseSurveyService';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import Breadcrumb from '@/components/common/Breadcrumb';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

export default function PulseSurveysPage() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [activeTab, setActiveTab] = useState('PENDING'); // PENDING or COMPLETED
    const { user } = useAuth();

    // Confirmation Dialog State
    const [confirmDelete, setConfirmDelete] = useState({
        isOpen: false,
        surveyId: null
    });

    const rawRole = user?.systemRole || user?.role || 'EMPLOYEE';
    const userRole = String(rawRole).toUpperCase().replace(/[\s-]+/g, "_");
    const isHRorAdmin = [
        'HR_ADMIN', 'COMPANY_ADMIN', 'COMPANY_OWNER', 'MASTER_ADMIN', 'SUPER_ADMIN',
        'ADMIN', 'HR', 'MANAGER', 'DIRECTOR', 'DEPT_HEAD', 'DEPARTMENT_HEAD'
    ].includes(userRole);
    const isEmployeeView = !isHRorAdmin;

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            setLoading(true);
            const data = await pulseSurveyService.getAllSurveys();
            setSurveys(data);
        } catch (error) {
            toast.error('Failed to load surveys');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id) => {
        try {
            await pulseSurveyService.updateSurvey(id, { status: 'PUBLISHED' });
            toast.success('Survey published successfully!');
            fetchSurveys();
        } catch (error) {
            toast.error('Failed to publish survey');
        }
    };

    const handleExportReport = () => {
        try {
            const rows = (Array.isArray(surveys) ? surveys : []).map((survey) => ({
                Title: survey.title || "",
                Status: survey.status || "",
                Type: survey.type || "",
                Category: survey.category || "",
                Responses: survey._count?.responses || 0,
                "Created At": survey.createdAt ? format(new Date(survey.createdAt), "yyyy-MM-dd HH:mm") : "",
                "End Date": survey.endDate ? format(new Date(survey.endDate), "yyyy-MM-dd") : "",
                Published: survey.isPublished ? "Yes" : "No",
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Pulse Surveys");

            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            const dateStamp = format(new Date(), "yyyy-MM-dd");
            link.href = url;
            link.setAttribute("download", `pulse-surveys-report-${dateStamp}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Report exported successfully");
        } catch (error) {
            toast.error("Failed to export report");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PUBLISHED': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800';
            case 'DRAFT': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800';
            case 'EXPIRED': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800';
            case 'CLOSED': return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
            default: return 'bg-[var(--color-primary-hover)] text-[#0b1220] border-[var(--color-primary)]';
        }
    };

    const openDeleteConfirmation = (id) => {
        setConfirmDelete({
            isOpen: true,
            surveyId: id
        });
    };

    const handleDelete = async () => {
        const { surveyId } = confirmDelete;
        if (!surveyId) return;

        try {
            await pulseSurveyService.deleteSurvey(surveyId);
            toast.success('Survey deleted');
            fetchSurveys();
        } catch (error) {
            toast.error('Failed to delete survey');
        } finally {
            setConfirmDelete({ isOpen: false, surveyId: null });
        }
    };

    const filteredSurveys = (Array.isArray(surveys) ? surveys : []).filter(s => {
        if (!s) return false;

        const title = (s.title || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        const status = (s.status || '').toUpperCase();

        const matchesSearch = title.includes(search);
        const matchesStatus = filterType === 'ALL' || status === filterType.toUpperCase();

        if (isEmployeeView) {
            const isCompleted = Array.isArray(s.responses) && s.responses.length > 0;
            if (activeTab === 'PENDING') {
                const isInactive = ['CLOSED', 'EXPIRED', 'ARCHIVED'].includes(status);
                return matchesSearch && !isCompleted && !isInactive;
            }
            if (activeTab === 'COMPLETED') {
                return matchesSearch && isCompleted;
            }
        }

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-transparent [--color-primary:hsl(238,90%,28%)] [--color-primary-hover:hsl(238,90%,22%)] [--color-secondary:hsl(238,90%,95%)]">
                <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Processing Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-transparent p-4 sm:p-8 space-y-8 [--color-primary:hsl(238,90%,28%)] [--color-primary-hover:hsl(238,90%,22%)] [--color-secondary:hsl(238,90%,95%)]">

            {/* Header Area */}
            <div className="space-y-6">
                <Breadcrumb
                    rightContent={!isEmployeeView && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExportReport}
                                className="inline-flex items-center gap-2 rounded-sm bg-transparent border border-[var(--color-primary)] px-5 py-2.5 text-[var(--color-primary)] hover:border-[var(--color-primary-hover)] transition-all shadow-sm font-bold uppercase text-[10px] tracking-widest active:scale-95"
                            >
                                <Download size={16} /> Export Report
                            </button>
                            <Link
                                href="/employee-pulse-surveys/management/new"
                                className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-primary)] px-5 py-2.5 text-white hover:bg-[var(--color-primary-hover)] transition-all shadow-sm font-bold uppercase text-[10px] tracking-widest active:scale-95"
                            >
                                <Plus size={16} /> Initiate Project
                            </Link>
                        </div>
                    )}
                />

                <div className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <h1 className="text-2xl font-bold text-[var(--color-primary)]">Pulse Surveys</h1>
                    <p className="text-sm text-[var(--color-primary)]/70 font-medium tracking-tight">Real-time personnel sentiment and engagement intelligence</p>
                </div>
            </div>

            {/* Stats Dashboard */}
            {!isEmployeeView && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Live Projects', value: surveys.filter(s => s.status === 'PUBLISHED').length, icon: Activity },
                        { label: 'Pending Drafts', value: surveys.filter(s => s.status === 'DRAFT').length, icon: FileText },
                        { label: 'Total Responses', value: surveys.reduce((acc, curr) => acc + (curr._count?.responses || 0), 0), icon: Users },
                        { label: 'Avg Participation', value: '72%', icon: TrendingUp },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-transparent p-6 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between group">
                            <div>
                                <span className="text-[10px] font-bold text-[var(--color-primary)]/70 uppercase tracking-widest leading-none">{stat.label}</span>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 leading-none">{stat.value}</p>
                            </div>
                            <div className="p-3 bg-[var(--color-secondary)] dark:bg-gray-800 rounded-sm border border-[var(--color-primary)]/40">
                                <stat.icon size={18} className="text-[var(--color-primary)]" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Employee Tabs */}
            {isEmployeeView && (
                <div className="flex bg-white dark:bg-transparent p-1 rounded-sm border border-gray-200 dark:border-gray-800 w-fit shadow-sm">
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${activeTab === 'PENDING' ? 'bg-[var(--color-primary)] text-[#0b1220] shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'}`}
                    >
                        Pending Actions
                    </button>
                    <button
                        onClick={() => setActiveTab('COMPLETED')}
                        className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${activeTab === 'COMPLETED' ? 'bg-[var(--color-primary)] text-[#0b1220] shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'}`}
                    >
                        History
                    </button>
                </div>
            )}

            {/* Search & Filters */}
            <div className="bg-white dark:bg-transparent p-1 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)] w-3.5 h-3.5" />
                    <input
                        type="text"
                        placeholder="Filter measures by designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 dark:bg-transparent border-none rounded-sm outline-none font-medium placeholder:text-[var(--color-primary)]/40 focus:ring-0 transition-all text-gray-900 dark:text-white"
                    />
                </div>
                {!isEmployeeView && (
                    <div className="flex items-center bg-gray-50 dark:bg-transparent rounded-sm px-4">
                        <Filter size={14} className="text-[var(--color-primary)] mr-2" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent border-none py-3 text-[10px] font-bold uppercase tracking-widest outline-none text-[var(--color-primary)]/70 cursor-pointer min-w-[120px]"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Table Format */}
            <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm overflow-hidden mb-20">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[color:var(--color-secondary)] border-b border-[var(--color-primary)]/30 dark:bg-[#2a2e4a] dark:border-[#3a4063]">
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Measure Identification</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Protocol Type</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Interaction State</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Expiration</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Participation</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Node Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredSurveys.map((survey) => (
                                <tr key={survey.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-sm bg-[var(--color-secondary)] dark:bg-primary-950/20 flex items-center justify-center text-[var(--color-primary)] border border-[var(--color-primary)]/40">
                                                <Brain size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[var(--color-primary)] transition-colors uppercase tracking-tight">{survey.title}</p>
                                                <p className="text-[10px] text-gray-400 font-medium tracking-tight truncate max-w-[200px]">{survey.description || 'System engagement node.'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <Activity size={12} className="text-[var(--color-primary)]/70" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{survey.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(survey.status)}`}>
                                            {survey.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            <Calendar size={12} className="text-[var(--color-primary)]/70" />
                                            {survey.endDate ? format(new Date(survey.endDate), 'MMM dd, yyyy') : '--'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {!isEmployeeView && survey.status !== 'DRAFT' ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[var(--color-primary)]"
                                                        style={{ width: `${Math.min(100, (survey._count?.responses || 0) * 5)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-900 dark:text-white">{survey._count?.responses || 0}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">--</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {isEmployeeView && survey.status === 'PUBLISHED' && activeTab === 'PENDING' ? (
                                                <Link
                                                    href={`/employee-pulse-surveys/participation/${survey.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-sm text-[9px] font-bold uppercase tracking-widest shadow-sm hover:bg-[var(--color-primary-hover)] transition-all active:scale-95"
                                                >
                                                    <Send size={12} /> Start
                                                </Link>
                                            ) : isEmployeeView && activeTab === 'COMPLETED' ? (
                                                <span className="flex items-center gap-1.5 text-emerald-600 text-[9px] font-bold uppercase tracking-widest">
                                                    <CheckCircle2 size={12} /> Confirmed
                                                </span>
                                            ) : (
                                                <>
                                                <Link
                                                    href={`/employee-pulse-surveys/participation/${survey.id}`}
                                                    title="Preview"
                                                    className="p-2 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 rounded-sm text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all"
                                                >
                                                    <Eye size={14} />
                                                </Link>
                                                <Link
                                                    href={`/employee-pulse-surveys/reporting/${survey.id}`}
                                                    title="Insights"
                                                    className="p-2 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 rounded-sm text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all"
                                                >
                                                        <BarChart2 size={14} />
                                                    </Link>
                                                    {(survey.status === 'DRAFT' || !survey.status) && (
                                                        <button
                                                            onClick={() => handlePublish(survey.id)}
                                                            title="Publish"
                                                            className="p-2 bg-[var(--color-primary)] text-white rounded-sm hover:bg-[var(--color-primary-hover)] transition-all shadow-sm"
                                                        >
                                                            <Send size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openDeleteConfirmation(survey.id)}
                                                        title="Delete"
                                                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[var(--color-primary)]/50 hover:text-rose-500 rounded-sm transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSurveys.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <AlertCircle size={32} className="text-gray-200 mb-4" />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No matching nodes identified</p>
                                            <p className="text-[10px] text-gray-300 font-medium mt-1">Adjust your filtration parameters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-4 bg-transparent border border-[var(--color-primary)]/50 rounded-sm flex gap-3">
                <Info size={14} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[var(--color-primary)]/70 font-bold uppercase tracking-widest leading-relaxed">
                    Data synchronization active. Analytical payloads are derived from live participant interaction nodes.
                </p>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, surveyId: null })}
                onConfirm={handleDelete}
                title="Delete Interaction Node"
                message="Are you sure you want to terminate this engagement measure? This action will result in permanent loss of all associated response entries."
                confirmText="Terminate Node"
                isDestructive={true}
            />
        </div>
    );
}
