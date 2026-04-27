"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { CheckCircle2, Save } from "lucide-react";
import { managerTeamService } from "@/services/manager-services/team.service";
import { managerPerformanceService } from "@/services/manager-services/performance-management.service";
import { toast } from "react-hot-toast";

export default function DefineKpisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kpiIdParam = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const isViewMode = modeParam === "view";
  const isEditMode = modeParam === "edit";
  const isEditPage = isViewMode || isEditMode;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [appliesTo, setAppliesTo] = useState([]);
  const [kpiType, setKpiType] = useState("Quantitative");
  const [measurementStyle, setMeasurementStyle] = useState("Percentage");
  const [targetValue, setTargetValue] = useState("");
  const [minAcceptable, setMinAcceptable] = useState("");
  const [stretchTarget, setStretchTarget] = useState("");
  const [weight, setWeight] = useState("");
  const [ratingScale, setRatingScale] = useState("1-5");
  const [autoScore, setAutoScore] = useState(true);
  const [whoUpdates, setWhoUpdates] = useState("Employee");
  const [frequency, setFrequency] = useState("Monthly");
  const [evidenceRequired, setEvidenceRequired] = useState(false);
  const [status, setStatus] = useState("Active");
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingKpi, setIsLoadingKpi] = useState(false);

  const normalizedStatus = useMemo(
    () =>
      status === "Active"
        ? "ACTIVE"
        : status === "Inactive"
          ? "INACTIVE"
          : status,
    [status],
  );

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    {
      label: "Performance Management",
      href: "/manager/performance-management",
    },
    {
      label: "Define KPIs",
      href: "/manager/performance-management/define-kpis",
    },
  ];

  const toggleAppliesTo = (id) => {
    setAppliesTo((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (
      !name.trim() ||
      !description.trim() ||
      targetValue === "" ||
      targetValue === null ||
      targetValue === undefined
    ) {
      setError("Please fill KPI Name, Description and Target Value.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const payload = {
        name: name.trim(),
        description: description.trim(),
        kpiType,
        measurementStyle,
        targetValue,
        minAcceptable,
        stretchTarget,
        weight,
        ratingScale,
        autoScore,
        whoUpdates,
        frequency,
        evidenceRequired,
        status: normalizedStatus,
        appliesTo,
      };

      if (isEditMode && kpiIdParam) {
        await managerPerformanceService.updateKpi(kpiIdParam, payload);
        toast.success("KPI updated successfully.");
        router.push("/manager/performance-management");
      } else {
        await managerPerformanceService.createKpi(payload);
        toast.success("KPI saved successfully.");
        router.push("/manager/performance-management");
      }
    } catch (err) {
      const message = err?.message || "Unable to save KPI";
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
        const teamData = await managerTeamService.getTeamOverview();
        if (!active) return;
        const normalized = Array.isArray(teamData)
          ? teamData
          : teamData?.teamMembers || teamData?.team || teamData?.data || [];
        setTeamMembers(normalized);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load team members");
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadKpi = async () => {
      if (!kpiIdParam) return;
      try {
        setIsLoadingKpi(true);
        const kpi = await managerPerformanceService.getKpiById(kpiIdParam);
        if (!active) return;
        setName(kpi?.name || "");
        setDescription(kpi?.description || "");
        setKpiType(kpi?.kpiType || "Quantitative");
        setMeasurementStyle(kpi?.measurementStyle || "Percentage");
        setTargetValue(kpi?.targetValue ?? "");
        setMinAcceptable(kpi?.minAcceptable ?? "");
        setStretchTarget(kpi?.stretchTarget ?? "");
        setWeight(kpi?.weight ?? "");
        setRatingScale(kpi?.ratingScale || "1-5");
        setAutoScore(kpi?.autoScore ?? true);
        setWhoUpdates(kpi?.whoUpdates || "Employee");
        setFrequency(kpi?.frequency || "Monthly");
        setEvidenceRequired(kpi?.evidenceRequired ?? false);
        setStatus(
          kpi?.status === "ACTIVE"
            ? "Active"
            : kpi?.status === "INACTIVE"
              ? "Inactive"
              : "Active",
        );
        setAppliesTo(kpi?.appliesTo || []);
      } catch (err) {
        if (!active) return;
        const message = err?.message || "Unable to load KPI";
        setError(message);
        toast.error(message);
      } finally {
        if (active) setIsLoadingKpi(false);
      }
    };

    loadKpi();

    return () => {
      active = false;
    };
  }, [kpiIdParam]);

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
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              KPI Basic Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  KPI Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                  placeholder="Enter KPI name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Applies To (optional)
                </label>
                <div className="mt-2 space-y-2">
                  {teamMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={appliesTo.includes(member.id)}
                        onChange={() => toggleAppliesTo(member.id)}
                        disabled={isViewMode || isLoadingKpi}
                      />
                      {member.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">
                KPI Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isViewMode || isLoadingKpi}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                placeholder="Describe what this KPI measures"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Measurement Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  KPI Type *
                </label>
                <select
                  value={kpiType}
                  onChange={(e) => setKpiType(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                >
                  <option>Quantitative</option>
                  <option>Qualitative</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Measurement Style *
                </label>
                <select
                  value={measurementStyle}
                  onChange={(e) => setMeasurementStyle(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                >
                  <option>Numeric</option>
                  <option>Percentage</option>
                  <option>Rating</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Target Value *
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                  placeholder="e.g. 75"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Minimum Acceptable
                </label>
                <input
                  type="number"
                  value={minAcceptable}
                  onChange={(e) => setMinAcceptable(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                  placeholder="e.g. 50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Stretch Target
                </label>
                <input
                  type="number"
                  value={stretchTarget}
                  onChange={(e) => setStretchTarget(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                  placeholder="e.g. 90"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Scoring & Weight
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  KPI Weight (%)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                  placeholder="e.g. 20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Rating Scale
                </label>
                <select
                  value={ratingScale}
                  onChange={(e) => setRatingScale(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                >
                  <option>1-5</option>
                  <option>1-10</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={autoScore}
                  onChange={() => setAutoScore((p) => !p)}
                  disabled={isViewMode || isLoadingKpi}
                />
                Auto score calculation
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Tracking Rules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Who Updates KPI
                </label>
                <select
                  value={whoUpdates}
                  onChange={(e) => setWhoUpdates(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                >
                  <option>Employee</option>
                  <option>Manager</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Update Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={evidenceRequired}
                  onChange={() => setEvidenceRequired((p) => !p)}
                  disabled={isViewMode || isLoadingKpi}
                />
                Evidence required
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  KPI Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isViewMode || isLoadingKpi}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Used In Goals
                </label>
                <input
                  value="None (demo)"
                  disabled
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm text-gray-500"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            {!isViewMode ? (
              <>
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 inline-flex items-center gap-2"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  <Save size={14} />{" "}
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                      ? "Save Changes"
                      : "Save KPI"}
                </button>
                {!isEditMode ? (
                  <button
                    type="button"
                    className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-2"
                    onClick={handleSave}
                    disabled={isSubmitting}
                  >
                    <CheckCircle2 size={14} />{" "}
                    {isSubmitting ? "Saving..." : "Save & Activate"}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
