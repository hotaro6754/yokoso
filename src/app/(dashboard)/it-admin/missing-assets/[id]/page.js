"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
    AlertTriangle,
    Calendar,
    MapPin,
    User,
    Laptop,
    ArrowLeft,
    Clock,
    FileText,
    CheckCircle2,
    XCircle,
    Building2,
    Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';
import Link from 'next/link';

export default function MissingAssetDetailsPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReport();
    }, [id]);

    const loadReport = async () => {
        try {
            setLoading(true);
            const res = await itDeviceService.getMissingReportById(id);
            if (res?.success) {
                setReport(res.data);
            } else {
                toast.error('Failed to load report details');
                router.push('/it-admin/missing-assets');
            }
        } catch (e) {
            toast.error('Error loading report');
            router.push('/it-admin/missing-assets');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'MISSING':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800';
            case 'FOUND':
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800';
            case 'WRITTEN_OFF':
                return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-400 dark:border-gray-800';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading report details...</p>
                </div>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-12">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <Breadcrumb
                    items={[
                        { label: "IT Admin", href: "/it-admin" },
                        { label: "Missing Assets", href: "/it-admin/missing-assets" },
                        { label: "Report Details", href: `/it-admin/missing-assets/${id}` },
                    ]}
                />

                {/* Header Action */}
                <div className="mt-6 mb-8 flex items-center justify-between">
                    <Link
                        href="/it-admin/missing-assets"
                        className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group"
                    >
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group-hover:border-red-200 transition-all">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="font-semibold">Back to Reports</span>
                    </Link>

                    <div className={`px-6 py-2 rounded-2xl border text-sm font-bold tracking-wider uppercase shadow-sm ${getStatusStyles(report.status)}`}>
                        {report.status}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Report Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Report Overview Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 dark:border-gray-700/50 bg-slate-50/50 dark:bg-gray-800/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl shadow-inner">
                                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Incident Summary</h2>
                                            <p className="text-gray-500 text-sm">Case Reference: {report.id.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600 flex flex-col items-center min-w-[100px]">
                                        <Calendar className="h-5 w-5 text-blue-600 mb-1" />
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Incident Date</span>
                                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                                            {new Date(report.missingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FileText size={16} />
                                        Detailed Description
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-800">
                                        {report.description || "No detailed description provided for this incident."}
                                    </div>
                                </div>

                                {/* Incident Metadata */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800 transition-hover hover:border-blue-200 dark:hover:border-blue-800">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-blue-600">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Known Location</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{report.location || "Location not specified"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800 transition-hover hover:border-blue-200 dark:hover:border-blue-800">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-indigo-600">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Report Logged At</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {new Date(report.createdAt).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Device Details Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-700/50 bg-slate-50/30 dark:bg-gray-800/30 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Laptop size={20} className="text-blue-600" />
                                    Asset Information
                                </h3>
                                <div className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full uppercase">
                                    {report.device.deviceType}
                                </div>
                            </div>
                            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Brand</p>
                                    <p className="font-bold text-gray-800 dark:text-white">{report.device.brand}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Model</p>
                                    <p className="font-bold text-gray-800 dark:text-white">{report.device.model}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Serial Number</p>
                                    <p className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg inline-block font-bold text-gray-900 dark:text-white">
                                        {report.device.serialNumber}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Content */}
                    <div className="space-y-8">
                        {/* Reported By (Employee) Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-gray-700 p-8">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <User size={16} />
                                Assigned Personnel
                            </h3>
                            {report.employee ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-4">
                                            <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg shadow-blue-900/20">
                                                {report.employee.firstName[0]}{report.employee.lastName[0]}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-green-500 rounded-xl border-4 border-white dark:border-gray-800 flex items-center justify-center">
                                                <CheckCircle2 size={16} className="text-white" />
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {report.employee.firstName} {report.employee.lastName}
                                        </h4>
                                        <p className="text-sm text-blue-600 font-semibold">{report.employee.employeeId}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-gray-50 dark:border-gray-800">
                                            <Building2 size={18} className="text-gray-400" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Department</p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                                                    {report.employee.department?.name || "Support Ops"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-gray-50 dark:border-gray-800">
                                            <Mail size={18} className="text-gray-400" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Email Address</p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                                                    {report.employee.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 italic text-sm">No linked employee found</p>
                                </div>
                            )}
                        </div>

                        {/* Admin Action Box */}
                        <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <AlertTriangle size={120} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2">Needs Resolution?</h4>
                                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                    Ensure this report is resolved correctly. Marking as found restores device status, while written off justifies replacement.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.push(`/it-admin/missing-assets`)}
                                        className="w-full py-3 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        Update Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
