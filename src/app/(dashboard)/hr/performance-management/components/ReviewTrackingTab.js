"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { organizationService } from "@/services/hr-services/organization.service";
import CustomDropdown from "../../leave/components/CustomDropdown";
import { toast } from "react-hot-toast";

const StageBadge = ({ done }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
    done
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  }`}>
    {done ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
    {done ? "Completed" : "Pending"}
  </span>
);

export default function ReviewTrackingTab() {
  const [reviews, setReviews] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cycleId: "all",
    departmentId: "all",
  });

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchFilters = async () => {
    try {
      const [cycleRes, deptRes] = await Promise.allSettled([
        performanceManagementService.getAppraisalCycles({ status: "all" }),
        organizationService.getAllDepartments({ limit: 100 }),
      ]);
      const cycleData = cycleRes.status === "fulfilled" ? cycleRes.value?.data || cycleRes.value || [] : [];
      const deptData = deptRes.status === "fulfilled"
        ? deptRes.value?.data?.departments || deptRes.value?.data || deptRes.value || []
        : [];
      setCycles(Array.isArray(cycleData) ? cycleData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        cycleId: filters.cycleId !== "all" ? filters.cycleId : "all",
        departmentId: filters.departmentId !== "all" ? filters.departmentId : "all",
        status: "all",
      };
      const response = await performanceManagementService.getReviewsForModeration(params);
      const data = response.success ? response.data : response.data || response || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching review tracking:", error);
      toast.error(error.message || "Failed to fetch review tracking");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Pending HR";
    return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cycle
            </label>
            <CustomDropdown
              value={filters.cycleId}
              onChange={(value) => setFilters((prev) => ({ ...prev, cycleId: value }))}
              options={[
                { value: "all", label: "All Cycles" },
                ...cycles.map((cycle) => ({ value: cycle.id, label: cycle.name })),
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
              onChange={(value) => setFilters((prev) => ({ ...prev, departmentId: value }))}
              options={[
                { value: "all", label: "All Departments" },
                ...departments.map((dept) => ({ value: dept.id, label: dept.name })),
              ]}
              placeholder="All Departments"
              className="w-full"
            />
          </div>
        </div>
      </div>

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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reviews.map((review) => {
                  const employee = review.employee || {};
                  const selfDone = Boolean(review.selfReview?.submittedAt || review.selfReviewStatus === "COMPLETED");
                  const managerDone = Boolean(review.managerReview?.submittedAt || review.overallRating);
                  const hrDone = Boolean(review.hrRating || review.hrComments);
                  const finalRating = review.hrRating || review.finalRating || "-";
                  return (
                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.name || "Employee"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {employee.employeeId || employee.publicId || "ID pending"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge done={selfDone} />
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge done={managerDone} />
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge done={hrDone} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {finalRating}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {getStatusLabel(review.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
            No reviews found.
          </div>
        )}
      </div>
    </div>
  );
}
