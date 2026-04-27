'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Building2, Mail, Phone, Globe, MapPin, Calendar, User, ArrowLeft, Edit, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';

export default function ViewCRMLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id;
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        // API Call to fetch real lead data by ID
        const response = await apiClient.get(`/master-admin/crm-lead/${leadId}`);
        
        // Based on your controller successResponse structure
        setLead(response.data.data);
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast.error(error.response?.data?.message || 'Failed to load lead details');
        router.push('/master-admin/crm-lead');
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLead();
    }
  }, [leadId, router]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'QUALIFIED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'CONVERTED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'NEW': return <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />;
      case 'CONTACTED': return <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />;
      case 'QUALIFIED': return <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />;
      case 'CONVERTED': return <CheckCircle2 size={16} className="text-purple-600 dark:text-purple-400" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
          <p className="text-sm text-gray-500">Fetching lead data...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Lead not found</p>
          <Link
            href="/master-admin/crm-lead"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Back to Leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        <div className="flex items-center justify-between">
          <Breadcrumb 
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'CRM Lead', href: '/master-admin/crm-lead' },
              { label: 'View Lead', href: `/master-admin/crm-lead/${leadId}` }
            ]}
          />
          <div className="flex items-center gap-3">
            <Link
              href={`/master-admin/crm-lead/${leadId}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit size={18} />
              <span>Edit Lead</span>
            </Link>
            <Link
              href="/master-admin/crm-lead"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(lead.status)}
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(lead.priority)}`}>
            {lead.priority} Priority
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Company Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Company Name</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.companyName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Industry</label>
                  <p className="text-sm text-gray-900 dark:text-white">{lead.industry || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Website</label>
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
                      <Globe size={14} />
                      {lead.website}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">N/A</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Employee Count</label>
                  <p className="text-sm text-gray-900 dark:text-white">{lead.employeeCount || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <User size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Person</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.contactPerson}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <a href={`mailto:${lead.email}`} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      {lead.email}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <a href={`tel:${lead.phone}`} className="text-sm text-gray-900 dark:text-white">
                      {lead.phone}
                    </a>
                  </div>
                </div>
                {lead.alternatePhone && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Alternate Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <a href={`tel:${lead.alternatePhone}`} className="text-sm text-gray-900 dark:text-white">
                        {lead.alternatePhone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MapPin size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Address Information</h2>
              </div>
              <div className="space-y-2">
                {lead.address && (
                  <p className="text-sm text-gray-900 dark:text-white">{lead.address}</p>
                )}
                <p className="text-sm text-gray-900 dark:text-white">
                  {[lead.city, lead.state, lead.country, lead.pincode].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notes</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Lead Details */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Calendar size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Source</label>
                  <p className="text-sm text-gray-900 dark:text-white">{lead.source}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expected Value</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {lead.expectedValue ? `${lead.expectedValue}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Created Date</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(lead.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}