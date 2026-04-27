"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft, Save } from "lucide-react";

export default function CreatePIPPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    employeeName: "",
    managerName: "",
    reason: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.employeeName || !form.managerName || !form.reason || !form.startDate || !form.endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const [empFirst = "Employee", empLast = ""] = form.employeeName.trim().split(/\s+/);
      const [mgrFirst = "Manager", mgrLast = ""] = form.managerName.trim().split(/\s+/);
      const cacheKey = "zodeck_pip_cache";
      const existing = JSON.parse(window.localStorage.getItem(cacheKey) || "[]");
      const newPip = {
        id: `pip_${Date.now()}`,
        status: "ACTIVE",
        progress: 0,
        reason: form.reason.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        employee: {
          firstName: empFirst,
          lastName: empLast,
          email: `${empFirst}.${empLast || "user"}`.toLowerCase() + "@example.com"
        },
        manager: {
          firstName: mgrFirst,
          lastName: mgrLast
        }
      };
      const updated = [newPip, ...(Array.isArray(existing) ? existing : [])];
      window.localStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch (error) {
      console.warn("Failed to cache PIP", error);
    }
    toast.success("PIP initiated successfully");
    router.push("/hr/performance/pip");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <ToastContainer />
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr/dashboard" },
            { label: "Performance Management", href: "/hr/performance-management/appraisals" },
            { label: "PIP Management", href: "/hr/performance/pip" },
            { label: "Initiate PIP" },
          ]}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 shadow-sm hover:bg-[var(--color-primary-hover)] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-[var(--color-primary)]/15"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Initiate New PIP</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a new performance improvement plan.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Employee Name</label>
            <input
              name="employeeName"
              value={form.employeeName}
              onChange={handleChange}
              className="mt-2 w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
              placeholder="Enter employee name"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Manager Name</label>
            <input
              name="managerName"
              value={form.managerName}
              onChange={handleChange}
              className="mt-2 w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
              placeholder="Enter manager name"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="mt-2 w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
              rows={3}
              placeholder="Reason for PIP"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="mt-2 w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="mt-2 w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0b1220] bg-[var(--color-primary)] rounded-sm hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
            >
              <Save size={16} />
              Initiate PIP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
