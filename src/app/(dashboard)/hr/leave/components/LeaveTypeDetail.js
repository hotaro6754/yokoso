// src/app/(dashboard)/hr/leave/components/LeaveTypeDetail.js
"use client";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Trash2, Edit, X } from 'lucide-react';

const LeaveTypeDetail = ({
  isOpen,
  onClose,
  leaveType,
  onEdit,
  onDelete
}) => {
  if (!leaveType) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-250"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250"
            enterFrom="opacity-0 translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-2 scale-95"
          >
            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all ring-1 ring-black/5">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div>
                    <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                      {leaveType.name}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Leave Type Details
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${leaveType.isActive
                        ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {leaveType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Code */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Leave Code</p>
                    <p className="font-medium text-gray-900 dark:text-white text-lg">
                      {leaveType.code || leaveType.leaveCode || "—"}
                    </p>
                  </div>

                  {/* Annual Limit */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Days Per Year</p>
                    <p className="font-medium text-gray-900 dark:text-white text-lg">
                      {leaveType.daysPerYear ?? leaveType.limitDays ?? 0} days
                    </p>
                  </div>

                  {/* Paid / Unpaid */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paid Leave</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {typeof leaveType.isPaid === "boolean"
                        ? leaveType.isPaid
                          ? "Paid"
                          : "Unpaid"
                        : "—"}
                    </p>
                  </div>

                  {/* Documentation */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Documentation</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {leaveType.requiresDocumentation || leaveType.requiresAttachment
                        ? "Required"
                        : "Not Required"}
                    </p>
                  </div>

                  {/* Encashment */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Encashment</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {leaveType.isEncashable ? 'Available' : 'Not Available'}
                    </p>
                  </div>

                  {/* Approval */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approval</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {leaveType.requiresApproval ? 'Required' : 'Auto-approved'}
                    </p>
                  </div>

                  {/* Deductible */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Deductible</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {leaveType.isDeductible ? "Yes" : "No"}
                    </p>
                  </div>

                  {/* Gender Restriction */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gender Restriction</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {leaveType.genderRestriction || "All"}
                    </p>
                  </div>

                  {/* Carry Forward */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carry Forward</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {leaveType.carryForwardAllowed || leaveType.carryOver || leaveType.maxCarryForwardDays
                        ? `Up to ${leaveType.maxCarryForwardDays || leaveType.carryOver || 0} days`
                        : "Not Allowed"}
                    </p>
                  </div>

                  {/* Max Consecutive Days */}
                  {leaveType.maxConsecutiveDays && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Consecutive Days</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {leaveType.maxConsecutiveDays} days
                      </p>
                    </div>
                  )}

                  {/* Advance Notice */}
                  {leaveType.advanceNoticeDays && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Advance Notice</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {leaveType.advanceNoticeDays} days
                      </p>
                    </div>
                  )}

                  {/* Accrual Rate */}
                  {leaveType.accrualRate && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accrual Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {leaveType.accrualRate} days per month
                      </p>
                    </div>
                  )}

                  {/* Carry Over */}
                  {leaveType.carryOver && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carry Over</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Up to {leaveType.carryOver} days
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {leaveType.description && (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                    <p className="text-gray-900 dark:text-white">
                      {leaveType.description}
                    </p>
                  </div>
                )}

                {/* Eligibility */}
                {leaveType.eligibility && (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Eligibility</p>
                    <p className="text-gray-900 dark:text-white">
                      {leaveType.eligibility}
                    </p>
                  </div>
                )}
              </div>

              {/* Fixed Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:px-6 sm:py-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <button
                    onClick={onDelete}
                    className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors border border-gray-300 dark:border-gray-500"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => onEdit(leaveType)}
                      className="flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LeaveTypeDetail;