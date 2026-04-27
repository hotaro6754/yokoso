// src/app/(dashboard)/hr/profile/components/PersonalInfo.js
"use client";

import { useEffect, useState } from 'react';
import { Save, Info, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DatePicker from '@/components/common/DatePicker';

export default function PersonalInfo({ data, onUpdate, updating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);
  const [familyInputMode, setFamilyInputMode] = useState({});

  // Constants for dropdowns
  const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const genderOptions = ['Male', 'Female', 'Other'];
  const nationalityOptions = ['Indian', 'American', 'British', 'Canadian', 'Australian', 'Other'];
  const countryOptions = ['India', 'USA', 'UK', 'Canada', 'Australia'];
  const stateOptions = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'
  ];

  // Fields that ARE allowed to be edited
  const editableFields = [
    { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Enter first name', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Enter last name', required: true },
    { name: 'email', label: 'Company Email', type: 'email', placeholder: 'Enter company email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter phone number', required: true },
    { name: 'personalEmail', label: 'Personal Email', type: 'email', placeholder: 'Enter personal email' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', placeholder: '', required: true },
    { name: 'gender', label: 'Gender', type: 'select', options: genderOptions, required: true },
    { name: 'maritalStatus', label: 'Marital Status', type: 'select', options: maritalStatusOptions },
    { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: bloodGroupOptions },
    { name: 'nationality', label: 'Nationality', type: 'select', options: nationalityOptions },

    { name: 'birthPlace', label: 'Birth Place', type: 'text', placeholder: 'Enter birth place' },
    { name: 'height', label: 'Height (cm)', type: 'number', placeholder: 'Enter height' },
    { name: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'Enter weight' },
    { name: 'totalExperience', label: 'Total Experience', type: 'number', placeholder: 'e.g. 5 Years' },
    { name: 'relevantExperience', label: 'Relevant Experience', type: 'number', placeholder: 'e.g. 3 Years' },
    
    { name: 'permanentAddress', label: 'Permanent Address', type: 'textarea', placeholder: 'Enter permanent address', rows: 3 },
    { name: 'currentAddress', label: 'Current Address', type: 'textarea', placeholder: 'Enter current address', rows: 3 },
    { name: 'city', label: 'City', type: 'text', placeholder: 'Enter city' },
    { name: 'state', label: 'State', type: 'select', options: stateOptions },
    { name: 'pincode', label: 'Pincode', type: 'text', placeholder: 'Enter pincode' },
    { name: 'country', label: 'Country', type: 'select', options: countryOptions, required: true },
    
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

  const handleArrayChange = (section, index, field, value) => {
    let finalValue = value;
    if (['name', 'relation'].includes(field)) {
      finalValue = value.replace(/[^a-zA-Z\\s]/g, '');
    } else if (field === 'phone') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'age') {
      finalValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (field === 'year') {
      finalValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'percentage') {
       finalValue = value.replace(/[^0-9.]/g, '');
    }
      
    setFormData(prev => {
      const updatedSection = [...(prev[section] || [])];
      updatedSection[index] = { ...updatedSection[index], [field]: finalValue };
      return { ...prev, [section]: updatedSection };
    });
  };

  const calculateAge = (dateValue) => {
    if (!dateValue) return '';
    const birthDate = new Date(dateValue);
    if (Number.isNaN(birthDate.getTime())) return '';

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    return age >= 0 ? String(age) : '';
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    const parsedDate = new Date(dateValue);
    return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().split('T')[0];
  };

  const handleFamilyDateOfBirthChange = (index, value) => {
    setFamilyInputMode((prev) => ({ ...prev, [index]: 'DOB' }));
    setFormData(prev => {
      const updatedSection = [...(prev.familyDetails || [])];
      updatedSection[index] = {
        ...updatedSection[index],
        dateOfBirth: value,
        dob: value,
        age: calculateAge(value) || updatedSection[index]?.age || ''
      };
      return { ...prev, familyDetails: updatedSection };
    });
  };

  useEffect(() => {
    setFamilyInputMode((prev) => {
      const members = formData.familyDetails || [];
      const next = { ...prev };

      Object.keys(next).forEach((key) => {
        const idx = Number(key);
        if (!Number.isFinite(idx) || idx >= members.length) delete next[key];
      });

      members.forEach((member, index) => {
        if (next[index] === 'DOB' || next[index] === 'AGE') return;
        const hasDob = Boolean(member?.dateOfBirth || member?.dob);
        const hasAge = String(member?.age || '').trim() !== '';
        next[index] = hasDob ? 'DOB' : hasAge ? 'AGE' : 'DOB';
      });

      return next;
    });
  }, [formData.familyDetails]);

  const handleFamilyAgeChange = (index, rawValue) => {
    const sanitized = String(rawValue || '').replace(/\D/g, '').slice(0, 3);
    setFamilyInputMode((prev) => ({ ...prev, [index]: 'AGE' }));
    setFormData(prev => {
      const updatedSection = [...(prev.familyDetails || [])];
      updatedSection[index] = {
        ...updatedSection[index],
        age: sanitized,
        dateOfBirth: '',
        dob: ''
      };
      return { ...prev, familyDetails: updatedSection };
    });
  };

  const handleFamilyModeChange = (index, mode) => {
    setFamilyInputMode((prev) => ({ ...prev, [index]: mode }));
    setFormData(prev => {
      const updatedSection = [...(prev.familyDetails || [])];
      const current = updatedSection[index] || {};
      if (mode === 'AGE') {
        updatedSection[index] = { ...current, dateOfBirth: '', dob: '' };
      } else {
        updatedSection[index] = { ...current, age: '' };
      }
      return { ...prev, familyDetails: updatedSection };
    });
  };

  const addArrayItem = (section, emptyItem) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), emptyItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields validation
    const missingFields = editableFields
      .filter(f => f.required && !formData[f.name])
      .map(f => f.label);

    if (missingFields.length > 0) {
      toast.error(`Required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (formData.emergencyContactPhone && formData.emergencyContactPhone.length !== 10) {
      toast.error('Emergency contact phone number must be exactly 10 digits');
      return;
    }

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

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleChange,
      disabled: !isEditing,
      className: `w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-[#E0E2FE] ${isEditing
        ? 'border-gray-300'
        : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
        } disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed`,
      placeholder: field.placeholder
    };

    if (field.type === 'textarea') {
      return <textarea {...commonProps} rows={field.rows || 3} />;
    } else if (field.type === 'select') {
      return (
        <select {...commonProps}>
          <option value="">Select {field.label}</option>
          {field.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    } else if (field.type === 'date') {
      return (
        <DatePicker
          name={field.name}
          value={formData[field.name]}
          onChange={(e) => handleChange(e)}
          disabled={!isEditing}
          placeholder={field.placeholder || "dd-mm-yyyy"}
          className={`px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-[#E0E2FE] ${isEditing
            ? 'border-gray-300'
            : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
            } disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed`}
          dateFormat="d-m-Y"
        />
      );
    } else {
      return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[#E0E2FE]">Personal Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition shadow-sm font-semibold dark:bg-[#E0E2FE] dark:text-[#0B0F19] dark:hover:bg-[#BBBDEC]"
          >
            Edit Information
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-[#BBBDEC]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-semibold dark:bg-[#E0E2FE] dark:text-[#0B0F19] dark:hover:bg-[#BBBDEC]"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-md font-semibold text-gray-800 dark:text-[#E0E2FE] mb-6 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editableFields.slice(0, 15).map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#BBBDEC] mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>

        {/* Family Member Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h3 className="text-md font-semibold text-gray-800 dark:text-[#E0E2FE]">Family Member Details</h3>
            {isEditing && (
              <button
                type="button"
                onClick={() => addArrayItem('familyDetails', { name: '', relation: '', phone: '', dateOfBirth: '', dob: '', age: '' })}
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium dark:text-[#E0E2FE] dark:hover:text-[#BBBDEC]"
              >
                <Plus size={14} /> Add Member
              </button>
            )}
          </div>
          <div className="space-y-4">
            {(formData.familyDetails || []).map((member, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 border rounded-lg relative bg-gray-50/50 dark:bg-gray-900/50">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleArrayChange('familyDetails', index, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-[#E0E2FE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">Relation</label>
                  <input
                    type="text"
                    value={member.relation || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleArrayChange('familyDetails', index, 'relation', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-[#E0E2FE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={member.phone || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleArrayChange('familyDetails', index, 'phone', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-[#E0E2FE]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">DOB / Age</label>
                    <select
                      value={familyInputMode[index] || 'DOB'}
                      disabled={!isEditing}
                      onChange={(e) => handleFamilyModeChange(index, e.target.value)}
                      className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-[#E0E2FE] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="DOB">DOB</option>
                      <option value="AGE">Age</option>
                    </select>
                  </div>
                  <input
                    type="date"
                    value={formatDateForInput(member.dateOfBirth || member.dob)}
                    disabled={!isEditing || familyInputMode[index] === 'AGE'}
                    onChange={(e) => handleFamilyDateOfBirthChange(index, e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-[#E0E2FE] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    value={
                      (familyInputMode[index] === 'AGE'
                        ? (member.age || '')
                        : (calculateAge(member.dateOfBirth || member.dob) || ''))
                    }
                    disabled={!isEditing || familyInputMode[index] !== 'AGE'}
                    onChange={(e) => handleFamilyAgeChange(index, e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-[#E0E2FE] disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Age"
                  />
                </div>
                {isEditing && (
                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('familyDetails', index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {(!formData.familyDetails || formData.familyDetails.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-[#BBBDEC] text-center py-4">No family details added.</p>
            )}
          </div>
        </div>

        {/* Education Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h3 className="text-md font-semibold text-gray-800 dark:text-[#E0E2FE]">Education Details</h3>
            {isEditing && (
              <button
                type="button"
                onClick={() => addArrayItem('educationDetails', { degree: '', institute: '', year: '', percentage: '' })}
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium dark:text-[#E0E2FE] dark:hover:text-[#BBBDEC]"
              >
                <Plus size={14} /> Add Education
              </button>
            )}
          </div>
          <div className="space-y-4">
            {(formData.educationDetails || []).map((edu, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">Degree/Course</label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleArrayChange('educationDetails', index, 'degree', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:text-[#E0E2FE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">Institute</label>
                  <input
                    type="text"
                    value={edu.institute || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleArrayChange('educationDetails', index, 'institute', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:text-[#E0E2FE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">Year</label>
                  <input
                    type="text"
                    value={edu.year || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleArrayChange('educationDetails', index, 'year', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:text-[#E0E2FE]"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">%/CGPA</label>
                    <input
                      type="text"
                      value={edu.percentage || ''}
                      disabled={!isEditing}
                      onChange={(e) => handleArrayChange('educationDetails', index, 'percentage', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:text-[#E0E2FE]"
                    />
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('educationDetails', index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h3 className="text-md font-semibold text-gray-800 dark:text-[#E0E2FE]">Previous Employment Details</h3>
            {isEditing && (
              <button
                type="button"
                onClick={() => addArrayItem('employmentDetails', { company: '', designation: '', from: '', to: '' })}
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium dark:text-[#E0E2FE] dark:hover:text-[#BBBDEC]"
              >
                <Plus size={14} /> Add Employment
              </button>
            )}
          </div>
          <div className="space-y-4">
            {(formData.employmentDetails || []).map((exp, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleArrayChange('employmentDetails', index, 'company', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:text-[#E0E2FE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">Designation</label>
                  <input
                    type="text"
                    value={exp.designation || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleArrayChange('employmentDetails', index, 'designation', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:text-[#E0E2FE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">From</label>
                  <input
                    type="text"
                    value={exp.from || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleArrayChange('employmentDetails', index, 'from', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:text-[#E0E2FE]"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-[#BBBDEC] mb-1">To</label>
                    <input
                      type="text"
                      value={exp.to || ''}
                      disabled={!isEditing}
                      onChange={(e) => handleArrayChange('employmentDetails', index, 'to', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-700 dark:text-[#E0E2FE]"
                    />
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('employmentDetails', index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address Information Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-md font-semibold text-gray-800 dark:text-[#E0E2FE] mb-6 border-b pb-2">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableFields.slice(15, 21).map((field) => (
              <div key={field.name} className={field.name.includes('Address') ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#BBBDEC] mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-md font-semibold text-gray-800 dark:text-[#E0E2FE] mb-6 border-b pb-2">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableFields.slice(21).map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#BBBDEC] mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
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
