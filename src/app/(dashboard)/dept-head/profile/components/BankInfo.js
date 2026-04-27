"use client";

import { useState, useEffect } from 'react';
import { Save, Edit2, X, Banknote } from 'lucide-react';

export default function BankInfo({ data, onUpdate, updating, allowedFields = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const bankFields = [
    { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Enter bank name' },
    { name: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'Enter account number' },
    { name: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'Enter IFSC code' },
    { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Enter account holder name' },
    { name: 'branchName', label: 'Branch Name', type: 'text', placeholder: 'Enter branch name' },
    { name: 'accountType', label: 'Account Type', type: 'select', options: ['SAVINGS', 'CURRENT'] },
    { name: 'panNumber', label: 'PAN Number', type: 'text', placeholder: 'Enter PAN number' },
    { name: 'aadhaarNumber', label: 'Aadhaar Number', type: 'text', placeholder: 'Enter Aadhaar number' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    setFormData(data || {});
    setIsEditing(false);
  };

  const isFieldEditable = (fieldName) => {
    return isEditing && (allowedFields.length === 0 || allowedFields.includes(fieldName));
  };

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleChange,
      disabled: !isFieldEditable(field.name),
      className: `w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
        isFieldEditable(field.name)
          ? 'border-gray-300 dark:border-gray-600'
          : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
      } disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed`,
      placeholder: field.placeholder
    };

    if (field.type === 'select') {
      return (
        <select {...commonProps}>
          <option value="">Select {field.label}</option>
          {field.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    } else {
      return (
        <input
          type={field.type}
          {...commonProps}
        />
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bank & Financial Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your banking information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Edit2 size={18} />
            Edit Information
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-semibold transition-all"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={updating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? (
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
        )}
      </div>

      {/* Bank Details */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20 rounded-lg">
            <Banknote className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Bank Account Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankFields.slice(0, 6).map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      {/* Financial Documents */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20 rounded-lg">
            <Banknote className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Financial Documents</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankFields.slice(6).map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
