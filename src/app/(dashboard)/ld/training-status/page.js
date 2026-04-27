"use client";

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { courseManagementService } from '@/services/course-management/course.service';
import {
    Search, Filter, Calendar, CheckCircle, Clock,
    AlertCircle, FileText, Download, Eye, XCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function TrainingStatusPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const breadcrumbItems = [
        { label: 'L&D Dashboard', href: '/ld/dashboard' },
        { label: 'Training Status', href: '/ld/training-status' }
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'NOT_STARTED', label: 'Not Started' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CERTIFIED', label: 'Certified' },
        { value: 'REJECTED', label: 'Rejected' }
    ];

    useEffect(() => {
        fetchData();
    }, [pagination.page, searchQuery, statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await courseManagementService.getLearningTrainingStatus({
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                status: statusFilter
            });

            if (response && response.data) {
                setData(response.data);
                setPagination({
                    page: response.pagination.page,
                    limit: response.pagination.limit,
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages
                });
            }
        } catch (error) {
            console.error("Failed to fetch training status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getStatusBadge = (status) => {
        const config = {
            'NOT_STARTED': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Not Started' },
            'IN_PROGRESS': { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'In Progress' },
            'PENDING_APPROVAL': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Pending Approval' },
            'COMPLETED': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
            'CERTIFIED': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Certified' },
            'REJECTED': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
        };

        const style = config[status] || { color: 'bg-gray-100 text-gray-800', icon: FileText, label: status };
        const Icon = style.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.color}`}>
                <Icon size={14} />
                {style.label}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Training Status Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track course assignments, completion, and certification status across the organization.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by course title..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Completion Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                        <p className="mt-2 text-sm text-gray-500">Loading records...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No records found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.assignmentId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.employeeName}</span>
                                                <span className="text-xs text-gray-500">{item.employeeEmail}</span>
                                                <span className="text-xs text-gray-400">{item.designation}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.courseName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {item.assignedDate ? format(new Date(item.assignedDate), 'MMM d, yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {item.completionDate ? format(new Date(item.completionDate), 'MMM d, yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => window.location.href = `/ld/training-status/${item.assignmentId}`}
                                                className="flex items-center gap-1.5 ml-auto px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                            >
                                                <Eye size={14} />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        <button
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
