"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Calendar, ChevronLeft, ChevronRight, Copy, Download, Eye, Mail, Search, Send, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { downloadExcel } from "@/utils/exportUtils";
import { managerTimesheetApprovalsService } from "@/services/manager-services/timesheet-approvals.service";

const keyOf = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};
const showDate = (v, opt = { day: "2-digit", month: "short", year: "numeric" }) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-GB", opt);
};
const weekStartOf = (v) => {
  const d = new Date(v);
  const n = d.getDay();
  d.setDate(d.getDate() - n + (n === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
};
const weekDaysOf = (s) => Array.from({ length: 7 }).map((_, i) => new Date(s.getFullYear(), s.getMonth(), s.getDate() + i));
const monthGridOf = (v) => {
  const f = new Date(v.getFullYear(), v.getMonth(), 1);
  const s = new Date(f);
  s.setDate(f.getDate() - ((f.getDay() + 6) % 7));
  return Array.from({ length: 35 }).map((_, i) => new Date(s.getFullYear(), s.getMonth(), s.getDate() + i));
};
const hours = (n) => Number(Number(n || 0).toFixed(2));
const badge = (s) => s === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : s === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" : s === "Submitted" ? "bg-sky-50 text-sky-700 border-sky-200" : "theme-soft-surface theme-accent-text border-[color:var(--color-primary)]/20";

export default function TeamTimesheetsPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");
  const [employee, setEmployee] = useState("all");
  const [project, setProject] = useState("all");
  const [query, setQuery] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const payload = await managerTimesheetApprovalsService.getApprovals();
        const list = payload?.timesheets || payload?.data?.timesheets || [];
        setEntries((Array.isArray(list) ? list : []).map((e) => ({
          id: e.id,
          employee: e.employee?.name || e.employeeName || e.employee || "Unknown Employee",
          project: e.project?.name || e.projectName || e.project || "Unassigned Project",
          task: e.task || e.description || e.taskDescription || "General Discussion",
          hours: hours(e.hours || e.totalHours || 0),
          date: e.date || new Date(),
          dateKey: keyOf(e.date || new Date()),
          status: String(e.status || "PENDING").toUpperCase() === "APPROVED" ? "Approved" : String(e.status || "PENDING").toUpperCase() === "REJECTED" ? "Rejected" : String(e.status || "PENDING").toUpperCase() === "SUBMITTED" ? "Submitted" : "Pending",
          workType: String(e.project?.name || e.projectName || e.project || "").toLowerCase().includes("non billable") ? "Non Billable" : "Billable"
        })));
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load team timesheets");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const weekStart = useMemo(() => weekStartOf(selectedDate), [selectedDate]);
  const weekEnd = useMemo(() => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6), [weekStart]);
  const weekDays = useMemo(() => weekDaysOf(weekStart), [weekStart]);
  const gridDays = useMemo(() => monthGridOf(selectedDate), [selectedDate]);
  const selectedKey = keyOf(selectedDate);
  const employees = useMemo(() => [...new Set(entries.map((e) => e.employee))].sort(), [entries]);
  const projects = useMemo(() => [...new Set(entries.map((e) => e.project))].sort(), [entries]);

  const filtered = useMemo(() => entries.filter((e) => {
    const d = new Date(e.date);
    const inWeek = d >= weekStart && d <= weekEnd;
    const byEmp = employee === "all" || e.employee === employee;
    const byProj = project === "all" || e.project === project;
    const byQuery = !query.trim() || `${e.employee} ${e.project} ${e.task}`.toLowerCase().includes(query.trim().toLowerCase());
    return inWeek && byEmp && byProj && byQuery;
  }), [entries, weekStart, weekEnd, employee, project, query]);

  const weeklyRows = useMemo(() => {
    const m = new Map();
    filtered.forEach((e) => {
      const k = `${e.employee}__${e.project}__${e.task}`;
      if (!m.has(k)) m.set(k, { key: k, employee: e.employee, project: e.project, task: e.task, workType: e.workType, status: e.status, total: 0, daily: Object.fromEntries(weekDays.map((d) => [keyOf(d), 0])) });
      const row = m.get(k);
      row.daily[e.dateKey] = hours(row.daily[e.dateKey] + e.hours);
      row.total = hours(row.total + e.hours);
    });
    return Array.from(m.values());
  }, [filtered, weekDays]);

  const dayRows = useMemo(() => filtered.filter((e) => e.dateKey === selectedKey), [filtered, selectedKey]);
  const reportRows = viewMode === "day" ? dayRows : filtered;

  const nav = (dir) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (viewMode === "day" ? dir : dir * 7));
    setSelectedDate(d);
  };
  const copySheet = async () => {
    try { await navigator.clipboard.writeText(reportRows.map((r) => `${r.employee} | ${r.project} | ${r.task} | ${r.hours}h`).join("\n")); toast.success("Timesheet copied"); }
    catch { toast.error("Failed to copy timesheet"); }
  };
  const exportSheet = () => downloadExcel({ columns: [{ label: "Employee", key: "employee" }, { label: "Project", key: "project" }, { label: "Task", key: "task" }, { label: "Hours", key: "hours" }], rows: reportRows, fileName: `team-timesheets-${keyOf(new Date())}.xlsx` });

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-4 dark:bg-slate-950 sm:p-6">
      <div className="space-y-5">
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Timesheet Management", href: "/attendance/timesheets/team" }, { label: "Team Timesheets" }]} />
        {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="grid gap-4 xl:grid-cols-[250px_1fr]">
          <aside className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, selectedDate.getDate()))} className="rounded-md p-1 text-gray-500 hover:bg-gray-100"><ChevronLeft size={16} /></button>
                <p className="text-sm font-semibold text-gray-900">{selectedDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
                <button type="button" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate()))} className="rounded-md p-1 text-gray-500 hover:bg-gray-100"><ChevronRight size={16} /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}</div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {gridDays.map((d) => {
                  const k = keyOf(d); const active = k === selectedKey; const inWeek = d >= weekStart && d <= weekEnd; const current = d.getMonth() === selectedDate.getMonth();
                  return <button key={k} type="button" onClick={() => setSelectedDate(d)} className={`h-8 rounded-md text-xs ${active ? "theme-solid" : inWeek ? "theme-soft-surface theme-accent-text" : current ? "text-gray-700 hover:bg-gray-100" : "text-gray-300"}`}>{d.getDate()}</button>;
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
              <Field label="User"><select value={employee} onChange={(e) => setEmployee(e.target.value)} className="field"><option value="all">All Employees</option>{employees.map((v) => <option key={v} value={v}>{v}</option>)}</select></Field>
              <Field label="Project"><select value={project} onChange={(e) => setProject(e.target.value)} className="field"><option value="all">All Projects</option>{projects.map((v) => <option key={v} value={v}>{v}</option>)}</select></Field>
              <Field label="Search"><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Project, task, employee" className="field pl-9" /></div></Field>
            </div>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{viewMode === "day" ? showDate(selectedDate, { weekday: "long", day: "numeric", month: "short", year: "numeric" }) : `${showDate(weekStart, { day: "numeric", month: "short" })} - ${showDate(weekEnd, { day: "numeric", month: "short", year: "numeric" })}`}</h1>
                  <p className="mt-1 text-sm text-gray-500">{viewMode === "day" ? "Daily review for HR admin" : "Weekly planner view for team timesheets"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setReportOpen(true)} className="theme-solid inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold hover:opacity-90"><Send size={14} />{viewMode === "day" ? "Send Daily Report" : "Send Weekly Report"}</button>
                  <button type="button" onClick={copySheet} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"><Copy size={14} />Copy Time Sheet</button>
                  <button type="button" onClick={exportSheet} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"><Download size={14} />Export</button>
                  <div className="inline-flex rounded-md border border-gray-300 bg-white p-1"><button type="button" onClick={() => setViewMode("day")} className={`rounded px-3 py-1 text-xs font-semibold ${viewMode === "day" ? "bg-gray-900 text-white" : "text-gray-600"}`}>Day</button><button type="button" onClick={() => setViewMode("week")} className={`rounded px-3 py-1 text-xs font-semibold ${viewMode === "week" ? "bg-gray-900 text-white" : "text-gray-600"}`}>Week</button></div>
                  <button type="button" onClick={() => nav(-1)} className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"><ChevronLeft size={14} /></button>
                  <button type="button" onClick={() => setSelectedDate(new Date())} className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Today</button>
                  <button type="button" onClick={() => nav(1)} className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"><ChevronRight size={14} /></button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Card label="Total Week Hours" value={hours(filtered.reduce((s, e) => s + e.hours, 0)).toFixed(2)} icon={<Calendar size={16} />} />
                <Card label="Selected Day Hours" value={hours(dayRows.reduce((s, e) => s + e.hours, 0)).toFixed(2)} icon={<Mail size={16} />} />
                <Card label="Visible Employees" value={new Set(filtered.map((e) => e.employee)).size} icon={<Users size={16} />} />
              </div>
            </div>

            {loading ? <div className="p-10 text-center text-sm text-gray-500">Loading team timesheets...</div> : viewMode === "week" ? (
              <div className="overflow-x-auto">
                <table className="min-w-[1180px] w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Project / Task</th><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Work Type</th>{weekDays.map((d) => <th key={keyOf(d)} className="px-3 py-3 text-center"><div>{d.toLocaleDateString("en-GB", { weekday: "short" })}</div><div className="text-[10px] font-normal">{showDate(d, { day: "numeric", month: "short" })}</div></th>)}<th className="px-4 py-3 text-center">Total</th><th className="px-4 py-3 text-center">Action</th></tr></thead>
                  <tbody>{weeklyRows.length ? weeklyRows.map((r) => <tr key={r.key} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-4 py-4"><div className="font-semibold text-gray-900">{r.project}</div><div className="mt-1 text-xs text-gray-500">{r.task}</div></td><td className="px-4 py-4"><div className="text-sm font-medium text-gray-700">{r.employee}</div></td><td className="px-4 py-4"><div className="text-sm font-medium text-gray-700">Design</div><div className="mt-1 text-xs text-gray-500">{r.workType}</div></td>{weekDays.map((d) => <td key={`${r.key}-${keyOf(d)}`} className="px-3 py-4 text-center font-medium text-gray-800">{hours(r.daily[keyOf(d)] || 0).toFixed(2)}</td>)}<td className="px-4 py-4 text-center font-semibold text-gray-900">{r.total.toFixed(2)}</td><td className="px-4 py-4 text-center"><button type="button" onClick={() => setReportOpen(true)} className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"><Eye size={14} /></button></td></tr>) : <tr><td colSpan={12} className="px-6 py-12 text-center text-sm text-gray-500">No timesheet entries found for the selected filters.</td></tr>}</tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Project / Task</th><th className="px-4 py-3">Quoted Hours</th><th className="px-4 py-3">Work Type</th><th className="px-4 py-3">Description</th><th className="px-4 py-3 text-center">Time</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Action</th></tr></thead>
                  <tbody>{dayRows.length ? dayRows.map((r) => <tr key={`${r.id}-${r.dateKey}`} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-4 py-4"><div className="font-semibold text-gray-900">{r.project}</div><div className="mt-1 text-xs text-gray-500">{r.task}</div></td><td className="px-4 py-4 text-gray-600">-</td><td className="px-4 py-4 text-gray-700">Design</td><td className="px-4 py-4 text-gray-600">{r.task}</td><td className="px-4 py-4 text-center font-semibold text-gray-900">{r.hours.toFixed(2)}</td><td className="px-4 py-4 text-center"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${badge(r.status)}`}>{r.status}</span></td><td className="px-4 py-4 text-center"><button type="button" onClick={() => setReportOpen(true)} className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"><Eye size={14} /></button></td></tr>) : <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">No daily entries found for the selected date.</td></tr>}</tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {reportOpen ? <ReportModal rows={reportRows} title={viewMode === "day" ? "Send Daily Report" : "Send Weekly Report"} onClose={() => setReportOpen(false)} onSend={() => { toast.success(viewMode === "day" ? "Daily report queued" : "Weekly report queued"); setReportOpen(false); }} /> : null}

      <style jsx>{`
        .field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          background: #fff;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
        }
        .field:focus {
          border-color: var(--color-primary);
        }
        .theme-solid {
          background: var(--color-primary);
          color: white;
        }
        .theme-accent-text {
          color: var(--color-primary);
        }
        .theme-soft-surface {
          background: color-mix(in srgb, var(--color-secondary) 72%, white);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) { return <label className="block space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>{children}</label>; }
function Card({ label, value, icon }) { return <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 text-lg font-semibold text-gray-900">{value}</p></div><div className="rounded-lg bg-white p-2 text-gray-600 shadow-sm">{icon}</div></div></div>; }

function ReportModal({ rows, title, onClose, onSend }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4"><div><h3 className="text-lg font-semibold text-gray-900">Email Preview</h3><p className="text-xs text-gray-500">{title}</p></div><button type="button" onClick={onClose} className="rounded-md p-2 text-gray-500 hover:bg-gray-100">×</button></div>
        <div className="space-y-5 px-5 py-4">
          <div className="flex flex-wrap gap-2">{["HR Review", "Selected Team", "Report"].map((item) => <span key={item} className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">{item}</span>)}</div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm"><thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Task</th><th className="px-4 py-3 text-right">Hours</th></tr></thead><tbody>{rows.map((r, i) => <tr key={`${r.employee}-${i}`} className="border-t border-gray-100"><td className="px-4 py-3 text-gray-700">{r.employee}</td><td className="px-4 py-3 font-medium text-gray-900">{r.project}</td><td className="px-4 py-3 text-gray-600">{r.task}</td><td className="px-4 py-3 text-right font-semibold text-gray-900">{r.hours.toFixed(2)}</td></tr>)}<tr className="border-t border-gray-200 bg-gray-50"><td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Total Hours</td><td className="px-4 py-3 text-right font-bold text-gray-900">{rows.reduce((s, r) => s + r.hours, 0).toFixed(2)}</td></tr></tbody></table>
          </div>
          <textarea rows={4} placeholder="Type more detail here..." className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-[color:var(--color-primary)]" />
        </div>
        <div className="flex justify-end border-t border-gray-200 px-5 py-4"><button type="button" onClick={onSend} className="theme-solid inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"><Mail size={14} />{title}</button></div>
      </div>
    </div>
  );
}
