"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { TrendingUp, ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function CourseProgressDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await ldService.getCourseProgressDetail(params.id);
      setDetail(response.data || response);
    } catch (error) {
      console.error("Error fetching course progress detail:", error);
      toast.error("Failed to load course progress detail");
      setDetail(null);
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
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
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

  if (!detail) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Course progress not found</p>
          <Link
            href="/ld/progress/course"
            className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course Progress
          </Link>
        </div>
      </div>
    );
  }

  const { course, summary, assignments } = detail;

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "L&D", href: "/ld" },
          { label: "Learning Progress", href: "/ld/progress" },
          { label: "Course-wise", href: "/ld/progress/course" },
          { label: course.courseTitle, href: `/ld/progress/course/${params.id}` },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {course.courseTitle}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Course progress details
              </p>
            </div>
          </div>
          <Link
            href="/ld/progress/course"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-500">Total Assigned</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">{summary.totalAssigned}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-xl font-semibold text-emerald-600">{summary.completed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-xl font-semibold text-blue-600">{summary.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-xl font-semibold text-red-600">{summary.overdue}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No assignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Mandatory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {assignment.assignedTo}
                      <span className="ml-2 text-xs text-gray-500">
                        ({assignment.assignedType?.replace("_", " ")})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(assignment.startDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {formatDate(assignment.completionDeadline)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {assignment.mandatory ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(assignment.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
