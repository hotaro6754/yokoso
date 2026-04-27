"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Briefcase, Building2, CalendarDays, FileText, FolderKanban, Loader2, Save, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import projectService from "@/services/project.service";

const createProjectSchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required"),
  projectName: z.string().trim().min(1, "Project name is required"),
  projectCode: z.string().trim().optional().or(z.literal("")),
  contractType: z.enum(["FIXED_PRICE", "TIME_AND_MATERIAL", "MANAGED_SERVICES"]),
  billable: z.boolean().optional().default(true),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  businessUnit: z.string().optional(),
  description: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.endDate && data.endDate < data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "End date must be after the start date"
    });
  }
});

const FIELD_STYLES = "w-full rounded-sm border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white";

export default function CreateProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const canManageProjects = useMemo(() => {
    const userRole = user?.role || user?.systemRole || "";
    return [
      "HR",
      "HR_ADMIN",
      "COMPANY_ADMIN",
      "MANAGER",
      "COMPANY_OWNER",
      "SUPER_ADMIN",
      "MASTER_ADMIN"
    ].includes(userRole);
  }, [user]);

  const form = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      clientName: "",
      projectName: "",
      projectCode: "",
      contractType: "FIXED_PRICE",
      billable: true,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      businessUnit: "",
      description: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      const response = await projectService.createProject({
        ...values,
        projectCode: values.projectCode || null,
        endDate: values.endDate || null
      });
      toast.success("Project created in draft");
      router.push(`/projects/${response.data.publicId}/assign`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  });

  if (user && !canManageProjects) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">You do not have access to create projects.</p>
      </div>
    );
  }

  const {
    register,
    formState: { errors }
  } = form;

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-8 dark:bg-transparent">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-3">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-primary-600">
            <ArrowLeft size={14} />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Project</h1>
          <Breadcrumb items={[{ label: "Projects", path: "/projects" }, { label: "Create" }]} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <form onSubmit={onSubmit} className="space-y-6">
            <section className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex items-center gap-2">
                <FolderKanban size={18} className="text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Project Basics</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Project Name" icon={Tag} error={errors.projectName?.message}>
                  <input {...register("projectName")} className={FIELD_STYLES} placeholder="Implementation rollout" />
                </Field>
                <Field label="Project Code" icon={Tag} error={errors.projectCode?.message}>
                  <input {...register("projectCode")} className={FIELD_STYLES} placeholder="Leave blank to auto-generate" />
                </Field>
                <Field label="Client Name" icon={Building2} error={errors.clientName?.message}>
                  <input {...register("clientName")} className={FIELD_STYLES} placeholder="Client organization" />
                </Field>
                <Field label="Business Unit" icon={Building2} error={errors.businessUnit?.message}>
                  <input {...register("businessUnit")} className={FIELD_STYLES} placeholder="Digital Services" />
                </Field>
                <Field label="Contract Type" icon={FileText} error={errors.contractType?.message}>
                  <select {...register("contractType")} className={FIELD_STYLES}>
                    <option value="FIXED_PRICE">Fixed Price</option>
                    <option value="TIME_AND_MATERIAL">Time & Material</option>
                    <option value="MANAGED_SERVICES">Managed Services</option>
                  </select>
                </Field>
                <Field label="Billing" icon={Briefcase} error={errors.billable?.message}>
                  <select
                    {...register("billable", { setValueAs: (value) => value === "true" })}
                    className={FIELD_STYLES}
                    defaultValue="true"
                  >
                    <option value="true">Billable</option>
                    <option value="false">Non Billable</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex items-center gap-2">
                <CalendarDays size={18} className="text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Start Date" icon={CalendarDays} error={errors.startDate?.message}>
                  <input type="date" {...register("startDate")} className={FIELD_STYLES} />
                </Field>
                <Field label="End Date" icon={CalendarDays} error={errors.endDate?.message}>
                  <input type="date" {...register("endDate")} className={FIELD_STYLES} />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Description" icon={FileText} error={errors.description?.message}>
                  <textarea
                    {...register("description")}
                    className={`${FIELD_STYLES} min-h-32 resize-y`}
                    placeholder="Scope, delivery notes, or onboarding context"
                  />
                </Field>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-sm bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Draft
              </button>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-sm border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-gray-800 dark:text-gray-300"
              >
                Cancel
              </Link>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Workflow</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Projects are created in <span className="font-semibold text-gray-900 dark:text-white">Draft</span>. After this step,
                assign the PM and RM, allocate resources, define the work schedule, and submit for approval.
              </p>
            </div>
            <div className="rounded-sm border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
              Timesheets stay disabled until the resource plan is approved and the project reaches <span className="font-semibold">ACTIVE</span>.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <label className="space-y-2">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        <Icon size={14} />
        {label}
      </span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
