"use client";
import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, CalendarDays, Clock, MapPin, User, Loader2, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { employeeShiftService } from '@/services/manager-services/employeeShift.service';
import DatePicker from '@/components/common/DatePicker';

export default function AssignShiftModal({ isOpen, onClose, onSuccess, teamMembers = [] }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    shiftCode: '',
    location: 'Office', // Default
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  // Helper method to get shift timing based on shift code
  const getShiftTiming = (shiftCode) => {
    const shiftTimings = {
      'S1': { name: 'Morning', timing: '09:00 - 18:00' },
      'S2': { name: 'Afternoon', timing: '14:00 - 23:00' },
      'S3': { name: 'Night', timing: '22:00 - 07:00' },
      'G': { name: 'General', timing: '10:00 - 19:00' }
    };
    return shiftTimings[shiftCode] || { name: 'General', timing: '09:00 - 18:00' };
  };

  // shift options mock
  const shiftOptions = [
    { code: 'S1', label: 'Morning Shift (09:00 - 18:00)' },
    { code: 'S2', label: 'Afternoon Shift (14:00 - 23:00)' },
    { code: 'S3', label: 'Night Shift (22:00 - 07:00)' },
    { code: 'G', label: 'General Shift (10:00 - 19:00)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.date || !formData.shiftCode) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await employeeShiftService.assignEmployeeShift({
        employeeId: parseInt(formData.employeeId),
        date: formData.date,
        shift: getShiftTiming(formData.shiftCode).name,
        shiftCode: formData.shiftCode,
        timing: getShiftTiming(formData.shiftCode).timing,
        location: formData.location,
        status: 'Scheduled',
        remarks: formData.remarks
      });
      toast.success("Shift assigned successfully");
      onSuccess();
      setFormData({ employeeId: '', date: '', shiftCode: '', location: 'Office', remarks: '' });
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="text-brand-600" size={20} /> Assign Shift
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Employee Select */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-500" />
                      Employee <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all px-4 py-3 font-medium"
                      required
                    >
                      <option value="" className="text-gray-500">Select Employee</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id} className="py-2">
                          {member.firstName} {member.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-brand-500" />
                      Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DatePicker
                        name="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        minDate={new Date().toISOString().split('T')[0]}
                        required={true}
                      />
                    </div>
                  </div>

                  {/* Shift Code */}
                  <div className="space-y-2">
                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-500" />
                        Shift <span className="text-red-500">*</span>
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                           value={formData.shiftCode}
                           onChange={(e) => setFormData({...formData, shiftCode: e.target.value})}
                           className="pl-12 w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all px-4 py-3 font-medium"
                           required
                        >
                           <option value="" className="text-gray-500">Select Shift</option>
                           {shiftOptions.map(opt => (
                              <option key={opt.code} value={opt.code} className="py-2">{opt.code} - {opt.label}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-500" />
                        Location
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                           value={formData.location}
                           onChange={(e) => setFormData({...formData, location: e.target.value})}
                           className="pl-12 w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all px-4 py-3 font-medium"
                        >
                           <option value="Office">Office</option>
                           <option value="Remote">Remote</option>
                        </select>
                     </div>
                  </div>

                   {/* Remarks */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Remarks</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all px-4 py-3 font-medium resize-none"
                      rows="3"
                      placeholder="Optional remarks about this shift assignment..."
                    />
                  </div>

                  <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border-2 border-gray-300 dark:border-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-3 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
                      {loading ? 'Assigning...' : 'Assign Shift'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
