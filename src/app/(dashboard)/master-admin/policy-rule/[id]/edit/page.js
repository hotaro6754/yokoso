'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { Shield, ArrowLeft, Save, X, AlertTriangle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import DatePicker from '@/components/common/DatePicker';

export default function EditPolicyPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'Draft',
    description: '',
    content: '',
    effectiveDate: '',
    expiryDate: '',
    department: '',
    version: '1.0',
    tags: ''
  });
  const [errors, setErrors] = useState({});

  const categories = ['HR', 'Security', 'General', 'Legal', 'Finance'];
  const statuses = ['Draft', 'Active', 'Inactive'];
  const departments = ['All Departments', 'HR', 'IT', 'Finance', 'Operations', 'Legal'];

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setIsLoading(true);
        // Real API call to fetch existing policy data
        const response = await apiClient.get(`/master-admin/policy-rules/${params.id}`);
        
        if (response.data.success) {
          const mockPolicy = response.data.data;
          
          // Format dates for HTML input (YYYY-MM-DD)
          const formattedData = {
            name: mockPolicy.name,
            category: mockPolicy.category,
            status: mockPolicy.status,
            description: mockPolicy.description,
            content: mockPolicy.content,
            effectiveDate: mockPolicy.effectiveDate ? new Date(mockPolicy.effectiveDate).toISOString().split('T')[0] : '',
            expiryDate: mockPolicy.expiryDate ? new Date(mockPolicy.expiryDate).toISOString().split('T')[0] : '',
            department: mockPolicy.department,
            version: mockPolicy.version,
            tags: mockPolicy.tags || ''
          };

          setFormData(formattedData);
          setOriginalData(formattedData);
        }
      } catch (err) {
        setError('Failed to load policy details');
        console.error('Error fetching policy:', err);
        toast.error("Could not find the requested policy");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPolicy();
    }
  }, [params.id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Policy name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Policy content is required';
    }
    
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }
    
    if (formData.expiryDate && formData.effectiveDate && formData.expiryDate < formData.effectiveDate) {
      newErrors.expiryDate = 'Expiry date must be after effective date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedForm);
    
    // Check if there are changes compared to original data
    if (originalData) {
      const isDifferent = Object.keys(updatedForm).some(
        key => updatedForm[key] !== originalData[key]
      );
      setHasChanges(isDifferent);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Real API call to update policy
      const response = await apiClient.put(`/master-admin/policy-rules/${params.id}`, {
        ...formData,
        effectiveDate: new Date(formData.effectiveDate).toISOString(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null
      });
      
      if (response.data.success) {
        toast.success('Policy updated successfully!');
        setHasChanges(false);
        router.push(`/master-admin/policy-rule/${params.id}`);
      }
      
    } catch (error) {
      console.error('Failed to update policy:', error);
      toast.error(error.response?.data?.message || 'Failed to update policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Are you sure you want to discard your changes?')) {
        router.push(`/master-admin/policy-rule/${params.id}`);
      }
    } else {
      router.push(`/master-admin/policy-rule/${params.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
            <p className="text-gray-50 text-sm font-medium">Loading policy data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !originalData) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
            <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error || 'Policy not found'}</p>
            <Link
              href="/master-admin/policy-rule"
              className="text-primary-600 hover:text-primary-700 font-semibold underline"
            >
              Back to Policies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Breadcrumb 
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'Policy & Rule', href: '/master-admin/policy-rule' },
              { label: originalData.name, href: `/master-admin/policy-rule/${params.id}` },
              { label: 'Edit', href: `/master-admin/policy-rule/${params.id}/edit` }
            ]}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Update Policy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warning Message */}
        {hasChanges && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-sm p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Unsaved Changes</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  You have made changes to this policy. Don&apos;t forget to save your changes before leaving.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 space-y-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield size={20} className="text-primary-600" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Policy Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                      }`}
                      placeholder="Enter policy name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Version
                    </label>
                    <input
                      type="text"
                      name="version"
                      value={formData.version}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="1.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="Brief description of the policy"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
              </div>
              
              {/* Policy Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Policy Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={10}
                  className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.content ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="Detailed policy content, rules, and guidelines..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                )}
              </div>
              
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Effective Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    name="effectiveDate"
                    value={formData.effectiveDate}
                    onChange={handleInputChange}
                    placeholder="dd-mm-yyyy"
                    required
                    className={`${errors.effectiveDate ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-sm`}
                  />
                  {errors.effectiveDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.effectiveDate}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <DatePicker
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="dd-mm-yyyy"
                    minDate={formData.effectiveDate ? new Date(formData.effectiveDate) : null}
                    className={`${errors.expiryDate ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-sm`}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expiryDate}</p>
                  )}
                </div>
              </div>
              
              {/* Additional Fields Removed */}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}