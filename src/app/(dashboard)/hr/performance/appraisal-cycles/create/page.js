"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import DatePickerField from "@/components/form/input/DatePickerField";

export default function CreateAppraisalCyclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    // Auto-fill dates when component loads
    autoFillDates(formData.year, formData.quarter);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill dates based on quarter selection
    if (name === 'quarter' || name === 'year') {
      const year = name === 'year' ? value : formData.year;
      const quarter = name === 'quarter' ? value : formData.quarter;
      autoFillDates(year, quarter);
    }
  };

  const autoFillDates = (year, quarter) => {
    const quarterDates = {
      Q1: { start: `${year}-01-01`, end: `${year}-03-31` },
      Q2: { start: `${year}-04-01`, end: `${year}-06-30` },
      Q3: { start: `${year}-07-01`, end: `${year}-09-30` },
      Q4: { start: `${year}-10-01`, end: `${year}-12-31` },
      ANNUAL: { start: `${year}-01-01`, end: `${year}-12-31` }
    };

    const dates = quarterDates[quarter];
    if (dates) {
      setFormData(prev => ({
        ...prev,
        startDate: dates.start,
        endDate: dates.end,
        // Don't auto-fill deadlines - let user select manually
        employeeSubmissionDeadline: prev.employeeSubmissionDeadline || ''
      }));
    }
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

    try {
      setLoading(true);

      // Helper to ensure YYYY-MM-DD format
      const ensureYYYYMMDD = (dateStr) => {
        if (!dateStr) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
          const [day, month, year] = dateStr.split("-");
          return `${year}-${month}-${day}`;
        }
        return dateStr;
      };

      // Prepare data for API
      const cycleData = {
        name: formData.name,
        year: formData.year,
        quarter: formData.quarter,
        startDate: ensureYYYYMMDD(formData.startDate),
        endDate: ensureYYYYMMDD(formData.endDate),
        employeeSubmissionDeadline: ensureYYYYMMDD(formData.employeeSubmissionDeadline),
        description: formData.description,
        status: formData.status,
        evaluationParameters: formData.evaluationParameters
      };

      // Call API to create appraisal cycle
      await performanceManagementService.createAppraisalCycle(cycleData);

      toast.success("Appraisal cycle created successfully");
      router.push("/hr/performance/appraisal-cycles");
    } catch (error) {
      console.error("Error creating appraisal cycle:", error);
      toast.error(error.message || "Failed to create appraisal cycle");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/hr/performance/appraisal-cycles");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Performance", href: "/hr/performance" },
          { label: "Appraisal Cycles", href: "/hr/performance/appraisal-cycles" },
          { label: "Create Cycle", href: "/hr/performance/appraisal-cycles/create" },
        ]}
      />

      <div className="mt-4">
        <Link
          href="/hr/performance/appraisal-cycles"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          title="Back"
        >
          <ArrowLeft size={16} />
        </Link>
      </div>

      <div className="my-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create Appraisal Cycle
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set up a new performance appraisal cycle
              </p>
            </div>
          </div>
        </div>

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="Q1">Q1 (Jan-Mar)</option>
                <option value="Q2">Q2 (Apr-Jun)</option>
                <option value="Q3">Q3 (Jul-Sep)</option>
                <option value="Q4">Q4 (Oct-Dec)</option>
                <option value="ANNUAL">Annual (Jan-Dec)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>
          </div>

          {/* Cycle Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <DatePickerField
                name="startDate"
                value={formData.startDate}
                disabled={true}
                placeholder="Start Date"
                className="bg-gray-100 dark:bg-gray-700/50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Auto-filled based on quarter selection</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <DatePickerField
                name="endDate"
                value={formData.endDate}
                disabled={true}
                placeholder="End Date"
                className="bg-gray-100 dark:bg-gray-700/50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Auto-filled based on quarter selection</p>
            </div>
          </div>

          {/* Deadlines */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={20} />
              Review Deadlines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee Submission Deadline *
                </label>
                <DatePickerField
                  name="employeeSubmissionDeadline"
                  value={formData.employeeSubmissionDeadline}
                  onChange={(date) => setFormData(prev => ({ ...prev, employeeSubmissionDeadline: date }))}
                  min={formData.startDate}
                  max={formData.endDate}
                  placeholder="Select deadline date"
                  required
                />
              </div>
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
                        onChange={(e) => {
                          const newParams = [...formData.evaluationParameters];
                          newParams[index].name = e.target.value;
                          setFormData({ ...formData, evaluationParameters: newParams });
                        }}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Brief Description</label>
                      <input
                        type="text"
                        value={metric.description}
                        onChange={(e) => {
                          const newParams = [...formData.evaluationParameters];
                          newParams[index].description = e.target.value;
                          setFormData({ ...formData, evaluationParameters: newParams });
                        }}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
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
                </div>
              ))}

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                  <li>Start and End dates are auto-filled based on quarter selection</li>
                  <li>Deadlines should be within the cycle period</li>
                  <li>Click the calendar icon to open date picker for deadlines</li>
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
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? "Creating..." : "Create Cycle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
