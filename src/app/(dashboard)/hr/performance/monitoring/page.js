'use client';

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  UserCheck,
  Building2,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Send,
  MessageSquare,
  Calendar,
  X,
  Bell
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { employeeService } from "@/services/hr-services/employeeService";

export default function PerformanceMonitoringPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", cycle: "", department: "" });
  const [monitoringData, setMonitoringData] = useState(null);

  // Get current year for dynamic fallback
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  useEffect(() => {
    fetchMonitoringData();
  }, [filters.cycle, filters.department, filters.status]); // Only re-fetch if filter params that affect data aggregation change, though here all filtering is client-side mostly? Actually processMonitoringData is client side but fetch might need params if API supports it. Code below fetches everything then filters.

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);

      // Fetch real data from APIs
      const [nineBoxData, departmentsData, cyclesData] = await Promise.all([
        performanceManagementService.getNineBoxGridData(filters),
        employeeService.getDepartments(),
        performanceManagementService.getAppraisalCycles()
      ]);

      // Try to fetch employees, but handle gracefully if it fails
      let employeesData = { data: [] };
      try {
        employeesData = await employeeService.getAllEmployees();
      } catch (employeeError) {
        console.warn('Failed to fetch employees, using empty array:', employeeError);
      }

      // Process monitoring data
      const processedData = processMonitoringData(nineBoxData, departmentsData, employeesData, cyclesData);

      setMonitoringData(processedData);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
      toast.error("Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  };

  const processMonitoringData = (nineBoxData, departmentsData, employeesData, cyclesData) => {
    // Updated to handle the new Nine-Box grid data structure which contains both assigned and unassigned employees
    const gridEmployees = nineBoxData.data?.gridData || (Array.isArray(nineBoxData.data) ? nineBoxData.data : []);
    const unassignedEmployees = nineBoxData.data?.unassignedEmployees || [];

    // Normalize and combine both lists
    const employees = [
      ...gridEmployees,
      ...unassignedEmployees.map(u => ({
        ...u,
        employee: {
          id: u.id,
          name: u.name,
          email: u.email,
          department: u.department,
          designation: u.designation
        },
        performanceScore: null,
        managerReviewDate: null,
        status: 'Unassigned'
      }))
    ];

    const allEmployees = employeesData.data || [];
    const cycles = cyclesData.data || [];

    // Get active cycle or fallback to default
    const activeCycle = cycles.find(cycle => cycle.status === 'ACTIVE') || cycles[0];
    const cycleName = activeCycle?.name || `Q4 ${previousYear}`;

    // Create monitoring progress for all employees
    const progress = employees.map(emp => {
      const employeeRecord = allEmployees.find(allEmp => allEmp.id === (emp.employee?.id || emp.id));

      const hasPerformanceData = !!emp.performanceScore;
      const hasManagerReview = emp.managerReviewDate && emp.managerReviewDate !== null;

      const employeeStatus = hasPerformanceData ? "COMPLETED" : "IN_PROGRESS";
      const managerStatus = hasManagerReview ? "COMPLETED" : (hasPerformanceData ? "IN_PROGRESS" : "PENDING");

      return {
        id: emp.employee?.id || emp.id,
        employeeName: employeeRecord ? `${employeeRecord.firstName} ${employeeRecord.lastName}` : emp.employee?.name || emp.name || 'Unknown Employee',
        email: employeeRecord?.email || emp.employee?.email || emp.email || '',
        department: employeeRecord?.department?.name || emp.employee?.department || emp.department || 'Unknown',
        designation: employeeRecord?.designation?.name || emp.employee?.designation || emp.designation || 'Employee',
        cycle: cycleName, // Use actual cycle data
        employeeStatus,
        managerStatus,
        finalScore: emp.performanceScore || null,
        submissionDate: emp.createdAt ? new Date(emp.createdAt).toISOString().split('T')[0] : null,
        managerReviewDate: emp.managerReviewDate || null
      };
    });

    // Calculate summary
    const totalEmployees = progress.length;
    const employeeSubmissions = progress.filter(emp => emp.employeeStatus === "COMPLETED").length;
    const managerReviews = progress.filter(emp => emp.managerStatus === "COMPLETED").length;
    const overallCompletion = totalEmployees > 0 ? Math.round(((employeeSubmissions + managerReviews) / (totalEmployees * 2)) * 100) : 0;

    return {
      summary: {
        totalEmployees,
        employeeSubmissions,
        managerReviews,
        overallCompletion
      },
      cycles: cycles.length > 0 ? cycles : [
        { id: 1, name: `Q4 ${previousYear}`, status: "ACTIVE" },
        { id: 2, name: `Q3 ${previousYear}`, status: "CLOSED" },
        { id: 3, name: `Q1 ${currentYear}`, status: "DRAFT" }
      ],
      departments: departmentsData.data || [],
      progress
    };
  };

  const getStatusBadge = (status, type) => {
    const statusConfig = {
      NOT_STARTED: { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400", icon: <Clock size={12} /> },
      IN_PROGRESS: { color: "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400", icon: <AlertTriangle size={12} /> },
      COMPLETED: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: <CheckCircle size={12} /> },
      PENDING: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400", icon: <Clock size={12} /> }
    };

    const config = statusConfig[status] || statusConfig.NOT_STARTED;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon}
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const getCompletionColor = (rate) => {
    if (rate >= 90) return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
    if (rate >= 70) return "text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400";
    if (rate >= 50) return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400";
    return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
  };

  const getProgressBarColor = (rate) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 70) return "bg-brand-500";
    if (rate >= 50) return "bg-amber-500";
    return "bg-red-500";
  }

  const filteredProgress = monitoringData?.progress?.filter(item => {
    const matchesCycle = !filters.cycle || item.cycle === filters.cycle;
    const matchesDepartment = !filters.department || item.department === filters.department;
    const matchesStatus = !filters.status ||
      item.employeeStatus === filters.status ||
      item.managerStatus === filters.status;
    const matchesSearch = !filters.search ||
      item.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.department.toLowerCase().includes(filters.search.toLowerCase());

    return matchesCycle && matchesDepartment && matchesStatus && matchesSearch;
  }) || [];

  const getCompletionRate = (employee) => {
    let completed = 0;
    let total = 2; // Only self and manager reviews

    if (employee.employeeStatus === "COMPLETED") completed++;
    if (employee.managerStatus === "COMPLETED") completed++;

    return Math.round((completed / total) * 100);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMonitoringData();
    setRefreshing(false);
    toast.success("Monitoring data refreshed");
  };

  const handleExport = () => {
    if (!monitoringData) return;

    const csvContent = generateMonitoringCSV(monitoringData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-monitoring-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Monitoring report exported successfully");
  };

  const generateMonitoringCSV = (data) => {
    const headers = ['Employee Name', 'Email', 'Department', 'Designation', 'Cycle', 'Self Review Status', 'Manager Review Status', 'Overall Progress', 'Final Score'];
    const rows = data.progress.map(emp => [
      emp.employeeName,
      emp.email,
      emp.department,
      emp.designation,
      emp.cycle,
      emp.employeeStatus,
      emp.managerStatus,
      `${getCompletionRate(emp)}%`,
      emp.finalScore || 'Not Rated'
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const handleSendReminder = (employee) => {
    setSelectedEmployee(employee);
    setShowReminderModal(true);
  };

  const handleViewDetails = (employee) => {
    router.push(`/hr/performance/monitoring/${employee.id}`);
  };

  const sendReminder = async (type) => {
    try {
      // API call to send reminder
      toast.success(`Reminder sent to ${selectedEmployee.employeeName}`);
      setShowReminderModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast.error("Failed to send reminder");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Performance", href: "/hr/performance" },
            { label: "Monitoring", href: "/hr/performance/monitoring" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Performance Monitoring
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track appraisal completion status across all levels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExport}
              disabled={!monitoringData}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0b1220] bg-[var(--color-primary)] rounded-sm hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 shadow-sm"
            >
              <Download size={14} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {monitoringData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <Users size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{monitoringData.summary.totalEmployees}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Self Reviews</span>
              <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
                <UserCheck size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{monitoringData.summary.employeeSubmissions}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Math.round((monitoringData.summary.employeeSubmissions / monitoringData.summary.totalEmployees) * 100)}% completion
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Manager Reviews</span>
              <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                <Users size={14} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{monitoringData.summary.managerReviews}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Math.round((monitoringData.summary.managerReviews / monitoringData.summary.totalEmployees) * 100)}% completion
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Completion</span>
              <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                <BarChart3 size={14} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${monitoringData.summary.overallCompletion >= 90 ? "text-[var(--color-primary)]" :
              monitoringData.summary.overallCompletion >= 70 ? "text-[var(--color-primary)]" :
                "text-amber-600"
              }`}>
              {monitoringData.summary.overallCompletion}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              All stages combined
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap lg:flex-nowrap items-center gap-4">
        <div className="relative w-full lg:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>
        <div className="flex w-full lg:w-auto overflow-x-auto gap-4">
          <select
            value={filters.cycle}
            onChange={(e) => setFilters({ ...filters, cycle: e.target.value })}
            className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-w-[140px]"
          >
            <option value="">All Cycles</option>
            {monitoringData?.cycles?.map(cycle => (
              <option key={cycle.id} value={cycle.name}>{cycle.name}</option>
            ))}
          </select>
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-w-[160px]"
          >
            <option value="">All Departments</option>
            {monitoringData?.departments?.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Progress Table */}
      <div className="rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        {filteredProgress.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No progress data found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-primary-hover)]/70 text-xs uppercase tracking-wide text-gray-700 dark:bg-[var(--color-primary)]/10 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Employee</th>
                  <th className="px-6 py-3 text-left font-medium">Department</th>
                  <th className="px-6 py-3 text-left font-medium">Cycle</th>
                  <th className="px-6 py-3 text-left font-medium">Self Review</th>
                  <th className="px-6 py-3 text-left font-medium">Manager Review</th>
                  <th className="px-6 py-3 text-left font-medium">Overall Progress</th>
                  <th className="px-6 py-3 text-left font-medium">Final Score</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredProgress.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {employee.employeeName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {employee.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {employee.cycle}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(employee.employeeStatus, 'employee')}
                      {employee.submissionDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {employee.submissionDate}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(employee.managerStatus, 'manager')}
                      {employee.managerReviewDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {employee.managerReviewDate}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 w-24">
                          <div
                            className={`h-1.5 rounded-full ${getProgressBarColor(getCompletionRate(employee))}`}
                            style={{ width: `${getCompletionRate(employee)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {getCompletionRate(employee)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {employee.finalScore ? (
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${employee.finalScore >= 4.5 ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                          employee.finalScore >= 4.0 ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                            employee.finalScore >= 3.5 ? "bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-400" :
                              employee.finalScore >= 3.0 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" :
                                "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          }`}>
                          {employee.finalScore}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not Rated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(employee)}
                          className="text-gray-500 hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:text-[var(--color-primary)]"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {(employee.employeeStatus === "NOT_STARTED" || employee.employeeStatus === "IN_PROGRESS") && (
                          <button
                            onClick={() => handleSendReminder(employee)}
                            className="text-gray-500 hover:text-[var(--color-primary)] dark:text-gray-400 dark:hover:text-[var(--color-primary)]"
                            title="Send Reminder"
                          >
                            <Bell size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {showReminderModal && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Send Reminder
              </h3>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Send reminder to: <span className="font-semibold text-gray-900 dark:text-white">{selectedEmployee.employeeName}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedEmployee.email}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => sendReminder('self-review')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-[#0b1220] font-medium rounded-sm hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
                >
                  <Send size={16} />
                  Send Self-Review Reminder
                </button>
                <button
                  onClick={() => sendReminder('manager-review')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <MessageSquare size={16} />
                  Send Manager Review Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
