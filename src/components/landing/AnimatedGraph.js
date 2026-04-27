"use client";

import { motion } from "framer-motion";

export const AnimatedGraph = () => {
    // Graph data points
    const points = [
        { x: 0, y: 80 },
        { x: 100, y: 60 },
        { x: 200, y: 70 },
        { x: 300, y: 40 },
        { x: 400, y: 50 },
        { x: 500, y: 20 },
    ];

    // Create path string from points
    const pathData = points.reduce((acc, point, i) => {
        return i === 0
            ? `M ${point.x},${point.y}`
            : `${acc} L ${point.x},${point.y}`;
    }, "");

    // Area path (closed at bottom)
    const areaPathData = `${pathData} L 500,150 L 0,150 Z`;

    return (
        <div className="relative w-full max-w-lg mx-auto aspect-[4/3] bg-white rounded-2xl shadow-xl shadow-brand-500/10 border border-brand-100 overflow-hidden p-6 flex flex-col items-center justify-center">
            {/* Background Grid */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-30">
                {[...Array(7)].map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full h-px bg-gray-100" style={{ top: `${i * 16.66}%` }} />
                ))}
                {[...Array(7)].map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full w-px bg-gray-100" style={{ left: `${i * 16.66}%` }} />
                ))}
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="h-2 w-24 bg-gray-100 rounded mb-2"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-brand-500/20"></div>
                    </div>
                </div>

                {/* The Graph */}
                <div className="relative flex-1 w-full mt-4">
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        {/* Area Gradient */}
                        <defs>
                            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.2" /> {/* Brand color approx */}
                                <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Animated Area */}
                        <motion.path
                            d={areaPathData}
                            fill="url(#gradient)"
                            initial={{ opacity: 0, pathLength: 0 }}
                            animate={{ opacity: 1, pathLength: 1 }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                        />

                        {/* Animated Line */}
                        <motion.path
                            d={pathData}
                            fill="none"
                            stroke="rgb(99, 102, 241)"
                            strokeWidth="4"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />

                        {/* Data Points */}
                        {points.map((point, i) => (
                            <motion.circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                fill="white"
                                stroke="rgb(99, 102, 241)"
                                strokeWidth="3"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1.5 + i * 0.1, type: "spring" }}
                            />
                        ))}
                    </svg>

                    {/* Floating Tooltip Animation */}
                    <motion.div
                        className="absolute top-[20%] right-[20%] bg-gray-900 text-white text-xs py-1 px-3 rounded shadow-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 }}
                    >
                        +125% Growth
                    </motion.div>
                </div>

                {/* Bottom stats rows */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <motion.div
                                className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.5 + i * 0.1 }}
                            >
                                <motion.div
                                    className="h-full bg-brand-500 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${60 + i * 15}%` }}
                                    transition={{ delay: 2.8 + i * 0.1, duration: 1 }}
                                />
                            </motion.div>
                            <div className="h-2 w-12 bg-gray-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
