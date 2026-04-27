"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Receipt, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import EmployeeReimbursementService from "@/services/employee/reimbursement.service";
import DatePickerField from "@/components/form/input/DatePickerField";

const categories = ["Travel", "Meals", "Office Supplies", "Medical", "Other"];

export default function CreateReimbursementPage() {
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const basePath = pathname.startsWith("/manager")
    ? "/manager"
    : pathname.startsWith("/it-admin")
      ? "/it-admin"
    : pathname.startsWith("/dept-head")
      ? "/dept-head"
    : pathname.startsWith("/ld")
      ? "/ld"
      : "/employee";
  const [formData, setFormData] = useState({
    category: "Travel",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
    attachment: null,
  });
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb customTitle="Raise Reimbursement" subtitle="Submit a new reimbursement claim" />

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">Reimbursement Details</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                Share the expense details and attach proof if required.
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

              await EmployeeReimbursementService.createReimbursement(payload);
              toast.success("Reimbursement submitted successfully");
              router.push(`${basePath}/reimbursement`);
            } catch (error) {
              toast.error(error.message || "Failed to submit reimbursement");
            } finally {
              setSubmitting(false);
            }
          }}
          className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</label>
            <select
              value={formData.category}
              onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs font-bold uppercase tracking-tight text-gray-800 dark:text-gray-200 outline-none focus:border-primary-400 transition-all"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount (INR)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
              className="w-full rounded-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-xs font-bold uppercase tracking-tight text-gray-800 dark:text-gray-200 outline-none focus:border-primary-400 transition-all"
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              Expense Date <Calendar size={12} className="text-gray-400" />
            </label>
            <div className="relative">
              <DatePickerField
                value={formData.expenseDate}
                onChange={(dateStr) => {
                  setFormData(prev => ({ ...prev, expenseDate: dateStr }));
                }}
                max="today"
                className="!py-2"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Attachment *</label>
            <div className="relative group">
              <input
                type="file"
                onChange={(event) => setFormData((prev) => ({ ...prev, attachment: event.target.files?.[0] || null }))}
                className="w-full rounded-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-[9px] file:font-bold file:uppercase file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-3 text-xs font-medium tracking-tight text-gray-800 dark:text-gray-200 outline-none focus:border-primary-400 transition-all resize-none leading-relaxed"
              placeholder="Describe the expense and justification"
              required
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push(`${basePath}/reimbursement`)}
              className="px-6 py-2 rounded-sm text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-800 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-sm bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
