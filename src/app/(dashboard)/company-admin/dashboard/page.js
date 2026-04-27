'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    UserCheck,
    FileText,
    AlertTriangle,
    CreditCard,
    LogOut,
    Calendar,
    Clock,
    CheckCircle2,
    Plus,
    FileCheck,
    ArrowRight,
    Briefcase
} from 'lucide-react';
import { dashboardService } from '@/services/company-admin-services/dashboard.service';
import DepartmentPerformanceChart from "@/components/dashboard/DepartmentPerformanceChart";

// --- Components ---

const KPIStrip = ({ data }) => {
    if (!data) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse h-24">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    const kpis = [
        {
            label: 'Total Employees',
            value: data.userOverview?.totalUsers || '0',
            sub: `${data.userOverview?.activeUsers || '0'} Active`,
            icon: Users,
            color: 'blue',
            href: '/company-admin/users'
        },
        {
            label: 'Present Today',
            value: data.attendanceStats?.present || '0',
            sub: `${data.attendanceStats?.attendancePercentage || '0%'} Attendance`,
            icon: UserCheck,
            color: 'green',
            href: '/company-admin/attendance'
        },
        {
            label: 'Pending Approvals',
            value: (data.pendingLeaveRequests || 0) + (data.pendingRegularizations || 0),
            sub: 'Leave & Attendance',
            icon: FileText,
            color: 'orange',
            href: '/company-admin/approvals'
        },
        {
            label: 'Departments',
            value: data.departments || '0',
            sub: 'Active departments',
            icon: LogOut,
            color: 'gray',
            href: '/company-admin/company-orgranization?tab=departments'
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {kpis.map((kpi, idx) => (
                <Link key={idx} href={kpi.href}>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer h-full">
        <div className={`p-2 w-fit rounded-lg mb-2 ${kpi.color === 'primary' ? 'bg-primary-50 text-primary-600' :
            kpi.color === 'green' ? 'bg-emerald-50 text-emerald-600' :
                kpi.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                    kpi.color === 'red' ? 'bg-rose-50 text-rose-600' :
                        kpi.color === 'purple' ? 'bg-secondary-50 text-secondary-600' :
                            'bg-gray-100 text-gray-600'
            }`}>
                            <kpi.icon size={16} />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {kpi.badge ? <span className="text-sm px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{kpi.value}</span> : kpi.value}
                            </h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-white">{kpi.label}</p>
                            <p className="text-[10px] text-gray-400 dark:text-white">{kpi.sub}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

const ActionList = ({ title, items, icon: Icon, data }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                {Icon && <Icon size={16} className="text-gray-400" />}
                {title}
            </h3>
            <Link href="/company-admin/approvals" className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-white">View All</Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {items.map((item, i) => (
                <Link key={i} href="/company-admin/approvals">
                    <div className="p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-full ${item.bg} ${item.accent}`}>
                                <item.icon size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{item.text}</p>
                                <p className="text-xs text-gray-500 dark:text-white">{item.sub}</p>
                            </div>
                        </div>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 transition-colors" />
                    </div>
                </Link>
            ))}
        </div>
    </div>
);

// --- Imports ---
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';

// --- Constants ---
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

// ... (other components)

const WorkforceSnapshot = ({ data }) => {
    if (!data) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-3 space-y-4 h-full animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
            </div>
        );
    }

    const totalEmployees = data.userOverview?.totalUsers || 0;
    const maleCount = data.userOverview?.maleCount || 0;
    const femaleCount = data.userOverview?.femaleCount || 0;

    const newHires = data.headcountSummary?.newJoiners || 0;
    const exits = data.headcountSummary?.exits || 0;
    const attritionRate = totalEmployees > 0 ? ((exits / totalEmployees) * 100).toFixed(1) : 0;




    // Use real department data, sorted by count
    const fullDeptData = data.departmentDistribution?.map(dept => ({
        name: dept.name || 'Dept',
        value: dept.employeeCount || 0
    })).sort((a, b) => b.value - a.value) || [];

    // Limit to top 4 for display in the legend
    const displayDeptData = fullDeptData.slice(0, 4);

    return (
        <div className="block h-full"> {/* Removed Link wrapper to allow internal link clicks */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-3 h-full hover:shadow-md transition-shadow flex flex-col gap-3">
                <div className="flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                        <Users size={16} className="text-gray-400" />
                        Workforce Snapshot
                    </h3>
                </div>

                {/* Top Section: Gender & Stats */}
                <Link href="/company-admin/users" className="grid grid-cols-2 gap-2 shrink-0 cursor-pointer">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/30 flex flex-col justify-center">
                        <p className="text-[10px] text-gray-500 dark:text-white mb-1 font-medium uppercase tracking-wider">Gender Ratio</p>
                        <div className="flex items-center gap-2">
                            {/* Male */}
                            <div className="flex-1 space-y-1">
                                <div className="h-1.5 w-full bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600" style={{ width: `${(maleCount / totalEmployees) * 100}%` }}></div>
                                </div>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{maleCount} M</p>
                            </div>
                            {/* Female */}
                            <div className="flex-1 space-y-1">
                                <div className="h-1.5 w-full bg-pink-200 dark:bg-pink-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-pink-500" style={{ width: `${(femaleCount / totalEmployees) * 100}%` }}></div>
                                </div>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{femaleCount} F</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 dark:text-white">New (30d)</span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-white">+{newHires}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 dark:text-white">Attrition</span>
                            <span className="text-sm font-bold text-rose-600 dark:text-white">{attritionRate}%</span>
                        </div>
                    </div>
                </Link>

                {/* Bottom Section: Department Chart */}
                <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex-1 min-h-0 flex flex-col">
                    <div className="flex justify-between items-center mb-1 shrink-0">
                        <p className="text-[10px] text-gray-400 dark:text-white font-medium uppercase tracking-wider">Department Distribution</p>
                        {fullDeptData.length > 4 && (
                            <Link href="/company-admin/company-orgranization?tab=departments" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 dark:text-white">
                                View All
                            </Link>
                        )}
                    </div>
                    <div className="flex-1 min-h-[100px] w-full flex items-center gap-2 overflow-hidden">
                        <div className="h-full w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fullDeptData} // Keep chart showing full data for accuracy
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={40}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {fullDeptData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend - Limited to top 4 */}
                        <div className="w-1/2 h-full flex flex-col justify-center gap-1.5">
                            {displayDeptData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5 w-full">
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-[10px] text-gray-500 dark:text-white font-medium truncate flex-1" title={entry.name}>
                                        {entry.name}
                                    </span>
                                    <span className="text-[10px] text-gray-900 dark:text-gray-300 font-bold shrink-0">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TodayAtWork = ({ data }) => {
    if (!data) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 h-full animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
            </div>
        );
    }

    // Use real attendance data from API
    const attendanceData = [
        { name: 'Present', value: data.attendanceStats?.present || 0, color: '#10B981' },
        { name: 'Absent', value: data.attendanceStats?.absent || 0, color: '#EF4444' },
        { name: 'Late', value: data.attendanceStats?.late || 0, color: '#F59E0B' },
        { name: 'On Leave', value: data.attendanceStats?.onLeave || 0, color: '#3B82F6' },
    ];

    const totalEmployees = attendanceData.reduce((sum, item) => sum + item.value, 0);
    const presentPercentage = totalEmployees > 0 ? Math.round((attendanceData[0].value / totalEmployees) * 100) : 0;



    return (
        <Link href="/company-admin/attendance" className="block h-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-3 h-full hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        Today at Work
                    </h3>
                    <span className="text-xs text-gray-400 dark:text-white">{new Date().toLocaleDateString()}</span>
                </div>

                <div className="flex items-center h-[140px]">
                    {/* Donut Chart */}
                    <div className="w-1/2 h-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={50}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Centered Total */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{presentPercentage}%</span>
                            <span className="text-[10px] text-gray-400 dark:text-white uppercase font-medium">Present</span>
                        </div>
                    </div>

                    {/* Stats List */}
                    <div className="w-1/2 space-y-3 pl-2">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Absent</span>
                            </div>
                            <span className="text-sm font-bold text-red-600 dark:text-white">{attendanceData[1].value}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Late</span>
                            </div>
                            <span className="text-sm font-bold text-amber-600 dark:text-white">{attendanceData[2].value}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Leave</span>
                            </div>
                            <span className="text-sm font-bold text-blue-600 dark:text-white">{attendanceData[3].value}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const DocumentCompliance = ({ data, totalUsers }) => {
    if (!data) return null;

    const missingCount = data.missingDocumentsCount || 0;
    const expiredCount = data.expiredDocumentsCount || 0;
    const requiredDocsPerUser = 3;
    const totalRequiredDocs = (totalUsers || 1) * requiredDocsPerUser;
    const completionRate = Math.round(((totalRequiredDocs - missingCount) / totalRequiredDocs) * 100);

    const panMissingCount = data.missingDocuments?.filter(d => d.missingDocumentType === 'PAN').length || 0;

    return (
        <Link href="/company-admin/users" className="block h-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-3 h-full hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 text-sm">
                    <FileCheck size={16} className="text-gray-400" />
                    Document Compliance
                </h3>
                <div className="mb-2">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="dark:text-white">Overall Completion</span>
                        <span className="text-emerald-600 dark:text-white">{completionRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }}></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30">
                        <span className="text-xs font-medium text-red-700 dark:text-red-400 flex items-center gap-1.5">
                            <AlertTriangle size={12} /> PAN Missing
                        </span>
                        <span className="text-xs font-bold text-red-700 dark:text-white">{panMissingCount} Users</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30">
                        <span className="text-xs font-medium text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                            <Clock size={12} /> Expired Documents
                        </span>
                        <span className="text-xs font-bold text-orange-700 dark:text-white">{expiredCount} Users</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const EmploymentTypeDistribution = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 h-full animate-pulse flex flex-col items-center justify-center">
                <p className="text-xs text-gray-400">No Employment Data</p>
            </div>
        );
    }

    const transformedData = data.map((item, idx) => ({
        ...item,
        color: COLORS[idx % COLORS.length]
    }));

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 h-full hover:shadow-md transition-shadow flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 text-sm">
                <Users size={16} className="text-gray-400" />
                Employment Type
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-[130px] h-[130px] relative mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={transformedData}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {transformedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{total}</span>
                        <span className="text-[10px] text-gray-400 dark:text-white uppercase font-medium">Total</span>
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 max-h-[100px] overflow-y-auto">
                    {transformedData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-gray-600 dark:text-white truncate max-w-[60px]">{item.name?.replace('_', ' ')}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LocationHeadcount = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 h-full animate-pulse flex flex-col items-center justify-center">
                <p className="text-xs text-gray-400">No Location Data</p>
            </div>
        );
    }

    const transformedData = data.map((item, idx) => ({
        ...item,
        color: COLORS[idx % COLORS.length]
    }));

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 h-full hover:shadow-md transition-shadow flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 text-sm">
                <Users size={16} className="text-gray-400" />
                Location Distribution
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-[130px] h-[130px] relative mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={transformedData}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {transformedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{total}</span>
                        <span className="text-[10px] text-gray-400 dark:text-white uppercase font-medium">Total</span>
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 max-h-[100px] overflow-y-auto">
                    {transformedData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-gray-600 dark:text-white truncate max-w-[60px] font-medium">{item.name}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function CompanyAdminDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [dashboardData, departmentData] = await Promise.all([
                    dashboardService.getCompleteDashboard(),
                    dashboardService.getDepartmentDistribution().catch(() => null)
                ]);

                // Transform HR dashboard data to company admin format
                const transformedData = {
                    userOverview: {
                        totalUsers: dashboardData.headcountSummary?.totalEmployees || 0,
                        activeUsers: dashboardData.headcountSummary?.activeEmployees || 0,
                        maleCount: dashboardData.headcountSummary?.maleCount ?? Math.floor((dashboardData.headcountSummary?.totalEmployees || 0) * 0.6),
                        femaleCount: dashboardData.headcountSummary?.femaleCount ?? Math.ceil((dashboardData.headcountSummary?.totalEmployees || 0) * 0.4)
                    },
                    headcountSummary: dashboardData.headcountSummary || {},
                    attendanceStats: {
                        present: dashboardData.attendanceSnapshot?.presentToday || 0,
                        absent: dashboardData.attendanceSnapshot?.absentToday || 0,
                        late: dashboardData.attendanceSnapshot?.lateArrivals || 0,
                        onLeave: dashboardData.leaveManagement?.employeesOnLeaveToday || 0,
                        attendancePercentage: dashboardData.attendanceSnapshot?.presentToday ?
                            Math.round((dashboardData.attendanceSnapshot.presentToday / (dashboardData.headcountSummary?.activeEmployees || 1)) * 100) + '%' : '0%'
                    },
                    pendingLeaveRequests: dashboardData.leaveManagement?.pendingLeaveApprovals || 0,
                    pendingRegularizations: dashboardData.attendanceSnapshot?.attendanceExceptions || 0,
                    departments: departmentData?.length || 0,
                    newHires: dashboardData.headcountSummary?.newJoiners || 0,
                    attritionRate: dashboardData.headcountSummary?.exits ?
                        Math.round((dashboardData.headcountSummary.exits / (dashboardData.headcountSummary?.totalEmployees || 1)) * 100) + '%' : '0%',
                    departmentDistribution: departmentData?.map(dept => ({
                        name: dept.name || 'Unknown',
                        employeeCount: dept._count?.employees || 0
                    })) || [],
                    departmentPerformance: dashboardData.departmentPerformance || [],
                    employmentTypeDistribution: dashboardData.employmentTypeDistribution || [],
                    locationDistribution: dashboardData.locationDistribution || [],
                    documentCompliance: dashboardData.documentCompliance || {}
                };

                setDashboardData(transformedData);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-transparent pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm h-24">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-transparent pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-red-800 font-semibold mb-2">Error loading dashboard</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare pending actions items
    const pendingActionsItems = [
        {
            icon: Calendar,
            text: `${dashboardData?.pendingLeaveRequests || 0} Leave Requests`,
            sub: 'Needs approval',
            bg: 'bg-orange-100',
            accent: 'text-orange-600'
        },
        {
            icon: Clock,
            text: `${dashboardData?.pendingRegularizations || 0} Attendance Regularizations`,
            sub: 'From various departments',
            bg: 'bg-blue-100',
            accent: 'text-blue-600'
        },
        {
            icon: FileText,
            text: '0 Exit Clearances',
            sub: 'No pending exits',
            bg: 'bg-red-100',
            accent: 'text-red-600'
        },
    ];
    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-transparent pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-xs text-gray-500 dark:text-white mt-0.5">Overview of your workforce and operations.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/company-admin/approvals">
                            <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                                <FileCheck size={14} />
                                Approvals
                            </button>
                        </Link>
                        <Link href="/company-admin/users/add">
                            <button className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg font-semibold text-xs hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                                <Plus size={14} />
                                Add Employee
                            </button>
                        </Link>
                    </div>
                </div>

                {/* 1. KPI Strip */}
                <KPIStrip data={dashboardData} />

                {/* 2. Main Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Row 1: Operations */}
                    <ActionList
                        title="Pending Actions"
                        icon={Briefcase}
                        items={pendingActionsItems}
                        data={dashboardData}
                    />
                    <WorkforceSnapshot data={dashboardData} />
                    <TodayAtWork data={dashboardData} />

                    {/* Row 2: Compliance & HR */}
                    <DocumentCompliance 
                        data={dashboardData?.documentCompliance} 
                        totalUsers={dashboardData?.userOverview?.totalUsers} 
                    />
                    <EmploymentTypeDistribution data={dashboardData?.employmentTypeDistribution} />

                    {/* Row 3: Analytics */}
                    <LocationHeadcount data={dashboardData?.locationDistribution} />
                    <DepartmentPerformanceChart data={dashboardData?.departmentPerformance} />
                </div>

            </div>
        </div>
    );
}
