'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { subscriptionService } from '@/services/master-admin/subscription.service';
import ActionDropdown from '../components/ActionDropdown';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await subscriptionService.getAllSubscriptions();
            setPlans(response.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subscription plans');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await subscriptionService.deleteSubscription(deleteId);
            setPlans(plans.filter(p => p.id !== deleteId));
            toast.success('Plan deleted successfully');
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete plan');
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 text-center">
                <p>Loading plans...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap className="text-primary-600" />
                        Subscription Plans
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage existing plans, trial configurations, and usage
                    </p>
                </div>
                <Link
                    href="/master-admin/subscriptions/add"
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
                >
                    <Plus size={18} className="mr-2" />
                    Add New Plan
                </Link>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider">Plan Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider">Trial Period</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider">Limits</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider text-center">Active Companies</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{plan.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {plan.currency === 'USD' ? '$' : '₹'}{plan.price} <span className="text-gray-400 text-xs font-normal">/{plan.billingCycle}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parseInt(plan.trialDays) > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {parseInt(plan.trialDays) > 0 ? `${plan.trialDays} Days` : 'No Trial'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {!plan.maxUsers ? 'Unlimited Users' : `Up to ${plan.maxUsers} Users`}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                            {plan._count?.companySubscriptions || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${plan.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {plan.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            {plan.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ActionDropdown
                                            viewUrl={`/master-admin/subscriptions/${plan.id}`}
                                            editUrl={`/master-admin/subscriptions/${plan.id}/edit`}
                                            onDelete={() => handleDeleteClick(plan.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {plans.length === 0 && (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <p>No subscription plans found. Add one to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Subscription Plan"
                description="Are you sure you want to delete this plan? This action cannot be undone."
                confirmText="Delete"
                confirmButtonClassName="bg-red-600 hover:bg-red-700 text-white"
            />
        </div>
    );
}
