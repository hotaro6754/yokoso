'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import OnboardingFlowForm from '../../components/OnboardingFlowForm';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingFlowEditPage() {
  const router = useRouter();
  const params = useParams();
  const flowId = params?.id;
  const [flow, setFlow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch current flow data to pre-fill the form
  useEffect(() => {
    const fetchFlowDetails = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/master-admin/onboarding-flow/${flowId}`);
        
        if (response.data.success) {
          setFlow(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching flow:', error);
        toast.error('Could not load onboarding flow details.');
        router.push('/master-admin/onboarding-flow');
      } finally {
        setIsLoading(false);
      }
    };

    if (flowId) {
      fetchFlowDetails();
    }
  }, [flowId, router]);

  // 2. Handle the update submission
  const handleSubmit = async (values) => {
    setIsSaving(true);
    try {
      // Real API PUT request to update the flow
      const response = await apiClient.put(`/master-admin/onboarding-flow/${flowId}`, values);

      if (response.data.success) {
        toast.success(response.data.message || 'Onboarding flow updated successfully');
        // Redirect back to the specific flow's view page
        router.push(`/master-admin/onboarding-flow/${flowId}`);
      }
    } catch (error) {
      console.error('Error updating flow:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update onboarding flow.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading flow data...</p>
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Onboarding flow not found.</p>
            <Link 
              href="/master-admin/onboarding-flow"
              className="inline-flex items-center gap-2 text-primary-600 font-bold hover:underline"
            >
              <ArrowLeft size={16} />
              Return to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'Onboarding Flow', href: '/master-admin/onboarding-flow' },
              { label: flow.companyName || 'View Flow', href: `/master-admin/onboarding-flow/${flow.id}` },
              { label: 'Edit', href: `/master-admin/onboarding-flow/${flow.id}/edit` },
            ]}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Onboarding Flow</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Modifying progress for <span className="font-bold text-primary-600">{flow.companyName}</span>. 
              Update the fields below and complete the steps to save.
            </p>
          </div>

          <OnboardingFlowForm
            mode="edit"
            initialValues={flow}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/master-admin/onboarding-flow/${flowId}`)}
          />
        </div>
      </div>
    </div>
  );
}