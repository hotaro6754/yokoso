import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';
import { Building2 } from "lucide-react";

const COLORS = ['#070C8A', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6'];

export default function DepartmentLeaveStats({ data }) {
    const chartData = data?.distribution?.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
    })) || [];

    const totalLeaves = data?.totalLeaves || 0;

    return (
        <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    Department Leave Distribution
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Percentage of total approved leaves by department
                </p>
            </div>

            {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-400 min-h-[200px]">
                    No leave data available
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-[180px] h-[180px] relative mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                    }}
                                    itemStyle={{ fontSize: '12px', color: '#374151' }}
                                    formatter={(value, name, props) => [`${value} days`, `${props.payload.percentage}%`]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalLeaves}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase font-medium">Total Days</span>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-1">
                        {chartData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate" title={item.name}>
                                        {item.name}
                                    </span>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <div className="text-xs font-bold text-gray-900 dark:text-white">{item.percentage}%</div>
                                    <div className="text-[10px] text-gray-500 text-right">{item.value} days</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
