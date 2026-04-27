'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import CompanyForm from '../components/CompanyForm';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AddCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      // 1. Prepare data for the backend (sanitizing types is done inside CompanyForm)
      // 2. Perform the real API POST request
      const response = await apiClient.post('/master-admin/company', values);

      if (response.data.success) {
        toast.success(response.data.message || 'Company created successfully!');
        // 3. Redirect back to the company list
        router.push('/master-admin/company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Failed to create company. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: 'Master Admin', href: '/master-admin/dashboard' },
            { label: 'Company', href: '/master-admin/company' },
            { label: 'Add', href: '/master-admin/company/add' },
          ]}
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Add Company</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create a company profile and configure plan limits.
              </p>
            </div>
          </div>
        </div>

        <CompanyForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.push('/master-admin/company')}
          submitText={isLoading ? 'Saving...' : 'Save Company'}
        />
      </div>
    </div>
  );
}