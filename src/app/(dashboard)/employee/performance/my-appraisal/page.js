"use client";

import React, { useState, useEffect } from "react";
import { 
  Save, 
  Lock, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  AlertCircle
} from "lucide-react";
import HRMSLoader from "@/components/common/HRMSLoader";
import { employeePerformanceService } from "@/services/employee/performance.service";
import { toast } from "react-hot-toast";

export default function MyAppraisal() {
  const [appraisalData, setAppraisalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ratingOptions = [
    { value: 1, label: "Needs Improvement", color: "text-red-600" },
    { value: 2, label: "Below Expectations", color: "text-orange-600" },
    { value: 3, label: "Meets Expectations", color: "text-yellow-600" },
    { value: 4, label: "Exceeds Expectations", color: "text-green-600" },
    { value: 5, label: "Outstanding", color: "text-emerald-600" }
  ];

  const defaultCategories = [
    { key: "productivity", name: "Productivity", description: "Efficiency and output quality" },
    { key: "quality", name: "Quality of Work", description: "Attention to detail and excellence" },
    { key: "compliance", name: "Compliance", description: "Adherence to policies and procedures" },
    { key: "learning", name: "Learning & Certifications", description: "Continuous development and skill acquisition" },
    { key: "communication", name: "Communication", description: "Clarity and effectiveness in interactions" },
    { key: "adaptability", name: "Adaptability", description: "Flexibility and response to change" },
    { key: "organization", name: "Organization Skills", description: "Time management and prioritization" }
  ];

  useEffect(() => {
    // Fetch real appraisal data from API
    const fetchAppraisalData = async () => {
      try {
        const data = await employeePerformanceService.getCurrentAppraisal();
        
        if (data) {
          setAppraisalData(data);
          
          // Check if form should be locked
          if (data.status === "Submitted" || data.status === "Reviewed" || data.status === "PENDING_MANAGER_REVIEW") {
            setIsLocked(true);
            // Load submitted data if available
            if (data.assessmentData) {
              setFormData(data.assessmentData);
            }
          }

          // Use dynamic parameters if available, else fallback to defaults
          const params = (data.evaluationParameters && data.evaluationParameters.length > 0)
            ? data.evaluationParameters.map(p => ({
              key: p.id || p.name,
              name: p.name,
              description: p.description || ""
            }))
            : defaultCategories;

          setCategories(params);

          // Initialize formData for categories if not already set (draft/submitted)
          if (!data.assessmentData) {
            const initialForm = {};
            params.forEach(c => {
              initialForm[c.key] = { rating: 3, comment: "" };
            });
            setFormData(initialForm);
          }
        } else {
          // No active appraisal cycle
          setAppraisalData(null);
        }
      } catch (error) {
        console.error("Failed to fetch appraisal data", error);
        toast.error("Failed to load appraisal data");
        // Set fallback data for demo purposes
        setAppraisalData({
          cycle: "No Active Cycle",
          status: "None",
          message: "No active appraisal cycles available"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppraisalData();
  }, []);

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

  const handleSubmit = async () => {
    if (isLocked) return;
    
    console.log("Submitting appraisal with data:", appraisalData);
    console.log("Appraisal Cycle ID:", appraisalData?.appraisalCycleId);
    
    setIsSubmitting(true);
    try {
      await employeePerformanceService.submitSelfAssessment(
        appraisalData.appraisalCycleId, 
        formData
      );
      
      setAppraisalData(prev => ({
        ...prev,
        status: "Submitted",
        submittedAt: new Date().toISOString()
      }));
      setIsLocked(true);
      toast.success("Appraisal submitted successfully!");
    } catch (error) {
      console.error("Failed to submit appraisal", error);
      toast.error(error.message || "Failed to submit appraisal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isLocked) return;
    
    try {
      // Only save draft if there's an existing review
      if (appraisalData.id) {
        await employeePerformanceService.saveDraft(
          appraisalData.id, 
          formData
        );
      } else {
        // If no review exists yet, we can't save draft - show message
        toast.info("Please submit the appraisal to create a review first");
        return;
      }
      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Failed to save draft", error);
      toast.error(error.message || "Failed to save draft");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} /> },
      Submitted: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle size={14} /> },
      "PENDING_MANAGER_REVIEW": { color: "bg-blue-100 text-blue-800", icon: <CheckCircle size={14} /> },
      Reviewed: { color: "bg-green-100 text-green-800", icon: <CheckCircle size={14} /> }
    };
    
    const config = statusConfig[status] || statusConfig.Pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon}
        {status === "PENDING_MANAGER_REVIEW" ? "Pending Manager Review" : status}
      </span>
    );
  };

  if (isLoading) {
    return <HRMSLoader text="Loading appraisal..." variant="fullscreen" size="md" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Appraisal</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {appraisalData ? `Self-assessment for ${appraisalData.cycle}` : "No active appraisal cycle"}
              </p>
              {appraisalData && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    Available: {formatDate(appraisalData.startDate)} - {formatDate(appraisalData.endDate)}
                  </span>
                  <span className="text-gray-500">
                    Deadline: {formatDate(appraisalData.employeeSubmissionDeadline)}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              {getStatusBadge(appraisalData?.status || "None")}
              {appraisalData && (
                <p className="text-xs text-gray-500 mt-1">Deadline: {formatDate(appraisalData?.employeeSubmissionDeadline)}</p>
              )}
            </div>
          </div>
          
          {!appraisalData && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">No Active Appraisal</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    There are currently no active appraisal cycles available for self-assessment. Please check back later or contact your HR administrator.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isLocked && appraisalData?.status === "Reviewed" && appraisalData?.managerFeedback && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <MessageSquare size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Manager Feedback</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">{appraisalData.managerFeedback}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Appraisal Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-primary-100/50 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Assessment</h2>
            {isLocked && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Lock size={16} />
                <span className="text-sm font-medium">Form Locked</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.key} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating
                    </label>
                    <select
                      value={formData[category.key]?.rating || 3}
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
                      Comments
                    </label>
                    <textarea
                      value={formData[category.key]?.comment || ""}
                      onChange={(e) => handleCommentChange(category.key, e.target.value)}
                      disabled={isLocked}
                      rows={3}
                      placeholder="Provide specific examples and achievements..."
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
            {!isLocked && appraisalData ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Save as Draft
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
                      <Save size={16} />
                      Submit Appraisal
                    </>
                  )}
                </button>
              </>
            ) : !appraisalData ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Lock size={20} />
                <span className="font-medium">No appraisal available to submit</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle size={20} />
                <span className="font-medium">
                  {appraisalData?.status === "Reviewed" ? "Appraisal Completed" : 
                   appraisalData?.status === "PENDING_MANAGER_REVIEW" ? "Appraisal Submitted - Pending Manager Review" :
                   "Appraisal Submitted"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
