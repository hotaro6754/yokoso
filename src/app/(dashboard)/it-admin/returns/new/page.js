"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Package, Save, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DatePicker from '@/components/common/DatePicker';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';

export default function ProcessReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assignmentId: assignmentId || '',
    returnDate: new Date().toISOString().split('T')[0],
    conditionAtReturn: '',
    remarks: ''
  });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [availableAssignments, setAvailableAssignments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await itDeviceService.getActiveAssignments({ page: 1, limit: 200 });
        const list = res?.data?.assignments || [];
        const mapped = list.map((a) => ({
          id: a.id,
          deviceSerial: a.deviceSerial,
          deviceType: a.deviceType,
          deviceBrand: a.deviceBrand,
          deviceModel: a.deviceModel,
          employeeName: a.employeeName,
          employeeId: a.employeeId,
          assignedDate: a.assignedDate
        }));

        setAvailableAssignments(mapped);

        if (assignmentId) {
          const assignment = mapped.find((a) => a.id === assignmentId);
          if (assignment) {
            setSelectedAssignment(assignment);
            setFormData((prev) => ({ ...prev, assignmentId }));
          }
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load active assignments');
      }
    };

    load();
  }, [assignmentId]);

  const handleAssignmentChange = (e) => {
    const assignmentId = e.target.value;
    const assignment = availableAssignments.find(a => a.id.toString() === assignmentId);
    setSelectedAssignment(assignment);
    setFormData(prev => ({ ...prev, assignmentId }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.assignmentId || !formData.conditionAtReturn) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const res = await itDeviceService.returnAssignment(formData.assignmentId, {
        returnDate: formData.returnDate,
        conditionAtReturn: formData.conditionAtReturn,
        remarks: formData.remarks
      });
      if (!res?.success) throw new Error(res?.message || 'Failed to process return');

      toast.success('Device return processed successfully!');
      router.push('/it-admin/returns');
    } catch (error) {
      toast.error('Failed to process return. Please try again.');
      console.error('Error processing return:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Breadcrumb
          items={[
            { label: "IT Admin", href: "/it-admin" },
            { label: "Device Returns", href: "/it-admin/returns" },
            { label: "Process Return", href: "/it-admin/returns/new" },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[hsl(var(--primary))] rounded-xl">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Process Device Return
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Record device return and update condition. Based on condition, device status will be automatically updated.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Assignment Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Assignment <span className="text-red-500">*</span>
              </label>
              <select
                name="assignmentId"
                value={formData.assignmentId}
                onChange={handleAssignmentChange}
                required
                disabled={!!assignmentId}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select an assignment</option>
                {availableAssignments.map(assignment => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.deviceSerial} - {assignment.employeeName} ({assignment.employeeId})
                  </option>
                ))}
              </select>
              {selectedAssignment && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Assignment Details</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div><span className="font-medium">Device:</span> {selectedAssignment.deviceSerial}</div>
                    <div><span className="font-medium">Type:</span> {selectedAssignment.deviceType}</div>
                    <div><span className="font-medium">Employee:</span> {selectedAssignment.employeeName}</div>
                    <div><span className="font-medium">Assigned:</span> {new Date(selectedAssignment.assignedDate).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Return Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Return Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                name="returnDate"
                value={formData.returnDate}
                onChange={handleDateChange}
                required
              />
            </div>

            {/* Condition at Return */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Device Condition at Return <span className="text-red-500">*</span>
              </label>
              <select
                name="conditionAtReturn"
                value={formData.conditionAtReturn}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select condition</option>
                <option value="Good">Good - Working properly</option>
                <option value="Used">Used - Working but shows wear</option>
                <option value="Damaged">Damaged - Not working properly</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <strong>Note:</strong> If condition is "Damaged", device will be moved to Maintenance status automatically.
              </p>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={4}
                placeholder="Any additional notes about the device condition or return..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Return Processing Logic:</p>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li><strong>Good:</strong> Status → Available</li>
                <li><strong>Used:</strong> Status → Available</li>
                <li><strong>Damaged:</strong> Status → Maintenance</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/it-admin/returns"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-semibold transition-all"
              >
                <X size={18} />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Process Return
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
