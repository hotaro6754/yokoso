'use client';

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Building2,
    Briefcase,
    CreditCard,
    FileText,
    LayoutDashboard,
    Clock,
    Award,
    DollarSign,
    Heart,
    Globe,
    Droplet,
    Users,
    ChevronLeft,
    Pencil,
    Trash2,
    Download
} from 'lucide-react';

export default function EmployeeDetailPage() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [employee, setEmployee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching employee data
        const fetchEmployee = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock Data - Detailed Schema Representation
            setEmployee({
                id: 1,
                publicId: 'uuid-1234-5678',
                employeeId: 'EMP-001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@abccorp.com',
                phone: '+1-234-567-8900',
                profileImage: null,
                status: 'ACTIVE',

                // Professional
                designation: { name: 'Senior Developer' },
                department: { name: 'Engineering' },
                company: { name: 'ABC Corp' },
                reportingManager: { firstName: 'Sarah', lastName: 'Connor', designation: 'Engineering Manager' },
                joiningDate: '2023-01-15',
                confirmationDate: '2023-07-15',
                employmentType: 'FULL_TIME',
                workLocation: 'New York HQ',
                workShift: 'General (9:00 AM - 6:00 PM)',
                location: { name: 'New York' },
                probationPeriod: 6, // months

                // Personal
                personalEmail: 'john.d.personal@gmail.com',
                dateOfBirth: '1990-05-15',
                gender: 'MALE',
                maritalStatus: 'SINGLE',
                bloodGroup: 'O+',
                nationality: 'American',

                birthPlace: 'Chicago, IL',

                // Address
                currentAddress: '123 Tech Park, Apt 4B',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                pincode: '10001',
                permanentAddress: '456 Oak Street, Springfield, IL 62704',

                // Emergency
                emergencyContactName: 'Jane Doe',
                emergencyContactRelation: 'Mother',
                emergencyContactPhone: '+1-555-0199',

                // Financial
                bankName: 'Chase Bank',
                accountNumber: '**** **** **** 6789',
                ifscCode: 'CHAS0001234', // Using generic/Indian format as per schema default
                accountHolderName: 'John Doe',
                accountType: 'SAVINGS',
                panNumber: 'ABCDE1234F',
                aadhaarNumber: '1234 5678 9012',
                uanNumber: '100000000001',
                pfNumber: 'AB/CDE/12345/678',
                baseSalary: 120000, // Annual
                paymentMethod: 'BANK_TRANSFER',

                // System
                createdAt: '2023-01-10T10:00:00Z'
            });
            setIsLoading(false);
        };

        if (params.id) {
            fetchEmployee();
        }
    }, [params.id]);

    if (isLoading || !employee) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const getInitials = (first, last) => `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'ON_LEAVE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'NOTICE_PERIOD': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'professional', label: 'Employment', icon: Briefcase },
        { id: 'financial', label: 'Financial', icon: DollarSign },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                <Breadcrumb
                    items={[
                        { label: 'Master Admin', href: '/master-admin/dashboard' },
                        { label: 'Employees', href: '/master-admin/employees' },
                        { label: `${employee.firstName} ${employee.lastName}`, href: '#' },
                    ]}
                />

                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold">
                                    {getInitials(employee.firstName, employee.lastName)}
                                </div>
                                <div className={`absolute bottom-1 right-1 h-5 w-5 border-2 border-white dark:border-gray-800 rounded-full ${employee.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.firstName} {employee.lastName}</h1>
                                <div className="flex items-center gap-3 mt-1 text-gray-500 dark:text-gray-400">
                                    <span className="text-sm font-medium">{employee.designation.name}</span>
                                    <span className="h-1 w-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                    <span className="text-sm">{employee.department.name}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                                        <Building2 size={14} />
                                        {employee.company.name}
                                    </span>
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${getStatusColor(employee.status)}`}>
                                        {employee.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium">
                                <Pencil size={18} />
                                Edit Profile
                            </button>
                            <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                                ${isActive
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                        }
                            `}
                                >
                                    <Icon size={18} className={`mr-2 ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Official Email</p>
                                                <p className="text-sm font-medium">{employee.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Phone Number</p>
                                                <p className="text-sm font-medium">{employee.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Work Location</p>
                                                <p className="text-sm font-medium">{employee.workLocation}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{employee.employeeId}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1">Joining Date</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{new Date(employee.joiningDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1">Type</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{employee.employmentType.replace('_', ' ')}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1">Reporting Manager</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{employee.reportingManager.firstName} {employee.reportingManager.lastName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-600 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    Basic Information
                                </h4>
                                <dl className="space-y-5">
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Full Name</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.firstName} {employee.lastName}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{new Date(employee.dateOfBirth).toLocaleDateString()}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Gender</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.gender}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Blood Group</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.bloodGroup}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Marital Status</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.maritalStatus}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Nationality</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.nationality}</dd>
                                    </div>
                                </dl>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-600 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    Contact & Address
                                </h4>
                                <dl className="space-y-5">
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Personal Email</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.personalEmail}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Current Address</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                            {employee.currentAddress}<br />
                                            {employee.city}, {employee.state} - {employee.pincode}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Permanent Address</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.permanentAddress}</dd>
                                    </div>
                                </dl>

                                <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-600 uppercase tracking-wider mt-8 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    Emergency Contact
                                </h4>
                                <dl className="space-y-5">
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Name</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.emergencyContactName} ({employee.emergencyContactRelation})</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500 dark:text-gray-400">Phone</dt>
                                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">{employee.emergencyContactPhone}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}

                    {activeTab === 'professional' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Organizational Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Designation</span>
                                        <span className="text-sm font-medium">{employee.designation.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Department</span>
                                        <span className="text-sm font-medium">{employee.department.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Manager</span>
                                        <span className="text-sm font-medium">{employee.reportingManager.firstName} {employee.reportingManager.lastName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Location</span>
                                        <span className="text-sm font-medium">{employee.location.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Work Schedule & Status</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Shift</span>
                                        <span className="text-sm font-medium">{employee.workShift}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Employment Type</span>
                                        <span className="text-sm font-medium">{employee.employmentType?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Joining Date</span>
                                        <span className="text-sm font-medium">{new Date(employee.joiningDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Confirmation Date</span>
                                        <span className="text-sm font-medium">{new Date(employee.confirmationDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <CreditCard size={18} /> Bank Information
                                </h4>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Bank Name</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{employee.bankName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Account Type</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{employee.accountType}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Account Number</p>
                                            <p className="font-mono text-gray-900 dark:text-white tracking-wider">{employee.accountNumber}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">IFSC / Routing Code</p>
                                            <p className="font-mono text-gray-900 dark:text-white">{employee.ifscCode}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText size={18} /> Statutory Info
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">PAN Number</span>
                                        <span className="font-mono font-medium text-gray-900 dark:text-white">{employee.panNumber}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Aadhaar / ID</span>
                                        <span className="font-mono font-medium text-gray-900 dark:text-white">{employee.aadhaarNumber}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">UAN (PF)</span>
                                        <span className="font-mono font-medium text-gray-900 dark:text-white">{employee.uanNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                <FileText size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Employee Documents</h3>
                            <p className="text-gray-500 text-sm mt-1">No documents have been uploaded for this employee yet.</p>
                            <button className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Upload Document
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
