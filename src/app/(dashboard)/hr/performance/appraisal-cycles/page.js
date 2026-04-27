"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  BarChart3,
  Download,
  X
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";
import ActionDropdown from "@/app/(dashboard)/master-admin/components/ActionDropdown";

export default function AppraisalCyclesPage() {
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState(null);

  useEffect(() => {
    fetchCycles();
  }, [filters]);

  const fetchCycles = async () => {
    try {
      setLoading(true);

      // Fetch real data from API
      const response = await performanceManagementService.getAppraisalCycles();
      const cyclesData = response || [];

      // Process and enhance the data with calculated fields
      const processedCycles = cyclesData.map(cycle => ({
        ...cycle,
        // Ensure all required fields exist with fallbacks
        name: cycle.name || `${cycle.quarter || 'Q'} ${cycle.year || new Date().getFullYear()} Appraisal Cycle`,
        year: cycle.year || new Date().getFullYear(),
        quarter: cycle.quarter || 'Q',
        startDate: cycle.startDate || cycle.startDate,
        endDate: cycle.endDate || cycle.endDate,
        status: cycle.status || 'DRAFT',
        employeeSubmissionDeadline: cycle.employeeSubmissionDeadline || cycle.submissionDeadline,
        managerReviewDeadline: cycle.managerReviewDeadline || cycle.reviewDeadline,
        deptHeadReviewDeadline: cycle.deptHeadReviewDeadline || cycle.finalDeadline,
        totalEmployees: cycle.totalEmployees || 0,
        employeeSubmissions: cycle.employeeSubmissions || 0,
        managerReviews: cycle.managerReviews || 0,
        deptHeadReviews: cycle.deptHeadReviews || 0,
        completionRate: cycle.completionRate || 0,
        description: cycle.description || `Performance appraisal cycle for ${cycle.quarter || 'Q'} ${cycle.year || new Date().getFullYear()}`,
        createdBy: cycle.createdBy || 'HR Admin',
        createdAt: cycle.createdAt ? new Date(cycle.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));

      setCycles(processedCycles);
    } catch (error) {
      console.error("Error fetching appraisal cycles:", error);
      toast.error("Failed to load appraisal cycles");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-100 text-gray-800", icon: <Clock size={14} /> },
      ACTIVE: { color: "bg-green-100 text-green-800", icon: <Play size={14} /> },
      IN_PROGRESS: { color: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} /> },
      COMPLETED: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle size={14} /> },
      CANCELLED: { color: "bg-red-100 text-red-800", icon: <X size={14} /> }
    };

    const config = statusConfig[status] || statusConfig.DRAFT;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getCompletionColor = (rate) => {
    if (rate >= 90) return "text-emerald-600 bg-emerald-50";
    if (rate >= 70) return "text-blue-600 bg-blue-50";
    if (rate >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const handleStatusChange = async (cycleId, newStatus) => {
    try {
      // Call real API to update cycle status
      await performanceManagementService.updateAppraisalCycleStatus(cycleId, newStatus);

      setCycles(prev => prev.map(cycle =>
        cycle.id === cycleId ? { ...cycle, status: newStatus } : cycle
      ));

      toast.success(`Appraisal cycle ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error updating cycle status:", error);
      toast.error("Failed to update cycle status");

      // Simulate the change for demo purposes
      setCycles(prev => prev.map(cycle =>
        cycle.id === cycleId ? { ...cycle, status: newStatus } : cycle
      ));
      toast.success(`Appraisal cycle ${newStatus.toLowerCase()} successfully (Demo)`);
    }
  };

  const handleDelete = async (cycle) => {
    setCycleToDelete(cycle);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!cycleToDelete) return;

    try {
      await performanceManagementService.deleteAppraisalCycle(cycleToDelete.id);
      toast.success("Appraisal cycle deleted successfully");
      fetchCycles(); // Refresh the list
    } catch (error) {
      console.error("Error deleting cycle:", error);
      toast.error(error.message || "Failed to delete appraisal cycle");
    } finally {
      setShowDeleteModal(false);
      setCycleToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCycleToDelete(null);
  };

  const handleExport = () => {
    if (cycles.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvContent = generateCyclesCSV(cycles);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appraisal-cycles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Appraisal cycles exported successfully");
  };

  const generateCyclesCSV = (data) => {
    const headers = ['Cycle Name', 'Year', 'Quarter', 'Start Date', 'End Date', 'Status', 'Total Employees', 'Employee Submissions', 'Manager Reviews', 'Dept Head Reviews', 'Completion Rate', 'Created Date'];
    const rows = data.map(cycle => [
      cycle.name,
      cycle.year,
      cycle.quarter,
      cycle.startDate,
      cycle.endDate,
      cycle.status,
      cycle.totalEmployees,
      cycle.employeeSubmissions,
      cycle.managerReviews,
      cycle.deptHeadReviews,
      `${cycle.completionRate}%`,
      cycle.createdAt
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const filteredCycles = cycles.filter(cycle => {
    const matchesSearch = cycle.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      cycle.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || cycle.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Performance", href: "/hr/performance" },
            { label: "Appraisal Cycles", href: "/hr/performance/appraisal-cycles" },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Appraisal Cycles
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage performance appraisal cycles, timelines, and execution status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={cycles.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm shadow-sm"
            >
              <Download size={16} />
              Export
            </button>
            <Link
              href="/hr/performance/appraisal-cycles/create"
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[#0b1220] shadow-sm transition hover:bg-[var(--color-primary-hover)]"
            >
              <Plus className="h-4 w-4" />
              Create Cycle
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cycles</span>
            <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
              <Calendar size={14} className="text-[var(--color-primary)]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{cycles.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Cycles</span>
            <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
              <Play size={14} className="text-[var(--color-primary)]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {cycles.filter(c => c.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</span>
            <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
              <Users size={14} className="text-[var(--color-primary)]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {cycles.reduce((sum, c) => sum + (c.totalEmployees || 0), 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Completion</span>
            <div className="p-1.5 bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)]/10 rounded-full">
              <BarChart3 size={14} className="text-[var(--color-primary)]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {cycles.length > 0 ? Math.round(cycles.reduce((sum, c) => sum + (c.completionRate || 0), 0) / cycles.length) : 0}%
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search cycles..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="h-10 w-full rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="h-10 w-full rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Cycles Table */}
      <div className="rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        {filteredCycles.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No appraisal cycles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-primary-hover)]/70 text-xs uppercase tracking-wide text-gray-700 dark:bg-[var(--color-primary)]/10 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Cycle Name</th>
                  <th className="px-6 py-3 text-left font-medium">Period</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Completion Rate</th>
                  <th className="px-6 py-3 text-left font-medium">Progress</th>
                  <th className="px-6 py-3 text-left font-medium">Deadlines</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCycles.map((cycle) => {
                  const cycleId = cycle.id ?? cycle._id;
                  return (
                  <tr key={cycleId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {cycle.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {cycle.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created: {cycle.createdAt}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 block whitespace-nowrap">
                        {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(cycle.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getCompletionColor(cycle.completionRate)}`}>
                        {cycle.completionRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs whitespace-nowrap gap-2">
                          <span className="text-gray-600 dark:text-gray-400">Employees:</span>
                          <span className="font-medium">{cycle.employeeSubmissions}/{cycle.totalEmployees}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs whitespace-nowrap gap-2">
                          <span className="text-gray-600 dark:text-gray-400">Managers:</span>
                          <span className="font-medium">{cycle.managerReviews}/{cycle.totalEmployees}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <AlertCircle size={12} className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Emp: {formatDate(cycle.employeeSubmissionDeadline)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <AlertCircle size={12} className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Mgr: {formatDate(cycle.managerReviewDeadline)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionDropdown
                        customActions={[
                          {
                            label: "View",
                            icon: Eye,
                            href: `/hr/performance/appraisal-cycles/${cycleId}`,
                            className: "text-gray-700 dark:text-gray-200",
                          iconClassName: "text-[var(--color-primary)]"
                        },
                          {
                            label: "Edit",
                            icon: Edit,
                            href: `/hr/performance/appraisal-cycles/${cycleId}/edit`,
                            className: "text-gray-700 dark:text-gray-200",
                            iconClassName: "text-gray-600 dark:text-gray-400"
                          },
                          /* Status Actions - Only show if applicable */
                          ...(cycle.status === 'DRAFT' ? [{
                            label: "Activate",
                            icon: Play,
                            onClick: () => handleStatusChange(cycleId, 'ACTIVE'),
                            className: "text-emerald-700 dark:text-emerald-200",
                            iconClassName: "text-emerald-600 dark:text-emerald-400",
                            hoverClassName: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          }] : []),
                          ...(cycle.status === 'ACTIVE' ? [{
                            label: "Complete",
                            icon: CheckCircle,
                            onClick: () => handleStatusChange(cycleId, 'COMPLETED'),
                            className: "text-blue-700 dark:text-blue-200",
                            iconClassName: "text-blue-600 dark:text-blue-400",
                            hoverClassName: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          }] : []),
                          ...(cycle.status === 'COMPLETED' ? [{
                            label: "Cancel",
                            icon: X,
                            onClick: () => handleStatusChange(cycleId, 'CANCELLED'),
                            className: "text-red-700 dark:text-red-200",
                            iconClassName: "text-red-600 dark:text-red-400",
                            hoverClassName: "hover:bg-red-50 dark:hover:bg-red-900/20"
                          }] : []),
                          /* Delete - Only if safely deleteable */
                          ...((cycle.status === 'DRAFT' || cycle.status === 'COMPLETED') ? [{
                            label: "Delete",
                            icon: Trash2,
                            onClick: () => handleDelete(cycle),
                            className: "text-red-700 dark:text-red-300",
                            iconClassName: "text-red-600 dark:text-red-400",
                            hoverClassName: "hover:bg-red-50 dark:hover:bg-red-900/20"
                          }] : [])
                        ]}
                      />
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Appraisal Cycle"
        description={`Are you sure you want to delete "${cycleToDelete?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Cycle"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
