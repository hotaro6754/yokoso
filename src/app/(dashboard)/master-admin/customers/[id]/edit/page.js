'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  MapPin,
  Building2,
  Package,
  X,
  Loader2
} from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { apiClient } from '@/lib/api';
import { subscriptionService } from '@/services/master-admin/subscription.service';
import { toast } from 'react-hot-toast';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id;

  const [customer, setCustomer] = useState({
    name: '',
    subdomain: '',
    subdomain: '',
    location: '',
    accountManager: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    subscriptionId: '',
    billingAddress: '',
    shippingAddress: ''
  });

  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch Plans
        const plansResponse = await subscriptionService.getAllSubscriptions();
        setPlans(plansResponse.data || []);

        // Fetch Customer
        const customerResponse = await apiClient.get(`/master-admin/customers/${customerId}`);
        const data = customerResponse.data.data;

        // Extract active subscription plan ID
        const activeSub = data.companySubscriptions?.length > 0 ? data.companySubscriptions[0] : null;

        setCustomer({
            name: data.name || '',
            subdomain: data.subdomain || '',
            location: data.address || data.location || '', // Map address to location
            accountManager: data.accountManager || '',
            email: data.contactEmail || '', // Map contactEmail to email
            phone: data.phone || '',
            status: data.status || 'ACTIVE',
            subscriptionId: activeSub ? activeSub.subscriptionId : '',
            billingAddress: data.billingAddress || '',
            shippingAddress: data.shippingAddress || ''
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load details');
        router.push('/master-admin/customers');
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchData();
    }
  }, [customerId, router]);

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
        const numericValue = value.replace(/\D/g, '');
        setCustomer(prev => ({ ...prev, [field]: numericValue }));
    } else {
        setCustomer(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!customer.name || !customer.email || !customer.subscriptionId) {
        toast.error("Please fill in all required fields (Name, Email, Plan)");
        return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        ...customer,
        ...customer,
      };

      await apiClient.put(`/master-admin/customers/${customerId}`, updateData);

      toast.success('Customer updated successfully');
      router.push(`/master-admin/customers/${customerId}`);
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'Customers', href: '/master-admin/customers' },
              { label: customer.name, href: `/master-admin/customers/${customerId}` },
              { label: 'Edit', href: `/master-admin/customers/${customerId}/edit` }
            ]}
          />

          <div className="flex items-center gap-3">
            <Link
              href={`/master-admin/customers/${customerId}`}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={16} />
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Company Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-blue-500" />
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subdomain</label>
                <input
                  type="text"
                  value={customer.subdomain}
                  readOnly 
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Subdomain cannot be changed.</p>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={customer.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Manager</label>
                <input
                  type="text"
                  value={customer.accountManager}
                  onChange={(e) => handleInputChange('accountManager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Mail size={18} className="text-purple-500" />
                    Contact Information
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Email *</label>
                        <input
                        type="email"
                        value={customer.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                        <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
              </div>

              {/* Subscription Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Package size={18} className="text-green-500" />
                    Subscription Information
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subscription Plan *</label>
                        <select
                            value={customer.subscriptionId}
                            onChange={(e) => handleInputChange('subscriptionId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                        >
                            <option value="">Select Plan</option>
                            {plans.map(plan => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} - {plan.currency === 'USD' ? '$' : '₹'}{plan.price} / {plan.billingCycle}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select
                            value={customer.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="TRIAL">Trial</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>
              </div>
          </div>

          {/* Address Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPin size={18} className="text-indigo-500" />
              Address Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Billing Address</label>
                <textarea
                  value={customer.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Address</label>
                <textarea
                  value={customer.shippingAddress}
                  onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}