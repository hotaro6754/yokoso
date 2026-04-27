"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, EyeOff, Info, Edit2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BankInfo({ data, onUpdate, updating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showAadhaarNumber, setShowAadhaarNumber] = useState(false);
  const [formData, setFormData] = useState(data);

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
    try {
      await onUpdate(formData);
      setIsEditing(false);
      toast.success('Bank information updated successfully');
    } catch (error) {
      console.error('Error updating bank info:', error);
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
      className: `w-full px-3 py-2 border rounded-lg transition-all ${
        isEditing 
          ? 'border-primary bg-card text-foreground focus:ring-2 focus:ring-primary/20' 
          : 'border-border bg-muted text-muted-foreground cursor-not-allowed'
      }`,
      placeholder: field.placeholder
    };

    if (field.name === 'accountNumber') {
      return (
        <div className="relative">
          <input
            type={showAccountNumber ? "text" : "password"}
            {...commonProps}
            className={`${commonProps.className} pr-10`}
          />
          {!isEditing && (
            <button
              type="button"
              onClick={() => setShowAccountNumber(!showAccountNumber)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
          {!isEditing && (
            <button
              type="button"
              onClick={() => setShowAadhaarNumber(!showAadhaarNumber)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

    return <input type={field.type} {...commonProps} />;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-foreground">Bank Information</h2>
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
            Bank details are used for payroll processing. Ensure all information is accurate.
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-md font-semibold text-foreground mb-4">Bank Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableBankFields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={field.name === 'bankName' || field.name === 'accountHolderName' ? 'md:col-span-2' : ''}
              >
                <label className="block text-sm font-medium text-foreground mb-2">
                  {field.label}
                </label>
                {renderField(field)}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="text-md font-semibold text-foreground mb-4">Statutory Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {readonlyBankFields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-muted p-4 rounded-lg border border-border"
              >
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {field.label}
                </label>
                <p className="text-sm font-semibold text-foreground">{field.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
