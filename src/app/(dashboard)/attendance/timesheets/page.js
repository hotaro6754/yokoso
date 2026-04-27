"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Download, FileClock, Pencil, Plus, Save, Sparkles, Trash2, X } from "lucide-react";
import Link from "next/link";
import { employeeTimesheetService } from "@/services/employee/timesheet.service";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

const formatDisplayDate = (value) => {
  if (!value) return "Unknown Date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown Date";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const normalizeStatus = (status) => {
  const normalized = String(status || "PENDING").toUpperCase();
  if (normalized === "SUBMITTED") return "Submitted";
  if (normalized === "APPROVED") return "Approved";
  if (normalized === "REJECTED") return "Rejected";
  return "Pending";
};

const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatHours = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(1) : "0.0";
};

const getWeekStart = (value) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getMonthGrid = (anchorDate) => {
  const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  return Array.from({ length: 35 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const statusClass = (status) => ({
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
  Submitted: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300",
  Pending: "theme-soft-border theme-soft-surface theme-accent-text",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
}[status] || "border-slate-200 bg-slate-50 text-slate-700");

export default function TimesheetsPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState("week");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ project: "", task: "", hours: "", billable: true });
  const [deleteState, setDeleteState] = useState({ open: false, entry: null });

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await employeeTimesheetService.getMyTimesheets();
        setEntries((data || []).map((entry) => ({
          id: entry.id,
          publicId: entry.publicId,
          project: entry.projectName || entry.project || "",
          projectCode: entry.projectCode || "",
          billable: entry.billable !== undefined ? Boolean(entry.billable) : undefined,
          task: entry.task || "",
          description: entry.description || "",
          hours: Number(entry.hours || 0),
          dateKey: entry.date,
          dateKeyNormalized: toDateKey(entry.date),
          displayDate: formatDisplayDate(entry.date),
          status: normalizeStatus(entry.status)
        })));
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load timesheets");
      } finally {
        setLoading(false);
      }
    };
    fetchTimesheets();
  }, []);

  const periodRange = useMemo(() => {
    const base = new Date(anchorDate);
    if (viewMode === "day") {
      const start = new Date(base);
      const end = new Date(base);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    if (viewMode === "month") {
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    const start = getWeekStart(base);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [anchorDate, viewMode]);

  const filteredEntries = useMemo(() => entries.filter((entry) => {
    const date = new Date(entry.dateKey);
    return date >= periodRange.start && date <= periodRange.end;
  }).sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey)), [entries, periodRange]);

  const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(periodRange.start);
    date.setDate(periodRange.start.getDate() + index);
    const key = toDateKey(date);
    const dayEntries = filteredEntries.filter((entry) => entry.dateKeyNormalized === key);
    return {
      key,
      date,
      label: date.toLocaleDateString("en-GB", { weekday: "short" }),
      dayLabel: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      entries: dayEntries,
      total: dayEntries.reduce((sum, entry) => sum + Number(entry.hours || 0), 0)
    };
  }), [filteredEntries, periodRange.start]);

  const selectedDayEntries = useMemo(() => {
    const key = toDateKey(periodRange.start);
    return filteredEntries.filter((entry) => entry.dateKeyNormalized === key);
  }, [filteredEntries, periodRange.start]);

  const activeWeekDayKey = useMemo(() => {
    const anchorKey = toDateKey(anchorDate);
    return weekDays.some((day) => day.key === anchorKey) ? anchorKey : weekDays[0]?.key || null;
  }, [anchorDate, weekDays]);

  const activeWeekDay = useMemo(() => (
    weekDays.find((day) => day.key === activeWeekDayKey) || weekDays[0] || null
  ), [activeWeekDayKey, weekDays]);

  const stats = useMemo(() => ({
    totalHours: filteredEntries.reduce((sum, entry) => sum + Number(entry.hours || 0), 0),
    pending: filteredEntries.filter((entry) => entry.status === "Pending").length,
    approved: filteredEntries.filter((entry) => entry.status === "Approved").reduce((sum, entry) => sum + Number(entry.hours || 0), 0),
    projects: new Set(filteredEntries.map((entry) => entry.project).filter(Boolean)).size
  }), [filteredEntries]);

  const periodLabel = viewMode === "day"
    ? periodRange.start.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" })
    : viewMode === "month"
      ? periodRange.start.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
      : `${periodRange.start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} - ${periodRange.end.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;

  const miniCalendar = useMemo(() => getMonthGrid(anchorDate), [anchorDate]);

  const shiftPeriod = (direction) => {
    const next = new Date(anchorDate);
    if (viewMode === "month") next.setMonth(next.getMonth() + direction);
    else if (viewMode === "day") next.setDate(next.getDate() + direction);
    else next.setDate(next.getDate() + (7 * direction));
    setAnchorDate(next);
  };

  const handleExportReport = () => {
    if (!filteredEntries.length) {
      toast.error("No timesheet entries to export");
      return;
    }
    const rows = filteredEntries.map((entry) => ({
      Date: entry.displayDate,
      Project: entry.project || "",
      Billing: entry.billable === false ? "Non Billable" : "Billable",
      Task: entry.task || "",
      Hours: entry.hours,
      Status: entry.status
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Timesheets");
    const blob = new Blob([XLSX.write(book, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `timesheet-report-${new Date().toISOString().split("T")[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Timesheet report exported");
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditDraft({
      project: entry.project || "",
      task: entry.task || "",
      hours: String(entry.hours || ""),
      billable: entry.billable !== false
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ project: "", task: "", hours: "", billable: true });
  };

  const saveEdit = async (entry) => {
    try {
      const payload = {
        project: editDraft.project.trim(),
        task: editDraft.task.trim(),
        hours: Number(editDraft.hours),
        billable: Boolean(editDraft.billable)
      };
      if (!payload.project || !payload.task || !Number.isFinite(payload.hours)) {
        toast.error("Please provide project, task, and valid hours");
        return;
      }
      const updated = await employeeTimesheetService.updateTimesheet(entry.id, payload);
      setEntries((prev) => prev.map((item) => item.id === entry.id ? {
        ...item,
        project: updated?.project ?? payload.project,
        task: updated?.task ?? payload.task,
        hours: updated?.hours ?? payload.hours,
        billable: updated?.billable !== undefined ? Boolean(updated.billable) : payload.billable
      } : item));
      toast.success("Timesheet updated");
      cancelEdit();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update timesheet");
    }
  };

  const confirmDelete = async () => {
    if (!deleteState.entry) return;
    try {
      await employeeTimesheetService.deleteTimesheet(deleteState.entry.id);
      setEntries((prev) => prev.filter((item) => item.id !== deleteState.entry.id));
      toast.success("Timesheet deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete timesheet");
    }
  };

  const canModify = (entry) => entry.status !== "Approved";
  const selectedDayTotal = selectedDayEntries.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
  const viewTitle = viewMode === "day"
    ? "Daily timesheet focus"
    : viewMode === "week"
      ? "Weekly activity lanes"
      : "Monthly activity ledger";
  const viewDescription = viewMode === "day"
    ? "A single-day worklog view for quick review, edits, and same-day follow-up."
    : viewMode === "week"
      ? "Review the full week at a glance, then work on one selected day in a focused panel."
      : "A cleaner running list for long-range review and quick corrections.";

  return (
    <div className="min-h-screen bg-[#f5f6fb] p-3 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-4">
      <div className="mx-auto max-w-[1380px] space-y-4">
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Timesheet Management", href: "/attendance/timesheets" }, { label: "My Timesheets" }]} />

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_-35px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900">
          <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40 lg:border-b-0 lg:border-r">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="theme-accent-text text-xs font-semibold uppercase tracking-[0.22em]">Timesheet</p>
                  <h1 className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-white">My Worklog</h1>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><CalendarDays size={16} /></div>
              </div>

              <p className="mt-2.5 text-[13px] leading-6 text-slate-600 dark:text-slate-300">Track hours, move across dates, and review entry status from one clean workspace.</p>

              <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => shiftPeriod(-1)} className="theme-hover-accent rounded-full border border-slate-200 p-2 text-slate-500 transition dark:border-slate-700 dark:text-slate-300"><ChevronLeft size={14} /></button>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Focus</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{periodLabel}</p>
                  </div>
                  <button type="button" onClick={() => shiftPeriod(1)} className="theme-hover-accent rounded-full border border-slate-200 p-2 text-slate-500 transition dark:border-slate-700 dark:text-slate-300"><ChevronRight size={14} /></button>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1.5">
                  {miniCalendar.map((date) => {
                    const key = toDateKey(date);
                    const active = key && date >= periodRange.start && date <= periodRange.end;
                    const currentMonth = date.getMonth() === anchorDate.getMonth();
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAnchorDate(new Date(date))}
                        aria-label={`Select ${date.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}`}
                        className={`rounded-xl px-2 py-2 text-center text-[11px] transition hover:scale-[1.03] ${
                          active
                            ? "theme-solid"
                            : currentMonth
                              ? "theme-hover-accent text-slate-700 dark:text-slate-200"
                              : "text-slate-300 dark:text-slate-600"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                <Metric label="Logged Hours" value={formatHours(stats.totalHours)} icon={<Clock3 size={16} />} tone="primary" />
                <Metric label="Pending Entries" value={stats.pending} icon={<FileClock size={16} />} tone="sky" />
                <Metric label="Approved Hours" value={formatHours(stats.approved)} icon={<CalendarDays size={16} />} tone="emerald" />
                <Metric label="Projects Touched" value={stats.projects} icon={<Sparkles size={16} />} tone="slate" />
              </div>
            </aside>

            <div className="min-w-0 p-4 sm:p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                    {["day", "week", "month"].map((mode) => (
                      <button key={mode} type="button" onClick={() => setViewMode(mode)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition ${viewMode === mode ? "theme-tab-active" : "text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}>{mode}</button>
                    ))}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{viewTitle}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{viewDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:justify-end sm:shrink-0">
                  <button type="button" onClick={handleExportReport} className="theme-hover-accent inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Download size={15} />Export</button>
                  <Link href="/attendance/timesheets/add" className="theme-cta inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition"><Plus size={15} />Log Work</Link>
                </div>
              </div>

              {error ? <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">{error}</div> : null}

              {loading ? (
                <div className="mt-8 flex min-h-[360px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"><div className="theme-spinner h-10 w-10 animate-spin rounded-full border-4 border-r-transparent" /></div>
              ) : !filteredEntries.length ? (
                <div className="mt-8 flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
                  <Clock3 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Nothing logged here yet</h3>
                  <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">Shift the period or create a new entry to start building the workboard.</p>
                </div>
              ) : viewMode === "day" ? (
                <div className="mt-6 space-y-3">
                  <div className="grid gap-2.5 lg:grid-cols-[1fr_120px_140px]">
                    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Selected day</p>
                      <h3 className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-white">
                        {periodRange.start.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" })}
                      </h3>
                    </div>
                    <SummaryTile label="Entries" value={selectedDayEntries.length} />
                    <SummaryTile label="Total Hours" value={`${formatHours(selectedDayTotal)}h`} />
                  </div>

                  {!selectedDayEntries.length ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
                      <Clock3 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No entries for this day</h3>
                      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">Pick another date or add a new timesheet entry to start filling this day.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="hidden grid-cols-[minmax(0,1.8fr)_110px_120px_150px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800 dark:bg-slate-950/50 md:grid">
                        <div>Work</div>
                        <div>Hours</div>
                        <div>Status</div>
                        <div className="text-right">Actions</div>
                      </div>

                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {selectedDayEntries.map((entry) => (
                          <DailyEntryRow
                            key={entry.id}
                            entry={entry}
                            editingId={editingId}
                            editDraft={editDraft}
                            setEditDraft={setEditDraft}
                            startEdit={startEdit}
                            cancelEdit={cancelEdit}
                            saveEdit={saveEdit}
                            requestDelete={(row) => setDeleteState({ open: true, entry: row })}
                            canModify={canModify}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : viewMode === "week" ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Week overview</p>
                        <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{periodLabel}</h3>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-2 text-right dark:bg-slate-950">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Week total</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatHours(stats.totalHours)}h</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-7 gap-2">
                      {weekDays.map((day) => {
                        const isActive = day.key === activeWeekDay?.key;
                        const dayNumber = day.date.getDate();

                        return (
                          <button
                            key={day.key}
                            type="button"
                            onClick={() => setAnchorDate(new Date(day.date))}
                            className={`min-w-0 rounded-[14px] border px-2 py-2.5 text-left transition ${
                              isActive
                                ? "theme-soft-border theme-soft-surface shadow-sm"
                                : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40"
                            }`}
                          >
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-start">
                                <span className="shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white">{formatHours(day.total)}h</span>
                              </div>
                              <div>
                                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{day.label}</p>
                                <p className="mt-1 text-[18px] font-semibold leading-none text-slate-900 dark:text-white">{dayNumber}</p>
                              </div>
                              <p className="text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                                {day.entries.length} {day.entries.length === 1 ? "entry" : "entries"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-2.5 md:grid-cols-[minmax(0,1.6fr)_140px_160px]">
                    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Selected day</p>
                      <p className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-white">
                        {activeWeekDay ? `${activeWeekDay.label}, ${activeWeekDay.dayLabel}` : "-"}
                      </p>
                    </div>
                    <SummaryTile label="Day Entries" value={activeWeekDay?.entries.length || 0} />
                    <SummaryTile label="Day Total" value={`${formatHours(activeWeekDay?.total || 0)}h`} />
                  </div>

                  <section className="rounded-[22px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Selected day details</p>
                        <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                          {activeWeekDay ? `${activeWeekDay.label}, ${activeWeekDay.dayLabel}` : "-"}
                        </h3>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-2 text-right dark:bg-slate-950">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Total</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatHours(activeWeekDay?.total || 0)}h</p>
                      </div>
                    </div>

                    <div className="space-y-2 p-3">
                      {activeWeekDay?.entries.length ? activeWeekDay.entries.map((entry) => (
                        <EntryItem key={entry.id} entry={entry} editingId={editingId} editDraft={editDraft} setEditDraft={setEditDraft} startEdit={startEdit} cancelEdit={cancelEdit} saveEdit={saveEdit} requestDelete={(row) => setDeleteState({ open: true, entry: row })} canModify={canModify} />
                      )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">No entries for this day</div>}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="mt-6 space-y-2.5">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="grid gap-3 xl:grid-cols-[160px_1.2fr_0.7fr_140px]">
                        <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Date</p><p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{entry.displayDate}</p></div>
                        <EntryContent entry={entry} editingId={editingId} editDraft={editDraft} setEditDraft={setEditDraft} />
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Status</p>
                          {editingId === entry.id ? <input type="number" step="0.1" min="0" value={editDraft.hours} onChange={(event) => setEditDraft((prev) => ({ ...prev, hours: event.target.value }))} className="theme-input-focus w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" /> : <div className="flex flex-wrap items-center gap-3"><span className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 dark:bg-slate-950 dark:text-white">{formatHours(entry.hours)}h</span><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${entry.billable === false ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"}`}>{entry.billable === false ? "Non Billable" : "Billable"}</span><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClass(entry.status)}`}>{entry.status}</span></div>}
                        </div>
                        <div className="flex items-start justify-end gap-2">
                          <EntryActions entry={entry} editingId={editingId} saveEdit={saveEdit} cancelEdit={cancelEdit} startEdit={startEdit} requestDelete={(row) => setDeleteState({ open: true, entry: row })} canModify={canModify} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <ConfirmationDialog isOpen={deleteState.open} onClose={() => setDeleteState({ open: false, entry: null })} onConfirm={confirmDelete} title="Delete Timesheet?" message="This action will permanently remove the timesheet entry." confirmText="Delete" cancelText="Cancel" isDestructive />

      <style jsx>{`
        .theme-brand {
          color: var(--color-brand-600);
        }
        .theme-accent-text {
          color: var(--color-brand-600);
        }
        .theme-soft-surface {
          background: color-mix(in srgb, var(--color-brand-600) 10%, white);
        }
        .theme-soft-border {
          border-color: color-mix(in srgb, var(--color-brand-600) 20%, #cbd5e1);
        }
        .theme-solid {
          background: var(--color-brand-600);
          color: white;
        }
        .theme-cta {
          background: var(--color-brand-600);
          border-color: var(--color-brand-600);
          color: white;
          box-shadow: 0 10px 22px -14px rgba(var(--color-primary-rgb), 0.55);
        }
        .theme-cta:hover {
          background: color-mix(in srgb, var(--color-brand-600) 88%, #000);
          border-color: color-mix(in srgb, var(--color-brand-600) 88%, #000);
        }
        .theme-tab-active {
          background: var(--color-brand-600);
          color: white;
          box-shadow: 0 8px 18px -12px rgba(var(--color-primary-rgb), 0.45);
        }
        .theme-hover-accent:hover {
          border-color: var(--color-brand-600);
          color: var(--color-brand-600);
        }
        .theme-input-focus:focus {
          border-color: var(--color-brand-600);
        }
        .theme-spinner {
          border-color: var(--color-brand-600);
        }
      `}</style>
    </div>
  );
}

function Metric({ label, value, icon, tone }) {
  const tones = {
    primary: "theme-soft-border theme-soft-surface theme-accent-text",
    sky: "border-sky-200 bg-sky-50/80 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300",
    emerald: "border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
    slate: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
  };
  return <div className={`rounded-[18px] border px-3.5 py-3 ${tones[tone] || tones.slate}`}><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-75">{label}</p><p className="mt-1.5 text-xl font-semibold">{value}</p></div><div className="rounded-xl border border-current/10 bg-white/80 p-2.5 dark:bg-slate-950/60">{icon}</div></div></div>;
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function EntryContent({ entry, editingId, editDraft, setEditDraft }) {
  if (editingId === entry.id) {
    return <div className="space-y-2"><input value={editDraft.project} onChange={(event) => setEditDraft((prev) => ({ ...prev, project: event.target.value }))} className="theme-input-focus w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" placeholder="Project" /><input value={editDraft.task} onChange={(event) => setEditDraft((prev) => ({ ...prev, task: event.target.value }))} className="theme-input-focus w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" placeholder="Task" /></div>;
  }
  return <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Work</p><p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{entry.project || "-"}</p>{entry.projectCode ? <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{entry.projectCode}</p> : null}<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.description || entry.task || "-"}</p></div>;
}

function EntryActions({ entry, editingId, saveEdit, cancelEdit, startEdit, requestDelete, canModify }) {
  if (editingId === entry.id) {
    return <><button type="button" onClick={() => saveEdit(entry)} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"><Save size={13} />Save</button><button type="button" onClick={cancelEdit} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300"><X size={13} />Cancel</button></>;
  }
  if (!canModify(entry)) return null;
  return <>
    <button
      type="button"
      onClick={() => startEdit(entry)}
      title="Edit timesheet"
      aria-label="Edit timesheet"
      className="theme-hover-accent inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition dark:border-slate-700 dark:text-slate-300"
    >
      <Pencil size={14} />
    </button>
    <button
      type="button"
      onClick={() => requestDelete(entry)}
      title="Delete timesheet"
      aria-label="Delete timesheet"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300"
    >
      <Trash2 size={14} />
    </button>
  </>;
}

function EntryItem({ entry, editingId, editDraft, setEditDraft, startEdit, cancelEdit, saveEdit, requestDelete, canModify }) {
  if (editingId === entry.id) {
    return <div className="theme-soft-border rounded-[24px] border bg-white p-4 shadow-sm dark:bg-slate-950"><div className="space-y-3"><input value={editDraft.project} onChange={(event) => setEditDraft((prev) => ({ ...prev, project: event.target.value }))} className="theme-input-focus w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900" placeholder="Project" /><input value={editDraft.task} onChange={(event) => setEditDraft((prev) => ({ ...prev, task: event.target.value }))} className="theme-input-focus w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900" placeholder="Task" /><input type="number" step="0.1" min="0" value={editDraft.hours} onChange={(event) => setEditDraft((prev) => ({ ...prev, hours: event.target.value }))} className="theme-input-focus w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900" placeholder="Hours" /><div className="flex items-center gap-2"><button type="button" onClick={() => saveEdit(entry)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"><Save size={14} />Save</button><button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300"><X size={14} />Cancel</button></div></div></div>;
  }
  return <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{entry.project || "-"}</p>{entry.projectCode ? <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">{entry.projectCode}</p> : null}<p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{entry.description || entry.task || "-"}</p></div><div className="rounded-2xl bg-slate-50 px-3 py-2 text-right dark:bg-slate-900"><p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Hours</p><p className="text-sm font-semibold text-slate-900 dark:text-white">{formatHours(entry.hours)}h</p></div></div><div className="mt-3 flex flex-wrap items-center gap-2"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${entry.billable === false ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"}`}>{entry.billable === false ? "Non Billable" : "Billable"}</span><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClass(entry.status)}`}>{entry.status}</span>{canModify(entry) ? <><button type="button" onClick={() => startEdit(entry)} title="Edit timesheet" aria-label="Edit timesheet" className="theme-hover-accent inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition dark:border-slate-700 dark:text-slate-300"><Pencil size={12} /></button><button type="button" onClick={() => requestDelete(entry)} title="Delete timesheet" aria-label="Delete timesheet" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300"><Trash2 size={12} /></button></> : null}</div></div>;
}

function DailyEntryRow({ entry, editingId, editDraft, setEditDraft, startEdit, cancelEdit, saveEdit, requestDelete, canModify }) {
  const isEditing = editingId === entry.id;

  return (
    <div className="grid gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1.8fr)_110px_120px_150px] md:items-center">
      <div className="min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <input value={editDraft.project} onChange={(event) => setEditDraft((prev) => ({ ...prev, project: event.target.value }))} className="theme-input-focus w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" placeholder="Project" />
            <input value={editDraft.task} onChange={(event) => setEditDraft((prev) => ({ ...prev, task: event.target.value }))} className="theme-input-focus w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" placeholder="Task" />
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.project || "-"}</p>
            {entry.projectCode ? <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">{entry.projectCode}</p> : null}
            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{entry.description || entry.task || "-"}</p>
          </>
        )}
      </div>

      <div>
        {isEditing ? (
          <input type="number" step="0.1" min="0" value={editDraft.hours} onChange={(event) => setEditDraft((prev) => ({ ...prev, hours: event.target.value }))} className="theme-input-focus w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" placeholder="Hours" />
        ) : (
          <span className="inline-flex rounded-xl bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-900 dark:bg-slate-950 dark:text-white">{formatHours(entry.hours)}h</span>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${entry.billable === false ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"}`}>{entry.billable === false ? "Non Billable" : "Billable"}</span>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClass(entry.status)}`}>{entry.status}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:justify-end">
        <EntryActions entry={entry} editingId={editingId} saveEdit={saveEdit} cancelEdit={cancelEdit} startEdit={startEdit} requestDelete={requestDelete} canModify={canModify} />
      </div>
    </div>
  );
}
