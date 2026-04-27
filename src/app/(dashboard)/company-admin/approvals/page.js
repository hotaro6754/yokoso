'use client';

import React, { useState } from 'react';
import {
    FileText,
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    Info,
    ChevronRight,
    Filter
} from 'lucide-react';

import toast, { Toaster } from 'react-hot-toast';

export default function ApprovalsPage() {
    const [activeTab, setActiveTab] = useState('All');
    const [approvals, setApprovals] = useState([
        { id: 1, type: 'Leave', user: 'Amit Verma', request: 'Sick Leave', dates: 'Oct 24 - Oct 25', status: 'Pending', time: '2 hours ago' },
        { id: 2, type: 'Attendance', user: 'Priya Singh', request: 'Regularization', dates: 'Oct 22', status: 'Pending', time: '5 hours ago' },
        { id: 3, type: 'Document', user: 'Rahul Sharma', request: 'Address Proof Update', dates: '-', status: 'Pending', time: '1 day ago' },
        { id: 4, type: 'Leave', user: 'Neha Gupta', request: 'Casual Leave', dates: 'Nov 01 - Nov 03', status: 'Pending', time: '1 day ago' },
        { id: 5, type: 'Attendance', user: 'Vikram Malhotra', request: 'Missed Punch', dates: 'Oct 20', status: 'Pending', time: '2 days ago' },
    ]);

    const handleApprove = (id) => {
        // In a real app, you would make an API call here.
        setApprovals(prev => prev.filter(item => item.id !== id));
        toast.success("Request approved successfully!");
    };

    const handleReject = (id) => {
        setApprovals(prev => prev.filter(item => item.id !== id));
        toast.error("Request rejected");
    };

    const filteredApprovals = activeTab === 'All' ? approvals : approvals.filter(a => a.type === activeTab);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-transparent p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="text-[var(--color-primary)]" />
                        Approvals
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage pending requests for leave, attendance, and documents.
                    </p>
                </div>

                {/* Tabs & Filter */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                    <div className="flex bg-white dark:bg-transparent p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-full sm:w-auto overflow-x-auto">
                        {['All', 'Leave', 'Attendance', 'Document'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                    ? 'bg-[var(--color-primary-hover)] text-[#0b1220] border border-[var(--color-primary)]'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-transparent rounded-lg transition-colors ml-auto sm:ml-0">
                        <Filter size={16} /> Filter
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filteredApprovals.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-transparent rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-center mb-3">
                                <CheckCircle size={48} className="text-gray-200 dark:text-gray-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Caught Up!</h3>
                            <p className="text-gray-500 text-sm mt-1">No pending approvals in this category.</p>
                        </div>
                    ) : (
                        filteredApprovals.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-transparent rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-4">
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[var(--color-primary-hover)] text-[#0b1220] border border-[var(--color-primary)]">
                                    {item.type === 'Leave' ? <Calendar size={20} /> :
                                        item.type === 'Attendance' ? <Clock size={20} /> :
                                            <FileText size={20} />}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{item.request}</h3>
                                        <span className="text-xs text-gray-400">{item.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                        Requested by <span className="font-semibold text-gray-900 dark:text-white">{item.user}</span>
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1 bg-transparent px-2 py-0.5 rounded text-[var(--color-primary)] border border-[var(--color-primary)]/60">
                                            {item.type}
                                        </span>
                                        {item.dates !== '-' && <span>{item.dates}</span>}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => handleApprove(item.id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[#0b1220] rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
                                    >
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(item.id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg text-sm font-medium hover:border-[var(--color-primary-hover)] transition-colors"
                                    >
                                        <XCircle size={16} /> Reject
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )))}
                </div>

            </div>
        </div>
    );
}
