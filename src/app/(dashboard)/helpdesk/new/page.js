"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import helpdeskService from "@/services/helpdesk.service";
import organizationService from "@/services/hr-services/organization.service";
import { 
  ArrowLeft, Clock, Info, Send, AlertCircle, 
  Building2, Tag, Layers, MessageSquareText
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function NewTicketPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    departmentId: "",
    categoryId: "",
    priority: "MEDIUM",
    subject: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slaEstimate, setSlaEstimate] = useState("");
  const payrollPrefix = pathname?.startsWith('/payroll') ? '/payroll' : '';
  const ldPrefix = pathname?.startsWith('/ld') ? '/ld' : '';
  const deptHeadPrefix = pathname?.startsWith('/dept-head') ? '/dept-head' : '';
  const financePrefix = pathname?.startsWith('/finance-role') ? '/finance-role' : '';
  const managerPrefix = pathname?.startsWith('/manager') ? '/manager' : '';
  const itAdminPrefix = pathname?.startsWith('/it-admin') ? '/it-admin' : '';

  const helpdeskBase = `${payrollPrefix || ldPrefix || deptHeadPrefix || financePrefix || managerPrefix || itAdminPrefix}/helpdesk`;
  const dashboardHref = payrollPrefix
    ? '/payroll/dashboard'
    : ldPrefix
      ? '/ld/dashboard'
      : deptHeadPrefix
        ? '/dept-head/dashboard'
        : financePrefix
          ? '/finance-role/dashboard'
          : managerPrefix
            ? '/manager/dashboard'
            : itAdminPrefix
              ? '/it-admin/dashboard'
              : '/employee/dashboard';

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.departmentId) {
      fetchCategories(formData.departmentId);
    } else {
      setCategories([]);
    }
  }, [formData.departmentId]);

  useEffect(() => {
    calculateSlaEstimate();
  }, [formData.categoryId, formData.priority, categories]);

  const fetchDepartments = async () => {
    try {
      const res = await organizationService.getAllDepartments();
      setDepartments(res?.data?.length > 0 ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  const fetchCategories = async (deptId) => {
    const staticCategories = [
      { id: 101, name: "Software / Application Issue" },
      { id: 102, name: "Hardware / Device Support" },
      { id: 103, name: "Network & VPN Connectivity" },
      { id: 104, name: "Access & Security Permissions" },
      { id: 105, name: "Payroll & Reimbursement Query" },
      { id: 106, name: "Policy & Compliance Clarification" },
      { id: 107, name: "Leave & Attendance Support" },
      { id: 108, name: "Office Facility / Maintenance" },
      { id: 109, name: "General Inquiry" },
    ];
    setCategories(staticCategories);
  };

  const calculateSlaEstimate = () => {
    if (!formData.categoryId) {
      setSlaEstimate("");
      return;
    }

    const category = categories.find(c => c.id === parseInt(formData.categoryId));
    if (!category) return;

    const assetKeywords = ['Procurement', 'Hardware', 'Asset'];
    const isAsset = assetKeywords.some(keyword => category.name.includes(keyword));

    if (isAsset) {
      setSlaEstimate("5 Working Days (Asset Rule)");
    } else {
      const estimates = {
        'HIGH': '24 Hours',
        'MEDIUM': '48 Hours',
        'LOW': '72 Hours'
      };
      setSlaEstimate(estimates[formData.priority]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await helpdeskService.createTicket(formData);
      toast.success("Ticket created successfully!");
      router.replace(`${helpdeskBase}?refresh=${Date.now()}`);
    } catch (error) {
      console.error("Failed to create ticket", error);
      toast.error(error.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: dashboardHref },
          { label: "Helpdesk", href: helpdeskBase },
          { label: "New Ticket", href: `${helpdeskBase}/new` },
        ]}
      />

      <div className="w-full space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Raise Support Ticket</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Share issue details and route the ticket to the right support team.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ArrowLeft size={16} />
              Back to Helpdesk
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="space-y-6 p-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3 dark:border-gray-700">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                      <Layers size={16} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ticket Categorization</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Target Department</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                          required
                          className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                          value={formData.departmentId}
                          onChange={(e) => setFormData({ ...formData, departmentId: e.target.value, categoryId: "" })}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Issue Category</label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                          required
                          disabled={!formData.departmentId}
                          className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-brand-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3 dark:border-gray-700">
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/20">
                      <AlertCircle size={16} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Priority & Impact</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
                    <div className="flex h-11 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900/50">
                      {["LOW", "MEDIUM", "HIGH"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: lvl })}
                          className={`flex-1 rounded-md text-xs font-semibold transition-colors ${
                            formData.priority === lvl
                              ? (lvl === "HIGH"
                                ? "bg-red-500 text-white"
                                : lvl === "MEDIUM"
                                  ? "bg-amber-500 text-white"
                                  : "bg-blue-500 text-white")
                              : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    {slaEstimate && (
                      <div className="flex items-center gap-2.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
                        <Clock size={16} className="shrink-0" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">Resolution Est.</p>
                          <p className="text-sm font-semibold">{slaEstimate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3 dark:border-gray-700">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20">
                      <Send size={16} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Issue Details</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Subject / Headline</label>
                      <input
                        required
                        type="text"
                        placeholder="What's the main issue?"
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Detailed Context</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Provide steps to reproduce or specific error messages..."
                        className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 p-4 sm:flex-row dark:border-gray-700 dark:bg-gray-900/30">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Info size={14} />
                  <p>Files can be attached after creation.</p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:flex-none dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60 sm:flex-none"
                  >
                    {isSubmitting ? "Processing..." : "Submit Ticket"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-500/30 dark:bg-brand-500/10">
              <h4 className="mb-3 text-sm font-semibold text-brand-800 dark:text-brand-300">Support Guidelines</h4>
              <ul className="space-y-2.5 text-sm text-brand-700 dark:text-brand-200">
                <li>High priority is for service-blocking issues.</li>
                <li>Include device/system details when reporting technical issues.</li>
                <li>SLA timelines apply during working hours.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Need urgent help?</h4>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                For business-critical downtime, contact your department IT coordinator directly.
              </p>
              <button className="w-full rounded-lg border border-gray-200 bg-gray-100 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                Open Directory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
