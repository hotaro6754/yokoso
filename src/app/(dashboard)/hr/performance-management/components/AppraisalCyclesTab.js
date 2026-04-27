"use client";

import { useState, useEffect } from "react";
import { Settings, Loader2, Plus, Eye } from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";
import CreateCycleModal from "./CreateCycleModal";
import CustomDropdown from "../../leave/components/CustomDropdown";
import Pagination from "@/components/common/Pagination";

export default function AppraisalCyclesTab() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

  useEffect(() => {
    fetchCycles();
  }, [filters.status, pagination.pageIndex, pagination.pageSize]);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const params = {
        status: filters.status !== "all" ? filters.status : "all",
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };
      const response = await performanceManagementService.getAppraisalCycles(params);

      // Support common response shapes:
      // 1) { success, data: [], pagination }
      // 2) { success, data: { cycles: [], pagination } }
      // 3) { data: { cycles: [], pagination } }
      const paginationInfo = response?.pagination || response?.data?.pagination || {};
      const data =
        (Array.isArray(response?.data) ? response.data : null) ||
        response?.data?.cycles ||
        response?.data?.data ||
        response?.data ||
        [];

      setCycles(Array.isArray(data) ? data : []);
      setTotalItems(paginationInfo.totalItems || paginationInfo.total || (Array.isArray(data) ? data.length : 0));
    } catch (error) {
      console.error("Error fetching cycles:", error);
      toast.error(error.message || "Failed to fetch appraisal cycles");
      setCycles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    fetchCycles();
    setIsModalOpen(false);
    setSelectedCycle(null);
  };

  const handleEdit = async (cycle) => {
    console.log('handleEdit called with cycle:', cycle);
    try {
      setEditLoading(true);
      // Fetch full cycle details to get all fields
      const response = await performanceManagementService.getAppraisalCycleById(cycle.id);
      const fullCycleData = response.success ? response.data : response.data;
      console.log('Full cycle data fetched:', fullCycleData);
      setSelectedCycle(fullCycleData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching full cycle details:', error);
      toast.error('Failed to fetch cycle details');
      // Fallback to using the basic cycle data if detailed fetch fails
      setSelectedCycle(cycle);
      setIsModalOpen(true);
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
      ACTIVE: { label: "Active", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      IN_PROGRESS: { label: "In Progress", className: "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400" },
      COMPLETED: { label: "Completed", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
      CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    };
    const statusConfig = config[status] || config.DRAFT;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        {statusConfig.label}
      </span>
    );
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const getProgress = (cycle) => {
    if (cycle?.progress !== undefined) return Math.round(cycle.progress);
    if (cycle?.completionPercent !== undefined) return Math.round(cycle.completionPercent);
    const total = cycle?.employeesCovered || cycle?.employeeCount || cycle?.totalEmployees || 0;
    const completed = cycle?.completedReviews || cycle?.reviewsCompleted || 0;
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <CustomDropdown
              value={filters.status}
              onChange={(value) => {
                setFilters({ ...filters, status: value });
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              options={statusOptions}
              placeholder="All Status"
              className="w-full"
            />
          </div>
          <button
            onClick={() => {
              setSelectedCycle(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-brand-500 text-white rounded-sm hover:bg-brand-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Cycle
          </button>
        </div>
      </div>

      {/* Cycles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : cycles.length > 0 ? (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              {/* Primary (brand) tinted header */}
              <thead className="bg-brand-50/70 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Cycle Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Employees Covered
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                {cycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{cycle.name}</p>
                        {cycle.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cycle.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      <div>
                        <p>{new Date(cycle.startDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">to {new Date(cycle.endDate).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {cycle.employeesCovered || cycle.employeeCount || cycle.totalEmployees || 0}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(cycle.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-[140px]">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{getProgress(cycle)}%</span>
                          <span>Complete</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-brand-500"
                            style={{ width: `${getProgress(cycle)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(cycle)}
                        disabled={editLoading}
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {editLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            View
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No appraisal cycles found</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalItems={totalItems}
          itemsPerPage={pagination.pageSize}
          showWhenEmpty={true}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))}
          onItemsPerPageChange={(size) => setPagination({ pageIndex: 0, pageSize: size })}
        />
      </div>

      {/* Create/Edit Cycle Modal */}
      {isModalOpen && (
        <CreateCycleModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCycle(null);
          }}
          cycle={selectedCycle}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
