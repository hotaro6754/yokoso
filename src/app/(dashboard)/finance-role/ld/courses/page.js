"use client";

import Breadcrumb from "@/components/common/Breadcrumb";

export default function FinanceCoursesSelfPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 dark:bg-gray-900">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance-role/dashboard" },
          { label: "Talent Development", href: "/finance-role/ld/courses" },
          { label: "Courses: Self" },
        ]}
      />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Courses: Self</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This screen will list self-paced courses for Finance Admins.
        </p>
      </div>
    </div>
  );
}

