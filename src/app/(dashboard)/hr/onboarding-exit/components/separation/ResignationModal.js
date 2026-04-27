"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function ResignationModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    resignationDate: new Date().toISOString().split("T")[0],
    lastWorkingDate: "",
    reason: "",
    reasonDetails: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    
    if (!formData.resignationDate) {
      setErrors({ resignationDate: "Resignation date is required" });
      return;
    }
    if (!formData.lastWorkingDate) {
      setErrors({ lastWorkingDate: "Last working date is required" });
      return;
    }
    if (!formData.reason) {
      setErrors({ reason: "Reason is required" });
      return;
    }

    try {
      setLoading(true);
      await onboardingExitService.createResignation(formData);
      toast.success("Resignation request created successfully");
      onSuccess();
      setFormData({
        resignationDate: new Date().toISOString().split("T")[0],
        lastWorkingDate: "",
        reason: "",
        reasonDetails: "",
      });
    } catch (error) {
      console.error("Error creating resignation:", error);
      toast.error(error.message || "Failed to create resignation request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Resignation Request</h2>
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
              Resignation Date <span className="text-red-500">*</span>
            </label>
            <DatePickerField
              value={formData.resignationDate}
              onChange={(value) => handleInputChange("resignationDate", value)}
              className={`w-full px-3 py-2 ${
                errors.resignationDate ? "border-red-500" : ""
              }`}
              placeholder="Select resignation date"
            />
            {errors.resignationDate && (
              <p className="mt-1 text-sm text-red-500">{errors.resignationDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Working Date <span className="text-red-500">*</span>
            </label>
            <DatePickerField
              value={formData.lastWorkingDate}
              onChange={(value) => handleInputChange("lastWorkingDate", value)}
              className={`w-full px-3 py-2 ${
                errors.lastWorkingDate ? "border-red-500" : ""
              }`}
              placeholder="Select last working date"
            />
            {errors.lastWorkingDate && (
              <p className="mt-1 text-sm text-red-500">{errors.lastWorkingDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white ${
                errors.reason ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter reason for resignation"
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason Details (Optional)
            </label>
            <textarea
              value={formData.reasonDetails}
              onChange={(e) => handleInputChange("reasonDetails", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="Provide detailed reason..."
            />
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
              className="px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit Resignation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
