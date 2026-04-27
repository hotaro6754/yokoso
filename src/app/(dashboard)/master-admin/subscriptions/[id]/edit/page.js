'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subscriptionService } from '@/services/master-admin/subscription.service';

export default function EditSubscriptionPlanPage() {
    const params = useParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        currency: 'INR',
        billingCycle: 'Monthly',
        trialDays: '14',
        maxUsers: '',
        status: 'Active',
        features: ''
    });

    useEffect(() => {
        if (params.id) {
            fetchPlan(params.id);
        }
    }, [params.id]);

    const fetchPlan = async (id) => {
        try {
            const response = await subscriptionService.getSubscriptionById(id);
            setFormData({
                name: response.data.name || '',
                description: response.data.description || '',
                price: response.data.price || '',
                currency: response.data.currency || 'INR',
                billingCycle: response.data.billingCycle || 'Monthly',
                trialDays: response.data.trialDays?.toString() || '14',
                maxUsers: response.data.maxUsers || '',
                status: response.data.status || 'Active',
                features: response.data.features || ''
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subscription plan');
            router.push('/master-admin/subscriptions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let nextValue = value;
        if (name === 'name') {
            nextValue = value.slice(0, 30);
        } else if (name === 'price') {
            // Remove non-numeric characters (though it's a number input)
            // and limit to 7 digits
            const digits = value.replace(/\D/g, '');
            if (digits.length > 7) {
                nextValue = digits.slice(0, 7);
            }
        } else if (name === 'description') {
            nextValue = value.slice(0, 30);
        } else if (name === 'maxUsers') {
            // Limit to 6 digits
                const digits = value.replace(/\D/g, '');
                if (digits.length > 6) {
                    nextValue = digits.slice(0, 6);
                }
        }
        
        setFormData(prev => ({ ...prev, [name]: nextValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Comprehensive field validation
        const requiredFields = ['name', 'price', 'currency', 'billingCycle', 'trialDays', 'maxUsers', 'status'];
        const missingFields = requiredFields.filter(field => !formData[field] && formData[field] !== 0);

        if (missingFields.length > 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.name.length > 30) {
            toast.error('Plan name cannot exceed 30 characters');
            return;
        }

        if (formData.description.length > 30) {
            toast.error('Description can be maximum 30 characters');
            return;
        }

        if (Number(formData.price) > 9999999) {
            toast.error('Price cannot exceed 7 digits (9,999,999)');
            return;
        }

        if (formData.maxUsers && Number(formData.maxUsers) > 999999) {
            toast.error('User limit cannot exceed 6 digits (999,999)');
            return;
        }

        setIsSubmitting(true);
        try {
            await subscriptionService.updateSubscription(params.id, formData);
            toast.success('Subscription plan updated successfully');
            router.push('/master-admin/subscriptions');
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Failed to update subscription plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 text-center">
                <p>Loading plan details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/master-admin/subscriptions"
                    className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Plan</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update existing subscription tier</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-primary-600" />
                        Plan Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Name *</label>
                                <span className={`text-[10px] font-medium uppercase ${formData.name.length >= 30 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {formData.name.length}/30
                                </span>
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                maxLength={30}
                                placeholder="e.g. Professional"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                maxLength={30}
                                rows={3}
                                placeholder="Brief description of the plan..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                             <div className="flex justify-between items-center px-1">
                                <p className="text-xs text-gray-500 font-medium">Clear, concise descriptions work best</p>
                                <p className={`text-xs ${formData.description.length >= 30 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                    {formData.description.length}/30
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing & Limits */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pricing & Limits</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency *</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700"
                            >
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price *</label>
                                <span className="text-[10px] text-gray-400 font-normal uppercase">Max 7 Digits</span>
                            </div>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                max="9999999"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Billing Cycle *</label>
                            <select
                                name="billingCycle"
                                value={formData.billingCycle}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700"
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Half Yearly">Half Yearly</option>
                                <option value="Yearly">Yearly</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User Limit *</label>
                                <span className="text-[10px] text-gray-400 font-normal uppercase">Max 6 Digits</span>
                            </div>
                            <input
                                type="number"
                                name="maxUsers"
                                value={formData.maxUsers}
                                onChange={handleChange}
                                max="999999"
                                placeholder="e.g. 10 (Leave blank for Unlimited)"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                            <p className="text-xs text-gray-500">How many subscriptions/users master admin provides to company.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trial Period (Days) *</label>
                            <select
                                name="trialDays"
                                value={formData.trialDays}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700"
                            >
                                <option value="0">No Trial</option>
                                <option value="7">7 Days</option>
                                <option value="14">14 Days</option>
                                <option value="30">30 Days</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Link
                        href="/master-admin/subscriptions"
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : <><Save size={18} /> Update Plan</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
