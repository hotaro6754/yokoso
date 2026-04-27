"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const HeroVisual = () => {
    return (
        <div className="relative w-full aspect-square md:aspect-[4/3] max-w-lg mx-auto flex items-center justify-center">
            {/* Abstract Background Blobs */}
            <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-brand-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                    y: [0, 50, 0],
                    x: [0, -20, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-10 left-10 w-64 h-64 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                    y: [0, -50, 0],
                    x: [0, 30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* Main Visual Composition */}
            <div className="relative z-10 grid grid-cols-2 gap-4 w-full">
                {/* Card 1: Employee Growth */}
                <motion.div
                    className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 col-span-2 md:col-span-1 row-span-2 flex flex-col justify-between h-64"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                        <span className="text-xl">🚀</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Growth</h3>
                        <p className="text-sm text-gray-500 mb-2">+127% efficiency</p>
                        {/* Mini Bar Chart */}
                        <div className="flex items-end space-x-1 h-32">
                            {[40, 60, 45, 70, 50, 80, 75, 95].map((h, i) => (
                                <motion.div
                                    key={i}
                                    className="flex-1 bg-brand-500 rounded-t-sm opacity-80"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Card 2: Team Connection */}
                <motion.div
                    className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 h-30 flex items-center space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex -space-x-2 overflow-hidden">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500`}>
                                U{i}
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Team Scale</p>
                        <p className="text-xs text-green-500 font-medium">Active Now</p>
                    </div>
                </motion.div>

                {/* Card 3: Task Completion */}
                <motion.div
                    className="bg-gradient-to-br from-brand-500 to-brand-600 p-5 rounded-2xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden h-30"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <h4 className="text-2xl font-bold mb-1">98%</h4>
                    <p className="text-sm text-brand-100">Tasks Completed</p>
                    <div className="mt-2 w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                            className="bg-white h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "98%" }}
                            transition={{ duration: 1.5, delay: 0.8 }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Floating Badge */}
            <motion.div
                className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-xl shadow-2xl border border-gray-100 flex flex-col items-center gap-1 z-20"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="text-2xl">⚡</div>
                <span className="text-xs font-bold text-gray-800">Fast</span>
            </motion.div>
        </div>
    );
};
