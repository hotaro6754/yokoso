'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import CompanyForm from '../../components/CompanyForm';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Company details from backend
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/master-admin/company/${id}`);
        // Assuming your standard response structure: { success: true, data: { ... } }
        setCompany(response.data.data);
      } catch (error) {
        console.error('Error fetching company:', error);
        toast.error('Failed to load company details');
        router.push('/master-admin/company');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id, router]);

  // 2. Handle Update Submission
  const handleSubmit = async (values) => {
    setIsSaving(true);
    try {
      // Real API Call to update company
      const response = await apiClient.put(`/master-admin/company/${id}`, values);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Company updated successfully');
        // Redirect back to the view page
        router.push(`/master-admin/company`);
      }
    } catch (error) {
      console.error('Error updating company:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update company';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Breadcrumb
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'Company', href: '/master-admin/company' },
              { label: 'Edit', href: '#' },
            ]}
          />
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">Company not found.</div>
            <Link
              href="/master-admin/company"
              className="inline-flex mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700 items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Company List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: 'Master Admin', href: '/master-admin/dashboard' },
            { label: 'Company', href: '/master-admin/company' },
            { label: company.name, href: `/master-admin/company/${id}` },
            { label: 'Edit', href: `/master-admin/company/${id}/edit` },
          ]}
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Edit Company</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update company details and plan settings. Changes will take effect immediately.
          </p>
        </div>

        <CompanyForm
          mode="edit"
          initialValues={company}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/master-admin/company/${id}`)}
          submitText={isSaving ? 'Saving Changes...' : 'Update Company'}
        />
      </div>
    </div>
  );
}