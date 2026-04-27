"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, ShieldCheck, UserCog, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import employeeService from "@/services/hr-services/employeeService";
import projectService from "@/services/project.service";

const assignSchema = z.object({
  pmId: z.string().min(1, "Project manager is required"),
  rmId: z.string().min(1, "Resource manager is required")
}).refine((value) => value.pmId !== value.rmId, {
  path: ["rmId"],
  message: "PM and RM should be different employees"
});

const selectStyles = "w-full rounded-sm border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white";

export default function AssignLeadershipPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;
  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      pmId: "",
      rmId: ""
    }
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projectResponse, employeeResponse] = await Promise.all([
          projectService.getProjectById(projectId),
          employeeService.getAllEmployees({ limit: 1000 })
        ]);
        const loadedProject = projectResponse.data;
        setProject(loadedProject);
        setEmployees(employeeResponse.data || []);
        form.reset({
          pmId: loadedProject.pmId ? String(loadedProject.pmId) : "",
          rmId: loadedProject.rmId ? String(loadedProject.rmId) : ""
        });
      } catch (error) {
        toast.error("Failed to load project leadership setup");
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      load();
    }
  }, [form, projectId, router]);

  const employeeOptions = useMemo(
    () =>
      employees
        .filter((employee) => {
          // Prevent picking employees from other companies (would fail backend validation).
          if (!project?.companyId) return true;
          if (employee?.companyId === undefined || employee?.companyId === null) return true;
          return Number(employee.companyId) === Number(project.companyId);
        })
        .map((employee) => ({
        value: String(employee.id),
        label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`
      })),
    [employees, project?.companyId]
  );

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSaving(true);
      await projectService.assignLeadership(projectId, {
        pmId: Number(values.pmId),
        rmId: Number(values.rmId)
      });
      toast.success("PM and RM assigned");
      router.push(`/projects/${projectId}/allocation`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign leadership");
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-8 dark:bg-transparent">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3">
          <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-primary-600">
            <ArrowLeft size={14} />
            Back to Project
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Project Leadership</h1>
          <Breadcrumb items={[{ label: "Projects", path: "/projects" }, { label: project?.projectName || "Project" }, { label: "Assign" }]} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <form onSubmit={onSubmit} className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center gap-2">
              <Users size={18} className="text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{project?.projectName}</h2>
            </div>

            <div className="space-y-5">
              <Field label="Project Manager" icon={ShieldCheck} error={form.formState.errors.pmId?.message}>
                <select {...form.register("pmId")} className={selectStyles}>
                  <option value="">Select PM</option>
                  {employeeOptions.map((employee) => (
                    <option key={employee.value} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Resource Manager" icon={UserCog} error={form.formState.errors.rmId?.message}>
                <select {...form.register("rmId")} className={selectStyles}>
                  <option value="">Select RM</option>
                  {employeeOptions.map((employee) => (
                    <option key={employee.value} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-sm bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Save Leadership
              </button>
              <Link
                href={`/projects/${projectId}/allocation`}
                className="inline-flex items-center gap-2 rounded-sm border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-gray-800 dark:text-gray-300"
              >
                Skip for now
              </Link>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Status impact</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Once both PM and RM are assigned, the project moves from <span className="font-semibold">DRAFT</span> to <span className="font-semibold">CREATED</span>.
              </p>
            </div>
            <div className="rounded-sm border border-sky-200 bg-sky-50 p-6 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-200">
              Next step: allocate delivery team members and define their allocation percentages before submission.
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
