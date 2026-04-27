'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/app/(dashboard)/master-admin/components/ActionDropdown';
import { companyOrganizationService } from '@/services/super-admin-services/companyOrganization.service';
import { handleApiError } from '@/utils/errorUtils';

export default function LocationTab({ companyId, isLoadingCompany }) {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        companyId: '',
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        timezone: 'Asia/Kolkata',
        status: 'ACTIVE'
    });

    useEffect(() => {
        if (companyId) {
            setFormData(prev => ({ ...prev, companyId }));
            loadLocations(companyId);
        }
    }, [companyId]);

    const loadLocations = async (id) => {
        setIsLoading(true);
        try {
            const data = await companyOrganizationService.getLocations(id);
            setLocations(data.data || data.locations || data);
        } catch (error) {
            console.error('Failed to load locations', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            companyId: companyId,
            name: '',
            code: '',
            address: '',
            city: '',
            state: '',
            country: 'India',
            pincode: '',
            timezone: 'Asia/Kolkata',
            status: 'ACTIVE'
        });
        setEditingLocation(null);
        setIsFormOpen(false);
    };

    const handleEdit = (location) => {
        setEditingLocation(location);
        setFormData({ ...location });
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        try {
            await companyOrganizationService.deleteLocation(deleteId, companyId);
            toast.success('Location removed');
            loadLocations(companyId);
            setDeleteId(null);
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = {
            ...formData,
            name: String(formData.name || '').trim(),
            code: String(formData.code || '').trim().toUpperCase(),
        };

        try {
            if (editingLocation) {
                await companyOrganizationService.updateLocation(editingLocation.id, trimmed);
                toast.success('Location updated');
            } else {
                await companyOrganizationService.createLocation(trimmed);
                toast.success('Location added');
            }
            loadLocations(companyId);
            resetForm();
        } catch (error) {
            handleApiError(error);
        }
    };

    const filteredLocations = locations.filter((l) => {
        const q = searchQuery.toLowerCase();
        return !q || l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q) || l.city.toLowerCase().includes(q);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-[hsl(var(--primary))]">Locations & Branches</h3>
                    <p className="text-sm text-gray-500 dark:text-[hsl(var(--primary))]/80">Manage your physical offices and branches.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-sm text-sm font-semibold hover:bg-[hsl(var(--primary))]/90"
                >
                    <Plus size={18} /> Add Branch
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[hsl(var(--primary))]/70" size={16} />
                <input
                    type="text"
                    placeholder="Search locations..."
                    className="w-full pl-10 pr-4 py-2 border rounded-sm text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] dark:border-gray-700 dark:text-[hsl(var(--primary))]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-sm w-full max-w-xl shadow-xl">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 dark:text-[hsl(var(--primary))]">{editingLocation ? 'Edit Branch' : 'Add New Branch'}</h3>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:text-[hsl(var(--primary))]">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase dark:text-[hsl(var(--primary))]">Branch Name</label>
                                <input required className="w-full px-3 py-2 border rounded-sm text-sm dark:border-gray-700 dark:text-[hsl(var(--primary))]" value={formData.name} onChange={v => setFormData({ ...formData, name: v.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase dark:text-[hsl(var(--primary))]">Branch Code</label>
                                <input required className="w-full px-3 py-2 border rounded-sm text-sm dark:border-gray-700 dark:text-[hsl(var(--primary))]" value={formData.code} onChange={v => setFormData({ ...formData, code: v.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase dark:text-[hsl(var(--primary))]">City</label>
                                <input className="w-full px-3 py-2 border rounded-sm text-sm dark:border-gray-700 dark:text-[hsl(var(--primary))]" value={formData.city} onChange={v => setFormData({ ...formData, city: v.target.value })} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase dark:text-[hsl(var(--primary))]">Address</label>
                                <textarea className="w-full px-3 py-2 border rounded-sm text-sm dark:border-gray-700 dark:text-[hsl(var(--primary))]" rows="2" value={formData.address} onChange={v => setFormData({ ...formData, address: v.target.value })} />
                            </div>
                            <div className="flex justify-end col-span-2 gap-2 pt-4">
                                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm border hover:bg-gray-50 dark:text-[hsl(var(--primary))] dark:border-[hsl(var(--primary))]/30 dark:hover:bg-[hsl(var(--primary))]/10">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-[hsl(var(--primary))] text-white font-semibold hover:bg-[hsl(var(--primary))]/90">Save Location</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Locations Table */}
            <div className="bg-white dark:bg-gray-900 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">
                {isLoading ? (
                    <div className="p-10 text-center text-gray-500">Loading locations...</div>
                ) : filteredLocations.length > 0 ? (
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-[hsl(var(--primary))]">
                            <thead className="bg-primary-50 dark:bg-[hsl(var(--primary))]/10 text-xs uppercase text-primary-700 dark:text-[hsl(var(--primary))] font-medium border-b border-primary-100 dark:border-[hsl(var(--primary))]/20">
                                <tr>
                                    <th className="px-6 py-3">Location / Code</th>
                                    <th className="px-6 py-3">City / State</th>
                                    <th className="px-6 py-3">Country</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLocations.map((loc) => (
                                    <tr key={loc.id} className="hover:bg-gray-50 dark:hover:bg-[hsl(var(--primary))]/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-[hsl(var(--primary))]">{loc.name}</div>
                                            <div className="text-xs text-primary-600 dark:text-[hsl(var(--primary))] font-medium">{loc.code}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-[hsl(var(--primary))]">{loc.city}</div>
                                            <div className="text-xs text-gray-500 dark:text-[hsl(var(--primary))]/80">
                                                {loc.state} {loc.pincode ? `- ${loc.pincode}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-[hsl(var(--primary))]">{loc.country}</div>
                                            <div className="text-xs text-gray-400 dark:text-[hsl(var(--primary))]/70">{loc.timezone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${loc.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[hsl(var(--primary))]/15 dark:text-[hsl(var(--primary))] dark:border-[hsl(var(--primary))]/30' : 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-[hsl(var(--primary))] dark:border-[hsl(var(--primary))]/20'}`}>
                                                {loc.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ActionDropdown
                                                customActions={[
                                                    {
                                                        label: "Edit",
                                                        icon: Edit2,
                                                        onClick: () => handleEdit(loc),
                                                        className: "text-gray-700 dark:text-[hsl(var(--primary))]",
                                                        iconClassName: "text-emerald-600 dark:text-[hsl(var(--primary))]",
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: Trash2,
                                                        onClick: () => setDeleteId(loc.id),
                                                        className: "text-red-700 dark:text-red-300",
                                                        iconClassName: "text-red-600 dark:text-red-400",
                                                        hoverClassName: "hover:bg-red-50 dark:hover:bg-red-900/20",
                                                    },
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p className="font-medium text-gray-900">No locations found</p>
                        <p className="text-sm mt-1">Add your first branch to manage city-wise locations.</p>
                    </div>
                )}
            </div>

            <ConfirmationDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Remove Location?"
                message="Are you sure you want to remove this branch record?"
            />
        </div>
    );
}
