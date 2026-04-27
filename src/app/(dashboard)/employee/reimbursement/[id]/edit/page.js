"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Receipt } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import EmployeeReimbursementService from "@/services/employee/reimbursement.service";

const categories = ["Travel", "Meals", "Office Supplies", "Medical", "Other"];

export default function EditReimbursementPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const basePath = pathname.startsWith("/manager")
    ? "/manager"
    : pathname.startsWith("/it-admin")
      ? "/it-admin"
      : "/employee";
  const [formData, setFormData] = useState({
    category: "Travel",
    amount: "",
    expenseDate: "",
    description: "",
    attachment: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await EmployeeReimbursementService.getReimbursement(params.id);
        setFormData({
          category: data.category || "Travel",
          amount: data.amount || "",
          expenseDate: data.expenseDate ? new Date(data.expenseDate).toISOString().split("T")[0] : "",
          description: data.description || "",
          attachment: null,
        });
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
          <Breadcrumb customTitle="Edit Reimbursement" subtitle="Loading reimbursement..." />
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
          <Breadcrumb customTitle="Edit Reimbursement" subtitle="Unable to load reimbursement" />
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
        <Breadcrumb customTitle="Edit Reimbursement" subtitle="Update your reimbursement details" />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Reimbursement</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Adjust the expense details and resubmit.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              setSubmitting(true);
              const payload = new FormData();
              payload.append("category", formData.category);
              payload.append("amount", formData.amount);
              payload.append("expenseDate", formData.expenseDate);
              payload.append("description", formData.description);
              if (!formData.attachment) {
                toast.error("Please attach a document");
                return;
              }
              payload.append("attachment", formData.attachment);

              await EmployeeReimbursementService.updateReimbursement(params.id, payload);
              toast.success("Reimbursement updated");
              router.push(`${basePath}/reimbursement/${params.id}`);
            } catch (err) {
              toast.error(err.message || "Failed to update reimbursement");
            } finally {
              setSubmitting(false);
            }
          }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Amount (INR)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Expense Date</label>
            <input
              type="date"
              value={formData.expenseDate}
              onChange={(event) => setFormData((prev) => ({ ...prev, expenseDate: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Attachment *</label>
            <input
              type="file"
              onChange={(event) => setFormData((prev) => ({ ...prev, attachment: event.target.files?.[0] || null }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-300"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Description</label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
              placeholder="Describe the expense and justification"
              required
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`${basePath}/reimbursement/${params.id}`)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
