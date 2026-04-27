'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { policyRuleService } from '@/services/super-admin-services/policy-rule.service';
import Breadcrumb from '@/components/common/Breadcrumb';
import PolicyForm from '../../_components/PolicyForm';
import { useAuth } from '@/context/AuthContext';

export default function EditPolicyPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { id } = useParams();
    const { user } = useAuth();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    const rawUserRole = user?.systemRole || user?.role || 'EMPLOYEE';
    const userRole = String(rawUserRole).toUpperCase().replace(/[\s-]+/g, '_');
    const canManagePolicies = !pathname.startsWith('/it-admin') && ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_ADMIN', 'MASTER_ADMIN'].includes(userRole);

    // Determine base path
    const basePath = pathname.startsWith('/hr')
        ? '/hr'
        : pathname.startsWith('/it-admin')
            ? '/it-admin'
            : pathname.startsWith('/company-admin')
                ? '/company-admin'
                : (pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/company-admin');

    useEffect(() => {
        if (!loading && !canManagePolicies) {
            router.replace(`${basePath}/policy-rule/view/${id}`);
            return;
        }

        const fetchPolicy = async () => {
            try {
                // Determine if it's a UI-only custom policy
                const urlParams = new URLSearchParams(window.location.search);
                const isCustomType = urlParams.get('type') === 'CUSTOM';

                if (isCustomType) {
                    const localData = typeof window !== 'undefined' ? localStorage.getItem('zodeck_custom_policies') : null;
                    if (localData) {
                        const list = JSON.parse(localData);
                        const found = list.find((p) => String(p.id) === String(id));
                        if (found) {
                            setPolicy({
                                ...found,
                                type: 'CUSTOM',
                                customRules: found.contentHtml || found.customRules || '',
                            });
                            setLoading(false);
                            return;
                        }
                    }
                }

                const response = await policyRuleService.getPolicyById(id);
                // Handle potential response structures: { success: true, data: policy } or just policy
                const policyData = response.data || response;
                const rules = policyData.rules || {};

                // Map API response to Formik initial values
                const normalizedData = {
                    ...rules, // Spread rules first so standard fields can override them if necessary
                    name: policyData.name || '',
                    description: policyData.description || '',
                    type: policyData.type || 'ATTENDANCE',
                    isActive: policyData.isActive !== undefined ? policyData.isActive : true,
                    version: policyData.version || '1.0',

                    // Attendance fallbacks
                    shiftStart: rules.shiftStart || policyData.shiftStart || '09:00',
                    shiftEnd: rules.shiftEnd || policyData.shiftEnd || '18:00',
                    gracePeriodMinutes: rules.gracePeriodMinutes ?? policyData.gracePeriodMinutes ?? 0,
                    halfDayLateEntry: rules.halfDayLateEntry || policyData.halfDayLateEntry || '11:00',
                    biometricEnabled: rules.biometricEnabled ?? policyData.biometricEnabled ?? false,

                    // Leave fallbacks
                    annualLeaveCount: rules.annualLeaveCount ?? policyData.annualLeaveCount ?? 0,
                    sickLeaveCount: rules.sickLeaveCount ?? policyData.sickLeaveCount ?? 0,
                    maxCarryOverDays: rules.maxCarryOverDays ?? policyData.maxCarryOverDays ?? 0,
                    encashmentAllowed: rules.encashmentAllowed ?? policyData.encashmentAllowed ?? false,
                    probationLeaveAllowed: rules.probationLeaveAllowed ?? policyData.probationLeaveAllowed ?? false,

                    // Payroll fallbacks
                    salaryCycleStartDay: rules.salaryCycleStartDay ?? policyData.salaryCycleStartDay ?? 1,
                    salaryCycleEndDay: rules.salaryCycleEndDay ?? policyData.salaryCycleEndDay ?? 30,
                    taxDeductionMethod: rules.taxDeductionMethod || policyData.taxDeductionMethod || 'PROJECTED',
                    overtimeCalculationRate: rules.overtimeCalculationRate ?? policyData.overtimeCalculationRate ?? 1.5,
                    payslipGenerationDate: rules.payslipGenerationDate ?? policyData.payslipGenerationDate ?? 28,

                    // Expense fallbacks
                    autoApprovalLimit: rules.autoApprovalLimit ?? policyData.autoApprovalLimit ?? 0,
                    receiptRequiredAbove: rules.receiptRequiredAbove ?? policyData.receiptRequiredAbove ?? 0,
                    travelClassAllowed: rules.travelClassAllowed || policyData.travelClassAllowed || 'ECONOMY',
                    maxFoodAllowancePerDay: rules.maxFoodAllowancePerDay ?? policyData.maxFoodAllowancePerDay ?? 0,
                    reimbursementCycleDays: rules.reimbursementCycleDays ?? policyData.reimbursementCycleDays ?? 7,

                    // Custom
                    customRules: rules.customRules || policyData.customRules || '',
                    policyDocumentUrl: rules.policyDocumentUrl || policyData.policyDocumentUrl || '',
                    policyDocumentName: rules.policyDocumentName || policyData.policyDocumentName || '',
                };

                setPolicy(normalizedData);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch policy details');
                router.push(`${basePath}/policy-rule`);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPolicy();
        }
    }, [id, router, basePath]);

    const handleSubmit = async (values) => {
        try {
            await policyRuleService.updatePolicy(id, values);
            toast.success('Policy updated successfully');
            router.push(`${basePath}/policy-rule`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update policy');
        }
    };

    const handleCancel = () => {
        router.push(`${basePath}/policy-rule`);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!policy) return null;

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans">
            <Toaster position="top-right" />
            <Breadcrumb pageName="Edit Policy" />

            <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Edit Policy: {policy.name}</h2>
                <PolicyForm
                    initialValues={policy}
                    onSubmit={handleSubmit}
                    isEditing={true}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
