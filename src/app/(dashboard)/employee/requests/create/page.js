"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { FileText, LifeBuoy, MessageSquare, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { employeeRequestsService } from "@/services/employee/requests.service";

const categories = [
  { value: "Document Request", icon: FileText, department: "HR Desk" },
  { value: "Salary Query", icon: MessageSquare, department: "Payroll" },
  { value: "HR Policy Query", icon: LifeBuoy, department: "HR Desk" },
  { value: "IT Asset Request", icon: Briefcase, department: "IT Service Desk" },
];

const priorityOptions = ["Normal", "High", "Urgent"];

export default function CreateRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    category: "Document Request",
    subject: "",
    description: "",
    priority: "Normal",
    attachment: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = categories.find((cat) => cat.value === formData.category);
  const SelectedIcon = selectedCategory?.icon || FileText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <SelectedIcon size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Request</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Submit a request to the right team. All requests are logged for tracking.
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
              payload.append("subject", formData.subject);
              payload.append("description", formData.description);
              payload.append("priority", formData.priority);
              if (formData.attachment) {
                payload.append("attachment", formData.attachment);
              }

              await employeeRequestsService.createRequest(payload);
              toast.success("Request submitted successfully");
              setFormData({
                category: "Document Request",
                subject: "",
                description: "",
                priority: "Normal",
                attachment: null,
              });
              router.push("/employee/requests");
            } catch (error) {
              toast.error(error.message || "Failed to submit request");
            } finally {
              setSubmitting(false);
            }
          }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.value}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Routed to: <span className="font-medium">{selectedCategory?.department}</span>
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Subject</label>
            <input
              value={formData.subject}
              onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
              placeholder="Request subject"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(event) => setFormData((prev) => ({ ...prev, priority: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Attachment</label>
            <input
              type="file"
              onChange={(event) => setFormData((prev) => ({ ...prev, attachment: event.target.files?.[0] || null }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-300"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Description</label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
              placeholder="Add request details"
              required
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button
              type="reset"
              onClick={() => setFormData((prev) => ({ ...prev, subject: "", description: "", priority: "Normal", attachment: null }))}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
