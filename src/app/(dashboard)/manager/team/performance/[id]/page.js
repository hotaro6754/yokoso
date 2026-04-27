"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Target, Star, Upload } from "lucide-react";
import { managerTeamService } from "@/services/manager-services/team.service";

export default function TeamPerformancePage() {
  const params = useParams();
  const [performance, setPerformance] = useState(null);
  const [error, setError] = useState("");

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "My Team", href: "/manager/my-team" },
    { label: "Performance", href: `/manager/team/performance/${params?.id}` },
  ];

  useEffect(() => {
    let active = true;

    const fetchPerformance = async () => {
      try {
        const data = await managerTeamService.getTeamMemberPerformance(params?.id);
        if (!active) return;
        setPerformance(data);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load performance data");
      }
    };

    if (params?.id) fetchPerformance();

    return () => {
      active = false;
    };
  }, [params?.id]);

  if (!performance) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-gray-600 dark:text-gray-400">
          {error || "Employee not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary-600 dark:text-primary-400" size={20} />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{performance.employeeName}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Goal tracking and appraisals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Appraisal Status</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{performance.appraisalStatus}</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-center gap-2">
              <Upload size={16} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Evidence Uploaded</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{performance.evidenceUploaded} files</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {performance.goals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-xs text-gray-500 dark:text-gray-400">
                No goals available yet.
              </div>
            ) : (
              performance.goals.map((goal) => (
                <div key={goal.title} className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{goal.progress}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            <Link
              href="/manager/my-team"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Back to My Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
