"use client";
import { useEffect, useMemo, useState } from "react";
import { Target, TrendingUp, Clock, CheckCircle, AlertCircle, Star } from "lucide-react";
import Link from "next/link";

export default function AppraisalWidget({ data }) {
    if (!data) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>;

    const [currentAppraisal, setCurrentAppraisal] = useState(null);

    useEffect(() => {
        // Mock data - in real app, this would come from props or API
        const mockAppraisal = {
            cycle: "Q4 2024",
            status: "Pending", // Pending, Submitted, Reviewed
            submissionDeadline: "2024-12-31",
            currentScore: null,
            latestScore: 4.2,
            managerFeedback: null,
            daysUntilDeadline: 15
        };
        
        setCurrentAppraisal(mockAppraisal);
    }, [data]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            Pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} /> },
            Submitted: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle size={14} /> },
            Reviewed: { color: "bg-green-100 text-green-800", icon: <CheckCircle size={14} /> }
        };
        
        const config = statusConfig[status] || statusConfig.Pending;
        
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.icon}
                {status}
            </span>
        );
    };

    const getScoreColor = (score) => {
        if (!score) return "text-gray-500";
        if (score >= 4.5) return "text-emerald-600";
        if (score >= 4.0) return "text-green-600";
        if (score >= 3.5) return "text-blue-600";
        if (score >= 3.0) return "text-yellow-600";
        return "text-orange-600";
    };

    const getDeadlineUrgency = (days) => {
        if (days <= 3) return { color: "text-red-600", bg: "bg-red-50", label: "Urgent" };
        if (days <= 7) return { color: "text-orange-600", bg: "bg-orange-50", label: "Soon" };
        return { color: "text-green-600", bg: "bg-green-50", label: "On Track" };
    };

    const deadlineInfo = useMemo(() => {
        if (!currentAppraisal?.daysUntilDeadline) return null;
        return getDeadlineUrgency(currentAppraisal.daysUntilDeadline);
    }, [currentAppraisal]);

    const renderStars = (score) => {
        if (!score) return null;
        
        const fullStars = Math.floor(score);
        const hasHalfStar = score % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <div className="flex items-center gap-1">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
                {hasHalfStar && (
                    <Star size={14} className="fill-yellow-200 text-yellow-400" />
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} size={14} className="text-gray-300" />
                ))}
                <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">{score}</span>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                    <Target size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Performance</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Appraisal status & scores</p>
                </div>
            </div>

            <div className="space-y-3 flex-1">
                {/* Current Appraisal Status */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Current Cycle</span>
                    <div className="text-right">
                        <div className="text-xs text-gray-600 dark:text-gray-400">{currentAppraisal?.cycle}</div>
                        {getStatusBadge(currentAppraisal?.status)}
                    </div>
                </div>

                {/* Latest Score */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Latest Score</span>
                    <div className={getScoreColor(currentAppraisal?.latestScore)}>
                        {renderStars(currentAppraisal?.latestScore)}
                    </div>
                </div>

                {/* Deadline */}
                {currentAppraisal?.status === "Pending" && deadlineInfo && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Deadline</span>
                        <div className="text-right">
                            <div className={`text-xs font-medium ${deadlineInfo.color}`}>
                                {currentAppraisal.daysUntilDeadline} days left
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                                {deadlineInfo.label}
                            </span>
                        </div>
                    </div>
                )}

                {/* Manager Feedback (if available) */}
                {currentAppraisal?.managerFeedback && (
                    <div className="pt-3 border-t border-primary-100/50 dark:border-gray-700">
                        <div className="flex items-start gap-2">
                            <div className="p-1 bg-green-50 text-green-600 rounded">
                                <CheckCircle size={12} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Latest Feedback</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {currentAppraisal.managerFeedback}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Performance Trend */}
                {currentAppraisal?.latestScore && (
                    <div className="pt-3 border-t border-primary-100/50 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Performance Trend</span>
                            <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp size={14} />
                                <span className="text-xs font-medium">+0.3 from last cycle</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
                {currentAppraisal?.status === "Pending" ? (
                    <Link
                        href="/employee/performance/my-appraisal"
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-semibold"
                    >
                        Complete Appraisal
                    </Link>
                ) : (
                    <Link
                        href="/employee/performance/my-appraisal"
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-primary-200/60 dark:border-primary-500/20 text-primary-700 dark:text-primary-300 hover:bg-primary-50/60 dark:hover:bg-primary-500/10 transition-colors text-sm font-semibold rounded-xl"
                    >
                        View Appraisal
                    </Link>
                )}
                
                <Link
                    href="/employee/performance/history"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold rounded-xl"
                >
                    View History
                </Link>
            </div>
        </div>
    );
}
