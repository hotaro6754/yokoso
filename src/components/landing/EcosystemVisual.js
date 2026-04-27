"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, Calendar, TrendingUp, Briefcase, UserPlus, Receipt, Box } from "lucide-react";

export const EcosystemVisual = () => {
    // 0-100 Coordinate System
    const center = { x: 50, y: 50 };
    const radius = 42; // Increased radius to give lines room to breathe

    const nodes = [
        { label: "Recruitment", icon: UserPlus, color: "bg-indigo-500", angle: -90, delay: 0 },
        { label: "Onboarding", icon: Briefcase, color: "bg-blue-500", angle: -45, delay: 0.5 },
        { label: "Attendance", icon: Calendar, color: "bg-orange-500", angle: 0, delay: 1 },
        { label: "Payroll", icon: DollarSign, color: "bg-green-500", angle: 45, delay: 1.5 },
        { label: "Performance", icon: TrendingUp, color: "bg-purple-500", angle: 90, delay: 2 },
        { label: "Expenses", icon: Receipt, color: "bg-yellow-500", angle: 135, delay: 0.8 },
        { label: "Engagement", icon: Users, color: "bg-pink-500", angle: 180, delay: 1.2 },
        { label: "Assets", icon: Box, color: "bg-teal-500", angle: 225, delay: 0.3 },
    ];

    // Helper: Polar to Cartesian (0-100)
    const getPos = (angle, r = radius) => {
        const rad = (angle * Math.PI) / 180;
        return {
            x: center.x + r * Math.cos(rad),
            y: center.y + r * Math.sin(rad),
        };
    };

    return (
        <div className="relative w-full aspect-square max-w-[550px] mx-auto flex items-center justify-center p-4">

            {/* Connecting Lines (SVG Layer) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                {nodes.map((node, index) => {
                    const pos = getPos(node.angle, radius); // Line ends exactly at Icon center
                    return (
                        <motion.line
                            key={index}
                            x1={center.x}
                            y1={center.y}
                            x2={pos.x}
                            y2={pos.y}
                            stroke="#2563eb" // Royal Blue
                            strokeWidth="0.8" // Approx 4px relative to 100-unit box
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.2 + index * 0.1, ease: "easeInOut" }}
                        />
                    );
                })}
            </svg>

            {/* Central Hub (Z-20) */}
            <div className="absolute z-20 w-[28%] h-[28%] bg-white rounded-full shadow-2xl flex flex-col items-center justify-center border-[4px] border-brand-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {/* Inner Pulse */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-brand-500/5"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Outer Ripple */}
                <motion.div
                    className="absolute inset-0 rounded-full border border-brand-100"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />

                <span className="block text-2xl lg:text-3xl font-bold text-gray-900 leading-none mb-1">360°</span>
                <span className="text-[8px] lg:text-[10px] font-bold text-brand-700 uppercase tracking-widest text-center leading-tight">Employee<br />Platform</span>
            </div>

            {/* Orbit Ring (Decorative Z-0) */}
            <div className="absolute border border-dashed border-gray-300 rounded-full animate-spin-slow pointer-events-none opacity-40 z-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                    width: '84%', // radius 42 * 2
                    height: '84%',
                    animationDuration: '60s'
                }}
            />

            {/* Nodes (Z-30) */}
            {nodes.map((node, index) => {
                const pos = getPos(node.angle);
                return (
                    <motion.div
                        key={index}
                        className="absolute z-30 flex flex-col items-center justify-center"
                        // Center the div exactly at 'pos'
                        style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: 0, // Zero width/height wrapper to act as point anchor
                            height: 0
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                    >
                        {/* Wrapper for Floating Animation */}
                        <motion.div
                            className="relative flex flex-col items-center justify-center"
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                                duration: 3 + index * 0.5, // Staggered duration
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: node.delay // Staggered start
                            }}
                        >
                            {/* Icon Circle - Centered on anchor */}
                            <motion.div
                                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl ${node.color} flex items-center justify-center shadow-lg border-[4px] border-white relative z-20`}
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <node.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                            </motion.div>

                            {/* Label Pill - Absolutely positioned below to avoid affecting center */}
                            <motion.div
                                className="absolute top-full mt-2 bg-white px-3 py-1 lg:px-4 lg:py-1.5 rounded-full shadow-md border border-gray-100 whitespace-nowrap left-1/2 -translate-x-1/2 z-10"
                                whileHover={{ scale: 1.05 }}
                            >
                                <span className="text-xs lg:text-sm font-bold text-gray-800">{node.label}</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>
    );
};
