"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DatePickerField from '@/components/form/input/DatePickerField';

const PolicyForm = ({
  initialData = null,
  onSave,
  onCancel,
  isSaving = false,
  dropdownData = {
    leaveTypes: [],
    departments: [],
    employees: []
  }
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    effectiveDate: '',
    status: 'draft',
    applicableTo: 'all_employees',
    accrualMethod: 'monthly',
    maxAccrual: 0,
    carryOverLimit: 0,
    encashment: false,
    requiresApproval: true,
    attachmentRequired: false,
    minServicePeriod: 0,
    maxConsecutiveDays: 0,
    advanceNoticeDays: 0,
    autoApprove: false,
    approvalLevels: 1,
    genderSpecific: 'all',
    probationApplicable: true,
    policyType: 'leave',
    leaveTypeIds: [],
    departmentIds: [],
    employeeIds: []
  });

  const [loading, setLoading] = useState(false);

  // Initialize form with initialData when it's available
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        effectiveDate: initialData.effectiveDate ? initialData.effectiveDate.split('T')[0] : '',
        status: initialData.status || 'draft',
        applicableTo: initialData.applicableTo || 'all_employees',
        accrualMethod: initialData.accrualMethod || 'monthly',
        maxAccrual: initialData.maxAccrual || 0,
        carryOverLimit: initialData.carryOverLimit || 0,
        encashment: initialData.encashment || false,
        requiresApproval: initialData.requiresApproval !== false,
        attachmentRequired: initialData.attachmentRequired || false,
        minServicePeriod: initialData.minServicePeriod || 0,
        maxConsecutiveDays: initialData.maxConsecutiveDays || 0,
        advanceNoticeDays: initialData.advanceNoticeDays || 0,
        autoApprove: initialData.autoApprove || false,
        approvalLevels: initialData.approvalLevels || 1,
        genderSpecific: initialData.genderSpecific || 'all',
        probationApplicable: initialData.probationApplicable !== false,
        policyType: initialData.policyType || 'leave',
        leaveTypeIds: initialData.leaveTypes?.map(lt => lt.id) || initialData.leaveTypeIds || [],
        departmentIds: initialData.departments?.map(d => d.id) || initialData.departmentIds || [],
        employeeIds: initialData.employees?.map(e => e.id) || initialData.employeeIds || []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  const handleMultiSelect = (name, value, isChecked) => {
    setFormData(prev => {
      const currentValues = prev[name] || [];
      let newValues;

      if (isChecked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(v => v !== value);
      }

      return {
        ...prev,
        [name]: newValues
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Policy name is required');
      return;
    }

    if (!formData.effectiveDate) {
      toast.error('Effective date is required');
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      maxAccrual: Number(formData.maxAccrual) || 0,
      carryOverLimit: Number(formData.carryOverLimit) || 0,
      minServicePeriod: Number(formData.minServicePeriod) || 0,
      maxConsecutiveDays: formData.maxConsecutiveDays ? Number(formData.maxConsecutiveDays) : null,
      advanceNoticeDays: formData.advanceNoticeDays ? Number(formData.advanceNoticeDays) : null,
      approvalLevels: formData.approvalLevels ? Number(formData.approvalLevels) : 1
    };

    // Call parent's save handler
    if (onSave) {
      await onSave(submitData);
    }
  };

  const applicableToOptions = [
    { value: 'all_employees', label: 'All Employees' },
    { value: 'full_time', label: 'Full-time Only' },
    { value: 'part_time', label: 'Part-time Only' },
    { value: 'male_employees', label: 'Male Employees' },
    { value: 'female_employees', label: 'Female Employees' },
    { value: 'permanent', label: 'Permanent Staff' },
    { value: 'contract', label: 'Contract Staff' }
  ];

  const accrualMethodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'one_time', label: 'One-time' },
    { value: 'hourly', label: 'Hourly' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
  ];

  const genderOptions = [
    { value: 'all', label: 'All Genders' },
    { value: 'male', label: 'Male Only' },
    { value: 'female', label: 'Female Only' }
  ];

  const isEditMode = !!initialData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onCancel}
            className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            disabled={isSaving}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Leave Policy' : 'Create New Leave Policy'}
          </h3>
          {isEditMode && initialData.id && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ID: {initialData.id}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          disabled={isSaving}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Policy Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={isSaving}
                placeholder="Enter policy name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Effective Date *
              </label>
              <DatePickerField
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={(value) => handleChange({ target: { name: "effectiveDate", value } })}
                placeholder="Select date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe the purpose and details of this policy"
              disabled={isSaving}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              disabled={isSaving}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Eligibility & Applicability */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Eligibility & Applicability
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Applicable To *
              </label>
              <select
                name="applicableTo"
                value={formData.applicableTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={isSaving}
              >
                {applicableToOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Service Period (months)
              </label>
              <input
                type="number"
                name="minServicePeriod"
                value={formData.minServicePeriod}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender Specific
            </label>
            <select
              name="genderSpecific"
              value={formData.genderSpecific}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              disabled={isSaving}
            >
              {genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="probationApplicable"
                checked={formData.probationApplicable}
                onChange={handleChange}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                disabled={isSaving}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Applies to Employees on Probation
              </span>
            </label>
          </div>
        </div>

        {/* Accrual & Limits */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Accrual & Limits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Accrual Method *
              </label>
              <select
                name="accrualMethod"
                value={formData.accrualMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={isSaving}
              >
                {accrualMethodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Accrual (days) *
              </label>
              <input
                type="number"
                name="maxAccrual"
                value={formData.maxAccrual}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Carry Over Limit (days)
              </label>
              <input
                type="number"
                name="carryOverLimit"
                value={formData.carryOverLimit}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Consecutive Days
              </label>
              <input
                type="number"
                name="maxConsecutiveDays"
                value={formData.maxConsecutiveDays}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Advance Notice (days)
              </label>
              <input
                type="number"
                name="advanceNoticeDays"
                value={formData.advanceNoticeDays}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Leave Types */}
        {dropdownData.leaveTypes.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Leave Types
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
              {dropdownData.leaveTypes.map(leaveType => (
                <label key={leaveType.id} className="flex items-start p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <input
                    type="checkbox"
                    checked={formData.leaveTypeIds.includes(leaveType.id)}
                    onChange={(e) => handleMultiSelect('leaveTypeIds', leaveType.id, e.target.checked)}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded mt-1"
                    disabled={isSaving}
                  />
                  <div className="ml-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {leaveType.name}
                    </span>
                    {leaveType.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {leaveType.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Policy Settings */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Policy Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="encashment"
                checked={formData.encashment}
                onChange={handleChange}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                disabled={isSaving}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Encashment Allowed</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="requiresApproval"
                checked={formData.requiresApproval}
                onChange={handleChange}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                disabled={isSaving}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Requires Approval</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="attachmentRequired"
                checked={formData.attachmentRequired}
                onChange={handleChange}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                disabled={isSaving}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Attachment Required</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="autoApprove"
                checked={formData.autoApprove}
                onChange={handleChange}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                disabled={isSaving}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto Approve Leave Requests</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Approval Levels
              </label>
              <input
                type="number"
                name="approvalLevels"
                value={formData.approvalLevels}
                onChange={handleNumberChange}
                min="1"
                max="5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-sm hover:shadow-md font-semibold disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditMode ? 'Update Policy' : 'Create Policy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyForm;