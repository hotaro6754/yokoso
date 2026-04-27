"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Info, Edit2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PersonalInfo({ data, onUpdate, updating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  const READONLY_FIELDS = ['firstName', 'lastName', 'email'];

  const editableFields = [
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter phone number' },
    { name: 'personalEmail', label: 'Personal Email', type: 'email', placeholder: 'Enter personal email' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'maritalStatus', label: 'Marital Status', type: 'text', placeholder: 'Enter marital status' },
    { name: 'bloodGroup', label: 'Blood Group', type: 'text', placeholder: 'Enter blood group' },
    { name: 'nationality', label: 'Nationality', type: 'text', placeholder: 'Enter nationality' },

    { name: 'birthPlace', label: 'Birth Place', type: 'text', placeholder: 'Enter birth place' },
    { name: 'height', label: 'Height (cm)', type: 'number', placeholder: 'Enter height' },
    { name: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'Enter weight' },
    { name: 'permanentAddress', label: 'Permanent Address', type: 'textarea', rows: 3 },
    { name: 'currentAddress', label: 'Current Address', type: 'textarea', rows: 3 },
    { name: 'city', label: 'City', type: 'text', placeholder: 'Enter city' },
    { name: 'state', label: 'State', type: 'text', placeholder: 'Enter state' },
    { name: 'pincode', label: 'Pincode', type: 'text', placeholder: 'Enter pincode' },
    { name: 'country', label: 'Country', type: 'text', placeholder: 'Enter country' },
    { name: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text' },
    { name: 'emergencyContactRelation', label: 'Emergency Contact Relation', type: 'text' },
    { name: 'emergencyContactPhone', label: 'Emergency Contact Phone', type: 'tel' }
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
      await onUpdate(formData);
      setIsEditing(false);
      toast.success('Personal information updated successfully');
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
      className: `w-full px-3 py-2 border rounded-lg transition-all ${isFieldEditable(field.name)
          ? 'border-primary bg-card text-foreground focus:ring-2 focus:ring-primary/20'
          : 'border-border bg-muted text-muted-foreground cursor-not-allowed'
        }`,
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
    } else {
      return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-md"
          >
            <Edit2 size={16} />
            Edit Information
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted"
            >
              <X size={16} />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-success text-success-foreground rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
            </motion.button>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg"
      >
        <div className="flex items-start gap-2">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">
            Only specific fields are editable. Contact HR for changes to non-editable information.
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-md font-semibold text-foreground mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                First Name <span className="text-muted-foreground text-xs">(Read-only)</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                disabled
                className="w-full px-3 py-2 border border-border bg-muted rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Last Name <span className="text-muted-foreground text-xs">(Read-only)</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                disabled
                className="w-full px-3 py-2 border border-border bg-muted rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Email <span className="text-muted-foreground text-xs">(Read-only)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-border bg-muted rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>

            {editableFields.slice(0, 6).map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <label className="block text-sm font-medium text-foreground mb-2">
                  {field.label}
                  {isFieldEditable(field.name) && (
                    <span className="text-success text-xs ml-2">(Editable)</span>
                  )}
                </label>
                {renderField(field)}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="text-md font-semibold text-foreground mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableFields.slice(12, 18).map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={field.name.includes('Address') ? 'md:col-span-2' : ''}
              >
                <label className="block text-sm font-medium text-foreground mb-2">
                  {field.label}
                  {isFieldEditable(field.name) && (
                    <span className="text-success text-xs ml-2">(Editable)</span>
                  )}
                </label>
                {renderField(field)}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="text-md font-semibold text-foreground mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableFields.slice(18).map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <label className="block text-sm font-medium text-foreground mb-2">
                  {field.label}
                  {isFieldEditable(field.name) && (
                    <span className="text-success text-xs ml-2">(Editable)</span>
                  )}
                </label>
                {renderField(field)}
              </motion.div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
