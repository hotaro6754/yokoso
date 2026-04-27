'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { integrationService } from '@/services/super-admin-services/integration.service';
import Breadcrumb from '@/components/common/Breadcrumb';
import IntegrationForm from '../../_components/IntegrationForm';

export default function EditIntegrationPage() {
    const router = useRouter();
    const { id } = useParams();
    const [integration, setIntegration] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIntegration = async () => {
            try {
                const response = await integrationService.getIntegrationById(id);
                let data = response.data || response;

                // Normalize config merging if backend returns flattened or changed structure
                // Ideally, the form expects { ..., config: { ... } }

                setIntegration(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch integration details');
                router.push('/super-admin/integration-management');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchIntegration();
        }
    }, [id, router]);

    const handleSubmit = async (values) => {
        try {
            await integrationService.updateIntegration(id, values);
            toast.success('Integration updated successfully');
            router.push('/super-admin/integration-management');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update integration');
        }
    };

    const handleCancel = () => {
        router.push('/super-admin/integration-management');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!integration) return null;

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans">
            <Toaster position="top-right" />
            <Breadcrumb pageName="Edit Integration" />

            <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Integration: {integration.name}</h2>
                <IntegrationForm
                    initialValues={integration}
                    onSubmit={handleSubmit}
                    isEditing={true}
                    integrationId={id}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
