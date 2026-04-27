'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { Shield, ArrowLeft, Edit, Calendar, User, Tag, FileText, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function ViewPolicyPage() {
  const params = useParams();
  const router = useRouter();
  const [policy, setPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setIsLoading(true);
        // Real API call to fetch policy details by ID
        const response = await apiClient.get(`/master-admin/policy-rules/${params.id}`);

        if (response.data.success) {
          // Format tags from comma-separated string to array for the UI
          const data = response.data.data;
          if (data.tags && typeof data.tags === 'string') {
            data.tags = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
          } else if (!data.tags) {
            data.tags = [];
          }
          setPolicy(data);
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load policy details';
        setError(message);
        toast.error(message);
        console.error('Error fetching policy:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPolicy();
    }
  }, [params.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <CheckCircle size={16} />;
      case 'Draft': return <AlertCircle size={16} />;
      case 'Inactive': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-GB').replace(/\//g, '-');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const d = date.toLocaleDateString('en-GB').replace(/\//g, '-');
    const t = date.toLocaleTimeString('en-GB');
    return `${d}, ${t}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Fetching policy content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error || 'Policy not found'}</p>
            <Link
              href="/master-admin/policy-rule"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold underline"
            >
              <ArrowLeft size={16} />
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
              { label: policy.name, href: `/master-admin/policy-rule/${policy.id}` }
            ]}
          />
          <div className="flex items-center gap-3">
            <Link
              href={`/master-admin/policy-rule/${policy.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors shadow-sm font-medium text-sm"
            >
              <Edit size={18} />
              <span>Edit Policy</span>
            </Link>
            <Link
              href="/master-admin/policy-rule"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* Policy Header */}
        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Shield size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{policy.name}</h1>
                  <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700">
                      {policy.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                      {getStatusIcon(policy.status)}
                      {policy.status}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      Version {policy.version}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{policy.description}</p>
          </div>
        </div>

        {/* Policy Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Policy Content */}
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Policy Content
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300 leading-relaxed">
                    {policy.content}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Policy Information */}
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Policy Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Effective Date</label>
                    <div className="flex items-center gap-2 mt-1 text-gray-900 dark:text-white">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(policy.effectiveDate)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiry Date</label>
                    <div className="flex items-center gap-2 mt-1 text-gray-900 dark:text-white">
                      <Calendar size={16} className="text-gray-400" />
                      {policy.expiryDate ? formatDate(policy.expiryDate) : 'No expiry'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</label>
                    <div className="mt-1 text-gray-900 dark:text-white font-medium">{policy.department}</div>
                  </div>

                </div>
              </div>
            </div>


            {/* Audit Information */}
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audit Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDateTime(policy.createdAt)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDateTime(policy.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}