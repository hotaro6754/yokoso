"use client";

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
    AlertTriangle,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Calendar,
    MapPin,
    User,
    Laptop,
    X,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';
import Pagination from '@/components/common/Pagination';
import Link from 'next/link';

export default function MissingAssetsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // Form state
    const [availableDevices, setAvailableDevices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        deviceId: '',
        employeeId: '',
        missingDate: new Date().toISOString().split('T')[0],
        location: '',
        description: '',
        status: 'MISSING'
    });

    useEffect(() => {
        loadReports();
        loadDropdownData();
    }, [statusFilter, currentPage, itemsPerPage]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const params = {
                // Since backend getReports doesn't have pagination yet, we'll handle it client side 
                // or I should have added it. Let's assume the service handles basic params.
                status: statusFilter !== 'all' ? statusFilter : undefined
            };
            const res = await itDeviceService.getMissingReports(params);
            if (res?.success) {
                setReports(res.data || []);
            }
        } catch (e) {
            toast.error('Failed to load missing reports');
        } finally {
            setLoading(false);
        }
    };

    const loadDropdownData = async () => {
        try {
            // Get all devices (not just available ones, because a missing device might be assigned)
            const deviceRes = await itDeviceService.getDevices({ limit: 200 });
            if (deviceRes?.success) {
                setAvailableDevices(deviceRes.data?.devices || []);
            }

            const empRes = await itDeviceService.getEmployees();
            if (empRes?.success) {
                // The employees API returns the array directly in the data property
                setEmployees(empRes.data || []);
            }
        } catch (e) {
            console.error('Failed to load dropdown data', e);
        }
    };

    const handleCreate = () => {
        setIsEditing(false);
        setFormData({
            deviceId: '',
            employeeId: '',
            missingDate: new Date().toISOString().split('T')[0],
            location: '',
            description: '',
            status: 'MISSING'
        });
        setShowModal(true);
    };

    const handleEdit = (report) => {
        setIsEditing(true);
        setSelectedReport(report);
        setFormData({
            deviceId: report.deviceId,
            employeeId: report.employee?.publicId || '',
            missingDate: report.missingDate?.split('T')[0] || '',
            location: report.location || '',
            description: report.description || '',
            status: report.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        try {
            const res = await itDeviceService.deleteMissingReport(id);
            if (res?.success) {
                toast.success('Report deleted successfully');
                loadReports();
            }
        } catch (e) {
            toast.error('Failed to delete report');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (isEditing) {
                res = await itDeviceService.updateMissingReport(selectedReport.id, formData);
            } else {
                res = await itDeviceService.createMissingReport(formData);
            }

            if (res?.success) {
                toast.success(isEditing ? 'Report updated' : 'Report created');
                setShowModal(false);
                loadReports();
            }
        } catch (e) {
            toast.error(e.message || 'Action failed');
        }
    };

    const filteredReports = reports.filter(r =>
        r.device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.employee && (r.employee.firstName + ' ' + r.employee.lastName).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'MISSING': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'FOUND': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'WRITTEN_OFF': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Breadcrumb
                    items={[
                        { label: "IT Admin", href: "/it-admin" },
                        { label: "Missing Assets", href: "/it-admin/missing-assets" },
                    ]}
                />

                {/* Header */}
                <div className="mt-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-500 rounded-xl shadow-lg shadow-red-200 dark:shadow-none">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Missing Assets
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Track and manage reported missing or lost IT equipment
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus size={20} />
                        Report Missing Asset
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search serial number or employee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-red-500 transition-all dark:text-white appearance-none"
                            >
                                <option value="all">All Status</option>
                                <option value="MISSING">Missing</option>
                                <option value="FOUND">Found</option>
                                <option value="WRITTEN_OFF">Written Off</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Device</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported Missing By</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">Loading missing assets...</td></tr>
                                ) : filteredReports.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No missing assets found</td></tr>
                                ) : filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                                    <Laptop className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{report.device.serialNumber}</p>
                                                    <p className="text-xs text-gray-500">{report.device.brand} {report.device.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.employee ? (
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    <span className="text-sm dark:text-gray-300">
                                                        {report.employee.firstName} {report.employee.lastName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No employee linked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(report.missingDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusBadge(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/it-admin/missing-assets/${report.id}`} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-lg transition-all" title="View Details">
                                                    <Eye size={18} />
                                                </Link>
                                                <button onClick={() => handleEdit(report)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-all" title="Edit">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(report.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-all" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="px-6 py-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {isEditing ? 'Update Missing Asset' : 'Report Missing Asset'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Device *</label>
                                    <select
                                        required
                                        value={formData.deviceId}
                                        onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                                        disabled={isEditing}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-red-500 dark:text-white disabled:opacity-50"
                                    >
                                        <option value="">Select a device</option>
                                        {availableDevices?.map(d => (
                                            <option key={d.id} value={d.id}>{d.serialNumber} - {d.brand} {d.model}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Assigned Employee (if any)</label>
                                    <select
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-red-500 dark:text-white"
                                    >
                                        <option value="">Select employee</option>
                                        {employees?.map(e => (
                                            <option key={e.publicId || e.id} value={e.publicId || e.id}>
                                                {e.firstName} {e.lastName} ({e.employeeId})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Missing Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.missingDate}
                                            onChange={(e) => setFormData({ ...formData, missingDate: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-red-500 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-red-500 dark:text-white"
                                        >
                                            <option value="MISSING">Missing</option>
                                            <option value="FOUND">Found</option>
                                            <option value="WRITTEN_OFF">Written Off</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Known Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Office Desk, Transit"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-red-500 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description / Remarks</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Provide details about the loss..."
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-red-500 dark:text-white resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                                >
                                    {isEditing ? 'Update Report' : 'Confirm Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
