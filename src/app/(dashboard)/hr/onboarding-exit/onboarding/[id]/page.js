"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import employeeService from "@/services/hr-services/employeeService";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import OnboardingWorkflowTabs from "../../components/OnboardingWorkflowTabs";

export default function OnboardingProfilePage({ params }) {
  const { id: employeeId } = use(params);
  const [employee, setEmployee] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [employeeRes, checklistRes, docsRes, surveyRes] = await Promise.allSettled([
          employeeService.getEmployeeById(employeeId),
          onboardingExitService.getOnboardingChecklist(employeeId),
          onboardingExitService.getDocumentCollection(employeeId),
          onboardingExitService.getOnboardingSurvey(employeeId),
        ]);

        if (employeeRes.status === "fulfilled") {
          const data = employeeRes.value?.data || employeeRes.value;
          setEmployee(data || null);
        }

        const sections = [];
        if (checklistRes.status === "fulfilled") {
          const checklist = checklistRes.value?.data || checklistRes.value;
          const total = checklist?.summary?.total || checklist?.tasks?.length || 0;
          const completed = checklist?.summary?.completed || checklist?.tasks?.filter((t) => t.status === "COMPLETED").length || 0;
          if (total > 0) sections.push((completed / total) * 100);
        }
        if (docsRes.status === "fulfilled") {
          const docs = docsRes.value?.data || docsRes.value;
          const total = docs?.summary?.total || docs?.documents?.length || 0;
          const verified = docs?.summary?.collected || docs?.documents?.filter((d) => d.status === "VERIFIED").length || 0;
          if (total > 0) sections.push((verified / total) * 100);
        }
        if (surveyRes.status === "fulfilled") {
          const survey = surveyRes.value?.data || surveyRes.value;
          if (survey?.submittedAt) sections.push(100);
        }

        if (sections.length > 0) {
          const average = sections.reduce((sum, value) => sum + value, 0) / sections.length;
          setProgress(Math.round(average));
        } else {
          setProgress(0);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [employeeId]);

  const employeeName = useMemo(() => {
    if (!employee) return "Employee";
    return employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Employee";
  }, [employee]);

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-3 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Onboarding & Exit", href: "/hr/onboarding-exit" },
          { label: "Onboarding Profile" },
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
              <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-500/20">
                <UserPlus className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{employeeName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {employee?.employeeId || employee?.publicId || "ID pending"} •{" "}
                  {employee?.designation?.name || employee?.jobTitle || "Role pending"}
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Onboarding completion</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <OnboardingWorkflowTabs employeeId={employeeId} />
      </div>
    </div>
  );
}
