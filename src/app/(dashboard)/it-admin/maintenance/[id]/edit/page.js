"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Wrench, Save, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DatePicker from '@/components/common/DatePicker';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';

export default function EditMaintenancePage() {
  const router = useRouter();
  const params = useParams();
  const maintenanceId = params.id;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deviceSerial: '',
    issueDescription: '',
    issueReportDate: '',
    sentForRepairDate: '',
    repairVendor: '',
    repairCost: '',
    repairStatus: '',
    completionDate: '',
    postRepairCondition: 'Good'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await itDeviceService.getMaintenanceById(maintenanceId);
        if (res?.success) {
          const r = res.data;
          setFormData({
            deviceSerial: r.device?.serialNumber || '',
            issueDescription: r.issueDescription || '',
            issueReportDate: r.issueReportDate ? new Date(r.issueReportDate).toISOString().split('T')[0] : '',
            sentForRepairDate: r.sentForRepairDate ? new Date(r.sentForRepairDate).toISOString().split('T')[0] : '',
            repairVendor: r.repairVendor || '',
            repairCost: r.repairCost ?? '',
            repairStatus: r.repairStatus || 'In Progress',
            completionDate: r.completionDate ? new Date(r.completionDate).toISOString().split('T')[0] : '',
            postRepairCondition: 'Good'
          });
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load maintenance record');
      }
    };
    load();
  }, [maintenanceId]);

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
    setLoading(true);

    try {
      const res = await itDeviceService.updateMaintenance(maintenanceId, {
        sentForRepairDate: formData.sentForRepairDate || null,
        repairVendor: formData.repairVendor || null,
        repairCost: formData.repairCost === '' ? null : formData.repairCost,
        repairStatus: formData.repairStatus,
        completionDate: formData.completionDate || null,
        postRepairCondition: formData.postRepairCondition || 'Good'
      });
      if (!res?.success) throw new Error(res?.message || 'Failed to update maintenance record');

      toast.success('Maintenance record updated successfully!');
      router.push('/it-admin/maintenance');
    } catch (error) {
      toast.error('Failed to update maintenance record. Please try again.');
      console.error('Error updating maintenance:', error);
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
            { label: "Maintenance", href: "/it-admin/maintenance" },
            { label: "Update Maintenance", href: `/it-admin/maintenance/${maintenanceId}/edit` },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[hsl(var(--primary))] rounded-xl">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Update Maintenance Record
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Update repair status and completion details
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Device (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Device
              </label>
              <input
                type="text"
                value={formData.deviceSerial}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Issue Description (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Issue Description
              </label>
              <textarea
                value={formData.issueDescription}
                disabled
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Issue Report Date
                </label>
                <input
                  type="text"
                  value={new Date(formData.issueReportDate).toLocaleDateString()}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sent for Repair Date
                </label>
                <DatePicker
                  name="sentForRepairDate"
                  value={formData.sentForRepairDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            {/* Vendor and Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Repair Vendor
                </label>
                <input
                  type="text"
                  name="repairVendor"
                  value={formData.repairVendor}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Repair Cost (₹)
                </label>
                <input
                  type="number"
                  name="repairCost"
                  value={formData.repairCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Repair Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Repair Status <span className="text-red-500">*</span>
              </label>
              <select
                name="repairStatus"
                value={formData.repairStatus}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              >
                <option value="In Progress">In Progress</option>
                <option value="Repaired">Repaired</option>
                <option value="Not Repairable">Not Repairable</option>
              </select>
            </div>

            {/* Completion Date */}
            {(formData.repairStatus === 'Repaired' || formData.repairStatus === 'Not Repairable') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Completion Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleDateChange}
                  required
                />
              </div>
            )}

            {/* Post Repair Condition (only when repaired) */}
            {formData.repairStatus === 'Repaired' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Condition After Repair <span className="text-red-500">*</span>
                </label>
                <select
                  name="postRepairCondition"
                  value={formData.postRepairCondition}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
                >
                  <option value="Good">Good</option>
                  <option value="Used">Used</option>
                </select>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">After Repair Completion:</p>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li><strong>Repaired:</strong> Condition → Good or Used, Status → Available</li>
                <li><strong>Not Repairable:</strong> Condition → Beyond Repair, Status → Retired</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/it-admin/maintenance"
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Update Record
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
