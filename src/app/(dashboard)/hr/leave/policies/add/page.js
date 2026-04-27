  "use client";
  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import Breadcrumb from '@/components/common/Breadcrumb';
  import PolicyForm from '../comopnents/PolicyForm';

  export default function AddPolicy() {
    const router = useRouter();

    const handleSave = (formData) => {
      // Here you would typically send the data to your API
      console.log('Saving policy:', formData);

      // For now, just redirect back to the policies page
      router.push('/hr/leave/policies');
    };

    const handleCancel = () => {
      router.push('/hr/leave/policies');
    };

    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <Breadcrumb
          pages={[
            { name: 'HR', href: '/hr' },
            { name: 'Leave', href: '/hr/leave' },
            { name: 'Policies', href: '/hr/leave/policies' },
            { name: 'Add Policy', href: '#' },
          ]}
        />

        <div className="mt-6">
          <PolicyForm
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }