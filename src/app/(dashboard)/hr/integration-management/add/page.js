'use client';

import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { integrationService } from '@/services/super-admin-services/integration.service';
import Breadcrumb from '@/components/common/Breadcrumb';
import BiometricIntegrationForm from '../_components/BiometricIntegrationForm';

export default function HRAddIntegrationPage() {
    const router = useRouter();

    const handleSubmit = async (values) => {
        try {
            await integrationService.createIntegration(values);
            toast.success('Biometric integration created successfully');
            router.push('/hr/integration-management');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create integration');
        }
    };

    const handleCancel = () => {
        router.push('/hr/integration-management');
    };

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans">
            <Toaster position="top-right" />
            <Breadcrumb pageName="Add Biometric Integration" />

            <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Setup New Biometric Device</h2>
                <BiometricIntegrationForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
