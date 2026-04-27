"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { toast } from "react-hot-toast";

export default function ModerateReviewModal({ isOpen, onClose, review, onSuccess }) {
  const [formData, setFormData] = useState({
    hrRating: "",
    hrComments: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (review && isOpen) {
      setFormData({
        hrRating: review.hrRating || "",
        hrComments: review.hrComments || "",
      });
    } else if (isOpen) {
      setFormData({
        hrRating: "",
        hrComments: "",
      });
    }
    setErrors({});
  }, [review, isOpen]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.hrRating) {
      setErrors({ hrRating: "HR rating is required" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        hrRating: formData.hrRating,
        hrComments: formData.hrComments,
        finalRating: formData.hrRating,
      };
      await performanceManagementService.moderateReviewRating(review.id, payload);
      toast.success("Review moderated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error moderating review:", error);
      toast.error(error.message || "Failed to moderate review");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Moderate Review Rating</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Review Details */}
          {review && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Employee</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {review.employee?.name} ({review.employee?.employeeId})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manager Rating</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {review.overallRating || review.managerRating || "-"}
                </p>
              </div>
              {review.latestFeedback?.feedback && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manager Feedback</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{review.latestFeedback.feedback}</p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HR Adjusted Rating <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.hrRating}
                onChange={(e) => handleInputChange("hrRating", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white ${
                  errors.hrRating ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select Rating</option>
                <option value="5">5 - Outstanding</option>
                <option value="4">4 - Exceeds</option>
                <option value="3">3 - Meets</option>
                <option value="2">2 - Needs Improvement</option>
                <option value="1">1 - Unsatisfactory</option>
              </select>
              {errors.hrRating && (
                <p className="mt-1 text-sm text-red-500">{errors.hrRating}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Final rating will be set based on HR adjusted rating.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HR Remarks
              </label>
              <textarea
                value={formData.hrComments}
                onChange={(e) => handleInputChange("hrComments", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add HR remarks for moderation..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Moderating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Moderate Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
