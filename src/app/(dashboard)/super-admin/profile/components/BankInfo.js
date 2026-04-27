// src/app/(dashboard)/hr/profile/components/BankInfo.js
"use client";

import { useState } from 'react';
import { Save, Eye, EyeOff, Info } from 'lucide-react';

export default function BankInfo({ data, onUpdate, updating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showAadhaarNumber, setShowAadhaarNumber] = useState(false);
  const [formData, setFormData] = useState(data);

  // Bank fields that ARE allowed to be edited
  const editableBankFields = [
    { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Enter bank name' },
    { name: 'accountNumber', label: 'Account Number', type: 'password', placeholder: 'Enter account number' },
    { name: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'Enter IFSC code' },
    { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Enter account holder name' },
    { name: 'branchName', label: 'Branch Name', type: 'text', placeholder: 'Enter branch name' },
    { name: 'accountType', label: 'Account Type', type: 'select', options: ['SAVINGS', 'CURRENT', 'CHECKING'] },
    { name: 'panNumber', label: 'PAN Number', type: 'text', placeholder: 'Enter PAN number' },
    { name: 'aadhaarNumber', label: 'Aadhaar Number', type: 'password', placeholder: 'Enter Aadhaar number' }
  ];

  // Non-editable bank fields (for display only)
  const readonlyBankFields = [
    { name: 'pfNumber', label: 'PF Number', value: data.pfNumber || 'Not provided' },
    { name: 'uanNumber', label: 'UAN Number', value: data.uanNumber || 'Not provided' },
    { name: 'esiNumber', label: 'ESI Number', value: data.esiNumber || 'Not provided' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(data);
    setIsEditing(false);
  };

  const toggleAccountVisibility = () => {
    setShowAccountNumber(!showAccountNumber);
  };

  const toggleAadhaarVisibility = () => {
    setShowAadhaarNumber(!showAadhaarNumber);
  };

  const isFieldEditable = () => {
    return isEditing;
  };

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleChange,
      disabled: !isFieldEditable(),
      className: `w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
        isFieldEditable() 
          ? 'border-gray-300' 
          : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
      } disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed`,
      placeholder: field.placeholder
    };

    // Special handling for password fields
    if (field.name === 'accountNumber') {
      return (
        <div className="relative">
          <input
            type={showAccountNumber ? "text" : "password"}
            {...commonProps}
            className={`${commonProps.className} pr-10`}
          />
          {!isFieldEditable() && (
            <button
              type="button"
              onClick={toggleAccountVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {showAccountNumber ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      );
    }

    if (field.name === 'aadhaarNumber') {
      return (
        <div className="relative">
          <input
            type={showAadhaarNumber ? "text" : "password"}
            {...commonProps}
            className={`${commonProps.className} pr-10`}
          />
          {!isFieldEditable() && (
            <button
              type="button"
              onClick={toggleAadhaarVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {showAadhaarNumber ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <select {...commonProps}>
          <option value="">Select account type</option>
          {field.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        {...commonProps}
      />
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Bank Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Information
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Only specific bank fields are editable. Other fields (PF, UAN, ESI) are managed by HR.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editable bank fields */}
          {editableBankFields.map((field) => (
            <div key={field.name} className={field.name === 'bankName' || field.name === 'accountHolderName' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
                {isFieldEditable() && (
                  <span className="text-green-600 text-xs ml-2">(Editable)</span>
                )}
              </label>
              {renderField(field)}
            </div>
          ))}

          {/* Read-only bank fields (HR managed) */}
          {readonlyBankFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label} <span className="text-gray-500 text-xs">(HR Managed)</span>
              </label>
              <input
                type="text"
                value={field.value}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-not-allowed"
              />
            </div>
          ))}
        </div>
      </form>

      {!isEditing && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            For security reasons, sensitive information is masked. Contact HR if you need to update HR-managed fields.
          </p>
        </div>
      )}
    </div>
  );
}