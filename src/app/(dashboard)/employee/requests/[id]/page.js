"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { employeeRequestsService } from "@/services/employee/requests.service";

const statusStylesMap = {
  Resolved: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",
  Closed: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",
  Open: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300",
  "In Progress": "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300",
  "Awaiting Employee": "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
};

export default function RequestDetailsPage() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await employeeRequestsService.getRequestById(id);
        setRequest(data);
      } catch (err) {
        setError(err.message || "Failed to load request");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequest();
    }
  }, [id]);

  const statusStyle = useMemo(() => {
    if (!request?.status) return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    return statusStylesMap[request.status] || "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }, [request?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Breadcrumb />
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
            <div className="mt-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Breadcrumb />
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Breadcrumb />
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 text-sm text-gray-500 dark:text-gray-400">
            Request not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ticket ID</p>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{request.id}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{request.subject}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
              {request.status}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{request.category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Priority</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{request.priority}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Handler</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{request.handler}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {request.updatedAt
                ? new Date(request.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : "-"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Description</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {request.description || "No description provided."}
          </p>
          {request.attachmentUrl && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attachment</p>
              <Link
                href={request.attachmentUrl}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                target="_blank"
              >
                {request.attachmentName || "Download attachment"}
              </Link>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            href="/employee/requests"
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back to Requests
          </Link>
        </div>
      </div>
    </div>
  );
}
