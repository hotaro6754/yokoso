"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Wrench, Save, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DatePicker from '@/components/common/DatePicker';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';

export default function NewMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [damagedDevices, setDamagedDevices] = useState([]);
  const [formData, setFormData] = useState({
    deviceId: '',
    issueReportDate: new Date().toISOString().split('T')[0],
    issueDescription: '',
    sentForRepairDate: '',
    repairVendor: '',
    repairCost: '',
    repairStatus: 'In Progress'
  });
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await itDeviceService.getDevices({
          page: 1,
          limit: 200,
          condition: 'damaged'
        });

        if (res?.success) {
          setDamagedDevices((res.data?.devices || []).map((d) => ({
            id: d.id,
            serialNumber: d.serialNumber,
            deviceType: d.deviceType,
            brand: d.brand,
            model: d.model,
            condition: d.condition
          })));
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load damaged devices');
      }
    };
    load();
  }, []);

  const handleDeviceChange = (e) => {
    const deviceId = e.target.value;
    const device = damagedDevices.find(d => d.id.toString() === deviceId);
    setSelectedDevice(device);
    setFormData(prev => ({ ...prev, deviceId }));
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
    setLoading(true);

    try {
      const res = await itDeviceService.createMaintenance({
        deviceId: formData.deviceId,
        issueReportDate: formData.issueReportDate,
        issueDescription: formData.issueDescription,
        sentForRepairDate: formData.sentForRepairDate || null,
        repairVendor: formData.repairVendor || null,
        repairCost: formData.repairCost === '' ? null : formData.repairCost
      });
      if (!res?.success) throw new Error(res?.message || 'Failed to create maintenance request');

      toast.success('Maintenance request created successfully!');
      router.push('/it-admin/maintenance');
    } catch (error) {
      toast.error('Failed to create maintenance request. Please try again.');
      console.error('Error creating maintenance request:', error);
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
            { label: "New Maintenance", href: "/it-admin/maintenance/new" },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[hsl(var(--primary))] rounded-xl">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              New Maintenance Request
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Create a maintenance record for a damaged device
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Device Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Device <span className="text-red-500">*</span>
              </label>
              <select
                name="deviceId"
                value={formData.deviceId}
                onChange={handleDeviceChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a device</option>
                {damagedDevices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.serialNumber} - {device.brand} {device.model} ({device.condition})
                  </option>
                ))}
              </select>
              {selectedDevice && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Selected Device</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedDevice.serialNumber} - {selectedDevice.deviceType}
                  </p>
                </div>
              )}
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe the issue with the device..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Issue Report Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="issueReportDate"
                  value={formData.issueReportDate}
                  onChange={handleDateChange}
                  required
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
                  placeholder="e.g., TechRepair Inc."
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
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status (Read-only for new requests) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Repair Status
              </label>
              <input
                type="text"
                value="In Progress"
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                New maintenance requests are automatically set to "In Progress"
              </p>
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create Maintenance Request
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
