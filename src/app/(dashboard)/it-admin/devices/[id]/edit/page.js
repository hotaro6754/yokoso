"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Save, X, Edit } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DatePicker from '@/components/common/DatePicker';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';

export default function EditDevicePage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params.id;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serialNumber: '',
    deviceType: '',
    deviceName: '',
    brand: '',
    model: '',
    purchaseDate: '',
    warrantyExpiry: '',
    condition: '',
    lifecycleStatus: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await itDeviceService.getDeviceById(deviceId);
        if (res?.success) {
          const d = res.data;
          setFormData({
            serialNumber: d.serialNumber || '',
            deviceType: d.deviceType || '',
            deviceName: d.deviceName || '',
            brand: d.brand || '',
            model: d.model || '',
            purchaseDate: d.purchaseDate ? new Date(d.purchaseDate).toISOString().split('T')[0] : '',
            warrantyExpiry: d.warrantyExpiry ? new Date(d.warrantyExpiry).toISOString().split('T')[0] : '',
            condition: d.condition || '',
            lifecycleStatus: d.lifecycleStatus || '',
            location: d.location || 'Office',
            notes: d.notes || ''
          });
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load device');
      }
    };
    load();
  }, [deviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'deviceType' && value !== 'Other') {
        next.deviceName = '';
      }
      return next;
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await itDeviceService.updateDevice(deviceId, {
        deviceType: formData.deviceType,
        deviceName: formData.deviceName,
        brand: formData.brand,
        model: formData.model,
        purchaseDate: formData.purchaseDate,
        warrantyExpiry: formData.warrantyExpiry,
        condition: formData.condition,
        lifecycleStatus: formData.lifecycleStatus,
        location: formData.location,
        notes: formData.notes
      });
      if (!res?.success) throw new Error(res?.message || 'Failed to update device');

      toast.success('Device updated successfully!');
      router.push('/it-admin/devices');
    } catch (error) {
      toast.error('Failed to update device. Please try again.');
      console.error('Error updating device:', error);
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
            { label: "Device Management", href: "/it-admin/devices" },
            { label: "Edit Device", href: `/it-admin/devices/${deviceId}/edit` },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[hsl(var(--primary))] rounded-xl">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Edit Device
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Serial: {formData.serialNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Serial Number (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Serial number cannot be changed
              </p>
            </div>

            {/* Device Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Device Type <span className="text-red-500">*</span>
              </label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select device type</option>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Mobile">Mobile</option>
                <option value="Tablet">Tablet</option>
                <option value="Monitor">Monitor</option>
                <option value="Printer">Printer</option>
                <option value="Network Device">Network Device</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Brand and Model */}
            {formData.deviceType === 'Other' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Device Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="deviceName"
                  value={formData.deviceName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required={formData.deviceType !== 'Other'}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required={formData.deviceType !== 'Other'}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Purchase Date and Warranty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Purchase Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleDateChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Warranty Expiry <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="warrantyExpiry"
                  value={formData.warrantyExpiry}
                  onChange={handleDateChange}
                  required
                />
              </div>
            </div>

            {/* Condition and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select condition</option>
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Used">Used</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Beyond Repair">Beyond Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Lifecycle Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="lifecycleStatus"
                  value={formData.lifecycleStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select status</option>
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              >
                <option value="Office">Office</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/it-admin/devices"
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
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
