"use client";

import { motion } from "framer-motion";

export const DashboardIllustration = () => {
    return (
        <div className="relative w-full max-w-[800px] mx-auto aspect-[16/10] perspective-1000">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full transform scale-75 translate-y-10" />

            {/* Main Dashboard Window */}
            <motion.div
                className="relative w-full h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
                initial={{ y: 20, rotateX: 5, opacity: 0 }}
                animate={{ y: 0, rotateX: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Window Controls (Browser Bar) */}
                <div className="h-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center px-4 space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    {/* Mock URL Bar */}
                    <div className="ml-4 h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md opacity-50" />
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-16 md:w-48 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-700 flex flex-col p-4 space-y-4">
                        {/* Logo placeholder */}
                        <div className="h-8 w-8 md:w-24 bg-brand-100 dark:bg-brand-900 rounded-lg mb-4" />

                        {/* Nav Items */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-lg ${i === 1 ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} flex-shrink-0`} />
                                <div className={`hidden md:block h-3 rounded w-20 ${i === 1 ? 'bg-gray-800 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            </div>
                        ))}
                    </div>

                    {/* Main Area */}
                    <div className="flex-1 p-6 bg-gray-50/30 dark:bg-gray-900 overflow-hidden flex flex-col space-y-6">

                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                >
                                    <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-900 mb-3" />
                                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                                    <div className="h-6 w-20 bg-gray-800 dark:bg-gray-200 rounded" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Main Chart Area */}
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <div className="h-4 w-32 bg-gray-800 dark:bg-gray-200 rounded" />
                                <div className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                            </div>

                            {/* SVG Chart */}
                            <svg className="w-full h-full absolute bottom-0 left-0 right-0 px-6 pb-6" viewBox="0 0 100 50" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Area */}
                                <motion.path
                                    d="M0,50 L0,35 Q25,20 50,30 T100,10 V50 Z"
                                    fill="url(#chartGradient)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />

                                {/* Line */}
                                <motion.path
                                    d="M0,35 Q25,20 50,30 T100,10"
                                    fill="none"
                                    stroke="rgb(99, 102, 241)"
                                    strokeWidth="1"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Element 1 - Notification */}
            <motion.div
                className="absolute -right-8 top-1/4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl shadow-brand-500/20 border border-gray-100 dark:border-gray-700 flex items-center space-x-3 z-10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                <div>
                    <div className="h-3 w-20 bg-gray-800 dark:bg-white rounded mb-1" />
                    <div className="h-2 w-16 bg-gray-400 rounded" />
                </div>
            </motion.div>

            {/* Floating Element 2 - User Card */}
            <motion.div
                className="absolute -left-6 bottom-1/4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl shadow-purple-500/20 border border-gray-100 dark:border-gray-700 flex items-center space-x-3 z-10"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">?</div>
                <div>
                    <div className="h-3 w-24 bg-gray-800 dark:bg-white rounded mb-1" />
                    <div className="h-2 w-12 bg-gray-400 rounded" />
                </div>
            </motion.div>
        </div>
    );
};
