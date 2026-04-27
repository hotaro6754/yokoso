"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, PieChart, TrendingUp, AlertTriangle, Download, Filter, Calendar } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function ExpenseAnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/expense-management/analytics/dashboard");
            setData(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch analytics data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="p-6">Loading analytics...</div>;

    const categoryChartData = {
        labels: data?.byCategory.map(c => c.category.replace('_', ' ')) || [],
        datasets: [{
            label: 'Spend by Category',
            data: data?.byCategory.map(c => c.amount) || [],
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(249, 115, 22, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(236, 72, 153, 0.8)',
            ],
            hoverOffset: 4
        }]
    };

    const budgetChartData = {
        labels: data?.budgetVsActual.slice(0, 5).map(c => c.preApprovalId) || [],
        datasets: [
            {
                label: 'Budget',
                data: data?.budgetVsActual.slice(0, 5).map(c => c.budget) || [],
                backgroundColor: 'rgba(209, 213, 219, 0.8)',
            },
            {
                label: 'Actual',
                data: data?.budgetVsActual.slice(0, 5).map(c => c.actual) || [],
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
            }
        ]
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Breadcrumb
                pageName="Spend Analytics & Reports"
                rightContent={
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
                            <Calendar size={16} /> Last 30 Days
                        </button>
                        <button className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm text-sm">
                            <Download size={16} /> Export Report
                        </button>
                    </div>
                }
            />

            {/* Top Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                            <PieChart size={20} className="text-brand-500" />
                            Spend by Category
                        </h3>
                        <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"><Filter size={16} /></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-[300px]">
                        <Pie data={categoryChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                            <BarChart3 size={20} className="text-brand-500" />
                            Budget vs Actual (Recent Pre-Approvals)
                        </h3>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <Bar data={budgetChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Pending Queue */}
                <div className="xl:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-red-50/30 dark:bg-red-900/10">
                        <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle size={20} />
                            Pending Queue (&gt; 48h)
                        </h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">{data?.pendingQueue.length}</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                        {data?.pendingQueue.length === 0 ? (
                            <p className="p-8 text-center text-gray-500 text-sm">All clear! No claims stuck.</p>
                        ) : (
                            data?.pendingQueue.map((claim) => (
                                <div key={claim.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm dark:text-white">{claim.claimNo}</p>
                                        <p className="text-xs text-gray-500">{claim.employee.firstName} {claim.employee.lastName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-brand-600">₹{claim.totalAmount.toLocaleString()}</p>
                                        <p className="text-xs text-red-500 font-medium">Stuck: {Math.floor((Date.now() - new Date(claim.createdAt)) / (1000 * 60 * 60))}h</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detailed Budget Variance */}
                <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-bold dark:text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-500" />
                            Detailed Budget Analysis
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Purpose</th>
                                    <th className="px-6 py-4">Budget</th>
                                    <th className="px-6 py-4">Actual Spend</th>
                                    <th className="px-6 py-4">Variance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {data?.budgetVsActual.map((row) => (
                                    <tr key={row.preApprovalId}>
                                        <td className="px-6 py-4 font-medium text-brand-600">{row.preApprovalId}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{row.purpose}</td>
                                        <td className="px-6 py-4 font-bold dark:text-white">₹{row.budget.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold dark:text-white">₹{row.actual.toLocaleString()}</td>
                                        <td className={`px-6 py-4 font-bold ${row.variance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            ₹{row.variance.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
