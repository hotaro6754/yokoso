// src/app/(dashboard)/ld/profile/components/EmploymentInfo.js
"use client";

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import DatePicker from '@/components/common/DatePicker';

export default function EmploymentInfo({ data, onUpdate, updating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

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
    setFormData(data);
    setIsEditing(false);
  };

  const fields = [
    { name: 'employeeId', label: 'Employee ID', type: 'text', readonly: true },
    { name: 'designation', label: 'Designation', type: 'text', readonly: true },
    { name: 'department', label: 'Department', type: 'text', readonly: true },
    { name: 'joiningDate', label: 'Joining Date', type: 'date', readonly: true },
    { name: 'employmentType', label: 'Employment Type', type: 'text', readonly: true },
    { name: 'workLocation', label: 'Work Location', type: 'text', readonly: true },
    { name: 'manager', label: 'Reporting Manager', type: 'text', readonly: true },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Employment Information</h2>
        {isEditing && (
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
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
                {field.readonly && (
                  <span className="text-gray-500 text-xs ml-2">(Read-only)</span>
                )}
              </label>
              {field.type === 'date' ? (
                <DatePicker
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder="Select date"
                  disabled={field.readonly || !isEditing}
                  maxDate={new Date()}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  disabled={field.readonly || !isEditing}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    field.readonly || !isEditing
                      ? 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed'
                      : 'border-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
