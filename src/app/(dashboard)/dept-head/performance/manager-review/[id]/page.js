"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MessageSquare, Save, Send, Lock, CheckCircle, User, ArrowLeft, Briefcase, Users } from "lucide-react";
import Link from "next/link";
import HRMSLoader from "@/components/common/HRMSLoader";

export default function ManagerReview() {
  const params = useParams();
  const router = useRouter();
  const managerId = params.id;
  
  const [managerData, setManagerData] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [formData, setFormData] = useState({
    delivery: { rating: 3, comment: "" },
    compliance: { rating: 3, comment: "" },
    practiceContribution: { rating: 3, comment: "" },
    overallPerformance: { rating: 3, comment: "" }
  });

  const ratingOptions = [
    { value: 1, label: "Needs Improvement", color: "text-red-600" },
    { value: 2, label: "Below Expectations", color: "text-orange-600" },
    { value: 3, label: "Meets Expectations", color: "text-yellow-600" },
    { value: 4, label: "Exceeds Expectations", color: "text-green-600" },
    { value: 5, label: "Outstanding", color: "text-emerald-600" }
  ];

  const reviewCategories = [
    { key: "delivery", name: "Delivery & Execution", description: "Project delivery, timeliness, and quality of outcomes" },
    { key: "compliance", name: "Compliance & Governance", description: "Adherence to policies, processes, and regulatory requirements" },
    { key: "practiceContribution", name: "Practice Contribution", description: "Knowledge sharing, innovation, and practice development" },
    { key: "overallPerformance", name: "Overall Performance", description: "Leadership, team management, and strategic impact" }
  ];

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        // Mock data - in real app, this would come from API
        const mockManagerData = {
          id: parseInt(managerId),
          name: "David Thompson",
          email: "david.thompson@company.com",
          department: "Engineering",
          designation: "Engineering Manager",
          teamSize: 8,
          joinDate: "2021-06-15"
        };

        const mockReviewData = {
          cycle: "Q4 2024",
          status: "In Progress", // Pending Review, In Progress, Reviewed
          submissionDate: "2024-12-28",
          managerSelfRating: 4.2,
          managerComments: {
            delivery: "Successfully delivered all key projects on time with high quality standards",
            compliance: "Maintained excellent compliance with all engineering standards and practices",
            practiceContribution: "Led several knowledge sharing sessions and contributed to practice improvements",
            overallPerformance: "Strong leadership with positive team feedback and good project outcomes"
          },
          deptHeadRating: null,
          deptHeadComments: null,
          finalScore: null,
          reviewedAt: null
        };
        
        setManagerData(mockManagerData);
        setReviewData(mockReviewData);
        
        // Check if form should be locked
        if (mockReviewData.status === "Reviewed") {
          setIsLocked(true);
          // Load existing department head ratings if available
          if (mockReviewData.deptHeadRating) {
            setFormData({
              delivery: { rating: 4, comment: "Excellent project delivery and team management" },
              compliance: { rating: 5, comment: "Outstanding adherence to governance and standards" },
              practiceContribution: { rating: 4, comment: "Strong contributions to engineering practice" },
              overallPerformance: { rating: 4, comment: "Consistent high performance and leadership" }
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch review data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewData();
  }, [managerId]);

  const handleRatingChange = (category, rating) => {
    if (isLocked) return;
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], rating }
    }));
  };

  const handleCommentChange = (category, comment) => {
    if (isLocked) return;
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], comment }
    }));
  };

  const calculateAverageScore = () => {
    const ratings = Object.values(formData).map(item => item.rating);
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const handleSaveDraft = async () => {
    if (isLocked) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReviewData(prev => ({
        ...prev,
        status: "In Progress",
        deptHeadRating: parseFloat(calculateAverageScore())
      }));
    } catch (error) {
      console.error("Failed to save draft", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isLocked) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalScore = parseFloat(calculateAverageScore());
      
      setReviewData(prev => ({
        ...prev,
        status: "Reviewed",
        deptHeadRating: finalScore,
        finalScore: finalScore,
        reviewedAt: new Date().toISOString()
      }));
      setIsLocked(true);
    } catch (error) {
      console.error("Failed to submit review", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Pending Review": { color: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} /> },
      "In Progress": { color: "bg-blue-100 text-blue-800", icon: <Edit size={14} /> },
      "Reviewed": { color: "bg-green-100 text-green-800", icon: <CheckCircle size={14} /> }
    };
    
    const config = statusConfig[status] || statusConfig["Pending Review"];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  if (isLoading) {
    return <HRMSLoader text="Loading manager review..." variant="fullscreen" size="md" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link
                href="/dept-head/performance/manager-reviews"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Managers
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manager Performance Review</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{managerData?.name}</span>
                  </div>
                  <div className="text-gray-400">•</div>
                  <span className="text-gray-600 dark:text-gray-400">{managerData?.designation}</span>
                  <div className="text-gray-400">•</div>
                  <span className="text-gray-600 dark:text-gray-400">{reviewData?.cycle}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{managerData?.department}</span>
                  </div>
                  <div className="text-gray-400">•</div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{managerData?.teamSize} team members</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(reviewData?.status)}
              <p className="text-xs text-gray-500 mt-1">Submitted: {reviewData?.submissionDate}</p>
            </div>
          </div>
        </div>

        {/* Manager Self Assessment */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manager Self Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Self Rating</h3>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(reviewData?.managerSelfRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {reviewData?.managerSelfRating || "Not Rated"}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Manager Comments</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Object.entries(reviewData?.managerComments || {}).map(([key, comment]) => (
                  <div key={key} className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {comment}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Department Head Assessment Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Department Head Assessment</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average Score: <span className="font-bold text-gray-900 dark:text-white">{calculateAverageScore()}</span>
              </div>
              {isLocked && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Lock size={16} />
                  <span className="text-sm font-medium">Submitted</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {reviewCategories.map((category) => (
              <div key={category.key} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Rating
                    </label>
                    <select
                      value={formData[category.key].rating}
                      onChange={(e) => handleRatingChange(category.key, parseInt(e.target.value))}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                        isLocked ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
                      }`}
                    >
                      {ratingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value} - {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Comments
                    </label>
                    <textarea
                      value={formData[category.key].comment}
                      onChange={(e) => handleCommentChange(category.key, e.target.value)}
                      disabled={isLocked}
                      rows={3}
                      placeholder="Provide specific examples and feedback..."
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none ${
                        isLocked ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            {!isLocked ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Draft
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Review
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle size={20} />
                <span className="font-medium">Review Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
