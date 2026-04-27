'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Trash2, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subscriptionService } from '@/services/master-admin/subscription.service';

import ConfirmModal from '@/components/common/ConfirmModal';

export default function ViewSubscriptionPlanPage() {
    const params = useParams();
    const router = useRouter();
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchPlan(params.id);
        }
    }, [params.id]);

    const fetchPlan = async (id) => {
        try {
            const response = await subscriptionService.getSubscriptionById(id);
            setPlan(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subscription plan');
            router.push('/master-admin/subscriptions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await subscriptionService.deleteSubscription(plan.id);
            toast.success('Plan deleted successfully');
            router.push('/master-admin/subscriptions');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete plan');
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 text-center">
                <p>Loading plan details...</p>
            </div>
        );
    }

    if (!plan) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/master-admin/subscriptions"
                        className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Subscription Plan Details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/master-admin/subscriptions/${plan.id}/edit`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 shadow-sm"
                    >
                        <Edit2 size={16} className="mr-2" />
                        Edit
                    </Link>
                    <button
                        onClick={handleDeleteClick}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-lg shadow-red-500/20"
                    >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {/* General Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-primary-600" />
                        Plan Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                            <p className="text-gray-900 dark:text-white text-base">
                                {plan.description || 'No description provided'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {plan.currency === 'USD' ? '$' : '₹'}{plan.price} <span className="text-sm font-normal text-gray-500">/{plan.billingCycle}</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${plan.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                {plan.status === 'Active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                {plan.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Limits & Config */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Configuration & Limits</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">User Limit</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {plan.maxUsers ? `${plan.maxUsers} Users` : 'Unlimited Users'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trial Period</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {plan.trialDays > 0 ? `${plan.trialDays} Days` : 'No Trial'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features (if any) */}
                {plan.features && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Features</h2>
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {plan.features}
                        </div>
                    </div>
                )}
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
