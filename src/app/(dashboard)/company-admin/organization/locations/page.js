'use client';

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Search,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import Pagination from '@/components/common/Pagination';
import { companyOrganizationService } from '@/services/super-admin-services/companyOrganization.service';
import { authService } from '@/services/auth-services/authService';

export default function LocationsPage() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [companyId, setCompanyId] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const defaultForm = {
        name: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        status: 'ACTIVE'
    };
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        const fetchUserAndLocations = async () => {
            try {
                const userResponse = await authService.getCurrentUser();
                const user = userResponse?.user || userResponse?.data?.user;

                if (user?.company?.id) {
                    setCompanyId(user.company.id);
                    fetchLocations(user.company.id);
                } else {
                    const storedCompanyId = localStorage.getItem('company_id');
                    if (storedCompanyId) {
                        setCompanyId(storedCompanyId);
                        fetchLocations(storedCompanyId);
                    }
                }
            } catch (error) {
                console.error("Error loading user data", error);
                setLoading(false);
            }
        };

        fetchUserAndLocations();
    }, []);

    const fetchLocations = async (id) => {
        try {
            setLoading(true);
            const response = await companyOrganizationService.getLocations(id);
            // Handle various response structures
            const data = response.data || response.locations || response || [];
            if (Array.isArray(data)) {
                setLocations(data);
            } else {
                setLocations([]);
            }
        } catch (error) {
            console.error("Error fetching locations", error);
            toast.error("Failed to load locations");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (location = null) => {
        if (location) {
            setEditingLocation(location);
            setFormData({
                name: location.name || '',
                address: location.address || '',
                city: location.city || '',
                state: location.state || '',
                country: location.country || 'India',
                pincode: location.pincode || '',
                status: location.status || 'ACTIVE'
            });
        } else {
            setEditingLocation(null);
            setFormData(defaultForm);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLocation(null);
        setFormData(defaultForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyId) {
            toast.error("Company information missing");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...formData, companyId: parseInt(companyId) };

            if (editingLocation) {
                await companyOrganizationService.updateLocation(editingLocation.id, payload);
                toast.success("Location updated successfully");
            } else {
                await companyOrganizationService.createLocation(payload);
                toast.success("Location created successfully");
            }

            fetchLocations(companyId);
            handleCloseModal();
        } catch (error) {
            console.error("Error saving location", error);
            toast.error(error.response?.data?.message || "Failed to save location");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this location?")) return;

        try {
            await companyOrganizationService.deleteLocation(id, companyId);
            toast.success("Location deleted successfully");
            fetchLocations(companyId);
        } catch (error) {
            console.error("Error deleting location", error);
            toast.error(error.response?.data?.message || "Failed to delete location");
        }
    };

    // Filter locations
    const filteredLocations = locations.filter(loc =>
        loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-transparent p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Breadcrumb & Header */}
                <div className="flex flex-col gap-4">
                    <nav className="text-sm text-gray-500 dark:text-[#BBBDEC] mb-1">
                        <Link href="/company-admin/dashboard" className="hover:text-primary-600 dark:hover:text-[#E0E2FE]">Company Admin</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 dark:text-[#E0E2FE] font-medium">Organization</span>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 dark:text-[#E0E2FE] font-medium">Locations</span>
                    </nav>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E0E2FE]">Locations</h1>
                            <p className="text-sm text-gray-500 dark:text-[#BBBDEC]">Manage your company branches and offices.</p>
                        </div>

                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm dark:bg-[#BBBDEC] dark:text-[#111827] dark:hover:bg-[#E0E2FE]"
                        >
                            <Plus size={18} />
                            Add New Location
                        </button>
                    </div>
                </div>

                {/* Filters & Table Container */}
                <div className="bg-white dark:bg-[rgba(187,189,236,0.06)] rounded-xl border border-gray-200 dark:border-[rgba(187,189,236,0.2)] shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 dark:border-[rgba(187,189,236,0.2)]">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or city..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-[rgba(187,189,236,0.25)] bg-gray-50 dark:bg-[rgba(187,189,236,0.06)] text-sm text-gray-900 dark:text-[#E0E2FE] focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 dark:bg-[rgba(187,189,236,0.08)] text-gray-500 dark:text-[#E0E2FE] text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Location Name</th>
                                    <th className="px-6 py-4">Address</th>
                                    <th className="px-6 py-4">City/State</th>
                                    <th className="px-6 py-4">Country</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[rgba(187,189,236,0.15)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-[#BBBDEC]">Loading locations...</td>
                                    </tr>
                                ) : filteredLocations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-[#BBBDEC]">No locations found.</td>
                                    </tr>
                                ) : (
                                    filteredLocations.map((loc) => (
                                        <tr key={loc.id} className="hover:bg-gray-50 dark:hover:bg-[rgba(187,189,236,0.08)] transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-[#E0E2FE]">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary-50 text-primary-600 dark:bg-[rgba(187,189,236,0.12)] dark:text-[#E0E2FE] flex items-center justify-center">
                                                        <MapPin size={16} />
                                                    </div>
                                                    {loc.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-[#BBBDEC] max-w-xs truncate">
                                                {loc.address || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-[#BBBDEC]">
                                                {[loc.city, loc.state].filter(Boolean).join(', ') || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-[#BBBDEC]">
                                                {loc.country || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${loc.status === 'ACTIVE'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                    }`}>
                                                    {loc.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(loc)}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-[rgba(187,189,236,0.12)] rounded-md text-gray-500 dark:text-[#BBBDEC] hover:text-gray-700 transition"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(loc.id)}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-[rgba(187,189,236,0.12)] rounded-md text-gray-500 dark:text-[#BBBDEC] hover:text-red-600 transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingLocation ? 'Edit Location' : 'Add New Location'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Headquarters, New York Branch"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Full street address"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        State/Province
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        ZIP/Pincode
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.status === 'ACTIVE'}
                                        onChange={e => setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    Active Location
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Location'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
