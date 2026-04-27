"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Receipt, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import EmployeeReimbursementService from "@/services/employee/reimbursement.service";

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function ReimbursementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const basePath = pathname.startsWith("/manager")
    ? "/manager"
    : pathname.startsWith("/it-admin")
      ? "/it-admin"
      : "/employee";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await EmployeeReimbursementService.getReimbursement(params.id);
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load reimbursement");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Breadcrumb customTitle="Reimbursement Details" subtitle="Loading reimbursement details..." />
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading reimbursement...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Breadcrumb customTitle="Reimbursement Details" subtitle="Unable to load reimbursement" />
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-500/30 shadow-sm p-6 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb customTitle="Reimbursement Details" subtitle="Review your reimbursement request" />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {data?.reference || `Reimbursement #${data?.id}`}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {data?.category || "Reimbursement"} • {data?.status || "Pending"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`${basePath}/reimbursement/${data?.id}/edit`}
              className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-sm font-medium"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => router.push(`${basePath}/reimbursement`)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft size={14} className="inline mr-2" />
              Back
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data?.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expense Date</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data?.expenseDate ? new Date(data.expenseDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
            <p className="text-gray-700 dark:text-gray-300">{data?.description || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <p className="font-semibold text-gray-900 dark:text-white">{data?.status || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attachment</p>
            {data?.attachmentUrl ? (
              <a className="text-primary-600 hover:text-primary-700" href={data.attachmentUrl} target="_blank" rel="noreferrer">
                View Attachment
              </a>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">None</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
