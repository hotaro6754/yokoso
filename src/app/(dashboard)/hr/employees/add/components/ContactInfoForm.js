// src\app\(dashboard)\hr\employees\add\components\ContactInfoForm.js
"use client";
import { Mail, Phone, MapPin, PhoneCall } from 'lucide-react';
import InputField from '@/components/form/input/InputField';
import SelectField from './SelectField';
import Label from '@/components/form/Label';

export default function ContactInfoForm({ formData, errors, onChange }) {
  const countryOptions = [
    { value: '', label: 'Select Country' },
    { value: 'India', label: 'India' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Japan', label: 'Japan' },
    { value: 'China', label: 'China' },
    { value: 'Brazil', label: 'Brazil' }
  ];

  const relationOptions = [
    { value: '', label: 'Select Relationship' },
    { value: 'SPOUSE', label: 'Spouse' },
    { value: 'PARENT', label: 'Parent' },
    { value: 'SIBLING', label: 'Sibling' },
    { value: 'CHILD', label: 'Child' },
    { value: 'FRIEND', label: 'Friend' },
    { value: 'RELATIVE', label: 'Relative' },
    { value: 'OTHER', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Contact Information
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enter contact details and address information
            </p>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Contact Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" required>
              Phone Number
            </Label>
            <InputField
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                onChange('phone', val);
              }}
              placeholder="Enter phone number"
              error={errors.phone}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalEmail" required>
              Personal Email
            </Label>
            <InputField
              id="personalEmail"
              name="personalEmail"
              type="email"
              value={formData.personalEmail}
              onChange={(e) => onChange('personalEmail', e.target.value)}
              placeholder="personal@email.com"
              error={errors.personalEmail}
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Address Information
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="permanentAddress">
              Permanent Address
            </Label>
            <InputField
              id="permanentAddress"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={(e) => onChange('permanentAddress', e.target.value)}
              placeholder="Enter permanent address"
              error={errors.permanentAddress}
              multiline
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sameAsPermanent"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              onChange={(e) => {
                if (e.target.checked) {
                  onChange('currentAddress', formData.permanentAddress);
                }
              }}
            />
            <Label htmlFor="sameAsPermanent" className="text-sm text-gray-600 dark:text-gray-400">
              Same as permanent address
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentAddress">
              Current Address
            </Label>
            <InputField
              id="currentAddress"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={(e) => onChange('currentAddress', e.target.value)}
              placeholder="Enter current address"
              error={errors.currentAddress}
              multiline
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City
              </Label>
              <InputField
                id="city"
                name="city"
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder="Enter city"
                error={errors.city}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">
                State
              </Label>
              <SelectField
                id="state"
                name="state"
                value={formData.state}
                onChange={(value) => onChange('state', value)}
                options={[
                  { value: '', label: 'Select State' },
                  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
                  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
                  { value: 'Assam', label: 'Assam' },
                  { value: 'Bihar', label: 'Bihar' },
                  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
                  { value: 'Goa', label: 'Goa' },
                  { value: 'Gujarat', label: 'Gujarat' },
                  { value: 'Haryana', label: 'Haryana' },
                  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
                  { value: 'Jharkhand', label: 'Jharkhand' },
                  { value: 'Karnataka', label: 'Karnataka' },
                  { value: 'Kerala', label: 'Kerala' },
                  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
                  { value: 'Maharashtra', label: 'Maharashtra' },
                  { value: 'Manipur', label: 'Manipur' },
                  { value: 'Meghalaya', label: 'Meghalaya' },
                  { value: 'Mizoram', label: 'Mizoram' },
                  { value: 'Nagaland', label: 'Nagaland' },
                  { value: 'Odisha', label: 'Odisha' },
                  { value: 'Punjab', label: 'Punjab' },
                  { value: 'Rajasthan', label: 'Rajasthan' },
                  { value: 'Sikkim', label: 'Sikkim' },
                  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                  { value: 'Telangana', label: 'Telangana' },
                  { value: 'Tripura', label: 'Tripura' },
                  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                  { value: 'Uttarakhand', label: 'Uttarakhand' },
                  { value: 'West Bengal', label: 'West Bengal' },
                  { value: 'Other', label: 'Other' }
                ]}
                error={errors.state}
                searchable={true}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">
                PIN Code
              </Label>
              <InputField
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={(e) => onChange('pincode', e.target.value)}
                placeholder="Enter PIN code"
                error={errors.pincode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country
              </Label>
              <SelectField
                id="country"
                name="country"
                value={formData.country}
                onChange={(value) => onChange('country', value)}
                options={countryOptions}
                error={errors.country}
                searchable={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <PhoneCall className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Emergency Contact
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">
              Contact Name
            </Label>
            <InputField
              id="emergencyContactName"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => onChange('emergencyContactName', e.target.value)}
              placeholder="Enter full name"
              error={errors.emergencyContactName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelation">
              Relationship
            </Label>
            <SelectField
              id="emergencyContactRelation"
              name="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={(value) => onChange('emergencyContactRelation', value)}
              options={relationOptions}
              error={errors.emergencyContactRelation}
              searchable={true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">
              Phone Number
            </Label>
            <InputField
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                onChange('emergencyContactPhone', val);
              }}
              placeholder="Enter phone number"
              error={errors.emergencyContactPhone}
            />
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-green-600 rounded-md flex-shrink-0 mt-0.5">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Contact Information Guidelines
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Ensure all contact information is up-to-date and accurate. Emergency contact details are crucial for workplace safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}