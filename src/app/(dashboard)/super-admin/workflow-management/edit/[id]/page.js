'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { workflowManageService } from '@/services/super-admin-services/workflow-manage.service';
import Breadcrumb from '@/components/common/Breadcrumb';
import WorkflowForm from '../../_components/WorkflowForm';

export default function EditWorkflowPage() {
    const router = useRouter();
    const { id } = useParams();
    const [workflow, setWorkflow] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflow = async () => {
            try {
                const response = await workflowManageService.getWorkflowById(id);
                // Handle { success: true, data: ... } vs direct object
                setWorkflow(response.data || response);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch workflow details');
                router.push('/company-admin/workflow-management');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchWorkflow();
        }
    }, [id, router]);

    const handleSubmit = async (values) => {
        try {
            await workflowManageService.updateWorkflow(id, values);
            toast.success('Workflow updated successfully');
            router.push('/company-admin/workflow-management');
        } catch (error) {
            console.error('Update workflow error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update workflow';
            toast.error(errorMessage);
            // Re-throw error so Formik can reset isSubmitting state
            throw error;
        }
    };

    const handleCancel = () => {
        router.push('/company-admin/workflow-management');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!workflow) return null;

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans">
            <Toaster position="top-right" />
            <Breadcrumb pageName="Edit Workflow" />

            <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Edit Workflow: {workflow.name}</h2>
                <WorkflowForm
                    initialValues={workflow}
                    onSubmit={handleSubmit}
                    isEditing={true}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
