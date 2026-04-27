"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { UserCheck, Save, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DatePicker from '@/components/common/DatePicker';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';

export default function NewAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    deviceId: '',
    employeeId: '',
    assignedDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    notes: ''
  });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [devicesResult, employeesResult] = await Promise.allSettled([
          itDeviceService.getAvailableDevices({}),
          itDeviceService.getEmployees({})
        ]);

        if (devicesResult.status === 'fulfilled') {
          const devicesRes = devicesResult.value;
          if (devicesRes?.success) {
            setAvailableDevices((devicesRes.data || []).map((d) => ({
              id: d.id,
              serialNumber: d.serialNumber,
              deviceType: d.deviceType,
              brand: d.brand,
              model: d.model,
              deviceName: d.deviceName,
              condition: d.condition,
              status: d.lifecycleStatus
            })));
          }
        } else {
          toast.error(devicesResult.reason?.message || 'Failed to load available devices');
        }

        if (employeesResult.status === 'fulfilled') {
          const employeesRes = employeesResult.value;
          if (employeesRes?.success) {
            setEmployees((employeesRes.data || []).map((e) => ({
              id: e.publicId,
              name: `${e.firstName} ${e.lastName || ''}`.trim(),
              employeeId: e.employeeId,
              department: e.department?.name
            })));
          }
        } else {
          toast.error(employeesResult.reason?.message || 'Failed to load employees');
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load assignment form data');
      }
    };

    load();
  }, []);

  const handleDeviceChange = (e) => {
    const deviceId = e.target.value;
    const device = availableDevices.find(d => d.id.toString() === deviceId);
    setSelectedDevice(device);
    setFormData(prev => ({ ...prev, deviceId }));

    // Validation: Check if device can be assigned
    if (device) {
      if (device.condition === 'Damaged' || device.condition === 'Beyond Repair') {
        setValidationError(`Cannot assign device: Condition is "${device.condition}"`);
      } else if (device.status !== 'Available') {
        setValidationError(`Cannot assign device: Status is "${device.status}"`);
      } else {
        setValidationError('');
      }
    }
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

    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!formData.deviceId || !formData.employeeId) {
      toast.error('Please select both device and employee');
      return;
    }

    setLoading(true);

    try {
      const res = await itDeviceService.createAssignment({
        deviceId: formData.deviceId,
        employeeId: formData.employeeId,
        assignedDate: formData.assignedDate,
        expectedReturnDate: formData.expectedReturnDate,
        notes: formData.notes
      });
      if (!res?.success) throw new Error(res?.message || 'Failed to assign device');

      toast.success('Device assigned successfully!');
      router.push('/it-admin/assignments');
    } catch (error) {
      toast.error('Failed to assign device. Please try again.');
      console.error('Error assigning device:', error);
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
            { label: "Device Assignments", href: "/it-admin/assignments" },
            { label: "New Assignment", href: "/it-admin/assignments/new" },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[hsl(var(--primary))] rounded-xl">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Assign Device
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Assign an available device to an employee. Only devices with Status = Available and Condition ≠ Damaged/Beyond Repair can be assigned.
          </p>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">Validation Error</p>
              <p className="text-sm text-red-700 dark:text-red-400">{validationError}</p>
            </div>
          </div>
        )}

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
                {availableDevices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.serialNumber} - {device.deviceType === 'Other'
                      ? (device.deviceName || 'Other')
                      : `${device.brand || ''} ${device.model || ''}`.trim() || '—'} ({device.condition})
                  </option>
                ))}
              </select>
              {selectedDevice && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Selected Device Details</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div><span className="font-medium">Type:</span> {selectedDevice.deviceType}</div>
                    <div><span className="font-medium">Condition:</span> {selectedDevice.condition}</div>
                    <div><span className="font-medium">Status:</span> {selectedDevice.status}</div>
                    {selectedDevice.deviceType === 'Other'
                      ? <div><span className="font-medium">Device Name:</span> {selectedDevice.deviceName || '—'}</div>
                      : <div><span className="font-medium">Brand:</span> {selectedDevice.brand}</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.employeeId}) - {employee.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Assigned Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="assignedDate"
                  value={formData.assignedDate}
                  onChange={handleDateChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Expected Return Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="expectedReturnDate"
                  value={formData.expectedReturnDate}
                  onChange={handleDateChange}
                  required
                  minDate={formData.assignedDate}
                />
              </div>
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
                rows={3}
                placeholder="Additional notes about this assignment..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> After assignment, the device status will automatically change to "Assigned" and condition will change to "Good" (if it was "New").
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/it-admin/assignments"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-semibold transition-all"
              >
                <X size={18} />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !!validationError}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Assign Device
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
