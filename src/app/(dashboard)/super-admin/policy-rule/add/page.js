// src/app/(dashboard)/company-admin/policy-rule/add/page.js (served via middleware rewrite)
// 'use client';

// import { useRouter } from 'next/navigation';
// import toast, { Toaster } from 'react-hot-toast';
// import { policyRuleService } from '@/services/super-admin-services/policy-rule.service';
// import Breadcrumb from '@/components/common/Breadcrumb';
// import PolicyForm from '../_components/PolicyForm';

// export default function CreatePolicyPage() {
//     const router = useRouter();

//     const handleSubmit = async (values) => {
//         try {
//             await policyRuleService.createPolicy(values);
//             toast.success('Policy created successfully');
//             router.push('/company-admin/policy-rule');
//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to create policy');
//         }
//     };

//     const handleCancel = () => {
//         router.push('/company-admin/policy-rule');
//     };

//     return (
//         <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans">
//             <Toaster position="top-right" />
//             <Breadcrumb pageName="Create Policy" />

//             <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Create New Policy</h2>
//                 <PolicyForm onSubmit={handleSubmit} onCancel={handleCancel} />
//             </div>
//         </div>
//     );
// }


"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { policyRuleService } from '@/services/super-admin-services/policy-rule.service';
import Breadcrumb from '@/components/common/Breadcrumb';
import PolicyForm from '../_components/PolicyForm';
import { FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CreatePolicyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const typeParam = searchParams.get('type');

    // Determine base path (e.g. /hr or /company-admin)
    const basePath = pathname.startsWith('/hr')
        ? '/hr'
        : pathname.startsWith('/it-admin')
            ? '/it-admin'
            : pathname.startsWith('/company-admin')
                ? '/company-admin'
                : (pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '/company-admin');

    const { user } = useAuth();
    const rawUserRole = user?.systemRole || user?.role || 'EMPLOYEE';
    const userRole = String(rawUserRole).toUpperCase().replace(/[\s-]+/g, '_');
    const canManagePolicies = !pathname.startsWith('/it-admin') && ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_ADMIN', 'MASTER_ADMIN'].includes(userRole);

    if (!canManagePolicies) {
        router.replace(`${basePath}/policy-rule`);
        return null;
    }

    const handleSubmit = async (values) => {
        try {
            await policyRuleService.createPolicy(values);
            toast.success('Policy created successfully');
            // If type was CUSTOM, maybe redirect back to custom-policies list?
            if (typeParam === 'CUSTOM') {
                router.push(`${basePath}/custom-policies`);
            } else {
                router.push(`${basePath}/policy-rule`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create policy');
        }
    };

    const handleCancel = () => {
        if (typeParam === 'CUSTOM') {
            router.push(`${basePath}/custom-policies`);
        } else {
            router.push(`${basePath}/policy-rule`);
        }
    };

    // Pre-fill type if provided in URL
    const initialDesc = typeParam === 'CUSTOM' ? 'Custom policy definition' : '';
    const initialType = typeParam ? typeParam.toUpperCase() : 'ATTENDANCE';

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]"></div>

            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Breadcrumb pageName={typeParam === 'CUSTOM' ? "Create Custom Policy" : "Create Policy"} />
                </div>

                {/* Form Container */}
                <PolicyForm
                    initialValues={{ type: initialType, description: initialDesc }}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
