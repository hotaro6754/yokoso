"use client";

import { useState, useEffect } from 'react';
import { Save, Edit2, X } from 'lucide-react';
import DatePicker from '@/components/common/DatePicker';

export default function PersonalInfo({ data, onUpdate, updating, allowedFields = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const READONLY_FIELDS = ["firstName", "lastName", "email"];

  const personalFields = [
    { name: "dateOfBirth", label: "Date of Birth", type: "date", placeholder: "Select date of birth" },
    { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { name: "bloodGroup", label: "Blood Group", type: "text", placeholder: "Enter blood group" },
    { name: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"] },
    { name: "nationality", label: "Nationality", type: "text", placeholder: "Enter nationality" },

    { name: "birthPlace", label: "Birth Place", type: "text", placeholder: "Enter birth place" },
  ];

  const contactFields = [
    { name: "phone", label: "Mobile Number", type: "tel", placeholder: "Enter mobile number" },
    { name: "personalEmail", label: "Personal Email", type: "email", placeholder: "Enter personal email" },
    { name: "currentAddress", label: "Current Address", type: "textarea", placeholder: "Enter current address", rows: 3 },
    { name: "permanentAddress", label: "Permanent Address", type: "textarea", placeholder: "Enter permanent address", rows: 3 },
    { name: "city", label: "City", type: "text", placeholder: "Enter city" },
    { name: "state", label: "State", type: "text", placeholder: "Enter state" },
    { name: "pincode", label: "Pincode", type: "text", placeholder: "Enter pincode" },
    { name: "country", label: "Country", type: "text", placeholder: "Enter country" },
  ];

  const emergencyFields = [
    { name: "emergencyContactName", label: "Emergency Contact Name", type: "text", placeholder: "Enter contact name" },
    { name: "emergencyContactRelation", label: "Relationship", type: "text", placeholder: "Enter relationship" },
    { name: "emergencyContactPhone", label: "Emergency Contact Phone", type: "tel", placeholder: "Enter contact phone" },
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

  const handleDateChange = (e) => {
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
    return !READONLY_FIELDS.includes(fieldName) && isEditing && (allowedFields.length === 0 || allowedFields.includes(fieldName));
  };

  const renderField = (field) => {
    if (field.type === 'date') {
      return (
        <DatePicker
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleDateChange}
          placeholder={field.placeholder}
          disabled={!isFieldEditable(field.name)}
          maxDate={field.name === 'dateOfBirth' ? new Date() : null}
          className={!isFieldEditable(field.name) ? 'opacity-60 cursor-not-allowed' : ''}
        />
      );
    }

    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleChange,
      disabled: !isFieldEditable(field.name),
      className: `w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${isFieldEditable(field.name)
          ? 'border-gray-300 dark:border-gray-600'
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal & Contact Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information</p>
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

      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName || ''}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName || ''}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          {personalFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactFields.map((field) => (
            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyFields.map((field) => (
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
