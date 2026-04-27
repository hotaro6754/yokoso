'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Briefcase, Award } from 'lucide-react';
import { companyOrganizationService } from '@/services/super-admin-services/companyOrganization.service';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/app/(dashboard)/master-admin/components/ActionDropdown';

import { useRouter } from 'next/navigation';

export default function DesignationTab({ companyId, isLoadingCompany }) {
    const router = useRouter();
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (companyId) {
            fetchDesignations(companyId);
            fetchDepartments(companyId);
        }
    }, [companyId]);

    const fetchDepartments = async (id) => {
        try {
            const data = await companyOrganizationService.getDepartments(id);
            setDepartments(data.data || data.departments || data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };

    const fetchDesignations = async (id) => {
        setIsLoading(true);
        try {
            const data = await companyOrganizationService.getDesignations(id);
            setDesignations(data.data || data.designations || data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await companyOrganizationService.deleteDesignation(deleteId, companyId);
            toast.success('Designation removed');
            fetchDesignations(companyId);
            setDeleteId(null);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete designation');
        }
    };

    const handleEdit = (desig) => {
        // Navigate to edit page
        router.push(`/company-admin/organization/designations/edit/${desig.id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Designations</h3>
                    <p className="text-sm text-gray-500">Manage official titles and roles.</p>
                </div>
                <button
                    onClick={() => router.push('/company-admin/organization/designations/add')}
                    disabled={!companyId || isLoadingCompany}
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-sm shadow-md transition-all ${companyId ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    <Plus size={18} /> New Designation
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Search designations..."
                    className="w-full pl-10 pr-4 py-2 border rounded-sm text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>



            {/* List */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-visible">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading designations...</div>
                ) : designations.length > 0 ? (
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-primary-50 text-xs uppercase text-primary-700 font-medium border-b border-primary-100">
                                <tr>
                                    <th className="px-6 py-3">Name / Code</th>
                                    <th className="px-6 py-3">Department</th>
                                    <th className="px-6 py-3">Level / Grade</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {designations.map((desig) => {
                                    // Find department name if possible
                                    // const deptName = departments.find(d => d.id === desig.departmentId)?.name || 'Unknown Dept';

                                    return (
                                        <tr key={desig.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{desig.name}</div>
                                                <div className="text-xs text-primary-600">{desig.code}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-gray-600 text-xs">
                                                    <Briefcase size={12} /> {desig.department?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {desig.level && <span className="px-2 py-0.5 border border-purple-200 bg-purple-50 text-purple-700 rounded text-xs">{desig.level}</span>}
                                                    {desig.grade && <span className="px-2 py-0.5 border border-orange-200 bg-orange-50 text-orange-700 rounded text-xs">{desig.grade}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ActionDropdown
                                                    customActions={[
                                                        {
                                                            label: "Edit",
                                                            icon: Edit2,
                                                            onClick: () => handleEdit(desig),
                                                            className: "text-gray-700 dark:text-gray-200",
                                                            iconClassName: "text-emerald-600 dark:text-emerald-400",
                                                        },
                                                        {
                                                            label: "Delete",
                                                            icon: Trash2,
                                                            onClick: () => setDeleteId(desig.id),
                                                            className: "text-red-700 dark:text-red-300",
                                                            iconClassName: "text-red-600 dark:text-red-400",
                                                            hoverClassName: "hover:bg-red-50 dark:hover:bg-red-900/20",
                                                        },
                                                    ]}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <Award className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>No designations found for this company.</p>
                    </div>
                )}
            </div>

            <ConfirmationDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Remove Designation?"
                message="Are you sure you want to delete this designation? This action cannot be undone."
            />
        </div>
    );
}
