"use client";

import Breadcrumb from "@/components/common/Breadcrumb";

export default function FinancePolicyRulePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Finance", href: "/finance-role" },
            { label: "Policy Management", href: "/finance-role/policy-rule" },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Policy Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure and review organizational policies.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        Policy Management for Finance Admin is not configured yet.
      </div>
    </div>
  );
}
