"use client";

import Breadcrumb from "@/components/common/Breadcrumb";
import { BarChart3 } from "lucide-react";

export default function RecruiterReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "Recruiter", href: "/recruiter/dashboard" },
            { label: "Talent Acquisition Reports and Insights", href: "/recruiter/reports" },
          ]}
        />

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Talent Acquisition Reports and Insights
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Reports will appear here once data is available.
          </p>
        </div>
      </div>
    </div>
  );
}
