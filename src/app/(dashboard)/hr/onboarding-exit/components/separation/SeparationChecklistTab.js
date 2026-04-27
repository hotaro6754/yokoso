"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Loader2, Plus } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import { onboardingExitService as service } from "@/services/hr-services/onboarding-exit.service";
import { toast } from "react-hot-toast";
import CreateChecklistItemModal from "./CreateChecklistItemModal";

export default function SeparationChecklistTab({ resignationId }) {
  const [checklistData, setChecklistData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedResignationId, setSelectedResignationId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLockedToResignation = Boolean(resignationId);

  useEffect(() => {
    if (isLockedToResignation && resignationId) {
      setSelectedResignationId(resignationId);
      return;
    }
    if (selectedResignationId) {
      fetchChecklist();
    }
  }, [selectedResignationId, resignationId, isLockedToResignation]);

  const fetchChecklist = async () => {
    if (!selectedResignationId) return;
    try {
      setLoading(true);
      const response = await service.getSeparationChecklist(selectedResignationId);
      const data = response.success ? response.data : response;
      setChecklistData(data);
    } catch (error) {
      console.error("Error fetching checklist:", error);
      toast.error(error.message || "Failed to fetch separation checklist");
      setChecklistData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (itemId, status, notes) => {
    try {
      await service.updateSeparationChecklistItem(itemId, { status, notes });
      toast.success("Checklist item updated successfully");
      fetchChecklist();
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast.error(error.message || "Failed to update checklist item");
    }
  };

  const handleModalSuccess = () => {
    fetchChecklist();
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      SKIPPED: { label: "Skipped", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
    };
    const statusConfig = config[status] || config.PENDING;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const config = {
      ASSET: { label: "Asset", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
      DOCUMENT: { label: "Document", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      CLEARANCE: { label: "Clearance", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
      FINANCE: { label: "Finance", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      OTHER: { label: "Other", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
    };
    const categoryConfig = config[category] || config.OTHER;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryConfig.className}`}>
        {categoryConfig.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {!isLockedToResignation && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
          Select a separation record from the dashboard to manage checklist items.
        </div>
      )}

      {selectedResignationId && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      )}

      {/* Checklist Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : checklistData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          {checklistData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {checklistData.summary.total || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {checklistData.summary.pending || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {checklistData.summary.inProgress || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {checklistData.summary.completed || 0}
                </p>
              </div>
            </div>
          )}

          {/* Resignation Info */}
          {checklistData.resignation && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {checklistData.resignation.employee?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last Working Date: {new Date(checklistData.resignation.lastWorkingDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Checklist Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Separation Checklist</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {checklistData.checklist && checklistData.checklist.length > 0 ? (
                checklistData.checklist.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckSquare className="w-5 h-5 text-gray-400" />
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</h4>
                          {getStatusBadge(item.status)}
                          {getCategoryBadge(item.category)}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-8 mb-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 ml-8 text-xs text-gray-500 dark:text-gray-400">
                          {item.dueDate && (
                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                          )}
                          {item.completedAt && (
                            <span>Completed: {new Date(item.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-8 mt-2 italic">
                            Notes: {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateItem(item.id, e.target.value, item.notes)}
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="SKIPPED">Skipped</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <CheckSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No checklist items found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isLockedToResignation
              ? "Separation checklist is not available yet."
              : "Enter a resignation ID to view the separation checklist"}
          </p>
        </div>
      )}

      {/* Create Checklist Item Modal */}
      {isModalOpen && selectedResignationId && (
        <CreateChecklistItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          resignationId={selectedResignationId}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
