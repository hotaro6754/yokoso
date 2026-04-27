"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import ModerateReviewModal from "./ModerateReviewModal";
import CustomDropdown from "../../leave/components/CustomDropdown";

export default function HRModerationTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [filters, setFilters] = useState({
    status: "PENDING_HR_MODERATION",
    cycleId: "all",
    departmentId: "all",
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchCycles();
  }, []);

  useEffect(() => {
    fetchReviews();
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

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        status: filters.status !== "all" ? filters.status : "all",
        cycleId: filters.cycleId !== "all" ? filters.cycleId : "all",
        departmentId: filters.departmentId !== "all" ? filters.departmentId : "all",
      };
      const response = await performanceManagementService.getReviewsForModeration(params);
      const data = response.success ? response.data : response.data || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error(error.message || "Failed to fetch reviews for moderation");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchReviews();
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING_HR_MODERATION: { label: "Pending Moderation", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      PENDING_MANAGER_REVIEW: { label: "Pending Manager Review", className: "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400" },
    };
    const statusConfig = config[status] || config.PENDING_HR_MODERATION;
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
              Status
            </label>
            <CustomDropdown
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'PENDING_HR_MODERATION', label: 'Pending HR Moderation' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'PENDING_MANAGER_REVIEW', label: 'Pending Manager Review' }
              ]}
              placeholder="All Status"
              className="w-full"
            />
          </div>
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
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Self Review
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Manager Review
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    HR Review
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Final Rating
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
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <img
                          src={review.employee?.profileImage || "/images/users/user-default.png"}
                          alt={review.employee?.name}
                          className="h-8 w-8 rounded-full object-cover mr-2"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.employee?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {review.employee?.employeeId} • {review.employee?.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                      {review.selfReview?.submittedAt ? "Completed" : "Pending"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                      {review.overallRating ? "Completed" : "Pending"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                      {review.hrRating ? "Completed" : "Pending"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {review.hrRating || review.finalRating || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleModerate(review)}
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
                      >
                        Moderate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShieldCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No reviews found for moderation</p>
          </div>
        )}
      </div>

      {/* Moderate Review Modal */}
      {isModalOpen && selectedReview && (
        <ModerateReviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReview(null);
          }}
          review={selectedReview}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
