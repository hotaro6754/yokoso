'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users, Briefcase } from 'lucide-react';
import ActionDropdown from '@/app/(dashboard)/master-admin/components/ActionDropdown';
import { companyOrganizationService } from '@/services/super-admin-services/companyOrganization.service';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { toast } from 'react-hot-toast';
import { handleApiError } from '@/utils/errorUtils';

export default function DepartmentTab({ companyId, isLoadingCompany }) {
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        headOfDepartment: '',
        locationId: ''
    });

    useEffect(() => {
        if (companyId) {
            fetchDepartments(companyId);
            fetchLocations(companyId);
        }
    }, [companyId]);

    const fetchDepartments = async (companyId) => {
        setIsLoading(true);
        try {
            const data = await companyOrganizationService.getDepartments(companyId);
            setDepartments(data.data || data.departments || data);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLocations = async (companyId) => {
        try {
            const data = await companyOrganizationService.getLocations(companyId);
            setLocations(data.data || data.locations || data);
        } catch (error) { }
    };

    const resetForm = () => {
        setEditingDepartment(null);
        setFormData({
            name: '',
            code: '',
            headOfDepartment: '',
            locationId: ''
        });
        setIsFormOpen(false);
    };

    const handleEdit = (dept) => {
        setEditingDepartment(dept);
        setFormData({
            name: dept.name || '',
            code: dept.code || '',
            headOfDepartment: dept.headOfDepartment || '',
            locationId: dept.locationId || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        try {
            await companyOrganizationService.deleteDepartment(deleteId, companyId);
            toast.success('Department removed');
            fetchDepartments(companyId);
            setDeleteId(null);
        } catch (error) {
            toast.error('Failed to delete department');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation could go here

        try {
            const payload = { ...formData, companyId };
            if (editingDepartment) {
                await companyOrganizationService.updateDepartment(editingDepartment.id, payload);
                toast.success('Department updated successfully');
            } else {
                await companyOrganizationService.createDepartment(payload);
                toast.success('Department created successfully');
            }
            fetchDepartments(companyId);
            resetForm();
        } catch (error) {
            handleApiError(error);
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Departments</h3>
                    <p className="text-sm text-gray-500">Manage business units and administrative departments.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    disabled={!companyId || isLoadingCompany}
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-sm shadow-md transition-all ${companyId ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    <Plus size={18} /> New Department
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Search departments..."
                    className="w-full pl-10 pr-4 py-2 border rounded-sm text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isFormOpen && (
                <div className="bg-white p-6 rounded-md shadow-md border border-gray-100 mb-6 transition-all">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">
                        {editingDepartment ? 'Edit Department' : 'Add New Department'}
                    </h4>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Department Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Human Resources"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. HR"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Head of Department</label>
                                <input
                                    type="text"
                                    value={formData.headOfDepartment}
                                    onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location</label>
                                <select
                                    value={formData.locationId}
                                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                >
                                    <option value="">Select Location</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 shadow-sm"
                            >
                                {editingDepartment ? 'Update Department' : 'Save Department'}
                            </button>
                        </div>
                    </form>
                </div>
            )}


            {/* List */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-visible">
                {isLoading && !departments.length ? (
                    <div className="p-8 text-center text-gray-500">Loading departments...</div>
                ) : filteredDepartments.length > 0 ? (
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-primary-50 text-xs uppercase text-primary-700 font-medium border-b border-primary-100">
                                <tr>
                                    <th className="px-6 py-3">Name / Code</th>
                                    <th className="px-6 py-3">Head of Dept</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDepartments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{dept.name}</div>
                                            <div className="text-xs text-primary-600">{dept.code}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {dept.headOfDepartment ? dept.headOfDepartment.charAt(0) : <Users size={12} />}
                                                </div>
                                                <span>{dept.headOfDepartment || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ActionDropdown
                                                customActions={[
                                                    {
                                                        label: "Edit",
                                                        icon: Edit2,
                                                        onClick: () => handleEdit(dept),
                                                        className: "text-gray-700 dark:text-gray-200",
                                                        iconClassName: "text-emerald-600 dark:text-emerald-400",
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: Trash2,
                                                        onClick: () => setDeleteId(dept.id),
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
                        <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>No departments found for this company.</p>
                    </div>
                )}
            </div>

            <ConfirmationDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Remove Department?"
                message="Are you sure you want to delete this department? This action cannot be undone."
            />
        </div>
    );
}
