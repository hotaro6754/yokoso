"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { deptHeadLeaveService } from "@/services/dept-head-services/leave-approvals.service";
import { toast } from "react-hot-toast";
import { CalendarCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LeaveApprovalViewPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchRequest();
    }
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await deptHeadLeaveService.getLeaveRequestById(params.id);
      setRequest(response.data || response);
    } catch (error) {
      console.error("Error fetching leave request:", error);
      toast.error("Failed to load leave request");
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Leave request not found</p>
          <Link
            href="/dept-head/leave-approvals"
            className="mt-4 inline-flex items-center gap-2 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leave Approvals
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
          { label: "Leave Approvals", href: "/dept-head/leave-approvals" },
          { label: request.employeeName, href: `/dept-head/leave-approvals/${params.id}` },
        ]}
      />

      <div className="mb-6 mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[hsl(var(--primary))] rounded-2xl shadow-lg">
            <CalendarCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {request.employeeName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{request.leaveType}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase">Employee ID</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{request.employeeId}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase">Duration</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase">Reason</p>
          <p className="text-sm text-gray-900 dark:text-white">{request.reason}</p>
        </div>
      </div>
    </div>
  );
}
