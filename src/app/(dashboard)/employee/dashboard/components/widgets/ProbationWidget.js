import React from 'react';
import { useRouter } from 'next/navigation';
import { Target, ChevronRight, Clock } from 'lucide-react';

export default function ProbationWidget({ data }) {
    const router = useRouter();

    if (!data || data.status === 'NO_RECORD') return null;

    // Only show if Active or Extended (or maybe Confirmed for a short while, but usually Active)
    // User Requirement: "Probation Status", "Current Stage", "Status".

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'EXTENDED': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case 'CONFIRMED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div
            onClick={() => router.push('/employee/performance/probation')}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Target size={20} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getStatusColor(data.status)}`}>
                    {data.status}
                </span>
            </div>

            <div className="relative z-10">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Probation Status</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Clock size={14} />
                    <span>Stage: <span className="text-gray-900 dark:text-white font-medium">{data.currentStage?.replace('DAYS_', '')} Days</span></span>
                </div>

                <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium mt-3 group-hover:translate-x-1 transition-transform">
                    View Details <ChevronRight size={16} />
                </div>
            </div>
        </div>
    );
}
