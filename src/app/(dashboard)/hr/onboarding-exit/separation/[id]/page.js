"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, LogOut } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import SeparationWorkflowTabs from "../../components/SeparationWorkflowTabs";

export default function SeparationProfilePage({ params }) {
  const resignationId = params?.id;
  const [resignation, setResignation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resignationId) return;
    const fetchResignation = async () => {
      try {
        setLoading(true);
        const response = await onboardingExitService.getResignations({});
        const data = response.success ? response.data : response.data || response || [];
        const found = Array.isArray(data) ? data.find((item) => item.id?.toString() === resignationId) : null;
        setResignation(found || null);
      } finally {
        setLoading(false);
      }
    };

    fetchResignation();
  }, [resignationId]);

  const employeeName = useMemo(() => {
    const employee = resignation?.employee || {};
    return employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Employee";
  }, [resignation]);

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-3 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Onboarding & Exit", href: "/hr/onboarding-exit" },
          { label: "Separation Profile" },
        ]}
      />

      <Link
        href="/hr/onboarding-exit"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-500/20">
                <LogOut className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{employeeName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {resignation?.employee?.employeeId || resignation?.employee?.publicId || "ID pending"} •{" "}
                  {resignation?.employee?.department?.name || resignation?.employee?.department || "Department pending"}
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-[220px] text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Resignation Date</span>
                <span>
                  {resignation?.resignationDate
                    ? new Date(resignation.resignationDate).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Last Working Day</span>
                <span>
                  {resignation?.lastWorkingDate || resignation?.lastWorkingDay
                    ? new Date(resignation.lastWorkingDate || resignation.lastWorkingDay).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <SeparationWorkflowTabs resignationId={resignationId} />
      </div>
    </div>
  );
}
