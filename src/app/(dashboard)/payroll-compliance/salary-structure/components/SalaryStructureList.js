"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useRouter } from "next/navigation";
import Pagination from "@/components/common/Pagination";

export default function SalaryStructureList({
  structures = [],
  loading = false,
  onStructureUpdated,
  pagination = { currentPage: 1, totalPages: 1, totalItems: 0, limit: 10, search: "", status: "ALL" },
  onPageChange,
  onLimitChange,
  onSearchChange,
  onStatusChange
}) {
  const [localSearch, setLocalSearch] = useState(pagination.search || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== pagination.search) {
        onSearchChange && onSearchChange(localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, pagination.search]);

  // Sync local search with prop if needed
  useEffect(() => {
    setLocalSearch(pagination.search || "");
  }, [pagination.search]);

  const handleView = (structure) => {
    router.push(`/payroll-compliance/salary-structure/ctc/${structure.id}`);
  };

  const handleDelete = async (id) => {
    setStructureToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!structureToDelete) return;

    try {
      await payrollSalaryStructureService.deleteSalaryStructure(structureToDelete);
      toast.success("Salary structure deleted successfully");
      if (onStructureUpdated) {
        onStructureUpdated();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete salary structure");
    } finally {
      setShowDeleteModal(false);
      setStructureToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStructureToDelete(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await payrollSalaryStructureService.updateSalaryStructure(id, { status: newStatus });
      toast.success("Status updated successfully");
      if (onStructureUpdated) {
        onStructureUpdated();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const normalizedStructures = useMemo(() => structures || [], [structures]);

  // Filtering is now handled by the backend, but we keep this for initial render safety
  const filteredStructures = normalizedStructures;

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  // Only show full loading spinner on initial load (no data)
  const isInitialLoading = loading && filteredStructures.length === 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm transition-opacity duration-200 ${loading ? "opacity-70" : "opacity-100"}`}>
      {/* Header - Always visible and mounted to prevent focus loss */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Salary Structures
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search structures..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={pagination.status}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
            <tr>
              <th className="text-left py-3 px-4 font-medium">
                Employee
              </th>

              <th className="text-left py-3 px-4 font-medium">
                Effective Date
              </th>
              <th className="text-left py-3 px-4 font-medium">
                Basic (Monthly)
              </th>
              <th className="text-left py-3 px-4 font-medium">
                Monthly CTC
              </th>
              <th className="text-left py-3 px-4 font-medium">
                Annual BASE CTC
              </th>
              {/* <th className="text-left py-3 px-4 font-medium">
                TDS
              </th> */}
              <th className="text-left py-3 px-4 font-medium">
                Frequency
              </th>
              <th className="text-left py-3 px-4 font-medium">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStructures.map((structure, index) => (
              <motion.tr
                key={structure.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {structure.employee?.firstName || structure.employee?.lastName
                      ? `${structure.employee.firstName || ""} ${structure.employee.lastName || ""}`.trim()
                      : structure.employee_name || "-"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {structure.employee_id || structure.employee?.employeeId || "-"}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {(() => {
                      const date = new Date(structure.effective_date || structure.effectiveDate);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}/${month}/${year}`;
                    })()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{parseFloat(structure.basic_salary ?? structure.basicSalary ?? 0).toLocaleString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    ₹{parseFloat(structure.monthlyCTC ?? structure.monthly_ctc ?? structure.totalCTC ?? structure.total_ctc ?? 0).toLocaleString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    ₹{parseFloat(structure.annualCTC ?? structure.annual_ctc ?? 0).toLocaleString()}
                  </div>
                </td>
                {/* <td className="py-3 px-4">
                  <div className="text-sm font-medium text-rose-600 dark:text-rose-400">
                    ₹{parseFloat(structure.tds ?? 0).toLocaleString()}
                  </div>
                </td> */}
                <td className="py-3 px-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {structure.frequency}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(structure.status)}`}>
                    {structure.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(structure)}
                      className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(structure.id)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredStructures.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {pagination.search || pagination.status !== "ALL"
                ? "No salary structures found matching your criteria"
                : "No salary structures found"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={pagination.currentPage}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.limit}
        onPageChange={onPageChange}
        onItemsPerPageChange={onLimitChange}
        className="mt-6"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Salary Structure"
        description="Are you sure you want to delete this salary structure? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
        </>
      )}
    </div>
  );
}
