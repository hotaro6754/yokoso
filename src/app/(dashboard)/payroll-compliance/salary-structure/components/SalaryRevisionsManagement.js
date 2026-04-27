"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  MessageSquare,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { payrollSalaryStructureService } from "@/services/payroll-role-services/salary-structure.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SalaryRevisionBulkUploadModal from "./RevisionBulkUploadModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import Pagination from "@/components/common/Pagination";

export default function SalaryRevisionsManagement() {
  const { user } = useAuth();
  const isHrAdmin = user?.systemRole === "HR_ADMIN";

  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    search: "",
    status: "ALL"
  });
  const [localSearch, setLocalSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirmModal, setBulkConfirmModal] = useState({ 
    isOpen: false, 
    action: null, 
    title: "", 
    description: "" 
  });
  const router = useRouter();

  useEffect(() => {
    fetchRevisions();
  }, [pagination.currentPage, pagination.limit, pagination.status, pagination.search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== pagination.search) {
        setPagination(prev => ({ ...prev, search: localSearch, currentPage: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, pagination.search]);

  // Sync local search with pagination search
  useEffect(() => {
    setLocalSearch(pagination.search);
  }, [pagination.search]);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const response = await payrollSalaryStructureService.getRevisions({
        limit: pagination.limit,
        page: pagination.currentPage,
        status: pagination.status === "ALL" ? undefined : pagination.status,
        search: pagination.search
      });
      const resData = response;
      const records = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      const meta = resData.meta || resData.pagination || {};

      const mapped = records.map((revision) => {
        const oldSalary = revision.oldStructure?.annualCTC || 0;
        const newSalary = revision.newStructure?.annualCTC || 0;
        const change = oldSalary
          ? ((newSalary - oldSalary) / oldSalary) * 100
          : oldSalary === 0 && newSalary > 0
            ? 100
            : 0;

        return {
          id: revision.id,
          public_id: revision.publicId || revision.id,
          employee_id: revision.employeeId,
          employee_name: revision.employee
            ? `${revision.employee.user?.firstName || ""} ${revision.employee.user?.lastName || ""}`.trim()
            : "Unknown",
          old_salary: oldSalary,
          new_salary: newSalary,
          revision_type: revision.revisionReason || "INCREMENT",
          percentage_change: Number.isFinite(change) ? change : 0,
          effective_date: revision.effectiveDate,
          status: revision.status,
          approved_by: revision.approver
            ? `${revision.approver.firstName} ${revision.approver.lastName}`
            : null,
          approved_date: revision.updatedAt,
          retro_calculation: false,
          retro_amount: 0,
          notes: revision.notes || "",
          salary_structure_id: revision.salaryTemplateId,
          created_at: revision.createdAt,
          updated_at: revision.updatedAt,
        };
      });

      setRevisions(mapped);
      if (meta.totalPages) {
        setPagination(prev => ({
          ...prev,
          totalPages: meta.totalPages,
          totalItems: meta.total || meta.totalItems || mapped.length,
          totalApproved: meta.totalApproved || 0,
          totalPending: meta.totalPending || 0
        }));
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch salary revisions");
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (revision) => {
    // Only draft or pending can be edited? Usually draft.
    toast.error("Editing revisions is coming soon");
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === "APPROVED") {
        await payrollSalaryStructureService.updateRevisionStatus(id, "APPROVE");
      } else if (newStatus === "REJECTED") {
        await payrollSalaryStructureService.updateRevisionStatus(id, "REJECT");
      }
      toast.success(`Revision ${newStatus.toLowerCase()} successfully`);
      fetchRevisions(); // Refresh
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return;
    
    const action = newStatus === "APPROVED" ? "APPROVE" : "REJECT";
    
    setBulkConfirmModal({
      isOpen: true,
      action: action,
      title: `Bulk ${action === "APPROVE" ? "Approval" : "Rejection"}`,
      description: `Are you sure you want to ${action.toLowerCase()} ${selectedIds.length} revisions? This action cannot be undone.`
    });
  };

  const executeBulkAction = async () => {
    const { action } = bulkConfirmModal;
    if (!action) return;

    try {
      setLoading(true);
      setBulkConfirmModal(prev => ({ ...prev, isOpen: false }));
      await payrollSalaryStructureService.bulkUpdateRevisionStatus(selectedIds, action);
      toast.success(`Bulk ${action.toLowerCase()} processed successfully`);
      setSelectedIds([]);
      fetchRevisions();
    } catch (error) {
      toast.error(error.message || "Failed to process bulk action");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pendings = filteredRevisions
      .filter(r => r.status === 'PENDING_APPROVAL' || r.status === 'PENDING')
      .map(r => r.id);
    
    if (selectedIds.length === pendings.length && pendings.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendings);
    }
  };

  const filteredRevisions = revisions; // Backend now handles filtering

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "PENDING_APPROVAL":
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400";
      case "DRAFT":
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "INCREMENT":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "PROMOTION":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      case "CORRECTION":
        return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400";
      case "INITIAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isInitialLoading = loading && revisions.length === 0;

  return (
    <div className="space-y-6">
      <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-opacity duration-200 ${loading ? "opacity-70" : "opacity-100"}`}>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Salary Revision Management
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track increment cycles, promotions, and retro-impact on payroll
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employee..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 text-sm w-48 xl:w-64 transition-all"
            />
          </div>

          <select
            value={pagination.status}
            onChange={(e) => setPagination(prev => ({ ...prev, status: e.target.value, currentPage: 1 }))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">Status: All</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING_APPROVAL">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>

          {selectedIds.length > 0 && isHrAdmin && (
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
              <button
                onClick={() => handleBulkStatusChange("APPROVED")}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Approve ({selectedIds.length})
              </button>
              <button
                onClick={() => handleBulkStatusChange("REJECTED")}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          )}

          {isHrAdmin ? (
            <div></div>
          ) : (
            <>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all"
              >
                <TrendingUp className="w-4 h-4 text-primary-600" /> Bulk Upload
              </button>

              <Link
                href="/payroll-compliance/salary-structure/revisions/create"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-primary-500/20"
              >
                <Plus className="w-4 h-4" />
                New Revision
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Revisions
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pagination.totalItems}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Approved
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pagination.totalApproved || 0}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pagination.totalPending || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revisions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm">
        {isInitialLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
              <tr>
                {isHrAdmin && (
                   <th className="py-3 px-4 w-10">
                     <input 
                       type="checkbox" 
                       checked={selectedIds.length > 0 && selectedIds.length === filteredRevisions.filter(r => r.status === 'PENDING_APPROVAL' || r.status === 'PENDING').length}
                       onChange={toggleSelectAll}
                       className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                     />
                   </th>
                )}
                <th className="text-left py-3 px-4 font-medium">Revision ID</th>
                <th className="text-left py-3 px-4 font-medium">Employee</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">
                  Salary Change
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  Effective Date
                </th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRevisions.map((revision, index) => (
                <motion.tr
                  key={revision.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {isHrAdmin && (
                    <td className="py-3 px-4">
                      {(revision.status === 'PENDING_APPROVAL' || revision.status === 'PENDING') ? (
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(revision.id)}
                          onChange={() => toggleSelect(revision.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      ) : (
                        <div className="w-4 h-4"></div>
                      )}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {revision.public_id}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {revision.id}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {revision.employee_name}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(revision.revision_type)}`}
                    >
                      {revision.revision_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(revision.old_salary)} →{" "}
                        {formatCurrency(revision.new_salary)}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          revision.percentage_change >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {revision.percentage_change >= 0 ? "+" : ""}
                        {revision.percentage_change.toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(revision.effective_date)}
                    </div>
                    {revision.retro_calculation && (
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Retro: {formatCurrency(revision.retro_amount)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(revision.status)}`}
                    >
                      {revision.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRevision(revision)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {(revision.status === "PENDING_APPROVAL" ||
                        revision.status === "PENDING") && isHrAdmin && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(revision.id, "APPROVED")
                            }
                            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(revision.id, "REJECTED")
                            }
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {revision.status === "DRAFT" && (
                        <button
                          onClick={() => handleEdit(revision)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredRevisions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {pagination.search || pagination.status !== "ALL"
                  ? "No revisions found matching your criteria"
                  : "No revisions found"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
          onItemsPerPageChange={(limit) => setPagination(prev => ({ ...prev, limit: 1, currentPage: 1 }))}
          className="mt-6"
        />
        </>
        )}
      </div>

      {/* Revision Details Modal */}
      {selectedRevision && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revision Details - {selectedRevision.public_id}
              </h3>
              <button
                onClick={() => setSelectedRevision(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Employee Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Name:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedRevision.employee_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Revision Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Type:
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedRevision.revision_type)}`}
                      >
                        {selectedRevision.revision_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Old Salary:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(selectedRevision.old_salary)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        New Salary:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(selectedRevision.new_salary)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Change:
                      </span>
                      <span
                        className={`font-medium ${
                          selectedRevision.percentage_change >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {selectedRevision.percentage_change >= 0 ? "+" : ""}
                        {selectedRevision.percentage_change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Effective Date:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(selectedRevision.effective_date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Created:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(selectedRevision.created_at)}
                      </span>
                    </div>
                    {selectedRevision.approved_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Approved:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(selectedRevision.approved_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Approval Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRevision.status)}`}
                      >
                        {selectedRevision.status}
                      </span>
                    </div>
                    {selectedRevision.approved_by && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Approved By:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedRevision.approved_by}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRevision.retro_calculation && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Retro Calculation
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Retro Amount:
                        </span>
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          {formatCurrency(selectedRevision.retro_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedRevision.notes && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Notes
                </h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                  {selectedRevision.notes}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-end gap-3">
              {(selectedRevision.status === "PENDING_APPROVAL" ||
                selectedRevision.status === "PENDING") && isHrAdmin && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedRevision.id, "REJECTED");
                      setSelectedRevision(null);
                    }}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject Revision
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedRevision.id, "APPROVED");
                      setSelectedRevision(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Revision
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedRevision(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <SalaryRevisionBulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImportSuccess={() => {
          setIsBulkModalOpen(false);
          fetchRevisions();
        }}
      />
      <ConfirmModal
        isOpen={bulkConfirmModal.isOpen}
        title={bulkConfirmModal.title}
        description={bulkConfirmModal.description}
        confirmText={bulkConfirmModal.action === "APPROVE" ? "Approve" : "Reject"}
        confirmButtonClassName={bulkConfirmModal.action === "APPROVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
        onConfirm={executeBulkAction}
        onCancel={() => setBulkConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
