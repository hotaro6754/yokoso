"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Breadcrumb from "@/components/common/Breadcrumb";
import { employeeTimesheetService } from "@/services/employee/timesheet.service";
import { employeeAttendanceService } from "@/services/employee/attendance.service";
import employeeLeaveService from "@/services/employee/leave.service";
import EmployeeHolidayService from "@/services/employee/holiday.service";
import projectService from "@/services/project.service";
import ActionDropdown from "@/app/(dashboard)/master-admin/components/ActionDropdown";
import { ChevronLeft, ChevronRight, Plus, Trash2, Save, Calendar, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const CLIENT_DAILY_HOURS = 8;

const entrySchema = z.object({
  rowId: z.string(),
  date: z.string(),
  projectId: z.string().optional().default(""),
  task: z.string().optional().default(""),
  billable: z.boolean().optional().default(true),
  hours: z.coerce.number().min(0, "Hours cannot be negative"),
  lockedProject: z.string().optional().default("")
}).superRefine((entry, ctx) => {
  const hasHours = Number(entry.hours || 0) > 0;
  if (hasHours && !entry.lockedProject && !String(entry.projectId || "").trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["projectId"], message: "Select a project" });
  }
  if (hasHours && !String(entry.task || "").trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["task"], message: "Task description is required" });
  }
  if (Number(entry.hours || 0) > 24) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["hours"], message: "Hours cannot exceed 24" });
  }
});

const formSchema = z.object({ entries: z.array(entrySchema) }).superRefine((value, ctx) => {
  const totals = new Map();
  value.entries.forEach((entry, index) => {
    const next = (totals.get(entry.date) || 0) + Number(entry.hours || 0);
    totals.set(entry.date, next);
    if (next > CLIENT_DAILY_HOURS) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["entries", index, "hours"], message: "Exceeded daily hours" });
    }
  });
});

const getMonday = (value) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const formatDateISO = (value) => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const getMonthYear = (date) => date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

const generateWeekDays = (startDate) => {
  const days = [];
  for (let i = 0; i < 5; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }
  return days;
};

const createRowId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 11);
};

const getSpecialProject = (date, leaveRecords, holidays) => {
  const dateKey = formatDateISO(date);
  const holiday = holidays.some((item) => formatDateISO(item.date) === dateKey && item.isActive !== false);
  if (holiday) return { value: "HOLIDAY", label: "Holiday" };
  const leave = leaveRecords.some((item) => {
    const status = String(item.status || "").toUpperCase();
    return status === "APPROVED" && dateKey >= formatDateISO(item.startDate) && dateKey <= formatDateISO(item.endDate);
  });
  if (leave) return { value: "LEAVE", label: "Leave" };
  return null;
};

const buildAttendanceMap = (response) => {
  const map = new Map();
  (response?.data || []).forEach((record) => {
    const key = record?.date ? formatDateISO(record.date) : "";
    if (!key) return;
    let hours = 0;
    if (record.totalHours) hours = Number(record.totalHours);
    else if (record.firstPunchIn && record.lastPunchOut) hours = (new Date(record.lastPunchOut) - new Date(record.firstPunchIn)) / (1000 * 60 * 60);
    map.set(key, Number(hours.toFixed(2)));
  });
  return map;
};

const getFirstErrorMessage = (errorObject) => {
  if (!errorObject) return "";
  if (typeof errorObject.message === "string") return errorObject.message;
  if (Array.isArray(errorObject)) {
    for (const item of errorObject) {
      const message = getFirstErrorMessage(item);
      if (message) return message;
    }
  }
  if (typeof errorObject === "object") {
    for (const value of Object.values(errorObject)) {
      const message = getFirstErrorMessage(value);
      if (message) return message;
    }
  }
  return "";
};

export default function TimesheetAddPage() {
  const router = useRouter();
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [projects, setProjects] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [existingTimesheets, setExistingTimesheets] = useState([]);
  const [loadingWeekData, setLoadingWeekData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const weekDays = useMemo(() => generateWeekDays(currentWeekStart), [currentWeekStart]);
  const { control, register, handleSubmit, reset, setValue, trigger, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { entries: [] },
    mode: "onChange"
  });
  const { fields, append, insert, remove } = useFieldArray({ control, name: "entries", keyName: "fieldKey" });
  const entryValues = watch("entries") || [];
  const hasWeekSubmission = existingTimesheets.length > 0;

  const projectOptions = useMemo(() => (projects || []).map((project) => ({
    id: String(project.publicId || project.id || ""),
    name: project.projectName || project.name || project.projectCode || "Unnamed Project",
    code: project.projectCode || "",
    billable: project.billable !== undefined ? Boolean(project.billable) : true
  })), [projects]);

  const projectNameById = useMemo(() => {
    const map = new Map();
    projectOptions.forEach((project) => map.set(project.id, project.name));
    map.set("LEAVE", "Leave");
    map.set("HOLIDAY", "Holiday");
    return map;
  }, [projectOptions]);

  const projectBillableById = useMemo(() => {
    const map = new Map();
    projectOptions.forEach((project) => map.set(project.id, Boolean(project.billable)));
    map.set("LEAVE", false);
    map.set("HOLIDAY", false);
    return map;
  }, [projectOptions]);

  // Derive the grouped entries from the latest watched form values so selects reflect changes immediately.
  const entriesByDate = new Map();
  entryValues.forEach((entry, index) => {
    if (!entriesByDate.has(entry.date)) entriesByDate.set(entry.date, []);
    entriesByDate.get(entry.date).push({ ...entry, index });
  });

  const grandTotal = entryValues.reduce((total, entry) => total + Number(entry?.hours || 0), 0);
  const getDayTotal = (dateKey) => (entriesByDate.get(dateKey) || []).reduce((total, entry) => total + Number(entry?.hours || 0), 0);
  const getProjectLabel = (projectId) => projectNameById.get(String(projectId || "")) || "";
  const getProjectBillable = (projectId) => projectBillableById.get(String(projectId || "")) ?? true;
  const isDateDisabled = (date) => Boolean(getSpecialProject(date, leaveRecords, holidays));

  useEffect(() => {
    let ignore = false;
    const loadWeekData = async () => {
      setLoadingWeekData(true);
      setSubmissionError("");
      const startDate = formatDateISO(weekDays[0]);
      const endDate = formatDateISO(weekDays[weekDays.length - 1]);
      const [projectsResult, timesheetsResult, leaveResult, holidaysResult, attendanceResult] = await Promise.allSettled([
        projectService.getAllProjects({ status: "ACTIVE", timesheetEligible: true }),
        employeeTimesheetService.getMyTimesheets({ startDate, endDate, limit: 50 }),
        employeeLeaveService.getLeaveHistory({ startDate, endDate, limit: 50 }),
        EmployeeHolidayService.getHolidays({ startDate, endDate, limit: 50 }),
        employeeAttendanceService.getMyAttendanceRecords({ startDate, endDate, limit: 50 })
      ]);
      if (ignore) return;
      const nextProjects = projectsResult.status === "fulfilled" ? (projectsResult.value?.data || []).filter((project) => String(project.status || "").toUpperCase() === "ACTIVE") : [];
      const nextTimesheets = timesheetsResult.status === "fulfilled" ? (Array.isArray(timesheetsResult.value) ? timesheetsResult.value : timesheetsResult.value?.data || []) : [];
      const nextLeaveRecords = leaveResult.status === "fulfilled" ? (leaveResult.value?.data || []) : [];
      const nextHolidays = holidaysResult.status === "fulfilled" ? (holidaysResult.value?.data || []) : [];
      const attendanceMap = attendanceResult.status === "fulfilled" ? buildAttendanceMap(attendanceResult.value) : new Map();
      const initialEntries = weekDays.map((day) => {
        const specialProject = getSpecialProject(day, nextLeaveRecords, nextHolidays);
        const dateKey = formatDateISO(day);
        return {
          rowId: createRowId(),
          date: dateKey,
          projectId: specialProject?.value || "",
          task: specialProject?.label || "",
          billable: specialProject ? false : true,
          hours: specialProject ? CLIENT_DAILY_HOURS : Number(attendanceMap.get(dateKey) || 0),
          lockedProject: specialProject?.value || ""
        };
      });
      setProjects(nextProjects);
      setExistingTimesheets(nextTimesheets);
      setLeaveRecords(nextLeaveRecords);
      setHolidays(nextHolidays);
      reset({ entries: initialEntries });
      setLoadingWeekData(false);
    };
    loadWeekData().catch((error) => {
      console.error("Failed to load timesheet setup data:", error);
      if (!ignore) {
        setProjects([]);
        setExistingTimesheets([]);
        setLeaveRecords([]);
        setHolidays([]);
        reset({ entries: weekDays.map((day) => ({ rowId: createRowId(), date: formatDateISO(day), projectId: "", task: "", billable: true, hours: 0, lockedProject: "" })) });
        setLoadingWeekData(false);
      }
    });
    return () => { ignore = true; };
  }, [reset, weekDays]);

  const handlePrevWeek = () => {
    const nextDate = new Date(currentWeekStart);
    nextDate.setDate(nextDate.getDate() - 7);
    setCurrentWeekStart(nextDate);
  };

  const handleNextWeek = () => {
    const nextDate = new Date(currentWeekStart);
    nextDate.setDate(nextDate.getDate() + 7);
    setCurrentWeekStart(nextDate);
  };

  const addEntry = (date) => {
    if (isDateDisabled(date) || hasWeekSubmission) return;
    const dateKey = formatDateISO(date);
    const lastIndexForDay = entryValues.reduce((lastIndex, entry, index) => (entry?.date === dateKey ? index : lastIndex), -1);
    const nextEntry = { rowId: createRowId(), date: dateKey, projectId: "", task: "", billable: true, hours: 0, lockedProject: "" };
    if (lastIndexForDay >= 0) insert(lastIndexForDay + 1, nextEntry);
    else append(nextEntry);
  };

  const handleProjectChange = async (index, value) => {
    setValue(`entries.${index}.projectId`, value, { shouldDirty: true, shouldValidate: true });
    setValue(`entries.${index}.lockedProject`, "", { shouldDirty: true, shouldValidate: true });
    setValue(`entries.${index}.billable`, getProjectBillable(value), { shouldDirty: true, shouldValidate: true });
    await trigger([`entries.${index}.projectId`, `entries.${index}.hours`]);
  };

  const onInvalidSubmit = () => {
    const message = getFirstErrorMessage(errors) || "Please fix the highlighted timesheet entries";
    setSubmissionError(message);
    toast.error(message);
  };

  const onSubmit = async (formValues) => {
    if (hasWeekSubmission) {
      toast.error("This week's timesheet is already submitted. Please edit existing entries.");
      router.push("/attendance/timesheets");
      return;
    }
    const activeEntries = (formValues.entries || []).filter((entry) => Number(entry.hours || 0) > 0);
    if (!activeEntries.length) {
      toast.warning("No hours entered to submit");
      return;
    }
    const existingSpecialKeys = new Set((existingTimesheets || []).filter((timesheet) => ["Leave", "Holiday"].includes(timesheet.project)).map((timesheet) => `${formatDateISO(timesheet.date)}|${String(timesheet.project).toLowerCase()}`));
    const sanitizedEntries = activeEntries.filter((entry) => {
      const projectName = getProjectLabel(entry.lockedProject || entry.projectId);
      if (projectName === "Leave" || projectName === "Holiday") return !existingSpecialKeys.has(`${entry.date}|${projectName.toLowerCase()}`);
      return true;
    });
    if (!sanitizedEntries.length) {
      toast.info("No new entries to submit for this week.");
      return;
    }
    setSubmitting(true);
    setSubmissionError("");
    try {
      await Promise.all(sanitizedEntries.map((entry) => {
        const projectId = entry.lockedProject || entry.projectId;
        const projectName = getProjectLabel(projectId);
        return employeeTimesheetService.createTimesheet({
          projectId,
          project: projectName,
          billable: entry.billable !== undefined ? Boolean(entry.billable) : true,
          task: entry.task.trim(),
          hours: Number(entry.hours),
          date: entry.date,
          description: entry.task.trim()
        });
      }));
      toast.success("Timesheets submitted successfully");
      router.push("/attendance/timesheets");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to submit timesheets";
      setSubmissionError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 text-gray-900 [--color-primary:hsl(238,90%,28%)] [--color-primary-hover:hsl(238,90%,22%)] [--color-secondary:hsl(238,90%,95%)]">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Attendance", href: "/attendance" },
          { label: "Timesheets", href: "/attendance/timesheets" },
          { label: "Weekly Entry" }
        ]} />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="mb-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft size={16} />
              </button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Weekly Timesheet</h1>
            <p className="text-sm text-gray-600 mt-1">Log time only against active projects where you are allocated.</p>
            <div className="mt-2 text-xs text-gray-500">
              {loadingWeekData ? "Loading timesheet setup..." : `Showing ${projectOptions.length} active allocated projects`}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
              <button type="button" onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                <ChevronLeft size={16} />
              </button>
              <div className="flex flex-col items-center min-w-[140px] px-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase">{getMonthYear(currentWeekStart)}</span>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Calendar size={14} className="text-brand-600" />
                  <span>{weekDays[0]?.getDate()} - {weekDays[4]?.getDate()}</span>
                </div>
              </div>
              <button type="button" onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => router.push("/attendance/timesheets")} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
                View Submitted
              </button>
              <button type="button" onClick={() => router.push("/attendance/timesheets")} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit, onInvalidSubmit)}
                disabled={submitting || hasWeekSubmission || loadingWeekData}
                className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-70"
              >
                <Save size={16} />
                {submitting ? "Saving..." : hasWeekSubmission ? "Already Submitted" : "Submit Sheet"}
              </button>
            </div>
          </div>
        </div>

        {submissionError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{submissionError}</span>
          </div>
        ) : null}

        {hasWeekSubmission ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This week&apos;s timesheet is already submitted. You can only edit existing entries from the main list.
          </div>
        ) : null}

        {!loadingWeekData && !projectOptions.length ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            No active allocated projects are available for timesheet entry right now.
          </div>
        ) : null}

        <div className="space-y-6">
          {existingTimesheets.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Existing Timesheets</h2>
                <p className="text-sm text-gray-500 mt-1">Previously submitted timesheets for this week</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-3 py-3">Project</th>
                      <th className="px-3 py-3">Task</th>
                      <th className="px-3 py-3 text-center">Hours</th>
                      <th className="px-3 py-3 text-center">Status</th>
                      <th className="px-3 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {existingTimesheets.map((timesheet) => (
                      <tr key={timesheet.id || timesheet.publicId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {timesheet.date ? new Date(timesheet.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "No Date"}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-600">{timesheet.project || "N/A"}</td>
                        <td className="px-3 py-4 text-sm text-gray-600">{timesheet.task || timesheet.description || "N/A"}</td>
                        <td className="px-3 py-4 text-sm text-center font-medium text-gray-900">{timesheet.hours}h</td>
                        <td className="px-3 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            timesheet.status === "APPROVED" ? "bg-green-100 text-green-700" : timesheet.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {timesheet.status || "DRAFT"}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <ActionDropdown
                            viewUrl={`/attendance/timesheets/${timesheet.id}`}
                            customActions={[{
                              label: "Edit",
                              icon: FileText,
                              onClick: () => router.push("/attendance/timesheets"),
                              className: "text-blue-700 dark:text-blue-300",
                              iconClassName: "text-blue-600 dark:text-blue-400"
                            }]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    {weekDays.map((day) => (
                      <th key={day.toISOString()} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-gray-900 font-semibold">{day.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                          <span className="text-[10px] text-gray-500">{day.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {weekDays.map((day) => {
                      const dateKey = formatDateISO(day);
                      const isDisabled = isDateDisabled(day);
                      const dayEntries = entriesByDate.get(dateKey) || [];
                      const dayTotal = getDayTotal(dateKey);
                      return (
                        <td key={day.toISOString()} className="align-top px-4 py-4 border-r border-gray-100 last:border-r-0">
                          <div className="space-y-4">
                            {dayEntries.length === 0 ? <div className="text-[11px] text-gray-400 text-center py-2">No entries</div> : null}

                            {dayEntries.map((entry) => {
                              const rowErrors = errors.entries?.[entry.index] || {};
                              const isSpecialProject = Boolean(entry.lockedProject);
                              return (
                                <div key={fields[entry.index]?.fieldKey || entry.rowId} className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-2">
                                  <input type="hidden" {...register(`entries.${entry.index}.rowId`)} />
                                  <input type="hidden" {...register(`entries.${entry.index}.date`)} />
                                  <input type="hidden" {...register(`entries.${entry.index}.projectId`)} />
                                  <input type="hidden" {...register(`entries.${entry.index}.lockedProject`)} />
                                  <div className="text-[10px] font-bold text-gray-500 uppercase">Project</div>
                                  {isSpecialProject ? (
                                    <div className="w-full px-2 py-2 text-xs border border-gray-200 rounded-md bg-gray-100 text-gray-500 text-center font-semibold">
                                      {getProjectLabel(entry.lockedProject)}
                                    </div>
                                  ) : (
                                    <select
                                      value={entry.projectId || ""}
                                      onChange={(event) => handleProjectChange(entry.index, event.target.value)}
                                      disabled={isDisabled || hasWeekSubmission || loadingWeekData}
                                      className={`w-full px-2 py-2 text-xs border rounded-md outline-none transition-all ${
                                        rowErrors.projectId ? "border-red-300 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-700"
                                      } ${isDisabled || hasWeekSubmission ? "cursor-not-allowed bg-gray-100 text-gray-400" : "focus:ring-2 focus:ring-brand-200 focus:border-brand-500"}`}
                                    >
                                      <option value="">Select project</option>
                                      {projectOptions.map((project) => (
                                        <option key={project.id} value={project.id}>
                                          {project.name}{project.code ? ` (${project.code})` : ""}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  {rowErrors.projectId?.message ? <p className="text-[11px] text-red-600">{rowErrors.projectId.message}</p> : null}

                                  <div className="text-[10px] font-bold text-gray-500 uppercase">Billing</div>
                                  <div className="w-full px-2 py-2 text-xs border border-gray-200 rounded-md bg-gray-100 text-gray-500 text-center font-semibold">
                                    {isSpecialProject ? "Non Billable" : (entry.billable === false ? "Non Billable" : "Billable")}
                                  </div>

                                  <div className="text-[10px] font-bold text-gray-500 uppercase">Hours</div>
                                  <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    step="0.5"
                                    disabled={isDisabled || hasWeekSubmission || loadingWeekData || isSpecialProject}
                                    className={`w-full text-center px-2 py-1.5 text-xs font-bold border rounded-md outline-none transition-all ${
                                      rowErrors.hours ? "border-red-300 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-900"
                                    } ${isDisabled || hasWeekSubmission || isSpecialProject ? "cursor-not-allowed bg-gray-100 text-gray-400" : "focus:ring-2 focus:ring-brand-200 focus:border-brand-500"}`}
                                    {...register(`entries.${entry.index}.hours`)}
                                  />
                                  {rowErrors.hours?.message ? <p className="text-[11px] text-red-600">{rowErrors.hours.message}</p> : null}

                                  <div className="text-[10px] font-bold text-gray-500 uppercase">Description</div>
                                  <div className="flex items-start gap-2">
                                    <textarea
                                      placeholder="Describe your task..."
                                      disabled={isDisabled || hasWeekSubmission || loadingWeekData || isSpecialProject}
                                      className={`w-full px-2 py-2 text-xs border rounded-md outline-none transition-all resize-none min-h-[64px] ${
                                        rowErrors.task ? "border-red-300 bg-red-50 text-red-700 placeholder-red-400" : "border-gray-200 bg-white text-gray-700 placeholder-gray-500"
                                      } ${isDisabled || hasWeekSubmission || isSpecialProject ? "cursor-not-allowed bg-gray-100 text-gray-400 placeholder-gray-400" : "focus:ring-2 focus:ring-brand-200 focus:border-brand-500"}`}
                                      {...register(`entries.${entry.index}.task`)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => remove(entry.index)}
                                      disabled={isDisabled || hasWeekSubmission || loadingWeekData}
                                      className={`mt-1 ${isDisabled || hasWeekSubmission ? "text-gray-300 cursor-not-allowed" : "text-red-600 hover:text-red-700"}`}
                                      title="Delete entry"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  {rowErrors.task?.message ? <p className="text-[11px] text-red-600">{rowErrors.task.message}</p> : null}
                                </div>
                              );
                            })}

                            <button
                              type="button"
                              onClick={() => addEntry(day)}
                              disabled={isDisabled || hasWeekSubmission || loadingWeekData}
                              className={`w-full inline-flex items-center justify-center gap-2 text-[11px] font-semibold px-3 py-2 rounded-md transition-colors ${
                                isDisabled || hasWeekSubmission || loadingWeekData ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-brand-600 bg-brand-50 hover:bg-brand-100"
                              }`}
                            >
                              <Plus size={12} /> Add Line
                            </button>

                            <div className={`flex items-center justify-between text-[10px] font-bold rounded-md px-2 py-1 ${
                              dayTotal > CLIENT_DAILY_HOURS ? "bg-red-100 text-red-700" : dayTotal === CLIENT_DAILY_HOURS ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}>
                              <span>Total</span>
                              <span>{dayTotal}h</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
                <tfoot className="bg-gray-900 text-white">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">Weekly Total Hours</td>
                    <td className="px-4 py-3 text-center text-lg font-bold">{grandTotal}h</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
