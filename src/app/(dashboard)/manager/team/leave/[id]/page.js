"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { CalendarDays, FileText } from "lucide-react";
import { managerTeamService } from "@/services/manager-services/team.service";

export default function TeamLeavePage() {
  const params = useParams();
  const [leaveData, setLeaveData] = useState(null);
  const [error, setError] = useState("");

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "My Team", href: "/manager/my-team" },
    { label: "Leave", href: `/manager/team/leave/${params?.id}` },
  ];

  useEffect(() => {
    let active = true;

    const fetchLeave = async () => {
      try {
        const data = await managerTeamService.getTeamMemberLeave(params?.id);
        if (!active) return;
        setLeaveData(data);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load leave summary");
      }
    };

    if (params?.id) fetchLeave();

    return () => {
      active = false;
    };
  }, [params?.id]);

  if (!leaveData) {
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
            <CalendarDays className="text-primary-600 dark:text-primary-400" size={20} />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{leaveData.employeeName}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Leave summary</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Available Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaveData.balance}</p>
            </div>
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaveData.pendingRequests}</p>
            </div>
          </div>

          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Leave Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {leaveData.balances?.map((balance, index) => (
              <div key={index} className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-semibold text-gray-900 dark:text-white">{balance.type}</span>
                  {balance.isBucket && (
                    <span className="text-[10px] font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full dark:bg-indigo-900/30 dark:text-indigo-300">
                      Bucket
                    </span>
                  )}
                </div>

                <div className="flex items-end justify-between mb-3">
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{balance.remaining}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">remaining</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                      {balance.used} used
                    </span>
                    <span className="text-[10px] text-gray-400">
                      of {balance.total} allocated
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(((balance.used / (balance.total || 1)) * 100), 100)}%`,
                      backgroundColor: balance.color || '#3b82f6'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent History</h3>

          <div className="mt-6 space-y-3">
            {leaveData.history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-xs text-gray-500 dark:text-gray-400">
                No leave history available.
              </div>
            ) : (
              leaveData.history.map((leave) => (
                <div key={leave.type + leave.dates} className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{leave.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{leave.dates}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{leave.status}</span>
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
