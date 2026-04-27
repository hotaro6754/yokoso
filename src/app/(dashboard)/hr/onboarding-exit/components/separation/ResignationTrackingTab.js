"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2, Filter, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import ResignationModal from "./ResignationModal";

export default function ResignationTrackingTab() {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    departmentId: "all",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchResignations();
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

  const fetchResignations = async () => {
    try {
      setLoading(true);
      const params = {
        status: filters.status !== "all" ? filters.status : "all",
        departmentId: filters.departmentId !== "all" ? filters.departmentId : "all",
      };
      const response = await onboardingExitService.getResignations(params);
      const data = response.success ? response.data : response.data || [];
      setResignations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching resignations:", error);
      toast.error(error.message || "Failed to fetch resignations");
      setResignations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (resignationId, status, rejectionReason) => {
    try {
      const payload = { status };
      if (status === "REJECTED" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }
      await onboardingExitService.updateResignationStatus(resignationId, payload);
      toast.success("Resignation status updated successfully");
      fetchResignations();
    } catch (error) {
      console.error("Error updating resignation status:", error);
      toast.error(error.message || "Failed to update resignation status");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { icon: Clock, label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      APPROVED: { icon: CheckCircle, label: "Approved", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      REJECTED: { icon: XCircle, label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
      WITHDRAWN: { icon: AlertCircle, label: "Withdrawn", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
    };
    const statusConfig = config[status] || config.PENDING;
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        <Icon className="w-3 h-3" />
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
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <select
              value={filters.departmentId}
              onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold"
          >
            Create Resignation
          </button>
        </div>
      </div>

      {/* Resignations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : resignations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Resignation Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Last Working Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {resignations.map((resignation) => (
                  <tr key={resignation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {resignation.employee?.profileImage ? (
                          <img
                            src={resignation.employee.profileImage}
                            alt={resignation.employee?.name}
                            className="h-8 w-8 rounded-full object-cover mr-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-8 w-8 rounded-full mr-2 bg-gray-200 dark:bg-gray-600 flex items-center justify-center ${
                            resignation.employee?.profileImage ? 'hidden' : 'flex'
                          }`}
                          style={{ display: resignation.employee?.profileImage ? 'none' : 'flex' }}
                        >
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {resignation.employee?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {resignation.employee?.employeeId} • {resignation.employee?.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(resignation.resignationDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(resignation.lastWorkingDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {resignation.reason}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(resignation.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {resignation.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(resignation.id, "APPROVED")}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Enter rejection reason:");
                                if (reason) handleStatusUpdate(resignation.id, "REJECTED", reason);
                              }}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No resignations found</p>
          </div>
        )}
      </div>

      {/* Create Resignation Modal */}
      {isModalOpen && (
        <ResignationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchResignations();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
