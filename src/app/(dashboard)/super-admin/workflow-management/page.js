'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
    Plus,
    Edit2,
    Trash2,
    GitBranch,
    Search,
    Filter,
    Copy,
    CheckCircle2,
    XCircle,
    MoreVertical
} from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ConfirmModal from '@/components/common/ConfirmModal';
import Pagination from '@/components/common/Pagination';
import { workflowManageService } from '@/services/super-admin-services/workflow-manage.service';

export default function WorkflowManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [params, setParams] = useState({ page: 1, limit: 10, type: '', isActive: '' });
    const [totalDocs, setTotalDocs] = useState(0);

    // Menu State for Portal
    const [menuState, setMenuState] = useState({
        isOpen: false,
        workflow: null,
        position: { top: 0, left: 0 }
    });

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [cloneModal, setCloneModal] = useState({ isOpen: false, workflow: null, newName: '' });

    // Fetch workflows
    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const response = await workflowManageService.getAllWorkflows(params);
            if (response?.data?.workflows) {
                setWorkflows(response.data.workflows);
                setTotalDocs(response.data.pagination?.total || 0);
            } else {
                setWorkflows(response.workflows || response.docs || []);
                setTotalDocs(response.pagination?.total || response.totalDocs || 0);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch workflows');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const urlType = searchParams?.get('type') || '';
        const mappedType = urlType === 'ATTENDANCE' ? 'ATTENDANCE_REGULARIZATION' : urlType;
        setParams((prev) => {
            if (prev.type !== mappedType) {
                return { ...prev, type: mappedType, page: 1 };
            }
            return prev;
        });
    }, [searchParams]);

    useEffect(() => {
        fetchWorkflows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    const handleToggleMenu = (e, workflow) => {
        e.stopPropagation();
        if (menuState.isOpen && menuState.workflow?.id === workflow.id) {
            setMenuState(prev => ({ ...prev, isOpen: false }));
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuState({
                isOpen: true,
                workflow: workflow,
                position: { top: rect.bottom + 2, left: rect.right - 160 }
            });
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ isOpen: true, id });
        setMenuState(prev => ({ ...prev, isOpen: false }));
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await workflowManageService.deleteWorkflow(deleteModal.id);
            toast.success('Workflow deleted successfully');
            fetchWorkflows();
        } catch (error) {
            toast.error('Failed to delete workflow');
        } finally {
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const handleCloneClick = (workflow) => {
        setCloneModal({
            isOpen: true,
            workflow: workflow,
            newName: `Copy of ${workflow.name}`
        });
        setMenuState(prev => ({ ...prev, isOpen: false }));
    };

    const confirmClone = async () => {
        if (!cloneModal.workflow || !cloneModal.newName.trim()) return;

        try {
            await workflowManageService.cloneWorkflow(cloneModal.workflow.id, { name: cloneModal.newName });
            toast.success('Workflow cloned successfully');
            fetchWorkflows();
            setCloneModal({ isOpen: false, workflow: null, newName: '' });
        } catch (error) {
            toast.error('Failed to clone workflow');
        }
    };

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans">
            <Toaster position="top-right" />
            <Breadcrumb pageName="Workflow Management" />

            {/* Header & Controls */}
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row shadow-sm p-4 bg-white rounded-sm border border-gray-100">
                <div className="relative w-full sm:w-72">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search workflows..."
                            className="w-full rounded-sm border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                        />
                    </div>
                </div>

                <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            className="rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                            value={params.type}
                            onChange={(e) => setParams({ ...params, type: e.target.value, page: 1 })}
                        >
                            <option value="">All Types</option>
                            <option value="LEAVE">Leave</option>
                            <option value="ATTENDANCE_REGULARIZATION">Attendance Regularization</option>
                            <option value="EXPENSE">Expense</option>
                            <option value="RECRUITMENT">Recruitment</option>
                            <option value="PAYROLL">Payroll</option>
                        </select>
                        <select
                            className="rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                            value={params.isActive}
                            onChange={(e) => setParams({ ...params, isActive: e.target.value, page: 1 })}
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                    <button
                        onClick={() => router.push('/company-admin/workflow-management/add')}
                        className="flex items-center gap-2 rounded-sm bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                    >
                        <Plus className="h-4 w-4" />
                        Create Workflow
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6 rounded-sm border border-gray-200 bg-white shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
                    </div>
                ) : workflows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <GitBranch className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No workflows found</p>
                        <p className="text-sm">Create a new workflow to get started</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="overflow-x-auto overflow-y-visible">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Steps</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {workflows.map((workflow) => (
                                        <tr key={workflow.id} className="hover:bg-gray-50 transition-colors relative">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{workflow.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate" title={workflow.description}>
                                                    {workflow.description}
                                                </div>
                                                {workflow.isDefault && (
                                                    <span className="inline-flex items-center rounded-sm bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 mt-1">Default</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20">
                                                    {workflow.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <div className="flex -space-x-2 overflow-hidden">
                                                        {workflow.steps?.map((step, idx) => (
                                                            <div key={idx} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 ring-2 ring-white text-xs font-medium text-primary-800" title={step.name}>
                                                                {step.stepNumber}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs ml-2">({workflow.steps?.length || 0} Levels)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    {workflow.isActive ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <span className={workflow.isActive ? 'text-green-700' : 'text-gray-500'}>
                                                        {workflow.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="relative flex justify-end">
                                                    <button
                                                        onClick={(e) => handleToggleMenu(e, workflow)}
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-gray-100 p-4 bg-gray-50/30">
                            <Pagination
                                currentPage={params.page}
                                totalItems={totalDocs > 0 ? totalDocs : workflows.length}
                                itemsPerPage={params.limit}
                                onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
                                onItemsPerPageChange={(limit) => setParams(prev => ({ ...prev, limit, page: 1 }))}
                            />
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Workflow"
                description="Are you sure you want to delete this workflow? This action cannot be undone."
                confirmText="Delete"
                confirmButtonClassName="bg-red-600 hover:bg-red-700"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
            />

            {/* Custom Clone Modal */}
            {cloneModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setCloneModal(prev => ({ ...prev, isOpen: false }))}
                    />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Clone Workflow
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New Workflow Name
                                </label>
                                <input
                                    type="text"
                                    value={cloneModal.newName}
                                    onChange={(e) => setCloneModal(prev => ({ ...prev, newName: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setCloneModal(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmClone}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                                >
                                    Clone
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Portal Action Menu */}
            {menuState.isOpen && typeof document !== 'undefined' && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setMenuState(prev => ({ ...prev, isOpen: false }))}
                    />
                    <div
                        className="fixed z-[9999] w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-100"
                        style={{ top: menuState.position.top, left: menuState.position.left }}
                    >
                        <button
                            onClick={() => handleCloneClick(menuState.workflow)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Copy size={14} /> Clone
                        </button>
                        <button
                            onClick={() => {
                                router.push(`/company-admin/workflow-management/edit/${menuState.workflow?.id}`);
                                setMenuState(prev => ({ ...prev, isOpen: false }));
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Edit2 size={14} /> Edit
                        </button>
                        <button
                            onClick={() => handleDeleteClick(menuState.workflow?.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}
