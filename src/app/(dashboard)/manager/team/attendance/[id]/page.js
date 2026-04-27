"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { CalendarCheck, Clock, AlertCircle } from "lucide-react";
import { managerTeamService } from "@/services/manager-services/team.service";

export default function TeamAttendancePage() {
  const params = useParams();
  const [attendance, setAttendance] = useState(null);
  const [error, setError] = useState("");

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "My Team", href: "/manager/my-team" },
    { label: "Attendance", href: `/manager/team/attendance/${params?.id}` },
  ];

  useEffect(() => {
    let active = true;

    const fetchAttendance = async () => {
      try {
        const data = await managerTeamService.getTeamMemberAttendance(params?.id);
        if (!active) return;
        setAttendance(data);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load attendance");
      }
    };

    if (params?.id) fetchAttendance();

    return () => {
      active = false;
    };
  }, [params?.id]);

  if (!attendance) {
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
            <CalendarCheck className="text-primary-600 dark:text-primary-400" size={20} />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{attendance.employee.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Attendance snapshot</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{attendance.todayStatus}</p>
            </div>
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-center gap-2">
              <Clock size={16} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Average In-Time</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{attendance.averageInTime}</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Late Arrivals (30 days)</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{attendance.lateArrivals}</p>
              </div>
            </div>
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
