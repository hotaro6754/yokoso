'use client';

import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { workflowManageService } from '@/services/super-admin-services/workflow-manage.service';
import Breadcrumb from '@/components/common/Breadcrumb';
import WorkflowForm from '../_components/WorkflowForm';

export default function AddWorkflowPage() {
    const router = useRouter();

    const handleSubmit = async (values) => {
        try {
            await workflowManageService.createWorkflow(values);
            toast.success('Workflow created successfully');
            router.push('/company-admin/workflow-management');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create workflow');
        }
    };

    const handleCancel = () => {
        router.push('/company-admin/workflow-management');
    };

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans">
            <Toaster position="top-right" />
            <Breadcrumb pageName="Create Workflow" />

            <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Define New Workflow</h2>
                <WorkflowForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
