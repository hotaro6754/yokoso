// src/app/(dashboard)/hr/employees/add/components/PersonalInfoForm.js
"use client";
import { User, Calendar, Globe, Upload, X, Camera, AlertCircle, CheckCircle, Ruler, Weight, MapPin, Plus, Trash2, GraduationCap, Briefcase } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import InputField from '@/components/form/input/InputField';
import DatePickerField from '@/components/form/input/DatePickerField';
import SelectField from './SelectField';
import Label from '@/components/form/Label';
import { toast } from 'sonner';

export default function PersonalInfoForm({ formData, errors, onChange, dropdownData }) {
  const [profilePreview, setProfilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [familyInputMode, setFamilyInputMode] = useState({});

  // Initialize preview if there's an existing profile image URL
  useEffect(() => {
    if (typeof formData.profileImage === 'string' && formData.profileImage) {
      setProfilePreview(formData.profileImage);
    }
  }, [formData.profileImage]);

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
  ];

  const maritalStatusOptions = [
    { value: '', label: 'Select Marital Status' },
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED', label: 'Married' },
    { value: 'DIVORCED', label: 'Divorced' },
    { value: 'WIDOWED', label: 'Widowed' },
    { value: 'SEPARATED', label: 'Separated' }
  ];

  const bloodGroupOptions = [
    { value: '', label: 'Select Blood Group' },
    { value: 'A_POSITIVE', label: 'A+' },
    { value: 'A_NEGATIVE', label: 'A-' },
    { value: 'B_POSITIVE', label: 'B+' },
    { value: 'B_NEGATIVE', label: 'B-' },
    { value: 'O_POSITIVE', label: 'O+' },
    { value: 'O_NEGATIVE', label: 'O-' },
    { value: 'AB_POSITIVE', label: 'AB+' },
    { value: 'AB_NEGATIVE', label: 'AB-' }
  ];

  const nationalityOptions = [
    { value: '', label: 'Select Nationality' },
    { value: 'Indian', label: 'Indian' },
    { value: 'American', label: 'American' },
    { value: 'British', label: 'British' },
    { value: 'Canadian', label: 'Canadian' },
    { value: 'Other', label: 'Other' }
  ];

  const handleProfilePhotoUpload = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target.result);
        onChange('profileImage', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (event) => {
    handleProfilePhotoUpload(event.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleProfilePhotoUpload(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Repeater handlers
  const handleArrayChange = (section, index, field, value) => {
    const updatedSection = [...(formData[section] || [])];
    updatedSection[index] = { ...updatedSection[index], [field]: value };
    onChange(section, updatedSection);
  };

  useEffect(() => {
    setFamilyInputMode((prev) => {
      const members = formData.familyDetails || [];
      const next = { ...prev };

      // Drop modes for removed rows
      Object.keys(next).forEach((key) => {
        const idx = Number(key);
        if (!Number.isFinite(idx) || idx >= members.length) delete next[key];
      });

      // Initialize modes for new rows only (do not override user selection)
      members.forEach((member, index) => {
        if (next[index] === 'DOB' || next[index] === 'AGE') return;
        const hasDob = Boolean(member?.dateOfBirth || member?.dob);
        const hasAge = String(member?.age || '').trim() !== '';
        next[index] = hasDob ? 'DOB' : hasAge ? 'AGE' : 'DOB';
      });

      return next;
    });
  }, [formData.familyDetails]);

  const handleFamilyDateOfBirthChange = (index, value) => {
    setFamilyInputMode((prev) => ({ ...prev, [index]: 'DOB' }));
    const updatedSection = [...(formData.familyDetails || [])];
    updatedSection[index] = {
      ...updatedSection[index],
      dateOfBirth: value,
      dob: value,
      age: calculateAge(value) || updatedSection[index]?.age || ''
    };
    onChange('familyDetails', updatedSection);
  };

  const handleFamilyAgeChange = (index, rawValue) => {
    setFamilyInputMode((prev) => ({ ...prev, [index]: 'AGE' }));
    const updatedSection = [...(formData.familyDetails || [])];
    const sanitized = String(rawValue || '').replace(/\D/g, '').slice(0, 3);
    updatedSection[index] = {
      ...updatedSection[index],
      age: sanitized,
      dateOfBirth: '',
      dob: ''
    };
    onChange('familyDetails', updatedSection);
  };

  const handleFamilyModeChange = (index, mode) => {
    setFamilyInputMode((prev) => ({ ...prev, [index]: mode }));

    const updatedSection = [...(formData.familyDetails || [])];
    const current = updatedSection[index] || {};

    if (mode === 'AGE') {
      updatedSection[index] = { ...current, dateOfBirth: '', dob: '' };
    } else {
      // DOB mode: clear manual age so one source of truth remains.
      updatedSection[index] = { ...current, age: '' };
    }

    onChange('familyDetails', updatedSection);
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

  const addArrayItem = (section, emptyItem) => {
    onChange(section, [...(formData[section] || []), emptyItem]);
  };

  const removeArrayItem = (section, index) => {
    onChange(section, (formData[section] || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-sm shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Personal Information
            </h2>
            <p className="text-sm text-brand-600 dark:text-brand-400 mt-1 font-medium">
              Complete employee personal details
            </p>
          </div>
        </div>
      </div>

      {/* Profile Photo */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700">
              {profilePreview ? (
                <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
          <div className="flex-1 w-full">
            <div 
              onClick={triggerFileInput}
              className="p-6 border-2 border-dashed rounded-sm text-center cursor-pointer hover:border-brand-500 transition-colors"
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (Max 5MB)</p>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileInputChange} />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6 border-b pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" required>First Name</Label>
            <InputField id="firstName" name="firstName" value={formData.firstName} onChange={(e) => onChange('firstName', e.target.value)} placeholder="Enter first name" error={errors.firstName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" required>Last Name</Label>
            <InputField id="lastName" name="lastName" value={formData.lastName} onChange={(e) => onChange('lastName', e.target.value)} placeholder="Enter last name" error={errors.lastName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" required>
              Official Email
            </Label>
            <InputField
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="employee@company.com"
              error={errors.email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personalEmail">Personal Email</Label>
            <InputField id="personalEmail" name="personalEmail" value={formData.personalEmail} onChange={(e) => onChange('personalEmail', e.target.value)} placeholder="personal@email.com" error={errors.personalEmail} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" required>Date of Birth</Label>
            <DatePickerField id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={(val) => onChange('dateOfBirth', val)} error={errors.dateOfBirth} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" required>Gender</Label>
            <SelectField id="gender" name="gender" value={formData.gender} onChange={(val) => onChange('gender', val)} options={genderOptions} error={errors.gender} searchable={true} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maritalStatus" required>Marital Status</Label>
            <SelectField id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={(val) => onChange('maritalStatus', val)} options={maritalStatusOptions} error={errors.maritalStatus} searchable={true} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <SelectField id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={(val) => onChange('bloodGroup', val)} options={bloodGroupOptions} error={errors.bloodGroup} searchable={true} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <SelectField id="nationality" name="nationality" value={formData.nationality} onChange={(val) => onChange('nationality', val)} options={nationalityOptions} error={errors.nationality} searchable={true} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthPlace">Birth Place</Label>
            <InputField id="birthPlace" name="birthPlace" value={formData.birthPlace} onChange={(e) => onChange('birthPlace', e.target.value)} placeholder="Enter birth place" />
          </div>
        </div>
      </div>

      {/* Family Details Repeater */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Family Details</h3>
          <button type="button" onClick={() => addArrayItem('familyDetails', { name: '', relation: '', dateOfBirth: '', dob: '', age: '' })} className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-bold">
            <Plus size={14} /> Add Member
          </button>
        </div>
        <div className="space-y-4">
          {(formData.familyDetails || []).map((member, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border rounded relative bg-gray-50 dark:bg-gray-900/40">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <InputField 
                  value={member.name} 
                  onChange={(e) => handleArrayChange('familyDetails', index, 'name', e.target.value)} 
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Relation</Label>
                <SelectField 
                  value={member.relation} 
                  onChange={(val) => handleArrayChange('familyDetails', index, 'relation', val)} 
                  options={[
                    { value: '', label: 'Select Relation' },
                    { value: 'SPOUSE', label: 'Spouse' },
                    { value: 'FATHER', label: 'Father' },
                    { value: 'MOTHER', label: 'Mother' },
                    { value: 'SON', label: 'Son' },
                    { value: 'DAUGHTER', label: 'Daughter' },
                    { value: 'BROTHER', label: 'Brother' },
                    { value: 'SISTER', label: 'Sister' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                  className="!py-1.5 !px-3 !rounded-lg border-[1px]"
                  searchable={true}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs">DOB / Age</Label>
                  <select
                    value={familyInputMode[index] || 'DOB'}
                    onChange={(e) => handleFamilyModeChange(index, e.target.value)}
                    className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="DOB">DOB</option>
                    <option value="AGE">Age</option>
                  </select>
                </div>
                {familyInputMode[index] === 'AGE' ? (
                  <DatePickerField
                    value=""
                    onChange={() => {}}
                    disabled={true}
                    placeholder="Using age"
                    className="h-9"
                  />
                ) : (
                  <DatePickerField
                    value={member.dateOfBirth || member.dob || ''}
                    onChange={(val) => handleFamilyDateOfBirthChange(index, val)}
                    className="h-9"
                  />
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Age</Label>
                <InputField
                  type="number"
                  min="0"
                  value={
                    (familyInputMode[index] === 'AGE'
                      ? (member.age || '')
                      : (calculateAge(member.dateOfBirth || member.dob) || ''))
                  }
                  disabled={familyInputMode[index] !== 'AGE'}
                  onChange={(e) => handleFamilyAgeChange(index, e.target.value)}
                  placeholder="Age"
                  className="h-9"
                />
                <p className="text-[10px] text-gray-500">Select DOB or Age above.</p>
              </div>
              <div className="flex items-end justify-end pb-1">
                <button type="button" onClick={() => removeArrayItem('familyDetails', index)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {(!formData.familyDetails || formData.familyDetails.length === 0) && <p className="text-sm text-gray-500 text-center py-2">No family details added.</p>}
        </div>
      </div>

      {/* Education Details Repeater */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Education Details</h3>
          </div>
          <button type="button" onClick={() => addArrayItem('educationDetails', { degree: '', institute: '', year: '', percentage: '' })} className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-bold">
            <Plus size={14} /> Add Education
          </button>
        </div>
        <div className="space-y-4">
          {(formData.educationDetails || []).map((edu, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded bg-gray-50 dark:bg-gray-900/40">
              <div className="space-y-1">
                <Label className="text-xs">Degree/Course</Label>
                <InputField 
                  value={edu.degree} 
                  onChange={(e) => handleArrayChange('educationDetails', index, 'degree', e.target.value)} 
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Institute</Label>
                <InputField 
                  value={edu.institute} 
                  onChange={(e) => handleArrayChange('educationDetails', index, 'institute', e.target.value)} 
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Year</Label>
                <InputField 
                  value={edu.year} 
                  onChange={(e) => handleArrayChange('educationDetails', index, 'year', e.target.value)} 
                  className="h-9"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">%/CGPA</Label>
                  <InputField 
                    value={edu.percentage} 
                    onChange={(e) => handleArrayChange('educationDetails', index, 'percentage', e.target.value)} 
                    className="h-9"
                  />
                </div>
                <button type="button" onClick={() => removeArrayItem('educationDetails', index)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors pb-1"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employment Details Repeater */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Previous Employment</h3>
          </div>
          <button type="button" onClick={() => addArrayItem('employmentDetails', { company: '', designation: '', from: '', to: '' })} className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-bold">
            <Plus size={14} /> Add Employment
          </button>
        </div>
        <div className="space-y-4">
          {(formData.employmentDetails || []).map((exp, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded bg-gray-50 dark:bg-gray-900/40">
              <div className="space-y-1">
                <Label className="text-xs">Company</Label>
                <InputField 
                  value={exp.company} 
                  onChange={(e) => handleArrayChange('employmentDetails', index, 'company', e.target.value)} 
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Designation</Label>
                <InputField 
                  value={exp.designation} 
                  onChange={(e) => handleArrayChange('employmentDetails', index, 'designation', e.target.value)} 
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <DatePickerField 
                  id={`emp_from_${index}`}
                  value={exp.from} 
                  onChange={(val) => handleArrayChange('employmentDetails', index, 'from', val)} 
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">To</Label>
                  <DatePickerField 
                    id={`emp_to_${index}`}
                    value={exp.to} 
                    onChange={(val) => handleArrayChange('employmentDetails', index, 'to', val)} 
                  />
                </div>
                <button type="button" onClick={() => removeArrayItem('employmentDetails', index)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors pb-1"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
