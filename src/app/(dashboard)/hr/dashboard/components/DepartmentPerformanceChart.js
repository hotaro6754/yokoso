"use client";
import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';
import { BarChart3 } from "lucide-react";

export default function DepartmentPerformanceChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 h-full flex flex-col items-center justify-center min-h-[300px]">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 italic">Department Performance</h3>
                <p className="text-xs text-gray-500">No performance data available</p>
            </div>
        );
    }

    const avgScore = Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length);

    return (
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 h-full flex flex-col">
            <div className="flex flex-col mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 size={16} className="text-gray-400" />
                    Department Average Scores
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Monthly performance based on attendance & leaves
                </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-[180px] h-[180px] relative mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="score"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.score >= 80 ? '#10B981' : (entry.score >= 60 ? '#F59E0B' : '#EF4444')}
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value) => `${value}%`}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                }}
                                itemStyle={{ fontSize: '12px', color: '#374151' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {avgScore}%
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-medium">Avg Score</span>
                    </div>
                </div>

                <div className="w-full grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto px-1 custom-scrollbar">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: item.score >= 80 ? '#10B981' : (item.score >= 60 ? '#F59E0B' : '#EF4444') }}
                                />
                                <span className="text-xs text-gray-600 dark:text-gray-300 truncate font-medium" title={item.name}>
                                    {item.name}
                                </span>
                                <span className="text-[10px] text-gray-400 flex-shrink-0">({item.employeeCount} emp)</span>
                            </div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{item.score}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
