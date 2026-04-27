'use client';

import React, { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import {
    Brain, ArrowLeft, Download, Users,
    TrendingUp, MessageSquare, BarChart3,
    Trophy, Activity, PieChart as PieChartIcon,
    ChevronRight, Calendar, Search, Layout, FileText,
    ArrowUpRight, Share2, MoreVertical, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { pulseSurveyService } from '@/services/hr-services/pulseSurveyService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function SurveyReportingPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFullTable, setShowFullTable] = useState(false);

    useEffect(() => {
        fetchSurveyReport();
    }, [id]);

    const fetchSurveyReport = async () => {
        try {
            const data = await pulseSurveyService.getSurveyById(id);
            setSurvey(data);
        } catch (error) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-gray-950">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Compiling Analytics...</p>
            </div>
        );
    }

    const totalResponses = survey?.responses?.length || 0;

    // Calculate Analytics
    const calculateAnalytics = () => {
        const stats = {
            nps: 0,
            avgLikert: 0,
            sentimentScore: 0,
            questionAverages: {}
        };

        if (totalResponses === 0) return stats;

        let totalNpsScore = 0;
        let likertTotal = 0;
        let likertCount = 0;

        survey.questions.forEach(q => {
            const answers = survey.responses.flatMap(r => r.answers.filter(a => a.questionId === q.id));
            if (q.type === 'LIKERT_SCALE') {
                const sum = answers.reduce((acc, curr) => acc + parseInt(curr.answerText || 0), 0);
                stats.questionAverages[q.id] = (sum / answers.length).toFixed(1);
                likertTotal += sum;
                likertCount += answers.length;
            } else if (q.type === 'NPS') {
                const scores = answers.map(a => parseInt(a.answerText || 0));
                const promoters = scores.filter(s => s >= 9).length;
                const detractors = scores.filter(s => s <= 6).length;
                stats.questionAverages[q.id] = Math.round(((promoters - detractors) / (scores.length || 1)) * 100);
            }
        });

        stats.avgLikert = likertCount > 0 ? (likertTotal / likertCount).toFixed(1) : 0;
        return stats;
    };

    const stats = calculateAnalytics();

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 p-4 sm:p-8 space-y-8">
            {/* Header Area */}
            <div className="space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Pulse Surveys", href: "/employee-pulse-surveys" },
                        { label: "Analytics Summary" },
                    ]}
                    rightContent={
                        <div className="flex gap-2">
                            {/* <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm font-bold uppercase text-[10px] tracking-widest shadow-sm hover:border-gray-300 transition-all">
                                <Download size={14} /> Export Node
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm font-bold uppercase text-[10px] tracking-widest shadow-sm hover:bg-primary-700 transition-all">
                                <Share2 size={14} /> Distribute
                            </button> */}
                        </div>
                    }
                />

                <div className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        Project Intelligence Report
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">Results for: <span className="text-primary-600">"{survey.title}"</span></p>
                </div>
            </div>

            {/* High-Level Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Payload Interactions', value: totalResponses, icon: Users, color: 'text-blue-500' },
                    { label: 'Network Engagement', value: `${(stats.avgLikert / 5 * 100).toFixed(0)}%`, icon: Activity, color: 'text-emerald-500' },
                    { label: 'NPS Core Index', value: stats.questionAverages[survey.questions.find(q => q.type === 'NPS')?.id] || 0, icon: Trophy, color: 'text-purple-500' },
                    { label: 'Average Valuation', value: stats.avgLikert, icon: TrendingUp, color: 'text-amber-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between group">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</span>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 leading-none">{stat.value}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-sm">
                            <stat.icon size={18} className={`${stat.color} opacity-80`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Quantitative Analysis */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="p-8 bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 pb-6">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <PieChartIcon size={16} className="text-primary-600" />
                                Metric Stratification
                            </h2>
                            <button onClick={() => setShowFullTable(true)} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary-600 flex items-center gap-1 transition-colors">
                                View Full Table <ArrowUpRight size={12} />
                            </button>
                        </div>

                        <div className="space-y-12">
                            {survey.questions.map((q, qIndex) => (
                                <div key={q.id} className="space-y-6 group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <span className="w-8 h-8 rounded-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                {String(qIndex + 1).padStart(2, '0')}
                                            </span>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm tracking-tight group-hover:text-primary-600 transition-colors uppercase">{q.questionText}</h4>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-primary-500 mt-1 block">{q.type}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                {stats.questionAverages[q.id] || '0.0'}
                                            </span>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                {q.type === 'LIKERT_SCALE' ? 'Rating' : q.type === 'NPS' ? 'Score' : 'Val'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Visualization */}
                                    <div className="pl-12">
                                        {q.type === 'LIKERT_SCALE' && (
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <div
                                                        key={star}
                                                        className={`h-1.5 flex-1 rounded-full ${star <= Math.round(stats.questionAverages[q.id]) ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {(q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOXES' || q.type === 'RADIO') && (
                                            <div className="space-y-3">
                                                {q.options?.map((opt, i) => {
                                                    const answers = survey.responses.flatMap(r => r.answers.filter(a => a.questionId === q.id));
                                                    const totalQuestionResponses = answers.length || 1;
                                                    let count = 0;

                                                    answers.forEach(a => {
                                                        const raw = String(a.answerText || a.answer || a.value || '').trim();
                                                        const optTrim = String(opt).trim();

                                                        if (raw) {
                                                            try {
                                                                const parsed = JSON.parse(raw);
                                                                if (Array.isArray(parsed)) {
                                                                    if (parsed.map(x => String(x).trim()).includes(optTrim)) {
                                                                        count++;
                                                                    }
                                                                } else if (String(parsed).trim() === optTrim) {
                                                                    count++;
                                                                } else if (raw === optTrim) {
                                                                    count++;
                                                                }
                                                            } catch (e) {
                                                                if (raw === optTrim || raw.includes(optTrim)) count++;
                                                            }
                                                        }
                                                    });

                                                    const percentage = totalQuestionResponses > 0 ? ((count / totalQuestionResponses) * 100).toFixed(0) : 0;

                                                    return (
                                                        <div key={i} className="flex items-center gap-4">
                                                            <span className="text-[10px] font-bold text-gray-400 w-32 truncate uppercase tracking-tight" title={opt}>{opt}</span>
                                                            <div className="flex-1 h-1.5 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500/80 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-400 w-12 text-right">{percentage}%</span>
                                                            <span className="text-[10px] font-bold text-gray-300 w-8">({count})</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        {q.type === 'NPS' && (
                                            <div className="space-y-2">
                                                <div className="h-1.5 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden flex">
                                                    <div className="bg-rose-500/80 h-full transition-all" style={{ width: '20%' }} />
                                                    <div className="bg-amber-500/80 h-full transition-all" style={{ width: '30%' }} />
                                                    <div className="bg-emerald-500/80 h-full transition-all" style={{ width: '50%' }} />
                                                </div>
                                                <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <span>Detractors</span>
                                                    <span>Passives</span>
                                                    <span>Promoters</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Qualitative Analysis */}
                <div className="space-y-6">
                    <div className="p-8 bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-gray-800 pb-4">
                            <h2 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare size={16} className="text-primary-600" />
                                Sentiment Feed
                            </h2>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Node</span>
                        </div>

                        <div className="flex-1 space-y-4">
                            {survey.responses.flatMap(r => r.answers.filter(a => survey.questions.find(q => q.id === a.questionId)?.type === 'OPEN_TEXT')).map((ans, i) => (
                                <div key={i} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-sm border border-gray-100 dark:border-gray-800/50 space-y-3 group hover:border-primary-100 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Authorized Entry</span>
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">{format(new Date(), 'MMM dd')}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                        "{ans.answerText}"
                                    </p>
                                </div>
                            ))}
                            {totalResponses === 0 && (
                                <div className="text-center py-20 bg-gray-50/50 rounded-sm border border-dashed border-gray-100">
                                    <FileText size={32} className="mx-auto mb-4 text-gray-200" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Textual Payload</p>
                                    <p className="text-[10px] text-gray-300 font-medium mt-1">Pending participant input.</p>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setShowFullTable(true)} className="w-full mt-8 py-3 bg-white dark:bg-gray-900 text-gray-400 border border-gray-200 dark:border-gray-800 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm">
                            View All Submissions
                        </button>
                    </div>
                </div>
            </div>

            {/* Full Table Modal */}
            {showFullTable && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:p-0">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowFullTable(false)} />
                    <div className="bg-white dark:bg-gray-900 w-full max-w-7xl rounded-sm shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Layout size={16} className="text-primary-600" />
                                Full Submission Report Table
                            </h3>
                            <button
                                onClick={() => setShowFullTable(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            <div className="rounded-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <div className="overflow-x-auto print:overflow-visible">
                                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-500 tracking-wider sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-6 py-4 border-y border-r border-gray-200 dark:border-gray-800 w-[150px]">Respondent</th>
                                                <th className="px-6 py-4 border-y border-r border-gray-200 dark:border-gray-800 w-[150px]">Date/Time</th>
                                                {survey?.questions?.map((q, i) => (
                                                    <th key={q.id} className="px-6 py-4 border-y border-r last:border-r-0 border-gray-200 dark:border-gray-800 max-w-[250px] whitespace-normal" title={q.questionText}>
                                                        <span className="text-primary-600">Q{i + 1}:</span> {q.questionText}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {survey?.responses?.length > 0 ? survey.responses.map((response, idx) => (
                                                <tr key={response.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                                                        {response.employee ? `${response.employee.firstName} ${response.employee.lastName}` : (survey.isAnonymous ? 'Anonymous' : 'Participant')}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-gray-500 border-r border-gray-100 dark:border-gray-800">
                                                        {response.submittedAt ? format(new Date(response.submittedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                                    </td>
                                                    {survey?.questions?.map(q => {
                                                        const ans = response.answers.find(a => a.questionId === q.id);
                                                        let displayValue = '-';
                                                        if (ans) {
                                                            const raw = String(ans.answerText || ans.answer || ans.value || '').trim();
                                                            if (raw) {
                                                                try {
                                                                    const parsed = JSON.parse(raw);
                                                                    displayValue = Array.isArray(parsed) ? parsed.join(', ') : String(parsed);

                                                                    // Fix for stringified primitives that might still have quotes
                                                                    if (displayValue.startsWith('"') && displayValue.endsWith('"')) {
                                                                        displayValue = displayValue.slice(1, -1);
                                                                    }
                                                                } catch (e) {
                                                                    displayValue = String(raw);
                                                                }
                                                            }
                                                        }
                                                        return (
                                                            <td key={q.id} className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400 border-r last:border-r-0 border-gray-100 dark:border-gray-800 max-w-[300px] whitespace-normal break-words" title={displayValue}>
                                                                {displayValue && displayValue !== 'undefined' ? displayValue : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={(survey?.questions?.length || 0) + 2} className="px-6 py-12 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
                                                        No submission data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                            <button
                                onClick={() => setShowFullTable(false)}
                                className="px-6 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
