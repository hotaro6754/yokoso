"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, AlertTriangle, CheckCircle, Clock, Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function EffectiveDatesManagement() {
  const [effectiveDates, setEffectiveDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [conflicts, setConflicts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [effectiveDateToDelete, setEffectiveDateToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchEffectiveDates();
  }, []);

  const fetchEffectiveDates = async () => {
    try {
      setLoading(true);
      const response = await payrollSalaryStructureService.getAllSalaryStructures({ limit: 100, page: 1 });
      const structures = response.data?.salaryStructures || response.data?.data || response.data || [];
      const effectiveDateData = (Array.isArray(structures) ? structures : []).map((structure) => ({
        id: structure.id,
        public_id: structure.public_id || structure.publicId || `ED-${structure.id}`,
        salary_structure_id: structure.id,
        salary_structure_name: structure.name || structure.public_id || structure.publicId || "Salary Structure",
        employee_id: structure.employee?.id || structure.employeeId || structure.employee_id,
        employee_name: structure.employee
          ? `${structure.employee.firstName || ""} ${structure.employee.lastName || ""}`.trim()
          : "Unknown",
        effective_date: structure.effective_date || structure.effectiveDate,
        end_date: null,
        status: structure.status || "ACTIVE",
        priority: "MEDIUM",
        conflict_count: 0,
        rawStructure: structure
      }));

      setEffectiveDates(effectiveDateData);
      setConflicts([]);
    } catch (error) {
      toast.error(error.message || "Failed to fetch effective dates");
      setEffectiveDates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await payrollSalaryStructureService.updateSalaryStructure(id, { status: newStatus });
      toast.success("Status updated successfully");
      fetchEffectiveDates();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleEdit = (effectiveDate) => {
    const structureId = effectiveDate.rawStructure?.id || effectiveDate.id;
    router.push(`/payroll-compliance/salary-structure/ctc/${structureId}/edit`);
  };

  const handleDelete = (id) => {
    setEffectiveDateToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!effectiveDateToDelete) return;
    try {
      await payrollSalaryStructureService.deleteSalaryStructure(effectiveDateToDelete);
      toast.success("Effective date deleted successfully");
      fetchEffectiveDates();
    } catch (error) {
      toast.error(error.message || "Failed to delete effective date");
    } finally {
      setShowDeleteModal(false);
      setEffectiveDateToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEffectiveDateToDelete(null);
  };

  const filteredEffectiveDates = effectiveDates.filter(ed => {
    const matchesSearch = ed.public_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ed.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ed.salary_structure_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || ed.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400";
      case "MEDIUM":
        return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400";
      case "LOW":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  const getConflictSeverityColor = (severity) => {
    switch (severity) {
      case "ERROR":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Ongoing";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Effective Date Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Plan salary changes and ensure smooth payroll cut-over
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 w-full xl:w-auto">
          <div className="flex flex-nowrap items-center justify-end gap-3 w-full xl:w-auto">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search effective dates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm whitespace-nowrap"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Add Button */}
          <Link
            href="/payroll-compliance/salary-structure/ctc/new"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Effective Date
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Effective Dates</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {effectiveDates.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {effectiveDates.filter(ed => ed.status === "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {effectiveDates.filter(ed => ed.status === "PENDING").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Changes</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {effectiveDates.filter(ed => ed.status === "PENDING").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Effective Dates Timeline
        </h4>

        <div className="space-y-4">
          {filteredEffectiveDates.map((effectiveDate, index) => (
            <motion.div
              key={effectiveDate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 pb-4 border-l-2 border-gray-300 dark:border-gray-600"
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 w-4 h-4 rounded-full -translate-x-1/2 bg-primary-500 border-2 border-white dark:border-gray-800"></div>

              {/* Content */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(effectiveDate.status)}`}>
                        {effectiveDate.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(effectiveDate.priority)}`}>
                        {effectiveDate.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Employee:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{effectiveDate.employee_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Structure:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{effectiveDate.salary_structure_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Effective:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formatDate(effectiveDate.effective_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(effectiveDate)}
                      className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(effectiveDate.id)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Effective Date"
        description="Are you sure you want to delete this effective date? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
