"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import { toast } from "react-hot-toast";
import CreateTaskModal from "./CreateTaskModal";

export default function TaskAssignmentTab({ employeeId }) {
  const [checklistData, setChecklistData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLockedToEmployee = Boolean(employeeId);

  useEffect(() => {
    if (isLockedToEmployee && employeeId) {
      setSelectedEmployeeId(employeeId);
      return;
    }
    if (selectedEmployeeId) {
      fetchChecklist();
    }
  }, [selectedEmployeeId, employeeId, isLockedToEmployee]);

  const fetchChecklist = async () => {
    if (!selectedEmployeeId) return;
    try {
      setLoading(true);
      const response = await onboardingExitService.getOnboardingChecklist(selectedEmployeeId);
      const data = response.success ? response.data : response;
      setChecklistData(data);
    } catch (error) {
      console.error("Error fetching checklist:", error);
      toast.error(error.message || "Failed to fetch checklist");
      setChecklistData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId, status, notes) => {
    try {
      await onboardingExitService.updateOnboardingTask(taskId, { status, notes });
      toast.success("Task updated successfully");
      fetchChecklist();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error.message || "Failed to update task");
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

  return (
    <div className="space-y-6">
      {!isLockedToEmployee && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
          Select an employee from the onboarding dashboard to assign tasks.
        </div>
      )}

      {selectedEmployeeId && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Assign Task
          </button>
        </div>
      )}

      {/* Task Assignment Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : checklistData ? (
        <div className="space-y-6">
          {/* Employee Info */}
          {checklistData.employee && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {checklistData.employee.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {checklistData.employee.employeeId} • {checklistData.employee.department}
              </p>
            </div>
          )}

          {/* Tasks List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Tasks</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {checklistData.tasks && checklistData.tasks.length > 0 ? (
                checklistData.tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <ClipboardList className="w-5 h-5 text-gray-400" />
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
                          {getStatusBadge(task.status)}
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-8 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 ml-8 text-xs text-gray-500 dark:text-gray-400">
                          {task.dueDate && (
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                          {task.assignedTo && (
                            <span>Assigned To: Employee #{task.assignedTo}</span>
                          )}
                          {task.completedAt && (
                            <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        {task.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-8 mt-2 italic">
                            Notes: {task.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTask(task.id, e.target.value, task.notes)}
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
                  <ClipboardList className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No tasks assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isLockedToEmployee
              ? "Assigned tasks are not available yet."
              : "Select an employee to view their assigned tasks"}
          </p>
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && selectedEmployeeId && (
        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employeeId={selectedEmployeeId}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
