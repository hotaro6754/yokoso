"use client";

import { useState, useEffect } from "react";
import { UserCheck, Loader2, Save } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function SeparationStatusTab({ resignationId }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedResignationId, setSelectedResignationId] = useState("");
  const [formData, setFormData] = useState({
    status: "",
    exitDate: "",
    finalSettlementDate: "",
    notes: "",
  });
  const isLockedToResignation = Boolean(resignationId);

  useEffect(() => {
    if (isLockedToResignation && resignationId) {
      setSelectedResignationId(resignationId);
      return;
    }
    if (selectedResignationId) {
      fetchStatus();
    }
  }, [selectedResignationId, resignationId, isLockedToResignation]);

  const fetchStatus = async () => {
    if (!selectedResignationId) return;
    try {
      setLoading(true);
      // We'll get status from resignation data
      const response = await onboardingExitService.getResignations({});
      const data = response.success ? response.data : response.data || [];
      const resignation = Array.isArray(data) ? data.find(r => r.id.toString() === selectedResignationId) : null;
      if (resignation) {
        setStatusData(resignation);
        setFormData({
          status: resignation.exitProcess?.status || "",
          exitDate: resignation.exitProcess?.exitDate ? new Date(resignation.exitProcess.exitDate).toISOString().split("T")[0] : "",
          finalSettlementDate: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Error fetching status:", error);
      toast.error(error.message || "Failed to fetch separation status");
      setStatusData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResignationId) {
      toast.error("Please enter a resignation ID");
      return;
    }
    try {
      setUpdating(true);
      await onboardingExitService.updateSeparationStatus(selectedResignationId, formData);
      toast.success("Separation status updated successfully");
      fetchStatus();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update separation status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      CLEARANCE_PENDING: { label: "Clearance Pending", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
      CLEARANCE_COMPLETED: { label: "Clearance Completed", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
      FINAL_SETTLEMENT_PENDING: { label: "Final Settlement Pending", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
      COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    };
    const statusConfig = config[status] || config.PENDING;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        {statusConfig.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {!isLockedToResignation && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
          Select a separation record from the dashboard to update status.
        </div>
      )}

      {/* Status Update Form */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : selectedResignationId ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {statusData && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Status
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Employee:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {statusData.employee?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Resignation Date:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(statusData.resignationDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Working Date:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(statusData.lastWorkingDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Exit Process Status:</span>
                  {getStatusBadge(statusData.exitProcess?.status || "PENDING")}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Update Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLEARANCE_PENDING">Clearance Pending</option>
                <option value="CLEARANCE_COMPLETED">Clearance Completed</option>
                <option value="FINAL_SETTLEMENT_PENDING">Final Settlement Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exit Date
              </label>
            <DatePickerField
              value={formData.exitDate}
              onChange={(value) => handleInputChange("exitDate", value)}
              className="w-full px-3 py-2"
              placeholder="Select exit date"
            />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Final Settlement Date
              </label>
            <DatePickerField
              value={formData.finalSettlementDate}
              onChange={(value) => handleInputChange("finalSettlementDate", value)}
              className="w-full px-3 py-2"
              placeholder="Select settlement date"
            />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add any notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isLockedToResignation
              ? "Separation status is not available yet."
              : "Enter a resignation ID to view and update separation status"}
          </p>
        </div>
      )}
    </div>
  );
}
