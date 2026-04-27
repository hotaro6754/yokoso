"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2, User, Eye } from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";
import CustomDropdown from "../../leave/components/CustomDropdown";

export default function ManagerFeedbackTab() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState([]);
  const [filters, setFilters] = useState({
    cycleId: "all",
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [filters]);

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const response = await performanceManagementService.getAppraisalCycles({ status: "all" });
      const data = response.success ? response.data : response.data || response || [];
      setCycles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching cycles:", error);
      setCycles([]);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = {
        cycleId: filters.cycleId !== "all" ? filters.cycleId : "all",
      };
      const response = await performanceManagementService.getManagerFeedback(params);
      const data = response.success ? response.data : response.data || [];
      setFeedback(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error(error.message || "Failed to fetch manager feedback");
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadge = (rating) => {
    const config = {
      EXCEEDS_EXPECTATIONS: { label: "Exceeds Expectations", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      MEETS_EXPECTATIONS: { label: "Meets Expectations", className: "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400" },
      NEEDS_IMPROVEMENT: { label: "Needs Improvement", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      UNSATISFACTORY: { label: "Unsatisfactory", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    };
    const ratingConfig = config[rating] || config.MEETS_EXPECTATIONS;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ratingConfig.className}`}>
        {ratingConfig.label}
      </span>
    );
  };

  const handleView = (item) => {
    setSelectedFeedback(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Appraisal Cycle
            </label>
            <CustomDropdown
              value={filters.cycleId}
              onChange={(value) => setFilters({ ...filters, cycleId: value })}
              options={[
                { value: "all", label: "All Cycles" },
                ...cycles.map((cycle) => ({ value: cycle.id, label: cycle.name })),
              ]}
              placeholder="All Cycles"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : feedback.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {feedback.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.employee?.name} ({item.employee?.employeeId})
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.employee?.department} • Manager: {item.manager?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRatingBadge(item.rating)}
                        <button
                          onClick={() => handleView(item)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </span>
                        </button>
                      </div>
                    </div>
                    {item.feedback && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.feedback}</p>
                      </div>
                    )}
                    {item.strengths && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Strengths:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.strengths}</p>
                      </div>
                    )}
                    {item.areasForImprovement && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Areas for Improvement:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.areasForImprovement}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {item.review?.cycle && (
                        <span>Cycle: {item.review.cycle.name}</span>
                      )}
                      {item.createdAt && (
                        <span>Date: {new Date(item.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No manager feedback found</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedFeedback && (
        <ManagerFeedbackModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFeedback(null);
          }}
          feedback={selectedFeedback}
        />
      )}
    </div>
  );
}

function ManagerFeedbackModal({ isOpen, onClose, feedback }) {
  if (!isOpen) return null;

  const selfReview = feedback.selfReview || {};
  const managerReview = feedback.managerReview || feedback.latestFeedback || {};
  const goalRatings = feedback.goalRatings || [];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Manager Feedback Review
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/30">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Employee</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {feedback.employee?.name} ({feedback.employee?.employeeId})
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {feedback.employee?.department} • Manager: {feedback.manager?.name || "Manager"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Self Review</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Employee self rating and notes.
              </p>
              <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Rating:</span>{" "}
                  {selfReview.rating || feedback.selfRating || "—"}
                </p>
                <p>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Comments:</span>{" "}
                  {selfReview.comments || feedback.selfComments || "No comments provided."}
                </p>
                <p>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Achievements:</span>{" "}
                  {selfReview.achievements || feedback.achievementNotes || "No achievements logged."}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Manager Review</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Read-only feedback and strengths.
              </p>
              <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Rating:</span>{" "}
                  {feedback.rating || feedback.overallRating || "—"}
                </p>
                <p>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Comments:</span>{" "}
                  {managerReview.feedback || feedback.feedback || "No manager comments."}
                </p>
                <p>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Strengths:</span>{" "}
                  {managerReview.strengths || feedback.strengths || "Not captured."}
                </p>
                <p>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Improvement Areas:</span>{" "}
                  {managerReview.areasForImprovement || feedback.areasForImprovement || "Not captured."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Manager Ratings by Goal</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {goalRatings.length > 0 ? (
                goalRatings.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between">
                    <span>{goal.title || "Goal"}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {goal.rating || "—"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">No per-goal ratings shared.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
