"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { UserCheck, ArrowLeft, Calendar, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ViewTrainingAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchAssignment();
    }
  }, [params.id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await ldService.getAssignmentById(params.id);
      setAssignment(response.data || response);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      toast.error("Failed to load assignment details");
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      NOT_STARTED: { label: "Not Started", color: "bg-gray-100 text-gray-800" },
      IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
      OVERDUE: { label: "Overdue", color: "bg-red-100 text-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap.NOT_STARTED;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Assignment not found</p>
          <Link
            href="/ld/training-assignments"
            className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "L&D", href: "/ld" },
          { label: "Training Assignment", href: "/ld/training-assignments" },
          { label: assignment.courseTitle, href: `/ld/training-assignments/${params.id}` },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Training Assignment Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View assignment information
              </p>
            </div>
          </div>
          <Link
            href="/ld/training-assignments"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assignment Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Course</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {assignment.courseTitle}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Assigned To</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {assignment.assignedTo}
                  <span className="ml-2 text-sm text-gray-500">
                    ({assignment.assignedType?.replace("_", " ")})
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {assignment.startDate}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completion Deadline</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {assignment.completionDeadline}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mandatory</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {assignment.mandatory ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status
            </h3>
            <div className="flex items-center justify-center py-4">
              {getStatusBadge(assignment.status)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
