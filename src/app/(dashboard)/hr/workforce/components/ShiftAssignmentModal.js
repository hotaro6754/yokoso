"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { workforceService } from "@/services/hr-services/workforce.service";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function ShiftAssignmentModal({ isOpen, onClose, employee, onSuccess }) {
  const [formData, setFormData] = useState({
    shift: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const shiftOptions = ["Morning", "Afternoon", "Night", "General", "Flexible & Rotation"];

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        shift: employee.shift || "",
        effectiveDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setErrors({});
    }
  }, [employee, isOpen]);

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

    if (!formData.shift) {
      setErrors({ shift: "Shift is required" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        shift: formData.shift,
        effectiveDate: formData.effectiveDate,
      };
      if (formData.notes) {
        payload.notes = formData.notes;
      }

      await workforceService.assignShift(employee.id, payload);
      toast.success("Shift assigned successfully");
      onSuccess();
    } catch (error) {
      console.error("Error assigning shift:", error);
      toast.error(error.message || "Failed to assign shift");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Assign Shift - {employee?.employeeName || employee?.name || `${employee?.firstName || ""} ${employee?.lastName || ""}`}
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
              Shift <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.shift}
              onChange={(e) => handleInputChange("shift", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${errors.shift ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
            >
              <option value="">Select Shift</option>
              {shiftOptions.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
            {errors.shift && (
              <p className="mt-1 text-sm text-red-500">{errors.shift}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Effective Date
            </label>
            <DatePickerField
              value={formData.effectiveDate}
              onChange={(value) => handleInputChange("effectiveDate", value)}
              placeholder="Select date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Add any notes or comments..."
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
