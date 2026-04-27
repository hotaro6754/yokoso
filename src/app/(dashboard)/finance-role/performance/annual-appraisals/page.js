"use client";

import Breadcrumb from "@/components/common/Breadcrumb";

export default function FinanceAnnualAppraisalsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 dark:bg-gray-900">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance-role/dashboard" },
          { label: "Performance Management", href: "/finance-role/performance/annual-appraisals" },
          { label: "Annual Appraisals" },
        ]}
      />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Annual Appraisals</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This screen will show appraisal cycles and summaries for Finance Admins.
        </p>
      </div>
    </div>
  );
}

