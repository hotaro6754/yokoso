'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Package,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { subscriptionService } from '@/services/master-admin/subscription.service';
import DatePicker from '@/components/common/DatePicker';

export default function AddCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - Updated to match Backend/Prisma Schema naming and enums
  // Form state - Updated to simplified version
  const [formData, setFormData] = useState({
    // Company Information
    name: '',
    subdomain: '',
    subdomain: '',
    location: '',
    accountManager: '',

    // Contact Information
    email: '', 
    phone: '',

    // Subscription Information
    subscriptionId: '', 
    
    // Additional Information
    billingAddress: '',
    shippingAddress: ''
  });

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
        const response = await subscriptionService.getAllSubscriptions();
        setPlans(response.data || []);
    } catch (error) {
        console.error("Failed to fetch plans", error);
        toast.error("Failed to load subscription plans");
    }
  };

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for company name to auto-generate subdomain if empty
    if (name === 'name' && !formData.subdomain && value) {
      const generated = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subdomain: generated
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }


    // Phone number validation: only allow numeric input
    if (name === 'phone') {
      // Remove all non-numeric characters
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.accountManager.trim()) newErrors.accountManager = 'Account manager is required';
    if (!formData.subscriptionId) newErrors.subscriptionId = 'Subscription plan is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Updated phone validation: exactly 10 digits, numeric only
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (formData.subdomain.includes('.com')) {
      newErrors.subdomain = 'Subdomain should not include .com (it is added automatically)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Data Sanitization: Convert strings to numbers for PostgreSQL/Prisma
      const submissionData = {
        ...formData,
        // Map frontend "email" to backend "contactEmail" to match Prisma schema
        contactEmail: formData.email,
        // Use the form value for subdomain, ensuring it's lowercase and clean
        subdomain: formData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')
      };

      // POST to the real backend route registered in your app.js
      await apiClient.post('/master-admin/customers', submissionData);

      toast.success('Customer added successfully!');
      router.push('/master-admin/customers');

    } catch (error) {
      console.error('Error adding customer:', error);

      const responseData = error.response?.data;

      // Handle structured validation errors from backend
      if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        responseData.errors.forEach((err) => {
          if (err.msg) {
            toast.error(err.msg);
          }
        });
      } else {
        // Fallback or standard error message
        const errorMessage = responseData?.message || 'Failed to add customer. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'Customers', href: '/master-admin/customers' },
              { label: 'Add Customer', href: '/master-admin/customers/add' }
            ]}
          />
          <Link
            href="/master-admin/customers"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="Enter company name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subdomain <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="subdomain"
                      value={formData.subdomain}
                      onChange={handleInputChange}
                      className={`flex-1 min-w-0 block w-full px-3 py-2 border rounded-l-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.subdomain ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      placeholder="company"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 sm:text-sm">
                      .zodeck.com
                    </span>
                  </div>
                  {errors.subdomain && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subdomain}</p>
                  )}
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.location ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      placeholder="Enter location"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Manager <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountManager"
                    value={formData.accountManager}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.accountManager ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="Enter account manager name"
                  />
                  {errors.accountManager && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.accountManager}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Mail size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.phone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      placeholder="Enter 10-digit phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Package size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subscription Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subscriptionId"
                    value={formData.subscriptionId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.subscriptionId ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select a Plan</option>
                    {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                            {plan.name} - {plan.currency === 'USD' ? '$' : '₹'}{plan.price} / {plan.billingCycle}
                        </option>
                    ))}
                  </select>
                  {errors.subscriptionId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subscriptionId}</p>
                  )}
                </div>
              </div>
            </div>



            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <MapPin size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Address Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Billing Address
                  </label>
                  <textarea
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Enter billing address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shipping Address
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Enter shipping address"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/master-admin/customers"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                <span>{isSubmitting ? 'Adding...' : 'Add Customer'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}