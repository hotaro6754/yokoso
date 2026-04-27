"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Clock3, Loader2, Save, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import projectService from "@/services/project.service";

const workDays = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" }
];

const scheduleSchema = z.object({
  workingDays: z.array(z.number()).min(1, "Select at least one working day"),
  shiftStart: z.string().min(1, "Shift start is required"),
  shiftEnd: z.string().min(1, "Shift end is required"),
  dailyHours: z.coerce.number().min(1).max(24),
  timezone: z.string().trim().min(1, "Timezone is required")
});

const fieldStyles = "w-full rounded-sm border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white";

export default function ProjectSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const normalizedStatus = String(project?.status || "").toUpperCase();
  const canSubmit = ["DRAFT", "CREATED", "REJECTED"].includes(normalizedStatus);

  const form = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      workingDays: [1, 2, 3, 4, 5],
      shiftStart: "09:00",
      shiftEnd: "18:00",
      dailyHours: 8,
      timezone: "Asia/Kolkata"
    }
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projectResponse, scheduleResponse] = await Promise.all([
          projectService.getProjectById(projectId),
          projectService.getWorkSchedule(projectId).catch(() => ({ data: null }))
        ]);
        setProject(projectResponse.data);
        if (scheduleResponse?.data) {
          form.reset({
            workingDays: Array.isArray(scheduleResponse.data.workingDays)
              ? scheduleResponse.data.workingDays.map((day) => Number(day))
              : [1, 2, 3, 4, 5],
            shiftStart: scheduleResponse.data.shiftStart || "09:00",
            shiftEnd: scheduleResponse.data.shiftEnd || "18:00",
            dailyHours: scheduleResponse.data.dailyHours || 8,
            timezone: scheduleResponse.data.timezone || "Asia/Kolkata"
          });
        }
      } catch (error) {
        toast.error("Failed to load project schedule");
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      load();
    }
  }, [form, projectId, router]);

  const selectedDays = form.watch("workingDays");

  const toggleDay = (day) => {
    const current = new Set(selectedDays);
    if (current.has(day)) {
      current.delete(day);
    } else {
      current.add(day);
    }
    form.setValue("workingDays", [...current], { shouldValidate: true });
  };

  const onSave = form.handleSubmit(async (values) => {
    try {
      setSaving(true);
      await projectService.saveWorkSchedule(projectId, values);
      toast.success("Work schedule saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  });

  const submitResourcePlan = async () => {
    const valid = await form.trigger();
    if (!valid) {
      return;
    }

    try {
      setSubmitting(true);
      const values = form.getValues();
      await projectService.saveWorkSchedule(projectId, values);
      await projectService.submitResourcePlan(projectId);
      toast.success("Resource plan submitted for approval");
      router.push(`/projects/${projectId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit resource plan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-8 dark:bg-transparent">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-3">
          <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-primary-600">
            <ArrowLeft size={14} />
            Back to Project
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Work Schedule</h1>
          <Breadcrumb items={[{ label: "Projects", path: "/projects" }, { label: project?.projectName || "Project" }, { label: "Schedule" }]} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <form onSubmit={onSave} className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center gap-2">
              <Clock3 size={18} className="text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Schedule</h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Working Days</span>
                <div className="flex flex-wrap gap-2">
                  {workDays.map((day) => {
                    const active = selectedDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`rounded-sm border px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {form.formState.errors.workingDays?.message ? (
                  <span className="text-xs text-red-600">{form.formState.errors.workingDays.message}</span>
                ) : null}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Shift Start" error={form.formState.errors.shiftStart?.message}>
                  <input type="time" {...form.register("shiftStart")} className={fieldStyles} />
                </Field>
                <Field label="Shift End" error={form.formState.errors.shiftEnd?.message}>
                  <input type="time" {...form.register("shiftEnd")} className={fieldStyles} />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Daily Hours" error={form.formState.errors.dailyHours?.message}>
                  <input type="number" min="1" max="24" step="0.5" {...form.register("dailyHours")} className={fieldStyles} />
                </Field>
                <Field label="Timezone" error={form.formState.errors.timezone?.message}>
                  <input {...form.register("timezone")} className={fieldStyles} placeholder="Asia/Kolkata" />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-sm bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Schedule
              </button>
              <button
                type="button"
                onClick={submitResourcePlan}
                disabled={submitting || !canSubmit}
                className="inline-flex items-center gap-2 rounded-sm border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Submit for Approval
              </button>
              {!canSubmit ? (
                <p className="w-full text-xs text-amber-700 dark:text-amber-300">
                  Current status: {normalizedStatus || "UNKNOWN"}. Only draft, created, or reworked projects can be submitted.
                </p>
              ) : null}
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Timesheet control</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                This schedule governs valid working days and the daily cap used by timesheet validation.
              </p>
            </div>
            <div className="rounded-sm border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
              Resource plan submission moves the project to <span className="font-semibold">PENDING APPROVAL</span>. Timesheets remain locked until approval activates the project.
            </div>
          </aside>
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
