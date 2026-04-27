// src/app/(dashboard)/hr/leave/requests/add/page.js
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import LeaveRequestForm from '../../components/LeaveRequestForm';
import { leaveRequestService } from '@/services/hr-services/leaveRequestService';
import { toast } from 'sonner';

export default function AddLeaveRequest() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = () => {
    // The form handles the API call and redirect. 
    // This callback is called after successful submission.
    // router.push('/hr/leave/requests');
    // router.refresh();
  };

  const handleCancel = () => {
    router.push('/hr/leave/requests');
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        pages={[
          { name: 'HR', href: '/hr' },
          { name: 'Leave', href: '/hr/leave' },
          { name: 'Requests', href: '/hr/leave/requests' },
          { name: 'Add Leave Request', href: '#' },
        ]}
      />

      <div className="mt-6">
        <LeaveRequestForm
          isEditMode={false}
          enableEmployeeSelect={true}
          onSave={handleSave}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}