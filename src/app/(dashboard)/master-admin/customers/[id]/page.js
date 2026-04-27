'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  Package,
  Trash2,
  Loader2,
  DollarSign,
  User,
  ArrowLeft,
  Edit,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/dateUtils';

export default function ViewCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/master-admin/customers/${customerId}`);
        const data = response.data.data;

        const activeSub = data.companySubscriptions?.length > 0 ? data.companySubscriptions[0] : null;

        setCustomer({
          ...data,
          status: activeSub?.status || data.status, // Use subscription status if available
          employeeCount: data.employeeCount || data.employees || '0', // Ensure employee count is picked up
          planName: activeSub?.subscription?.name || data.plan,
          planPrice: activeSub?.subscription?.price || data.totalAmount,
          currency: activeSub?.subscription?.currency || 'USD',
          billingCycle: activeSub?.subscription?.billingCycle || 'Monthly',
          subscriptionStart: activeSub?.startDate || data.createdAt,
          nextBillingDate: activeSub?.currentPeriodEnd || null,
        });

      } catch (error) {
        console.error('Error fetching customer:', error);
        toast.error(error.response?.data?.message || 'Failed to load customer details');
        router.push('/master-admin/customers');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId, router]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'TRIAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />;
      case 'TRIAL': return <Clock size={16} className="text-blue-600 dark:text-blue-400" />;
      case 'SUSPENDED': return <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400" />;
      case 'INACTIVE': return <AlertCircle size={16} className="text-gray-600 dark:text-gray-400" />;
      default: return null;
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const openDeleteDialog = () => setDeleteDialog({ isOpen: true });
  const closeDeleteDialog = () => setDeleteDialog({ isOpen: false });

  const handleDeleteCustomer = async () => {
    try {
      await apiClient.delete(`/master-admin/customers/${customer.id}`);
      toast.success('Customer deleted successfully');
      router.push('/master-admin/customers');
    } catch (e) {
      console.error('Failed to delete customer:', e);
      toast.error('Failed to delete customer');
    } finally {
      closeDeleteDialog();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Customer not found</p>
          <Link
            href="/master-admin/customers"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Back to Customers
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
              { label: 'Customers', href: '/master-admin/customers' },
              { label: 'View Customer', href: `/master-admin/customers/${customerId}` }
            ]}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={openDeleteDialog}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
            <Link
              href={`/master-admin/customers/${customerId}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit size={18} />
              <span>Edit Customer</span>
            </Link>
            <Link
              href="/master-admin/customers"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* Status and Plan Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(customer.status)}
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(customer.status)}`}>
              {customer.status}
            </span>
          </div>
          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            {customer.planName} Plan
          </span>
        </div>

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
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Subdomain</label>
                  <p className="text-sm text-gray-900 dark:text-white">{customer.subdomain}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Employees</label>
                  <p className="text-sm text-gray-900 dark:text-white">{customer.employeeCount || '0'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <MapPin size={14} className="text-gray-400" />
                    {customer.address || customer.location || customer.city || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Account Manager</label>
                  <p className="text-sm text-gray-900 dark:text-white">{customer.accountManager || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <User size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Email</label>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <a href={`mailto:${customer.contactEmail}`} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      {customer.contactEmail}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <a href={`tel:${customer.phone}`} className="text-sm text-gray-900 dark:text-white">
                      {customer.phone || 'N/A'}
                    </a>
                  </div>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Billing Address</label>
                  <p className="text-sm text-gray-900 dark:text-white">{customer.billingAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Shipping Address</label>
                  <p className="text-sm text-gray-900 dark:text-white">{customer.shippingAddress || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Package size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Plan</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.planName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Price</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(customer.planPrice, customer.currency)} 
                    <span className="text-xs text-gray-500 ml-1">/{customer.billingCycle}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(customer.subscriptionStart)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Next Billing</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.nextBillingDate ? formatDate(customer.nextBillingDate) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            {/* Removed Payment Summary as it relied on removed fields */}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Customer</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <strong>{customer?.name}</strong>? This will permanently remove their data from the master record.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={closeDeleteDialog} className="px-4 py-2 border rounded-lg dark:text-gray-300">Cancel</button>
                <button onClick={handleDeleteCustomer} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}