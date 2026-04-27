"use client";
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import PolicyStatusBadge from './PolicyStatusBadge';
import Link from 'next/link';
import leavePolicyService from '../../../../../../services/hr-services/leavepolicies.service';
import { toast } from 'sonner';

// Create a portal for the dropdown to render outside the table
const DropdownPortal = ({
  isOpen,
  onClose,
  position,
  children
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown positioned relative to the trigger button */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        style={{
          top: position.top + position.height + 8,
          left: position.left - 200, // Adjust this to position it left of the button
          width: '240px'
        }}
      >
        {children}
      </div>
    </>
  );
};

const PoliciesTable = ({
  searchParams = {}
}) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [actionMenu, setActionMenu] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const result = await leavePolicyService.getAllPolicies();

      if (result.success) {
        // Transform the data if needed
        const transformedPolicies = result.data?.map(policy => ({
          id: policy.id,
          name: policy.name,
          description: policy.description,
          effectiveDate: policy.effectiveDate,
          status: policy.status,
          applicableTo: policy.applicableTo,
          accrualMethod: policy.accrualMethod,
          maxAccrual: policy.maxAccrual,
          carryOverLimit: policy.carryOverLimit,
          encashment: policy.encashment,
          requiresApproval: policy.requiresApproval,
          attachmentRequired: policy.attachmentRequired,
          minServicePeriod: policy.minServicePeriod,
          maxConsecutiveDays: policy.maxConsecutiveDays,
          advanceNoticeDays: policy.advanceNoticeDays,
          createdAt: policy.createdAt,
          updatedAt: policy.updatedAt
        })) || [];

        setPolicies(transformedPolicies);
      } else {
        toast.error(result.message || 'Failed to load policies');
        setPolicies([]);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Fetch policies when component mounts or searchParams change
  useEffect(() => {
    fetchPolicies();
  }, [searchParams]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPolicies = [...policies].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <div className="ml-1 flex flex-col"><ChevronUp className="w-3 h-3 -mb-0.5 text-gray-400" /><ChevronDown className="w-3 h-3 -mt-0.5 text-gray-400" /></div>;
    }
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="ml-1 w-4 h-4 text-brand-600" /> :
      <ChevronDown className="ml-1 w-4 h-4 text-brand-600" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getApplicableToLabel = (value) => {
    const mapping = {
      'all_employees': 'All Employees',
      'full_time': 'Full-time Only',
      'part_time': 'Part-time Only',
      'male_employees': 'Male Employees',
      'female_employees': 'Female Employees',
      'permanent': 'Permanent Staff',
      'contract': 'Contract Staff'
    };
    return mapping[value] || value;
  };

  const getAccrualMethodLabel = (value) => {
    const mapping = {
      'monthly': 'Monthly',
      'yearly': 'Yearly',
      'quarterly': 'Quarterly',
      'one_time': 'One-time',
      'hourly': 'Hourly'
    };
    return mapping[value] || value;
  };

  const handleStatusUpdate = async (policyId, newStatus) => {
    try {
      const result = await leavePolicyService.updatePolicyStatus(policyId, newStatus);

      if (result.success) {
        toast.success(result.message || 'Policy status updated');
        fetchPolicies(); // Refresh the list
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update policy status');
    } finally {
      setActionMenu(null);
    }
  };

  const handleDelete = async (policyId) => {
    if (!confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      const result = await leavePolicyService.deletePolicy(policyId);

      if (result.success) {
        toast.success(result.message || 'Policy deleted');
        fetchPolicies(); // Refresh the list
      } else {
        toast.error(result.message || 'Failed to delete policy');
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy');
    } finally {
      setActionMenu(null);
    }
  };

  const handleActionButtonClick = (e, policyId) => {
    e.stopPropagation();

    // Get the button position
    const buttonRect = e.currentTarget.getBoundingClientRect();
    setButtonPosition({
      top: buttonRect.top + window.scrollY,
      left: buttonRect.left + window.scrollX,
      width: buttonRect.width,
      height: buttonRect.height
    });

    setActionMenu(actionMenu === policyId ? null : policyId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Policy Name
                  <SortIcon columnKey="name" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  <SortIcon columnKey="status" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Applicable To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Accrual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Max Days
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('effectiveDate')}
              >
                <div className="flex items-center">
                  Effective Date
                  <SortIcon columnKey="effectiveDate" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedPolicies.map((policy) => (
              <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {policy.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {policy.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <PolicyStatusBadge status={policy.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {getApplicableToLabel(policy.applicableTo)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {getAccrualMethodLabel(policy.accrualMethod)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {policy.maxAccrual} days
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(policy.effectiveDate)}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/hr/leave/policies/edit/${policy.id}`}
                      className="p-2 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
                      title="Edit Policy"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <div className="relative">
                      <button
                        onClick={(e) => handleActionButtonClick(e, policy.id)}
                        className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        title="More Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedPolicies.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-brand-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No policies found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Render dropdown portal for the currently active policy */}
      {sortedPolicies.map((policy) => (
        actionMenu === policy.id && (
          <DropdownPortal
            key={policy.id}
            isOpen={true}
            onClose={() => setActionMenu(null)}
            position={buttonPosition}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  handleStatusUpdate(policy.id, 'active');
                  setActionMenu(null);
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Mark Active</div>
                  <div className="text-xs text-gray-500 mt-0.5">Set policy to active status</div>
                </div>
              </button>

              <button
                onClick={() => {
                  handleStatusUpdate(policy.id, 'draft');
                  setActionMenu(null);
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-3 text-brand-600" />
                <div className="text-left">
                  <div className="font-medium">Mark Draft</div>
                  <div className="text-xs text-gray-500 mt-0.5">Set policy to draft status</div>
                </div>
              </button>

              <button
                onClick={() => {
                  handleStatusUpdate(policy.id, 'archived');
                  setActionMenu(null);
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-3 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">Archive Policy</div>
                  <div className="text-xs text-gray-500 mt-0.5">Move policy to archived</div>
                </div>
              </button>

              <hr className="my-1 border-gray-200 dark:border-gray-700" />

              <button
                onClick={() => {
                  setActionMenu(null);
                  setTimeout(() => handleDelete(policy.id), 100);
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Delete Policy</div>
                  <div className="text-xs text-red-500/80 mt-0.5">Permanently remove policy</div>
                </div>
              </button>
            </div>
          </DropdownPortal>
        )
      ))}
    </>
  );
};

export default PoliciesTable;