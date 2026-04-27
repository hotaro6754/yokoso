"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Loader2, Target } from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { organizationService } from "@/services/hr-services/organization.service";
import employeeService from "@/services/hr-services/employeeService";
import { toast } from "react-hot-toast";
import CustomDropdown from "../../leave/components/CustomDropdown";

export default function GoalCompletionTab() {
  const [goalData, setGoalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [managers, setManagers] = useState([]);
  const [filters, setFilters] = useState({
    cycleId: "all",
    departmentId: "all",
    managerId: "all",
    status: "all",
  });

  useEffect(() => {
    fetchDepartments();
    fetchCycles();
    fetchManagers();
  }, []);

  useEffect(() => {
    fetchGoalOverview();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const response = await organizationService.getAllDepartments({ limit: 100 });
      const deptData = response.success ? response.data?.departments || response.data : response.data || [];
      setDepartments(deptData);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchCycles = async () => {
    try {
      const response = await performanceManagementService.getAppraisalCycles({ status: "all" });
      const data = response.success ? response.data : response.data || [];
      setCycles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching cycles:", error);
      setCycles([]);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await employeeService.getManagers();
      const data = response?.data || response || [];
      setManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setManagers([]);
    }
  };

  const fetchGoalOverview = async () => {
    try {
      setLoading(true);
      const params = {
        cycleId: filters.cycleId !== "all" ? filters.cycleId : "all",
        departmentId: filters.departmentId !== "all" ? filters.departmentId : "all",
        managerId: filters.managerId !== "all" ? filters.managerId : "all",
        status: filters.status !== "all" ? filters.status : "all",
      };
      const response = await performanceManagementService.getGoalCompletionOverview(params);
      const data = response.success ? response.data : response;
      setGoalData(data);
    } catch (error) {
      console.error("Error fetching goal overview:", error);
      toast.error(error.message || "Failed to fetch goal completion overview");
      setGoalData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      NOT_STARTED: { label: "Not Started", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
      IN_PROGRESS: { label: "In Progress", className: "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400" },
      ON_TRACK: { label: "On Track", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      AT_RISK: { label: "At Risk", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      COMPLETED: { label: "Completed", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
      CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    };
    const statusConfig = config[status] || config.NOT_STARTED;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        {statusConfig.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cycle
            </label>
            <CustomDropdown
              value={filters.cycleId}
              onChange={(value) => setFilters({ ...filters, cycleId: value })}
              options={[
                { value: 'all', label: 'All Cycles' },
                ...cycles.map(cycle => ({ value: cycle.id, label: cycle.name }))
              ]}
              placeholder="All Cycles"
              className="w-full"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <CustomDropdown
              value={filters.departmentId}
              onChange={(value) => setFilters({ ...filters, departmentId: value })}
              options={[
                { value: 'all', label: 'All Departments' },
                ...departments.map(dept => ({ value: dept.id, label: dept.name }))
              ]}
              placeholder="All Departments"
              className="w-full"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Manager
            </label>
            <CustomDropdown
              value={filters.managerId}
              onChange={(value) => setFilters({ ...filters, managerId: value })}
              options={[
                { value: 'all', label: 'All Managers' },
                ...managers.map(manager => ({
                  value: manager.id || manager._id,
                  label: manager.name || `${manager.firstName || ""} ${manager.lastName || ""}`.trim()
                }))
              ]}
              placeholder="All Managers"
              className="w-full"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <CustomDropdown
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'NOT_STARTED', label: 'Not Started' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' }
              ]}
              placeholder="All Status"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Goal Overview */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : goalData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          {goalData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {goalData.summary.total || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                  {goalData.summary.inProgress || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">On Track</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {goalData.summary.onTrack || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {goalData.summary.completed || 0}
                </p>
              </div>
            </div>
          )}

          {/* Goals Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Goal Monitoring</h3>
            </div>
            {goalData.goals && goalData.goals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Goal Title
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Weight
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Progress
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {goalData.goals.map((goal) => (
                      <tr key={goal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Target className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {goal.employee?.name || "Employee"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {goal.employee?.employeeId || "ID pending"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {goal.employee?.department || goal.department || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {goal.title || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {goal.weight || goal.weightage || 0}%
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {goal.progress || 0}%
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(goal.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No goals found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No goal data available</p>
        </div>
      )}
    </div>
  );
}
