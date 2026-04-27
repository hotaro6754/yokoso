"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import {
  Calendar,
  ArrowLeft,
  Save,
  X,
  Users,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Target
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import Link from "next/link";

export default function EditAppraisalCyclePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cycle, setCycle] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    quarter: "Q1",
    startDate: "",
    endDate: "",
    employeeSubmissionDeadline: "",
    description: "",
    status: "DRAFT",
    evaluationParameters: []
  });

  const [newMetric, setNewMetric] = useState({ name: "", description: "", weight: 0 });

  // Unwrap params using React.use()
  const cycleId = params?.id;

  useEffect(() => {
    if (cycleId) {
      fetchCycleDetails();
    }
  }, [cycleId]);

  const fetchCycleDetails = async () => {
    try {
      setLoading(true);
      const data = await performanceManagementService.getAppraisalCycleById(cycleId);
      const cycleData = data?.data ?? data;
      
      if (!cycleData) {
        throw new Error("Appraisal cycle not found");
      }
      setCycle(cycleData);

      // Helper to format date to YYYY-MM-DD
      const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split('T')[0];
      };

      // Populate form with existing data
      setFormData({
        name: cycleData.name || "",
        year: cycleData.year || (cycleData.startDate ? new Date(cycleData.startDate).getFullYear() : new Date().getFullYear()),
        quarter: cycleData.quarter || "Q1",
        startDate: formatDate(cycleData.startDate),
        endDate: formatDate(cycleData.endDate),
        employeeSubmissionDeadline: formatDate(cycleData.employeeSubmissionDeadline),
        description: cycleData.description || "",
        status: cycleData.status || "DRAFT",
        evaluationParameters: cycleData.evaluationParameters || []
      });
    } catch (error) {
      console.error("Error fetching cycle details:", error);
      toast.error("Failed to load appraisal cycle details");
      router.push("/hr/performance/appraisal-cycles");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Cycle name is required");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Start date and end date are required");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    if (!formData.employeeSubmissionDeadline) {
      toast.error("Employee submission deadline is required");
      return;
    }

    // Check if cycle is active - if so, restrict certain fields
    if (cycle.status === 'ACTIVE') {
      toast.error("Cannot modify an active cycle. Please close the cycle first.");
      return;
    }

    try {
      setSaving(true);

      // Prepare data for API
      const cycleData = {
        name: formData.name,
        year: formData.year,
        quarter: formData.quarter,
        startDate: formData.startDate,
        endDate: formData.endDate,
        employeeSubmissionDeadline: formData.employeeSubmissionDeadline,
        description: formData.description,
        status: formData.status,
        evaluationParameters: formData.evaluationParameters
      };

      // Call API to update appraisal cycle
      await performanceManagementService.updateAppraisalCycle(cycleId, cycleData);

      toast.success("Appraisal cycle updated successfully");
      router.push(`/hr/performance/appraisal-cycles/${cycleId}`);
    } catch (error) {
      console.error("Error updating appraisal cycle:", error);
      toast.error(error.message || "Failed to update appraisal cycle");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/hr/performance/appraisal-cycles/${cycleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Appraisal cycle not found
          </h2>
          <Link
            href="/hr/performance/appraisal-cycles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[#0b1220] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Cycles
          </Link>
        </div>
      </div>
    );
  }

  const isReadOnly = cycle.status === 'ACTIVE' || cycle.status === 'IN_PROGRESS' || cycle.status === 'COMPLETED' || cycle.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Performance", href: "/hr/performance" },
          { label: "Appraisal Cycles", href: "/hr/performance/appraisal-cycles" },
          { label: cycle.name, href: `/hr/performance/appraisal-cycles/${cycleId}` },
          { label: "Edit", href: `/hr/performance/appraisal-cycles/${cycleId}/edit` },
        ]}
      />

      <div className="my-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/hr/performance/appraisal-cycles`}
            className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            title="Back"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[var(--color-primary-hover)] p-3 text-[#0b1220] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)]">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Appraisal Cycle
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update appraisal cycle information
              </p>
            </div>
          </div>
        </div>

        {isReadOnly && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <p className="font-medium mb-1">Read-Only Mode:</p>
                <p className="text-yellow-700 dark:text-yellow-400">
                  This cycle is {cycle.status.toLowerCase()}. Only draft cycles can be modified.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cycle Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Q1 2025 Appraisal Cycle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="2020"
                max="2030"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quarter *
              </label>
              <select
                name="quarter"
                value={formData.quarter}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isReadOnly}
              >
                <option value="Q1">Q1 (Jan-Mar)</option>
                <option value="Q2">Q2 (Apr-Jun)</option>
                <option value="Q3">Q3 (Jul-Sep)</option>
                <option value="Q4">Q4 (Oct-Dec)</option>
                <option value="ANNUAL">Annual (Jan-Dec)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Deadlines */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={20} />
              Submission Deadlines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee Submission Deadline *
                </label>
                <input
                  type="date"
                  name="employeeSubmissionDeadline"
                  value={formData.employeeSubmissionDeadline}
                  onChange={handleInputChange}
                  min={formData.startDate}
                  max={formData.endDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-lg">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-[#0b1220] dark:text-[var(--color-primary)]">
                <li>Employee submission deadline must be within the cycle period</li>
                <li>Once activated, the cycle cannot be modified</li>
                <li>Employees will be notified based on the submission deadline</li>
              </ul>
            </div>
          </div>

          {/* Metrics Template */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Target size={20} className="text-blue-600" />
                  Evaluation Metrics Template
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Define the metrics that will be used to evaluate employees in this cycle.</p>
              </div>
            </div>

            <div className="space-y-4">
              {formData.evaluationParameters.map((metric, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 relative group">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Metric Name</label>
                      <input
                        type="text"
                        value={metric.name}
                        disabled={isReadOnly}
                        onChange={(e) => {
                          const newParams = [...formData.evaluationParameters];
                          newParams[index].name = e.target.value;
                          setFormData({ ...formData, evaluationParameters: newParams });
                        }}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Brief Description</label>
                      <input
                        type="text"
                        value={metric.description}
                        disabled={isReadOnly}
                        onChange={(e) => {
                          const newParams = [...formData.evaluationParameters];
                          newParams[index].description = e.target.value;
                          setFormData({ ...formData, evaluationParameters: newParams });
                        }}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
                      />
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        const newParams = formData.evaluationParameters.filter((_, i) => i !== index);
                        setFormData({ ...formData, evaluationParameters: newParams });
                      }}
                      className="self-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}

              {!isReadOnly && (
                <div className="flex gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="New Metric Name (e.g. Quality of Work)"
                      value={newMetric.name}
                      onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Short description..."
                      value={newMetric.description}
                      onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMetric.name) return toast.error("Metric name is required");
                      setFormData({
                        ...formData,
                        evaluationParameters: [...formData.evaluationParameters, { ...newMetric, id: Date.now() }]
                      });
                      setNewMetric({ name: "", description: "", weight: 0 });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold h-fit self-center"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe the appraisal cycle, objectives, and any special instructions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isReadOnly}
            />
          </div>

          {/* Info Box */}
          <div className="bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/60 dark:border-[var(--color-primary)]/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-[#0b1220] dark:text-[var(--color-primary)] mt-0.5" />
              <div className="text-sm text-[#0b1220] dark:text-[var(--color-primary)]">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-[#0b1220] dark:text-[var(--color-primary)]">
                  <li>All dates must be within the cycle period</li>
                  <li>Deadlines should be in chronological order</li>
                  <li>Once activated, the cycle cannot be modified</li>
                  <li>Employees will be notified based on these deadlines</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-[#0b1220] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
