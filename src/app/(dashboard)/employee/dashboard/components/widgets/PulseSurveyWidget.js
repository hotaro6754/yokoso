'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { pulseSurveyService } from '@/services/hr-services/pulseSurveyService';
import Link from 'next/link';

export default function PulseSurveyWidget() {
    const [pendingSurveys, setPendingSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingSurveys = async () => {
            try {
                const allSurveys = await pulseSurveyService.getAllSurveys();
                // Filter for published surveys that the user hasn't responded to
                const pending = allSurveys.filter(s => s.status === 'PUBLISHED' && (!s.responses || s.responses.length === 0));
                setPendingSurveys(pending);
            } catch (error) {
                console.error('Failed to fetch pending surveys', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingSurveys();
    }, []);

    if (loading) return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="space-y-3">
                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Brain className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Pulse Feedback</h3>
                </div>
                {pendingSurveys.length > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full animate-pulse">
                        {pendingSurveys.length} PENDING
                    </span>
                )}
            </div>

            <div className="flex-1 space-y-3">
                {pendingSurveys.length > 0 ? (
                    pendingSurveys.slice(0, 2).map((survey) => (
                        <Link
                            key={survey.id}
                            href={`/employee-pulse-surveys/participation/${survey.id}`}
                            className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent hover:border-primary-200 dark:hover:border-primary-900 transition-all"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                                    {survey.title}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter mt-1">
                                    {survey.type} feedback
                                </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-xs font-bold text-gray-500">All caught up!</p>
                        <p className="text-[10px] text-gray-400 px-4">No pending surveys for now.</p>
                    </div>
                )}
            </div>

            <Link
                href="/employee-pulse-surveys"
                className="mt-6 text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
                View all surveys <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
