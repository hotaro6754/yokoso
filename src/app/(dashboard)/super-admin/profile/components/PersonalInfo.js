// src/app/(dashboard)/hr/profile/components/PersonalInfo.js
"use client";

import { useState, useEffect } from 'react';
import { Save, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PersonalInfo({ data, onUpdate, updating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  // Helper function to transform blood group enum to display format
  const transformBloodGroupForDisplay = (bloodGroup) => {
    const bloodGroupMapping = {
      'A_POSITIVE': 'A+',
      'A_NEGATIVE': 'A-',
      'B_POSITIVE': 'B+',
      'B_NEGATIVE': 'B-',
      'AB_POSITIVE': 'AB+',
      'AB_NEGATIVE': 'AB-',
      'O_POSITIVE': 'O+',
      'O_NEGATIVE': 'O-'
    };
    return bloodGroupMapping[bloodGroup] || bloodGroup;
  };

  // Helper function to transform display format back to enum
  const transformBloodGroupForAPI = (displayBloodGroup) => {
    const reverseBloodGroupMapping = {
      'A+': 'A_POSITIVE',
      'A-': 'A_NEGATIVE',
      'B+': 'B_POSITIVE',
      'B-': 'B_NEGATIVE',
      'AB+': 'AB_POSITIVE',
      'AB-': 'AB_NEGATIVE',
      'O+': 'O_POSITIVE',
      'O-': 'O_NEGATIVE'
    };
    return reverseBloodGroupMapping[displayBloodGroup] || displayBloodGroup;
  };

  // Initialize formData with transformed blood group for display
  useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        bloodGroup: transformBloodGroupForDisplay(data.bloodGroup)
      });
    }
  }, [data]);

  // Fields that are NOT allowed to be edited
  const READONLY_FIELDS = ['email'];

  // Fields that ARE allowed to be edited (from the allowed list)
  const editableFields = [
    { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Enter first name' },
    { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Enter last name' },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter phone number' },
    { name: 'personalEmail', label: 'Personal Email', type: 'email', placeholder: 'Enter personal email' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', placeholder: '' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] },
    {
      name: 'bloodGroup', label: 'Blood Group', type: 'select', options: [
        { value: 'A_POSITIVE', label: 'A+' },
        { value: 'A_NEGATIVE', label: 'A-' },
        { value: 'B_POSITIVE', label: 'B+' },
        { value: 'B_NEGATIVE', label: 'B-' },
        { value: 'AB_POSITIVE', label: 'AB+' },
        { value: 'AB_NEGATIVE', label: 'AB-' },
        { value: 'O_POSITIVE', label: 'O+' },
        { value: 'O_NEGATIVE', label: 'O-' }
      ]
    },
    { name: 'nationality', label: 'Nationality', type: 'text', placeholder: 'Enter nationality' },

    { name: 'birthPlace', label: 'Birth Place', type: 'text', placeholder: 'Enter birth place' },
    { name: 'height', label: 'Height (cm)', type: 'number', placeholder: 'Enter height' },
    { name: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'Enter weight' },
    { name: 'permanentAddress', label: 'Permanent Address', type: 'textarea', placeholder: 'Enter permanent address', rows: 3 },
    { name: 'currentAddress', label: 'Current Address', type: 'textarea', placeholder: 'Enter current address', rows: 3 },
    { name: 'city', label: 'City', type: 'text', placeholder: 'Enter city' },
    { name: 'state', label: 'State', type: 'text', placeholder: 'Enter state' },
    { name: 'pincode', label: 'Pincode', type: 'number', placeholder: 'Enter pincode' },
    { name: 'country', label: 'Country', type: 'text', placeholder: 'Enter country' },
    { name: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text', placeholder: 'Enter emergency contact name' },
    { name: 'emergencyContactRelation', label: 'Emergency Contact Relation', type: 'text', placeholder: 'Enter relationship' },
    { name: 'emergencyContactPhone', label: 'Emergency Contact Phone', type: 'tel', placeholder: 'Enter emergency contact phone' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let safeValue = value || '';

    const textOnlyFields = ['firstName', 'lastName', 'birthPlace', 'city', 'emergencyContactName', 'emergencyContactRelation', 'state', 'country', 'nationality'];
    if (textOnlyFields.includes(name)) {
      const textValue = safeValue.replace(/[^a-zA-Z\s'-]/g, '');
      if (e.target && typeof e.target.value !== 'undefined') {
        e.target.value = textValue;
      }
      setFormData(prev => ({ ...prev, [name]: textValue }));
      return;
    }

    if (name === 'phone' || name === 'emergencyContactPhone') {
      const numericValue = safeValue.replace(/\D/g, '').slice(0, 10);
      if (e.target && typeof e.target.value !== 'undefined') {
        e.target.value = numericValue;
      }
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    if (name === 'pincode') {
      const numericValue = safeValue.replace(/\D/g, '');
      if (e.target && typeof e.target.value !== 'undefined') {
        e.target.value = numericValue;
      }
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    if (name === 'height' || name === 'weight') {
      const numericValue = safeValue.replace(/[^0-9.]/g, '');
      if (e.target && typeof e.target.value !== 'undefined') {
        e.target.value = numericValue;
      }
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: safeValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Transform blood group back to enum format before sending to API
      const transformedData = {
        ...formData,
        bloodGroup: transformBloodGroupForAPI(formData.bloodGroup)
      };

      await onUpdate(transformedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    setFormData(data);
    setIsEditing(false);
  };

  const isFieldEditable = (fieldName) => {
    return !READONLY_FIELDS.includes(fieldName) && isEditing;
  };

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleChange,
      disabled: !isFieldEditable(field.name),
      className: `w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isFieldEditable(field.name)
          ? 'border-gray-300'
          : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
        } disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed`,
      placeholder: field.placeholder
    };

    if (field.type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={field.rows || 3}
        />
      );
    } else if (field.type === 'select') {
      return (
        <select {...commonProps}>
          <option value="">Select {field.label}</option>
          {field.options?.map(option => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            return (
              <option key={optionValue} value={optionValue}>{optionLabel}</option>
            );
          })}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Personal Information</h2>
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
            Only specific fields are editable. Contact HR for changes to non-editable information.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div>
          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Editable fields from the allowed list */}
            {editableFields.slice(0, 8).map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                  {isFieldEditable(field.name) && (
                    <span className="text-green-600 text-xs ml-2">(Editable)</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}

            {/* Company Email - Read-only */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Email <span className="text-gray-500 text-xs">(Read-only)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-not-allowed"
              />
            </div>

            {/* Remaining editable fields */}
            {editableFields.slice(8, 12).map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                  {isFieldEditable(field.name) && (
                    <span className="text-green-600 text-xs ml-2">(Editable)</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>

        {/* Address Information Section */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableFields.slice(12, 18).map((field) => (
              <div key={field.name} className={field.name.includes('Address') ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                  {isFieldEditable(field.name) && (
                    <span className="text-green-600 text-xs ml-2">(Editable)</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableFields.slice(18).map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                  {isFieldEditable(field.name) && (
                    <span className="text-green-600 text-xs ml-2">(Editable)</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}