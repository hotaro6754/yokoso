"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import PolicyForm from '../../comopnents/PolicyForm';
import leavePolicyService from '../../../../../../../services/hr-services/leavepolicies.service';
import { toast } from 'sonner';

export default function EditPolicy() {
  const router = useRouter();
  const params = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    leaveTypes: [],
    departments: [],
    employees: []
  });

  useEffect(() => {
    if (params.id) {
      fetchPolicyAndData();
    }
  }, [params.id]);

  const fetchPolicyAndData = async () => {
    try {
      setLoading(true);
      const policyId = params.id;

      if (!policyId) {
        toast.error('Invalid policy ID');
        router.push('/hr/leave/policies');
        return;
      }

      // Fetch policy data and dropdown data in parallel
      const [policyResult, leaveTypesRes, departmentsRes, employeesRes] = await Promise.all([
        leavePolicyService.getPolicyById(policyId),
        leavePolicyService.getLeaveTypesDropdown(),
        leavePolicyService.getDepartmentsDropdown(),
        leavePolicyService.getEmployeesDropdown()
      ]);

      if (policyResult.success) {
        setPolicy(policyResult.data);
      } else {
        toast.error(policyResult.message || 'Failed to fetch policy');
        router.push('/hr/leave/policies');
        return;
      }

      // Set dropdown data
      if (leaveTypesRes.success) {
        setDropdownData(prev => ({ ...prev, leaveTypes: leaveTypesRes.data || [] }));
      }
      if (departmentsRes.success) {
        setDropdownData(prev => ({ ...prev, departments: departmentsRes.data || [] }));
      }
      if (employeesRes.success) {
        setDropdownData(prev => ({ ...prev, employees: employeesRes.data || [] }));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again.');
      router.push('/hr/leave/policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      const policyId = params.id;

      console.log('Updating policy with data:', formData); // Debug log

      const result = await leavePolicyService.updatePolicy(policyId, formData);

      if (result.success) {
        toast.success(result.message || 'Policy updated successfully');
        router.push('/hr/leave/policies');
        router.refresh(); // Refresh the page data
      } else {
        toast.error(result.message || 'Failed to update policy');
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update policy. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/hr/leave/policies');
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <Breadcrumb
          pages={[
            { name: 'HR', href: '/hr' },
            { name: 'Leave', href: '/hr/leave' },
            { name: 'Policies', href: '/hr/leave/policies' },
            { name: 'Edit Policy', href: '#' },
          ]}
        />
        <div className="mt-6 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading policy data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <Breadcrumb
          pages={[
            { name: 'HR', href: '/hr' },
            { name: 'Leave', href: '/hr/leave' },
            { name: 'Policies', href: '/hr/leave/policies' },
            { name: 'Edit Policy', href: '#' },
          ]}
        />
        <div className="mt-6 text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 inline-block">
            <p className="text-red-600 dark:text-red-400 font-medium">Policy not found</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              The policy you're trying to edit doesn't exist or has been deleted.
            </p>
            <button
              onClick={handleCancel}
              className="mt-4 px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Back to Policies
            </button>
          </div>
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
          { name: 'Policies', href: '/hr/leave/policies' },
          { name: 'Edit Policy', href: '#' },
        ]}
      />

      <div className="mt-6">
        <PolicyForm
          initialData={policy}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={saving}
          dropdownData={dropdownData}
        />
      </div>
    </div>
  );
}