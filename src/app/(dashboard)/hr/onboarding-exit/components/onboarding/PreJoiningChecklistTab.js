"use client";

import { useState, useEffect, useRef } from "react";
import { CheckSquare, Loader2, Plus, Search, X, User } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import employeeService from "@/services/hr-services/employeeService";
import { toast } from "react-hot-toast";
import CreateTaskModal from "./CreateTaskModal";

export default function PreJoiningChecklistTab({ employeeId }) {
  const [checklistData, setChecklistData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchingEmployees, setSearchingEmployees] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const isLockedToEmployee = Boolean(employeeId);

  useEffect(() => {
    if (isLockedToEmployee) {
      setSelectedEmployeeId(employeeId);
      setSelectedEmployee(null);
      setSearchTerm("");
      setShowDropdown(false);
      return;
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (isLockedToEmployee && employeeId) {
      setSelectedEmployeeId(employeeId);
      return;
    }
    if (selectedEmployeeId) {
      fetchChecklist();
    } else {
      setChecklistData(null);
    }
  }, [selectedEmployeeId, employeeId, isLockedToEmployee]);

  useEffect(() => {
    // Filter employees based on search term (only if no employee is selected)
    if (selectedEmployee) {
      setFilteredEmployees([]);
      setShowDropdown(false);
      return;
    }
    
    if (searchTerm.trim() === "") {
      setFilteredEmployees([]);
      setShowDropdown(false);
    } else {
      const filtered = employees.filter((emp) => {
        const name = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
        return (
          name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredEmployees(filtered.slice(0, 10)); // Limit to 10 results
      setShowDropdown(filtered.length > 0);
    }
  }, [searchTerm, employees, selectedEmployee]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchEmployees = async () => {
    try {
      setSearchingEmployees(true);
      const response = await employeeService.getAllEmployees({ limit: 100, status: "all" });
      const employeeList = response.success
        ? response.data?.employees || response.data || []
        : response.data?.employees || response.data || [];
      setEmployees(Array.isArray(employeeList) ? employeeList : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setSearchingEmployees(false);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSelectedEmployeeId(employee.id);
    const employeeName = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
    setSearchTerm(`${employeeName} (${employee.employeeId})`);
    setShowDropdown(false);
    setChecklistData(null); // Clear previous data
  };

  const handleClearSelection = () => {
    setSelectedEmployee(null);
    setSelectedEmployeeId("");
    setSearchTerm("");
    setChecklistData(null);
    setShowDropdown(false);
  };

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
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Employee
              </label>
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employee by name or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!selectedEmployee) {
                      setShowDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    if (!selectedEmployee && filteredEmployees.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-all"
                  disabled={selectedEmployee !== null}
                />
                {selectedEmployee && (
                  <button
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {showDropdown && filteredEmployees.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {filteredEmployees.map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => handleEmployeeSelect(employee)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {employee.profileImage ? (
                              <img
                                src={employee.profileImage}
                                alt={employee.name}
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ${
                                employee.profileImage ? 'hidden' : 'flex'
                              }`}
                              style={{ display: employee.profileImage ? 'none' : 'flex' }}
                            >
                              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {employee.employeeId} {employee.department && `• ${typeof employee.department === 'string' ? employee.department : employee.department.name || ''}`}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && searchTerm.trim() !== "" && filteredEmployees.length === 0 && !searchingEmployees && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      No employees found
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                if (!selectedEmployeeId) {
                  toast.error("Please select an employee first");
                  return;
                }
                setIsModalOpen(true);
              }}
              disabled={!selectedEmployeeId}
              className="px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
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

          {/* Employee Info */}
          {checklistData.employee && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {checklistData.employee.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {checklistData.employee.employeeId} • {checklistData.employee.department}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Status: <span className="font-medium">{checklistData.employee.onboardingStatus}</span>
              </p>
            </div>
          )}

          {/* Tasks List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pre-joining Checklist</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {checklistData.tasks && checklistData.tasks.length > 0 ? (
                checklistData.tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckSquare className="w-5 h-5 text-gray-400" />
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
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white transition-all"
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
                  <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isLockedToEmployee
              ? "Onboarding checklist is not available yet."
              : "Search an employee to view their pre-joining checklist"}
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
