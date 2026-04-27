"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { managerTeamService } from "@/services/manager-services/team.service";
import { managerPerformanceService } from "@/services/manager-services/performance-management.service";
import { toast } from "react-hot-toast";

export default function AssignGoalPage() {
  const router = useRouter();
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalType, setGoalType] = useState("Individual");
  const [priority, setPriority] = useState("Medium");
  const [weightage, setWeightage] = useState("");
  const [assignTo, setAssignTo] = useState([]);
  const [period, setPeriod] = useState("Quarterly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [measurementType, setMeasurementType] = useState("% Progress");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [selectedKpis, setSelectedKpis] = useState([]);
  const [kpiWeights, setKpiWeights] = useState({});
  const [instructions, setInstructions] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [milestones, setMilestones] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "Performance Management", href: "/manager/performance-management" },
    { label: "Assign Goal", href: "/manager/performance-management/assign-goal" },
  ];

  const weightageError = useMemo(() => {
    const value = Number(weightage);
    if (Number.isNaN(value)) return "";
    if (value < 0 || value > 100) return "Weightage must be between 0 and 100.";
    return "";
  }, [weightage]);

  const toggleAssignTo = (id) => {
    setAssignTo((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleKpi = (id) => {
    setSelectedKpis((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id);
        setKpiWeights((weights) => {
          const copy = { ...weights };
          delete copy[id];
          return copy;
        });
        return next;
      }
      return [...prev, id];
    });
  };

  const updateKpiWeight = (id, value) => {
    setKpiWeights((prev) => ({ ...prev, [id]: value }));
  };

  const addMilestone = () => {
    setMilestones((prev) => [...prev, { name: "", date: "", notes: "" }]);
  };

  const updateMilestone = (index, key, value) => {
    setMilestones((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const removeMilestone = (index) => {
    setMilestones((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveDraft = () => {
    // UI only: no persistence yet.
    toast.success("Draft saved locally (demo).");
  };

  const handleAssign = async () => {
    if (!goalTitle.trim() || !goalDescription.trim() || !assignTo.length) {
      const message = "Please fill mandatory fields (Title, Description, Assign To).";
      setError(message);
      toast.error(message);
      return;
    }
    if (weightageError) {
      setError(weightageError);
      toast.error(weightageError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await managerPerformanceService.createGoals({
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        employeeIds: assignTo,
        targetValue,
        unit,
        dueDate: endDate || null
      });
      toast.success("Goal assigned successfully.");
      router.push("/manager/performance-management");
    } catch (err) {
      const message = err?.message || "Unable to assign goal";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [teamData, kpiData] = await Promise.all([
          managerTeamService.getTeamOverview(),
          managerPerformanceService.getKpis()
        ]);
        if (!active) return;
        const normalizedTeam = Array.isArray(teamData)
          ? teamData
          : teamData?.teamMembers || teamData?.team || teamData?.data || [];
        const normalizedKpis = Array.isArray(kpiData)
          ? kpiData
          : kpiData?.kpis || kpiData?.data || [];
        setTeamMembers(normalizedTeam);
        setKpis(normalizedKpis);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load assignment data");
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700 p-6 shadow-sm space-y-6">
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Goal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Goal Title *</label>
                <input
                  value={goalTitle}
                  maxLength={100}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-gray-200"
                  placeholder="Increase Campaign Reach"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Goal Type *</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-gray-200"
                >
                  <option>Individual</option>
                  <option>Team</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-gray-200"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Weightage (%) *</label>
                <input
                  type="number"
                  value={weightage}
                  onChange={(e) => setWeightage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-gray-200"
                  placeholder="0 - 100"
                />
                {weightageError && (
                  <p className="text-xs text-rose-600 mt-1">{weightageError}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Goal Description *</label>
              <textarea
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-gray-200"
                placeholder="Describe what needs to be achieved."
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Assignment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Assign To *</label>
                <div className="mt-2 space-y-2">
                  {teamMembers.map((member) => (
                    <label key={member.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={assignTo.includes(member.id)}
                        onChange={() => toggleAssignTo(member.id)}
                      />
                      {member.name} ({member.designation})
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Reporting Period *</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-gray-200"
                >
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Annual</option>
                </select>
                <div className="mt-4">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Reviewing Manager</label>
                  <input
                    value="Auto-assigned"
                    disabled
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm text-gray-500"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Start Date *</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onFocus={(e) => e.target.showPicker?.()}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 pr-10 text-sm text-gray-900 dark:text-gray-200"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">End Date *</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onFocus={(e) => e.target.showPicker?.()}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 pr-10 text-sm text-gray-900 dark:text-gray-200"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Milestones (optional)</h3>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Plus size={12} /> Add Row
                </button>
              </div>
              {milestones.map((milestone, index) => (
                <div key={`${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    value={milestone.name}
                    onChange={(e) => updateMilestone(index, "name", e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                    placeholder="Milestone name"
                  />
                  <input
                    type="date"
                    value={milestone.date}
                    onChange={(e) => updateMilestone(index, "date", e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                  />
                  <input
                    value={milestone.notes}
                    onChange={(e) => updateMilestone(index, "notes", e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                    placeholder="Notes"
                  />
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="inline-flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Success Metric</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Measurement Type *</label>
                <select
                  value={measurementType}
                  onChange={(e) => setMeasurementType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                >
                  <option>% Progress</option>
                  <option>Numeric Target</option>
                  <option>Milestone Based</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Target Value *</label>
                <input
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                  placeholder="20% growth / 500 leads"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Unit of Measure (%)</label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Progress Update Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>End-cycle</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">KPI Linking</h2>
            <div className="space-y-3">
              {kpis.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No KPIs defined yet.</p>
              ) : null}
              {kpis.map((kpi) => (
                <div key={kpi.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedKpis.includes(kpi.id)}
                      onChange={() => toggleKpi(kpi.id)}
                    />
                    {kpi.name}
                  </label>
                  <input
                    value={kpiWeights[kpi.id] || ""}
                    onChange={(e) => updateKpiWeight(kpi.id, e.target.value)}
                    className="w-full md:w-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                    placeholder="Weight %"
                    disabled={!selectedKpis.includes(kpi.id)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Visibility & Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Instructions to Employee</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Private Manager Notes</label>
                <textarea
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={() => setAllowComments((prev) => !prev)}
              />
              Allow employee comments
            </label>
          </section>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleAssign}
              className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Assigning..." : "Assign Goal"}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
