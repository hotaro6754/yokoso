// src/app/(dashboard)/hr/leave/types/edit/[id]/page.js
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import LeaveTypeForm from '../../../components/LeaveTypeForm';
import { leaveTypeService } from '@/services/hr-services/leaveTypeService';
import { toast } from 'sonner';

export default function EditLeaveType() {
  const router = useRouter();
  const params = useParams();
  const [leaveType, setLeaveType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLeaveType = async () => {
      try {
        const typeId = parseInt(params.id);
        const leaveTypeData = await leaveTypeService.getLeaveTypeById(typeId);
        setLeaveType(leaveTypeData.data);
      } catch (error) {
        console.error('Error fetching leave type:', error);
        toast.error(error.message || 'Failed to fetch leave type');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveType();
  }, [params.id]);

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    try {
      await leaveTypeService.updateLeaveType(parseInt(params.id), formData);
      toast.success('Leave type updated successfully');
      router.push('/hr/leave/types');
      router.refresh();
    } catch (error) {
      console.error('Error updating leave type:', error);
      toast.error(error.message || 'Failed to update leave type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/hr/leave/types');
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </div>
    );
  }

  if (!leaveType) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
        <Breadcrumb
          pages={[
            { name: 'HR', href: '/hr' },
            { name: 'Leave', href: '/hr/leave' },
            { name: 'Leave Types', href: '/hr/leave/types' },
            { name: 'Edit Leave Type', href: '#' },
          ]}
        />

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Leave Type Not Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            The requested leave type could not be found.
          </p>
          <button
            onClick={() => router.push('/hr/leave/types')}
            className="mt-4 px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold"
          >
            Back to Leave Types
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        pages={[
          { name: 'HR', href: '/hr' },
          { name: 'Leave', href: '/hr/leave' },
          { name: 'Leave Types', href: '/hr/leave/types' },
          { name: 'Edit Leave Type', href: '#' },
        ]}
      />

      <div className="mt-6">
        <LeaveTypeForm
          initialData={leaveType}
          onSave={handleSave}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          isEdit={true}
        />
      </div>
    </div>
  );
}