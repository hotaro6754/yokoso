"use client";

import { useState } from "react";
import { ArrowLeft, X, Loader2 } from "lucide-react";

const LeaveTypeForm = ({ initialData = null, onSave, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || initialData?.leaveCode || "",
    daysPerYear: initialData?.daysPerYear ?? initialData?.limitDays ?? 0,
    isPaid: initialData?.isPaid ?? true,
    isDeductible: initialData?.isDeductible ?? true,
    requiresApproval: initialData?.requiresApproval ?? true,
    requiresDocumentation:
      initialData?.requiresDocumentation ??
      initialData?.requiresAttachment ??
      false,
    genderRestriction: initialData?.genderRestriction || "ALL",
    carryForwardAllowed:
      initialData?.carryForwardAllowed ??
      Boolean(initialData?.carryOver || initialData?.maxCarryForwardDays),
    maxCarryForwardDays:
      initialData?.maxCarryForwardDays ?? initialData?.carryOver ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      daysPerYear: Number(formData.daysPerYear || 0),
      limitDays: Number(formData.daysPerYear || 0),
      isPaid: formData.isPaid,
      isDeductible: formData.isDeductible,
      requiresApproval: formData.requiresApproval,
      requiresDocumentation: formData.requiresDocumentation,
      requiresAttachment: formData.requiresDocumentation,
      genderRestriction: formData.genderRestriction,
      carryForwardAllowed: formData.carryForwardAllowed,
      maxCarryForwardDays: formData.carryForwardAllowed
        ? Number(formData.maxCarryForwardDays || 0)
        : 0,
      carryOver: formData.carryForwardAllowed
        ? Number(formData.maxCarryForwardDays || 0)
        : 0,
      isActive: formData.isActive,
      status: formData.isActive ? "active" : "inactive",
    };

    onSave(payload);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={onCancel}
            className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            disabled={isSubmitting}
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initialData ? "Edit Leave Type" : "Add Leave Type"}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          disabled={isSubmitting}
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Leave Type Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Leave Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Days Per Year *
            </label>
            <input
              type="number"
              name="daysPerYear"
              value={formData.daysPerYear}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender Restriction
            </label>
            <select
              name="genderRestriction"
              value={formData.genderRestriction}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="ALL">All</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            Paid Leave
            <input
              type="checkbox"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleChange}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            Deductible
            <input
              type="checkbox"
              name="isDeductible"
              checked={formData.isDeductible}
              onChange={handleChange}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            Requires Approval
            <input
              type="checkbox"
              name="requiresApproval"
              checked={formData.requiresApproval}
              onChange={handleChange}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            Requires Documentation
            <input
              type="checkbox"
              name="requiresDocumentation"
              checked={formData.requiresDocumentation}
              onChange={handleChange}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            Carry Forward Allowed
            <input
              type="checkbox"
              name="carryForwardAllowed"
              checked={formData.carryForwardAllowed}
              onChange={handleChange}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
          </label>
          {formData.carryForwardAllowed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Carry Forward Days
              </label>
              <input
                type="number"
                name="maxCarryForwardDays"
                value={formData.maxCarryForwardDays}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        <label className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
          Status (Active)
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveTypeForm;
