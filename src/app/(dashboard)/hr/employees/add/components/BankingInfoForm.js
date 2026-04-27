// src\app\(dashboard)\hr\employees\add\components\BankingInfoForm.js
"use client";
import { CreditCard, Building, User, Scan, Banknote, MapPin } from 'lucide-react';
import InputField from '@/components/form/input/InputField';
import SelectField from './SelectField';
import Label from '@/components/form/Label';

export default function BankingInfoForm({ formData, errors, onChange }) {
  const accountTypeOptions = [
    { value: '', label: 'Select Account Type' },
    { value: 'SAVINGS', label: 'Savings Account' },
    { value: 'CURRENT', label: 'Current Account' },
    { value: 'SALARY', label: 'Salary Account' },
    { value: 'NRE', label: 'NRE Account' },
    { value: 'NRO', label: 'NRO Account' }
  ];

  // Function to format IFSC code to uppercase
  const handleIFSCChange = (value) => {
    onChange('ifscCode', value.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Banking Information
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enter the employee's bank account details for payroll processing
            </p>
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Bank Account Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName" required>
              Bank Name
            </Label>
            <InputField
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={(e) => onChange('bankName', e.target.value)}
              placeholder="Enter bank name"
              error={errors.bankName}
              icon={<Building className="w-4 h-4" />}
            />
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber" required>
              Account Number
            </Label>
            <InputField
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => onChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="Enter account number"
              error={errors.accountNumber}
              icon={<CreditCard className="w-4 h-4" />}
              maxLength={18}
            />
          </div>

          {/* IFSC Code */}
          <div className="space-y-2">
            <Label htmlFor="ifscCode" required>
              IFSC Code
            </Label>
            <InputField
              id="ifscCode"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={(e) => handleIFSCChange(e.target.value)}
              placeholder="e.g. SBIN0001234"
              error={errors.ifscCode}
              icon={<Scan className="w-4 h-4" />}
              maxLength={11}
              className="uppercase"
            />
          </div>

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="accountHolderName" required>
              Account Holder Name
            </Label>
            <InputField
              id="accountHolderName"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={(e) => onChange('accountHolderName', e.target.value)}
              placeholder="Enter account holder name"
              error={errors.accountHolderName}
              icon={<User className="w-4 h-4" />}
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="accountType" required>
              Account Type
            </Label>
            <SelectField
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={(value) => onChange('accountType', value)}
              options={accountTypeOptions}
              error={errors.accountType}
              searchable={true}
            />
          </div>
        </div>
      </div>

      {/* Tax & Document Information */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Scan className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Tax & Document Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PAN Number */}
          <div className="space-y-2">
            <Label htmlFor="panNumber" required>
              PAN Number
            </Label>
            <InputField
              id="panNumber"
              name="panNumber"
              value={formData.panNumber}
              onChange={(e) => onChange('panNumber', e.target.value.toUpperCase())}
              placeholder="Enter PAN number"
              error={errors.panNumber}
              maxLength={10}
              className="uppercase"
            />
          </div>

          {/* Aadhaar Number */}
          <div className="space-y-2">
            <Label htmlFor="aadhaarNumber" required>
              Aadhaar Number
            </Label>
            <InputField
              id="aadhaarNumber"
              name="aadhaarNumber"
              value={formData.aadhaarNumber}
              onChange={(e) => onChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="Enter Aadhaar number"
              error={errors.aadhaarNumber}
              maxLength={12}
            />
          </div>

          {/* UAN Number */}
          <div className="space-y-2">
            <Label htmlFor="uanNumber">
              UAN Number
            </Label>
            <InputField
              id="uanNumber"
              name="uanNumber"
              value={formData.uanNumber}
              onChange={(e) => onChange('uanNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="Enter UAN number"
              error={errors.uanNumber}
              maxLength={12}
            />
          </div>

          {/* Passport Number */}
          <div className="space-y-2">
            <Label htmlFor="passportNumber">
              Passport Number
            </Label>
            <InputField
              id="passportNumber"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={(e) => onChange('passportNumber', e.target.value.toUpperCase())}
              placeholder="Enter Passport number"
              error={errors.passportNumber}
              maxLength={20}
              className="uppercase"
            />
          </div>


        </div>
      </div>

      {/* Info Card */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-indigo-600 rounded-md flex-shrink-0 mt-0.5">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              Banking Information Guidelines
            </p>
            <ul className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 space-y-1">
              <li>• Please fill in all mandatory bank details for payroll processing</li>
              <li>• Ensure account number matches the bank passbook</li>
              <li>• IFSC code must be exactly 11 characters</li>
              <li>• Account holder name should match the employee's name</li>
              <li>• PAN and Aadhaar are required for tax compliance</li>
              <li>• Double-check details to avoid payroll processing errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}