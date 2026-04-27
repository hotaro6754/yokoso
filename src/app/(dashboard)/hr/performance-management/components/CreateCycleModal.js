"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function CreateCycleModal({ isOpen, onClose, cycle, onSuccess }) {
  console.log('cycle', cycle);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    reviewType: "ANNUAL",
    startDate: "",
    endDate: "",
    goalSettingDeadline: "",
    selfReviewDeadline: "",
    managerReviewDeadline: "",
    hrReviewDeadline: "",
    status: "DRAFT",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('useEffect triggered - cycle:', cycle, 'isOpen:', isOpen);
    if (cycle && isOpen) {
      console.log('Setting form data from cycle:', cycle);
      const newFormData = {
        name: cycle.name || "",
        description: cycle.description || "",
        reviewType: cycle.reviewType || "ANNUAL",
        startDate: cycle.startDate ? new Date(cycle.startDate).toISOString().split("T")[0] : "",
        endDate: cycle.endDate ? new Date(cycle.endDate).toISOString().split("T")[0] : "",
        goalSettingDeadline: cycle.goalSettingDeadline ? new Date(cycle.goalSettingDeadline).toISOString().split("T")[0] : "",
        selfReviewDeadline: cycle.selfReviewDeadline ? new Date(cycle.selfReviewDeadline).toISOString().split("T")[0] : "",
        managerReviewDeadline: cycle.managerReviewDeadline ? new Date(cycle.managerReviewDeadline).toISOString().split("T")[0] : "",
        hrReviewDeadline: cycle.hrReviewDeadline ? new Date(cycle.hrReviewDeadline).toISOString().split("T")[0] : "",
        status: cycle.status || "DRAFT",
      };
      console.log('New form data being set:', newFormData);
      setFormData(newFormData);
    } else if (isOpen) {
      console.log('Resetting form data');
      setFormData({
        name: "",
        description: "",
        reviewType: "ANNUAL",
        startDate: "",
        endDate: "",
        goalSettingDeadline: "",
        selfReviewDeadline: "",
        managerReviewDeadline: "",
        hrReviewDeadline: "",
        status: "DRAFT",
      });
    }
    setErrors({});
  }, [cycle, isOpen]);

  // Debug log to see current formData
  useEffect(() => {
    console.log('Current formData:', formData);
  }, [formData]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setErrors({ name: "Name is required" });
      return;
    }
    if (!formData.startDate) {
      setErrors({ startDate: "Start date is required" });
      return;
    }
    if (!formData.endDate) {
      setErrors({ endDate: "End date is required" });
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrors({ endDate: "End date must be after start date" });
      return;
    }

    try {
      setLoading(true);
      if (cycle) {
        await performanceManagementService.updateAppraisalCycle(cycle.id, formData);
        toast.success("Appraisal cycle updated successfully");
      } else {
        await performanceManagementService.createAppraisalCycle(formData);
        toast.success("Appraisal cycle created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving cycle:", error);
      toast.error(error.message || "Failed to save appraisal cycle");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {cycle ? "Edit Appraisal Cycle" : "Create Appraisal Cycle"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cycle Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white ${
                errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="e.g., Q1 2025 Performance Review"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter cycle description..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Type
              </label>
              <select
                value={formData.reviewType}
                onChange={(e) => handleInputChange("reviewType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ANNUAL">Annual</option>
                <option value="HALF_YEARLY">Half-Yearly</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <DatePickerField
                value={formData.startDate}
                onChange={(value) => handleInputChange("startDate", value)}
                className={`w-full px-3 py-2 ${errors.startDate ? "border-red-500" : ""}`}
                placeholder="Select start date"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <DatePickerField
                value={formData.endDate}
                onChange={(value) => handleInputChange("endDate", value)}
                className={`w-full px-3 py-2 ${errors.endDate ? "border-red-500" : ""}`}
                placeholder="Select end date"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal Setting Deadline
              </label>
              <DatePickerField
                value={formData.goalSettingDeadline}
                onChange={(value) => handleInputChange("goalSettingDeadline", value)}
                className="w-full px-3 py-2"
                placeholder="Select deadline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Self Review Deadline
              </label>
              <DatePickerField
                value={formData.selfReviewDeadline}
                onChange={(value) => handleInputChange("selfReviewDeadline", value)}
                className="w-full px-3 py-2"
                placeholder="Select deadline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manager Review Deadline
              </label>
              <DatePickerField
                value={formData.managerReviewDeadline}
                onChange={(value) => handleInputChange("managerReviewDeadline", value)}
                className="w-full px-3 py-2"
                placeholder="Select deadline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HR Review Deadline
              </label>
              <DatePickerField
                value={formData.hrReviewDeadline}
                onChange={(value) => handleInputChange("hrReviewDeadline", value)}
                className="w-full px-3 py-2"
                placeholder="Select deadline"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {cycle ? "Update" : "Create"} Cycle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
