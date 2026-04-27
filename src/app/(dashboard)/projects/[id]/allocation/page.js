"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Briefcase, CalendarDays, Loader2, Save, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import employeeService from "@/services/hr-services/employeeService";
import projectService from "@/services/project.service";

const allocationSchema = z.object({
  employeeIds: z.preprocess(
    (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string" && value) return [value];
      return [];
    },
    z.array(z.string().min(1)).min(1, "At least one employee is required")
  ),
  role: z.string().trim().min(1, "Role is required"),
  allocationPercentage: z.coerce.number().min(1).max(100),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  billable: z.boolean().default(true)
}).superRefine((value, ctx) => {
  if (value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "End date must be after the start date"
    });
  }
});

const fieldStyles = "w-full rounded-sm border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white";

export default function ProjectAllocationPage() {
  const params = useParams();
  const projectId = params?.id;
  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [applyToExisting, setApplyToExisting] = useState(false);

  const form = useForm({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      employeeIds: [],
      role: "Developer",
      allocationPercentage: 100,
      startDate: "",
      endDate: "",
      billable: true
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectResponse, employeesResponse, allocationsResponse] = await Promise.all([
        projectService.getProjectById(projectId),
        employeeService.getAllEmployees({ limit: 1000 }),
        projectService.getProjectAllocations(projectId)
      ]);

      const loadedProject = projectResponse.data;
      setProject(loadedProject);
      setEmployees(employeesResponse.data || []);
      const loadedAllocations = allocationsResponse.data || [];
      setAllocations(loadedAllocations);

      const allocatedEmployeeIds = Array.from(
        new Set(
          loadedAllocations
            .map((allocation) => String(allocation.employee?.id || allocation.employeeId || ""))
            .filter(Boolean)
        )
      );

      // Default allocation start to "today" for already-started projects to avoid accidental
      // historical overlap (which can trigger the 100% capacity validation).
      const toDateInputValue = (date) => {
        const pad = (value) => String(value).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const projectStart = loadedProject.startDate ? new Date(loadedProject.startDate) : null;
      if (projectStart) projectStart.setHours(0, 0, 0, 0);
      const projectEnd = loadedProject.endDate ? new Date(loadedProject.endDate) : null;
      if (projectEnd) projectEnd.setHours(0, 0, 0, 0);

      const effectiveStart = projectStart && projectStart.getTime() > today.getTime() ? projectStart : today;
      const safeStart = projectEnd && effectiveStart.getTime() > projectEnd.getTime() ? projectEnd : effectiveStart;
      form.reset({
        employeeIds: allocatedEmployeeIds,
        role: "Developer",
        allocationPercentage: 100,
        startDate: toDateInputValue(safeStart),
        endDate: projectEnd ? toDateInputValue(projectEnd) : "",
        billable: true
      });
    } catch (error) {
      toast.error("Failed to load allocation workflow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: String(employee.id),
        label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`
      })),
    [employees]
  );

  const selectedEmployeeIds = form.watch("employeeIds") || [];

  const filteredEmployeeOptions = useMemo(() => {
    const query = employeeSearch.trim().toLowerCase();
    if (!query) return employeeOptions;
    return employeeOptions.filter((option) => option.label.toLowerCase().includes(query));
  }, [employeeOptions, employeeSearch]);

  const toggleEmployeeId = (value) => {
    const current = new Set(Array.isArray(selectedEmployeeIds) ? selectedEmployeeIds : []);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    form.setValue("employeeIds", Array.from(current), { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSaving(true);
      const response = await projectService.saveAllocation({
        projectId,
        employeeIds: values.employeeIds.map((id) => Number(id)),
        role: values.role,
        allocationPercentage: values.allocationPercentage,
        startDate: values.startDate,
        endDate: values.endDate || null,
        billable: values.billable,
        // Make the selected list the source of truth: removed employees are removed from the project.
        replaceExisting: true,
        // Default behavior: don't overwrite existing team allocation settings unless user opts in.
        preserveExisting: !applyToExisting
      });

      const payload = response?.data;
      const failed = Array.isArray(payload?.failed) ? payload.failed : [];
      const savedCount = Array.isArray(payload)
        ? payload.length
        : Array.isArray(payload?.saved)
          ? payload.saved.length
          : (payload ? 1 : 0);

      if (failed.length) {
        toast.success(`Saved ${savedCount} allocation(s)`);
        toast.error(`Failed for ${failed.map((item) => item.employeeName || item.employeeCode || item.employeeId).join(", ")}`);
      } else {
        toast.success("Allocation saved");
      }
      window.dispatchEvent(new Event("projectsUpdated"));
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save allocation");
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
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-primary-600">
            <ArrowLeft size={14} />
            Back to Project
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Allocation</h1>
          <Breadcrumb items={[{ label: "Projects", path: "/projects" }, { label: project?.projectName || "Project" }, { label: "Allocation" }]} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form onSubmit={onSubmit} className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center gap-2">
              <Users size={18} className="text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add or Update Allocation</h2>
            </div>

            <div className="space-y-5">
              <Field label="Employees" error={form.formState.errors.employeeIds?.message}>
                <div className="flex items-center justify-between gap-3">
                  <input
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className={fieldStyles}
                    placeholder="Search employees..."
                  />
                  <button
                    type="button"
                    onClick={() => form.setValue("employeeIds", [], { shouldDirty: true, shouldValidate: true })}
                    className="shrink-0 rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                  >
                    Clear ({Array.isArray(selectedEmployeeIds) ? selectedEmployeeIds.length : 0})
                  </button>
                </div>

                <div className="mt-3 max-h-64 overflow-auto rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                  {filteredEmployeeOptions.length ? (
                    filteredEmployeeOptions.map((employee) => {
                      const checked = Array.isArray(selectedEmployeeIds) && selectedEmployeeIds.includes(employee.value);
                      return (
                        <label
                          key={employee.value}
                          className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-2.5 text-sm text-gray-700 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:text-gray-300 dark:hover:bg-gray-900/40"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEmployeeId(employee.value)}
                            className="h-4 w-4"
                          />
                          <span className="truncate">{employee.label}</span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No employees found.</div>
                  )}
                </div>
              </Field>

              <Field label="Role" error={form.formState.errors.role?.message}>
                <input {...form.register("role")} className={fieldStyles} placeholder="Developer" />
              </Field>

              <Field label="Allocation %" error={form.formState.errors.allocationPercentage?.message}>
                <input type="number" min="1" max="100" {...form.register("allocationPercentage")} className={fieldStyles} />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Start Date" error={form.formState.errors.startDate?.message}>
                  <input type="date" {...form.register("startDate")} className={fieldStyles} />
                </Field>
                <Field label="End Date" error={form.formState.errors.endDate?.message}>
                  <input type="date" {...form.register("endDate")} className={fieldStyles} />
                </Field>
              </div>

              <label className="flex items-center gap-3 rounded-sm border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                <input type="checkbox" {...form.register("billable")} className="h-4 w-4" />
                Mark this allocation as billable
              </label>

              <label className="flex items-center gap-3 rounded-sm border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={applyToExisting}
                  onChange={(e) => setApplyToExisting(e.target.checked)}
                  className="h-4 w-4"
                />
                Apply these allocation settings to already-assigned employees
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-sm bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Allocation
              </button>
              <Link
                href={`/projects/${projectId}/schedule`}
                className="inline-flex items-center gap-2 rounded-sm border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-gray-800 dark:text-gray-300"
              >
                Continue to Schedule
              </Link>
            </div>
          </form>

          <section className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center gap-2">
              <Briefcase size={18} className="text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Allocations</h2>
            </div>

            {allocations.length ? (
              <div className="space-y-3">
                {allocations.map((allocation) => (
                  <div key={allocation.id} className="rounded-sm border border-gray-200 p-4 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {allocation.employee?.firstName} {allocation.employee?.lastName}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {allocation.role} - {allocation.allocationPercentage}% - {allocation.billable ? "Billable" : "Non-billable"}
                        </p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {allocation.employee?.employeeId}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <CalendarDays size={14} />
                      <span>
                        {allocation.startDate ? new Date(allocation.startDate).toLocaleDateString() : "-"} to{" "}
                        {allocation.endDate ? new Date(allocation.endDate).toLocaleDateString() : "Open"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No allocations yet. Add at least one team member before submitting the resource plan.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
