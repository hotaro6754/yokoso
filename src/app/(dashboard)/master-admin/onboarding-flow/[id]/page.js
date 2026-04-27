'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import OnboardingFlowForm from '../components/OnboardingFlowForm';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingFlowViewPage() {
  const router = useRouter();
  const params = useParams();
  const flowId = params?.id;
  const [flow, setFlow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchFlowDetails = async () => {
      try {
        setIsLoading(true);
        // Real API Call to fetch onboarding flow by ID
        const response = await apiClient.get(`/master-admin/onboarding-flow/${flowId}`);
        
        if (response.data.success) {
          setFlow(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching onboarding flow:', error);
        toast.error('Onboarding flow not found or access denied.');
        router.push('/master-admin/onboarding-flow');
      } finally {
        setIsLoading(false);
      }
    };

    if (flowId) {
      fetchFlowDetails();
    }
  }, [flowId, router]);

  const handleSubmit = async (values) => {
    setIsSaving(true);
    try {
      const response = await apiClient.put(`/master-admin/onboarding-flow/${flowId}`, { ...values, isCompleted: true });
      if (response.data.success) {
        toast.success('Onboarding flow finalized successfully');
        return true; 
      }
    } catch (error) {
      console.error('Error finalizing flow:', error);
      toast.error('Failed to finalize onboarding flow.');
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Fetching flow details...</p>
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Onboarding flow not found.</p>
            <Link 
              href="/master-admin/onboarding-flow" 
              className="inline-flex items-center gap-2 text-primary-600 font-bold hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Onboarding List
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
              { label: flow.companyName || 'View Details', href: `/master-admin/onboarding-flow/${flow.id}` },
            ]}
          />
          <Link
            href={`/master-admin/onboarding-flow/${flow.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-bold text-sm"
          >
            Edit This Flow
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="mb-8 border-b dark:border-gray-700 pb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding Flow Details</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Reviewing configuration for <span className="font-bold text-primary-600">{flow.companyName}</span>. 
              This is a read-only view.
            </p>
          </div>
          
          <OnboardingFlowForm 
            mode="view" 
            initialValues={flow} 
            onSubmit={handleSubmit}
            onCancel={() => router.push('/master-admin/onboarding-flow')} 
          />
        </div>
      </div>
    </div>
  );
}