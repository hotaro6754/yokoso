'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Network,
    Search,
    CheckCircle2,
    XCircle,
    AlertOctagon,
    RefreshCw,
    Plus,
    Edit2,
    Trash2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Breadcrumb from '@/components/common/Breadcrumb';
import { integrationService } from '@/services/super-admin-services/integration.service';

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    );
}

export default function IntegrationManagementPage() {
    const router = useRouter();
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

    const fetchIntegrations = async () => {
        setLoading(true);
        try {
            const response = await integrationService.getAllIntegrations();
            const data = response.data || response.integrations || response.docs || [];

            setIntegrations(data);

            // Calculate Stats
            const total = data.length;
            const active = data.filter(i => i.status === 'ACTIVE').length;
            const inactive = total - active;
            setStats({ total, active, inactive });

        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch integrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
            try {
                await integrationService.deleteIntegration(id);
                toast.success('Integration deleted');
                fetchIntegrations();
            } catch (error) {
                toast.error('Failed to delete integration');
            }
        }
    };

    const filteredIntegrations = integrations.filter(i => i.type === 'BIOMETRIC');

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans">
            <Toaster position="top-right" />
            <Breadcrumb pageName="Integration Management" />

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <StatCard title="Total Integrations" value={stats.total} icon={Network} color="bg-blue-600" />
                <StatCard title="Active Connections" value={stats.active} icon={CheckCircle2} color="bg-green-500" />
                <StatCard title="Inactive/Failed" value={stats.inactive} icon={AlertOctagon} color="bg-red-500" />
                <StatCard title="Avg Sync Time" value="1.2s" icon={RefreshCw} color="bg-purple-500" />
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-6">
                {/* Left Panel - Category */}
                <div className="w-full md:w-56 flex-shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Category</p>
                        </div>
                        <nav className="p-3">
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-100">
                                <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Network className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-blue-700">Biometric</span>
                            </div>
                        </nav>
                    </div>
                </div>

                {/* Main Panel - List */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            Biometric Integrations
                        </h2>
                        <button
                            onClick={() => router.push('/super-admin/integration-management/add')}
                            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Add New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            </div>
                        ) : filteredIntegrations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Network className="h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-lg font-medium">No integrations found</p>
                                <p className="text-sm">Select a different category or create a new integration.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-500">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold tracking-wider border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Company</th>
                                            <th className="px-6 py-4">Sync Freq</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredIntegrations.map((item) => (
                                            <tr key={item.id || item._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{item.environment}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {/* Placeholder if company missing in response */}
                                                    {item.company?.name || 'Default Company'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.syncFrequency}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        {item.status === 'ACTIVE' ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-gray-400" />
                                                        )}
                                                        <span className={item.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-500'}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => router.push(`/super-admin/integration-management/edit/${item.id || item._id}`)}
                                                            className="rounded-md p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id || item._id)}
                                                            className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
