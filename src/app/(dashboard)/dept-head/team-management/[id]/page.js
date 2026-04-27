"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { deptHeadTeamService } from "@/services/dept-head-services/team.service";
import { toast } from "react-hot-toast";
import { Users, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";

const getStatusLabel = (status) => {
  if (status === "ACTIVE") return "Active";
  if (status === "ON_LEAVE") return "On Leave";
  return "Inactive";
};

export default function TeamMemberViewPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);

  useEffect(() => {
    if (params.id) {
      fetchMember();
    }
  }, [params.id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const [memberData, leavesData] = await Promise.all([
        deptHeadTeamService.getManagerById(params.id),
        deptHeadTeamService.getManagerLeaveBalances(params.id)
      ]);
      setMember(memberData.data || memberData);
      setLeaveBalances(leavesData.data || leavesData || []);
    } catch (error) {
      console.error("Error fetching manager:", error);
      toast.error("Failed to load manager details");
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Manager not found</p>
          <Link
            href="/dept-head/team-management"
            className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Department Head", href: "/dept-head" },
          { label: "Team Management", href: "/dept-head/team-management" },
          { label: member.name, href: `/dept-head/team-management/${params.id}` },
        ]}
      />

      <div className="mb-6 mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dept-head/team-management"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/dept-head/team-management/${params.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{member.employeeId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Designation</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{member.designation || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Reporting Manager</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{member.reportingManager || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{getStatusLabel(member.employmentStatus)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Joining Date</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leave Balances</h3>
        {leaveBalances.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No leave balances found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {leaveBalances.map((balance, index) => (
              <div key={index} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{balance.type}</p>
                  {balance.isBucket && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">Bucket</span>
                  )}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{balance.remaining}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{balance.used}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Used</p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${balance.total > 0 ? (balance.used / balance.total) * 100 : 0}%`, backgroundColor: balance.color || '#4f46e5' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
