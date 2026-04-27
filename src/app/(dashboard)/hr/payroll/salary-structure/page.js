// src/app/(dashboard)/hr/payroll/salary-structure/page.js
"use client";
import { FileText } from "lucide-react";
import Breadcrumb from '@/components/common/Breadcrumb';
import SalaryStructureTable from './components/SalaryStructureTable';

export default function SalaryStructure() {
  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-3 sm:p-6">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Payroll Overview", href: "/hr/payroll" },
            { label: "Salary Structure" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Salary Structure Breakdown
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View employee salary structure details
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-sm border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-800/30 dark:bg-brand-900/10">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-brand-100 p-2 text-brand-600 dark:bg-brand-800/30 dark:text-brand-400 mt-0.5">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-900 dark:text-brand-100">
              View-Only Access
            </h3>
            <p className="text-sm text-brand-700 dark:text-brand-300/80 mt-1">
              HR users have read-only access to salary structure details. HR users cannot edit or modify compensation components directly.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <SalaryStructureTable />
      </div>
    </div>
  );
}