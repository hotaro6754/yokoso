"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Loader2, XCircle } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import DatePickerField from "@/components/form/input/DatePickerField";
import { toast } from "react-hot-toast";

export default function ResignationTrackingDetailTab({ resignationId }) {
  const [resignation, setResignation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!resignationId) return;
    const fetchResignation = async () => {
      try {
        setLoading(true);
        const response = await onboardingExitService.getResignations({});
        const data = response.success ? response.data : response.data || response || [];
        const found = Array.isArray(data) ? data.find((item) => item.id?.toString() === resignationId) : null;
        setResignation(found || null);
      } catch (error) {
        console.error("Error fetching resignation:", error);
        setResignation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResignation();
  }, [resignationId]);

  const noticePeriodDays = useMemo(() => {
    if (!resignation?.resignationDate || !resignation?.lastWorkingDate) return "-";
    const start = new Date(resignation.resignationDate);
    const end = new Date(resignation.lastWorkingDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days` : "-";
  }, [resignation]);

  const handleApproval = async (status) => {
    try {
      setUpdating(true);
      await onboardingExitService.updateResignationStatus(resignationId, { status });
      toast.success(`Resignation ${status.toLowerCase()}`);
    } catch (error) {
      toast.error(error.message || "Failed to update resignation status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!resignation) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Resignation details not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Resignation Tracking</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Track resignation details, approvals, and notice period.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Resignation Date
            </label>
            <DatePickerField
              value={resignation.resignationDate?.split("T")[0]}
              onChange={() => {}}
              disabled
              className="w-full px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Last Working Day
            </label>
            <DatePickerField
              value={resignation.lastWorkingDate?.split("T")[0]}
              onChange={() => {}}
              disabled
              className="w-full px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Reason for Leaving
            </label>
            <input
              type="text"
              value={resignation.reason || "Not specified"}
              disabled
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Notice Period
            </label>
            <input
              type="text"
              value={noticePeriodDays}
              disabled
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Reason Details
            </label>
            <textarea
              value={resignation.reasonDetails || "No additional details provided."}
              disabled
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Manager Approval</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Approve or reject the resignation request.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {resignation.status === "APPROVED" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Approved
            </span>
          ) : resignation.status === "REJECTED" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              Rejected
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              Pending Approval
            </span>
          )}
          {resignation.status === "PENDING" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApproval("APPROVED")}
                disabled={updating}
                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleApproval("REJECTED")}
                disabled={updating}
                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
