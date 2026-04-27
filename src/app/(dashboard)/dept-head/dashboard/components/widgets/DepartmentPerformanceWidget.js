"use client";
import { useEffect, useMemo, useState } from "react";
import { Users, TrendingUp, TrendingDown, Star, Clock, CheckCircle, AlertCircle, Award, Briefcase } from "lucide-react";
import Link from "next/link";

export default function DepartmentPerformanceWidget({ data }) {
    if (!data) return <div className="animate-pulse h-32 bg-gray-50 dark:bg-gray-800 rounded-sm"></div>;

    const [departmentData, setDepartmentData] = useState(null);

    useEffect(() => {
        // Mock data - in real app, this would come from props or API
        const mockDepartmentData = {
            averageScore: 4.1,
            managersRated: 3,
            totalManagers: 5,
            topManagers: [
                { name: "David Thompson", score: 4.5, trend: "up" },
                { name: "Lisa Anderson", score: 4.3, trend: "up" }
            ],
            cycle: "Q4 2024",
            deadline: "2024-12-31",
            daysUntilDeadline: 10,
            pendingReviews: 2,
            completedReviews: 3,
            departmentName: "Engineering"
        };

        setDepartmentData(mockDepartmentData);
    }, [data]);

    const getScoreColor = (score) => {
        if (score >= 4.5) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
        if (score >= 4.0) return "text-green-500 bg-green-50 dark:bg-green-900/20";
        if (score >= 3.5) return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
        if (score >= 3.0) return "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
        return "text-rose-500 bg-rose-50 dark:bg-rose-900/20";
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case "up":
                return <TrendingUp size={12} className="text-emerald-500" />;
            case "down":
                return <TrendingDown size={12} className="text-rose-500" />;
            default:
                return <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm" />;
        }
    };

    const getDeadlineUrgency = (days) => {
        if (days <= 3) return { color: "text-rose-500 border-rose-200 dark:border-rose-800", bg: "bg-rose-50 dark:bg-rose-900/20", label: "Urgent" };
        if (days <= 7) return { color: "text-amber-500 border-amber-200 dark:border-amber-800", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Soon" };
        return { color: "text-emerald-500 border-emerald-200 dark:border-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-900/20", label: "On Track" };
    };

    const deadlineInfo = useMemo(() => {
        if (!departmentData?.daysUntilDeadline) return null;
        return getDeadlineUrgency(departmentData.daysUntilDeadline);
    }, [departmentData]);

    const renderStars = (score) => {
        if (!score) return null;

        const fullStars = Math.floor(score);
        const hasHalfStar = score % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} size={12} className="fill-amber-400 text-amber-400" />
                ))}
                {hasHalfStar && (
                    <Star size={12} className="fill-amber-200 text-amber-400" />
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} size={12} className="text-gray-200 dark:text-gray-700" />
                ))}
                <span className="ml-1.5 text-[10px] font-bold text-gray-700 dark:text-gray-300">{score}</span>
            </div>
        );
    };

    const ratingPercentage = Math.round((departmentData?.managersRated / departmentData?.totalManagers) * 100) || 0;

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 dark:border-gray-800/50 pb-4">
                <Briefcase size={16} className="text-primary-600" />
                <h2 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                    Department Performance
                </h2>
            </div>

            <div className="space-y-6 flex-1">
                {/* Department Average Score */}
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department Average</span>
                    <div className={getScoreColor(departmentData?.averageScore)}>
                        {renderStars(departmentData?.averageScore)}
                    </div>
                </div>

                {/* Managers Rated */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Managers Rated</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                            {departmentData?.managersRated}/{departmentData?.totalManagers} <span className="text-[10px] text-gray-400 tracking-widest">Reviewed</span>
                        </span>
                    </div>
                    <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${ratingPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Pending Reviews */}
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Reviews</span>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{departmentData?.pendingReviews}</span>
                        <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Managers</span>
                    </div>
                </div>

                {/* Deadline */}
                {deadlineInfo && (
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review Deadline</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${deadlineInfo.color}`}>
                                {departmentData.daysUntilDeadline} Days Left
                            </span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest border rounded-sm ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                                {deadlineInfo.label}
                            </span>
                        </div>
                    </div>
                )}

                {/* Top Managers */}
                <div className="pt-6 mt-2 border-t border-gray-50 dark:border-gray-800/50">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <Award size={12} className="text-emerald-500" />
                            Top Performers
                        </span>
                    </div>
                    <div className="space-y-3">
                        {departmentData?.topManagers?.slice(0, 2).map((manager, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800/50 rounded-sm">
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{manager.name}</span>
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(manager.trend)}
                                    <span className="text-xs font-bold text-emerald-600 leading-none">{manager.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3 pt-6 border-t border-gray-50 dark:border-gray-800/50">
                {departmentData?.pendingReviews > 0 ? (
                    <Link
                        href="/dept-head/performance/manager-reviews"
                        className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors text-[10px] font-bold uppercase tracking-widest"
                    >
                        Complete Actions ({departmentData.pendingReviews})
                    </Link>
                ) : (
                    <Link
                        href="/dept-head/performance/manager-reviews"
                        className="w-full flex items-center justify-center px-4 py-3 border border-primary-200 dark:border-primary-800/50 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-[10px] font-bold uppercase tracking-widest rounded-sm"
                    >
                        Review Vault
                    </Link>
                )}

                <Link
                    href="/dept-head/performance"
                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-[10px] font-bold uppercase tracking-widest rounded-sm"
                >
                    Analytic Report
                </Link>
            </div>
        </div>
    );
}
