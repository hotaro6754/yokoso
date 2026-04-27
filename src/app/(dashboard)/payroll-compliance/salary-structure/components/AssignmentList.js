"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Search, MoreVertical, Plus, Users, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/common/ConfirmModal";
import Pagination from "@/components/common/Pagination";

export default function AssignmentList({ refreshKey = 0, onAddAssignment }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    fetchAssignments();
  }, [refreshKey]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await payrollSalaryStructureService.getAllSalaryStructures({ limit: 100, page: 1 });
      const structures = response.data?.salaryStructures || response.data?.data || response.data || [];
      const assignmentsData = (Array.isArray(structures) ? structures : []).map((structure) => {
        const employeeName = structure.employee
          ? `${structure.employee.firstName || ""} ${structure.employee.lastName || ""}`.trim()
          : "Unknown";

        return {
          id: structure.id,
          public_id: structure.public_id || structure.publicId || `ASG-${structure.id}`,
          assignment_type: "individual",
          employee_ids: [structure.employee?.id || structure.employeeId || structure.employee_id].filter(Boolean),
          employee_names: employeeName ? [employeeName] : [],
          department_ids: [],
          department_names: structure.employee?.department?.name ? [structure.employee.department.name] : [],
          salary_structure_id: structure.id,
          salary_structure_name: structure.name || structure.public_id || structure.publicId || "Salary Structure",
          salary_structure_public_id: structure.public_id || structure.publicId || "",
          effective_date: structure.effective_date || structure.effectiveDate,
          end_date: null,
          status: structure.status || "ACTIVE",
          notes: structure.notes || "",
          rawStructure: structure
        };
      });

      setAssignments(assignmentsData);
    } catch (error) {
      toast.error(error.message || "Failed to fetch assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };
  console.log('assignments', assignments)

  const handleEdit = (assignment) => {
    const assignmentId = assignment.rawStructure?.id || assignment.id;
    router.push(`/payroll-compliance/salary-structure/assignment/${assignmentId}/edit`);
  };

  const handleDelete = (id) => {
    setAssignmentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await payrollSalaryStructureService.deleteSalaryStructure(assignmentToDelete);
      toast.success("Assignment deleted successfully");
      fetchAssignments();
    } catch (error) {
      toast.error(error.message || "Failed to delete assignment");
    } finally {
      setShowDeleteModal(false);
      setAssignmentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAssignmentToDelete(null);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.public_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.salary_structure_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.employee_names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      assignment.department_names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || assignment.status === statusFilter;
    const matchesType = typeFilter === "ALL" || assignment.assignment_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-3 h-3" />;
      case "INACTIVE":
        return <XCircle className="w-3 h-3" />;
      case "PENDING":
        return <Clock className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = filteredAssignments.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Salary Structure Assignments
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage salary structure assignments to employees and departments
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 w-full xl:w-auto">
          <div className="flex flex-nowrap items-center justify-end gap-3 w-full xl:w-auto">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search assignments..."
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

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-sm whitespace-nowrap"
            >
              <option value="ALL">All Types</option>
              <option value="individual">Individual</option>
              <option value="bulk" disabled>Bulk</option>
            </select>
          </div>

          {/* Add Assignment Button */}
          <button
            onClick={onAddAssignment}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Assignment
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Assignments</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {assignments.length}
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
                {assignments.filter(a => a.status === "ACTIVE").length}
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
                {assignments.filter(a => a.status === "PENDING").length}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Bulk Assignments</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {assignments.filter(a => a.assignment_type === "bulk").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
              <tr>
                <th className="text-left py-3 px-4 font-medium">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  Assigned To
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  Salary Structure
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  Effective Period
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
              {currentItems.map((assignment, index) => (
                <motion.tr
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${assignment.assignment_type === "individual"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                      : "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400"
                      }`}>
                      {assignment.assignment_type === "individual" ? "Individual" : "Bulk"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {assignment.assignment_type === "individual" ? (
                      <div>
                        {assignment.employee_names.map((name, idx) => (
                          <div key={idx} className="text-sm text-gray-900 dark:text-white">
                            {name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        {assignment.department_names.map((name, idx) => (
                          <div key={idx} className="text-sm text-gray-900 dark:text-white">
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                              {name} Dept
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {assignment.salary_structure_name}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(assignment.effective_date)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      to {formatDate(assignment.end_date)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      {assignment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
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

          {filteredAssignments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL"
                  ? "No assignments found matching your criteria"
                  : "No assignments found"}
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Assignment"
        description="Are you sure you want to delete this assignment? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {!loading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
}
