"use client";
import { useEffect, useMemo, useState } from "react";
import { Users, TrendingUp, TrendingDown, Star, Clock, CheckCircle, AlertCircle, Award, BarChart3, PieChart } from "lucide-react";
import Link from "next/link";

export default function TeamPerformanceWidget({ data }) {
    const [teamData, setTeamData] = useState(null);

    // Helper functions - define before hooks that use them
    const getDeadlineUrgency = (days) => {
        if (days <= 3) return { color: "text-red-600", bg: "bg-red-50", label: "Urgent" };
        if (days <= 7) return { color: "text-orange-600", bg: "bg-orange-50", label: "Soon" };
        return { color: "text-green-600", bg: "bg-green-50", label: "On Track" };
    };

    useEffect(() => {
        // Use actual data from props
        const actualTeamData = {
            averageScore: data?.averageScore || 0,
            pendingReviews: data?.pendingReviews || 0,
            totalEmployees: data?.totalEmployees || 0,
            completedReviews: data?.completedReviews || 0,
            highPerformers: data?.highPerformers || [],
            lowPerformers: data?.lowPerformers || [],
            cycle: "Current Cycle",
            deadline: new Date().toISOString().split('T')[0],
            daysUntilDeadline: 15,
            ratingDistribution: data?.ratingDistribution || [
                { band: "Outperforms", count: 0, color: "bg-emerald-500" },
                { band: "Exceeds", count: 0, color: "bg-blue-500" },
                { band: "Meets", count: 0, color: "bg-indigo-500" },
                { band: "Needs Improvement", count: 0, color: "bg-yellow-500" },
                { band: "Unsatisfactory", count: 0, color: "bg-red-500" }
            ],
            employeeScores: [
                { name: "Sarah Johnson", score: 4.5 },
                { name: "Michael Chen", score: 4.3 },
                { name: "David Kim", score: 4.1 },
                { name: "Lisa Wang", score: 3.9 },
                { name: "James Brown", score: 3.7 },
                { name: "Emily Davis", score: 3.2 },
                { name: "Robert Wilson", score: 3.4 },
                { name: "Anna Martinez", score: 4.0 }
            ]
        };
        setTeamData(actualTeamData);
    }, [data?.averageScore, data?.pendingReviews, data?.totalEmployees, data?.completedReviews, data?.highPerformers, data?.lowPerformers, data?.ratingDistribution]);

    const deadlineInfo = useMemo(() => {
        if (!teamData?.daysUntilDeadline) return null;
        return getDeadlineUrgency(teamData.daysUntilDeadline);
    }, [teamData]);

    // Early return after all hooks
    if (!data) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>;

    try {
    const getScoreColor = (score) => {
        if (score >= 4.5) return "text-emerald-600 bg-emerald-50";
        if (score >= 4.0) return "text-green-600 bg-green-50";
        if (score >= 3.5) return "text-blue-600 bg-blue-50";
        if (score >= 3.0) return "text-yellow-600 bg-yellow-50";
        return "text-orange-600 bg-orange-50";
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={12} className="text-green-600" />;
            case 'down':
                return <TrendingDown size={12} className="text-red-600" />;
            default:
                return <div className="w-3 h-3 bg-gray-300 rounded-full" />;
        }
    };

    const getRatingColor = (rating) => {
        const ratingColors = {
            '5.0': 'bg-emerald-500',
            '4.0': 'bg-blue-500',
            '3.0': 'bg-indigo-500',
            '2.0': 'bg-yellow-500',
            '1.0': 'bg-red-500'
        };
        return ratingColors[rating] || 'bg-gray-500';
    };

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
                    <Users size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Team Performance</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Appraisal overview & insights</p>
                </div>
            </div>

            {/* Performance Charts Section */}
            <div className="space-y-4 mb-4">
                {/* Team Performance Distribution Bar Chart */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <BarChart3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        Team Rating Distribution
                    </h4>
                    <div className="space-y-2">
                        {teamData?.ratingDistribution?.map((band, index) => (
                            <div key={`rating-${index}`} className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-24">
                                    {band.rating || band.band}
                                </span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                                    <div 
                                        className={`${band.color || getRatingColor(band.rating || band.band)} h-4 rounded-full transition-all duration-300`}
                                        style={{ width: `${teamData.totalEmployees > 0 ? (band.count / teamData.totalEmployees) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                                    {band.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Average Score by Employee Bar Chart */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                        Team Member Scores
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {teamData?.employeeScores?.sort((a, b) => b.score - a.score).map((employee) => (
                            <div key={employee.name} className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-28 truncate">
                                    {employee.name}
                                </span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                    <div 
                                        className={`h-3 rounded-full transition-all duration-300 ${
                                            employee.score >= 4.5 ? "bg-emerald-500" :
                                            employee.score >= 4.0 ? "bg-green-500" :
                                            employee.score >= 3.5 ? "bg-blue-500" :
                                            employee.score >= 3.0 ? "bg-yellow-500" : "bg-red-500"
                                        }`}
                                        style={{ width: `${(employee.score / 5) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                                    {employee.score}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Review Completion Donut Chart */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <PieChart className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        Review Completion
                    </h4>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 relative">
                                <svg className="w-12 h-12 transform -rotate-90">
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        className="text-gray-200 dark:text-gray-600"
                                    />
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 20}`}
                                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - (teamData?.completedReviews / teamData?.totalEmployees))}`}
                                        className="text-green-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {Math.round((teamData?.completedReviews / teamData?.totalEmployees) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Completed: {teamData?.completedReviews}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Pending: {teamData?.pendingReviews}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 flex-1">
                {/* Team Average Score */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Team Average</span>
                    <div className={getScoreColor(teamData?.averageScore)}>
                        {renderStars(teamData?.averageScore)}
                    </div>
                </div>

                {/* Pending Reviews */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Pending Reviews</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{teamData?.pendingReviews}</span>
                        <span className="text-xs text-gray-500">of {teamData?.totalEmployees}</span>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Completion Rate</span>
                    <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(teamData?.completedReviews / teamData?.totalEmployees) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {Math.round((teamData?.completedReviews / teamData?.totalEmployees) * 100)}%
                        </span>
                    </div>
                </div>

                {/* Deadline */}
                {deadlineInfo && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Deadline</span>
                        <div className="text-right">
                            <div className={`text-xs font-medium ${deadlineInfo.color}`}>
                                {teamData.daysUntilDeadline} days left
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                                {deadlineInfo.label}
                            </span>
                        </div>
                    </div>
                )}

                {/* High Performers */}
                <div className="pt-3 border-t border-primary-100/50 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <Award size={14} className="text-green-600" />
                            Top Performers
                        </span>
                    </div>
                    <div className="space-y-1">
                        {teamData?.highPerformers?.slice(0, 2).map((performer, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 dark:text-gray-400">{performer.name}</span>
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(performer.trend)}
                                    <span className="text-xs font-medium text-green-600">{performer.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Performers */}
                {teamData?.lowPerformers?.length > 0 && (
                    <div className="pt-3 border-t border-primary-100/50 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <AlertCircle size={14} className="text-orange-600" />
                                Needs Attention
                            </span>
                        </div>
                        <div className="space-y-1">
                            {teamData?.lowPerformers?.slice(0, 2).map((performer, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{performer.name}</span>
                                    <div className="flex items-center gap-1">
                                        {getTrendIcon(performer.trend)}
                                        <span className="text-xs font-medium text-orange-600">{performer.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
                {teamData?.pendingReviews > 0 ? (
                    <Link
                        href="/manager/performance-management/team-appraisals"
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-semibold"
                    >
                        Complete Reviews ({teamData.pendingReviews})
                    </Link>
                ) : (
                    <Link
                        href="/manager/performance-management/team-appraisals"
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-primary-200/60 dark:border-primary-500/20 text-primary-700 dark:text-primary-300 hover:bg-primary-50/60 dark:hover:bg-primary-500/10 transition-colors text-sm font-semibold rounded-xl"
                    >
                        View All Reviews
                    </Link>
                )}
                
                <Link
                    href="/manager/performance-management/team-performance"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold rounded-xl"
                >
                    Team Analytics
                </Link>
            </div>
        </div>
    );
    } catch (error) {
        console.error('TeamPerformanceWidget error:', error);
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
                <div className="text-center py-8">
                    <div className="text-red-600 mb-2">Error loading team performance data</div>
                    <div className="text-sm text-gray-500">Please try again later</div>
                </div>
            </div>
        );
    }
}
