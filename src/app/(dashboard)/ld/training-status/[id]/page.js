"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { courseManagementService } from '@/services/course-management/course.service';
import {
    Clock, CheckCircle, AlertCircle, XCircle, FileText,
    Download, Eye, User, Calendar, BookOpen, Building
} from 'lucide-react';
import { format } from 'date-fns';
import { getProfileImageUrl } from '@/utils/fileUrl';
import Image from 'next/image';

export default function TrainingStatusDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const breadcrumbItems = [
        { label: 'L&D Dashboard', href: '/ld/dashboard' },
        { label: 'Training Status', href: '/ld/training-status' },
        { label: 'Details', href: '#' }
    ];

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await courseManagementService.getLearningTrainingStatusDetails(id);
            if (response && response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch details:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
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
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${style.color}`}>
                <Icon size={16} />
                {style.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-6 h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 text-center text-gray-500">
                Details not found.
            </div>
        );
    }

    const { assignment, course, employee, certificate } = data;

    return (
        <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Training Assignment Details</h1>
                <StatusBadge status={assignment.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Employee Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="text-primary-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Info</h2>
                    </div>

                    {employee ? (
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary-100">
                                <Image
                                    src={getProfileImageUrl(employee.profileImage)}
                                    alt={employee.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{employee.name}</h3>
                                <p className="text-sm text-gray-500">{employee.designation || 'No Designation'}</p>
                                <p className="text-xs text-gray-400 mt-1">{employee.department || 'No Department'}</p>
                            </div>
                            <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-700 text-left space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium text-gray-900 dark:text-white">Emp ID:</span> {employee.empId || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={employee.email}>
                                    <span className="font-medium text-gray-900 dark:text-white">Email:</span> {employee.email}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Employee information not available.</p>
                    )}
                </div>

                {/* Course Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="text-primary-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Course Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.courseTitle}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                                {course.description || "No description provided."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Category</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{course.category || 'General'}</span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Duration</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{course.duration ? `${course.duration} minutes` : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Assigned Date</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {assignment.assignedDate ? format(new Date(assignment.assignedDate), 'MMM d, yyyy') : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Due Date</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {assignment.dueDate ? format(new Date(assignment.dueDate), 'MMM d, yyyy') : 'No Deadline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status & Certificate Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm col-span-1 md:col-span-3">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="text-primary-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Progress & Certification</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Timeline / Status Info */}
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <span className="block text-sm text-gray-500">Current Status</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{assignment.status.replace('_', ' ')}</span>
                                </div>
                                {assignment.completionDate && (
                                    <div className="text-right">
                                        <span className="block text-sm text-gray-500">Completed On</span>
                                        <span className="font-semibold text-green-600">
                                            {format(new Date(assignment.completionDate), 'MMMM d, yyyy')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {assignment.completionComment && (
                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Employee Verified Completion Comment:</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{assignment.completionComment}"</p>
                                </div>
                            )}
                        </div>

                        {/* Certificate Box */}
                        <div className="w-full md:w-1/3 flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            {certificate ? (
                                <>
                                    <div className="bg-purple-100 text-purple-600 p-3 rounded-full mb-3">
                                        <FileText size={32} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Certificate Issued</h3>
                                    <p className="text-xs text-gray-500 mb-4 font-mono">{certificate.certificateCode}</p>

                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => {
                                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                                window.open(`${apiUrl}/employee/courses/certificates/${certificate.id}/download?token=${localStorage.getItem('token')}&action=view`, '_blank');
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                        >
                                            <Eye size={16} /> View
                                        </button>
                                        <button
                                            onClick={() => {
                                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                                window.open(`${apiUrl}/employee/courses/certificates/${certificate.id}/download?token=${localStorage.getItem('token')}&action=download`, '_blank');
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                                        >
                                            <Download size={16} /> Download
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-gray-100 text-gray-400 p-3 rounded-full mb-3">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">No certificate available yet.</p>
                                    <p className="text-xs text-gray-400 text-center mt-1">Certificate will be generated upon completion and approval.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
