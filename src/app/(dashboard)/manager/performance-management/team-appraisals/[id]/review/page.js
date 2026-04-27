"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { use } from "react";
import { ArrowLeft, User, Calendar, Star, Save, Send, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import HRMSLoader from "@/components/common/HRMSLoader";
import { managerPerformanceService } from "@/services/manager/performance.service";
import { toast } from "react-hot-toast";

export default function EmployeeAppraisalReview({ params }) {
  const router = useRouter();
  const [appraisalData, setAppraisalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [id, setId] = useState(null);
  
  // Review form state
  const [reviewData, setReviewData] = useState({
    overallRating: 3,
    potentialRating: 3,
    feedback: "",
    strengths: "",
    areasForImprovement: "",
    goals: "",
    oneOnOneCompleted: false
  });

  // Handle params being a Promise in Next.js 15
  React.useEffect(() => {
    if (params instanceof Promise) {
      params.then(resolvedParams => {
        setId(resolvedParams.id);
      });
    } else {
      setId(params.id);
    }
  }, [params]);

  useEffect(() => {
    const fetchAppraisalData = async () => {
      if (!id) return;
      
      try {
        const data = await managerPerformanceService.getEmployeeAppraisal(id);
        setAppraisalData(data);
        
        // Pre-fill with existing manager feedback if available
        if (data.managerFeedback) {
          setReviewData({
            overallRating: data.managerFeedback.rating || 3,
            potentialRating: data.potentialRating ? (typeof data.potentialRating === 'number' ? data.potentialRating : 3) : 3,
            feedback: data.managerFeedback.feedback || "",
            strengths: data.managerFeedback.strengths || "",
            areasForImprovement: data.managerFeedback.areasForImprovement || "",
            goals: data.managerFeedback.goals || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch appraisal data:", error);
        toast.error(error.message || "Failed to load appraisal data");
        router.push("/manager/performance-management/team-appraisals");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAppraisalData();
    }
  }, [id, router]);

  const handleInputChange = (field, value) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRatingChange = (field, rating) => {
    setReviewData(prev => ({
      ...prev,
      [field]: rating
    }));
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await managerPerformanceService.saveReviewDraft(id, reviewData);
      toast.success("Draft saved successfully");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error(error.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitReview = async () => {
    // Validate required fields
    if (!reviewData.feedback.trim()) {
      toast.error("Please provide feedback before submitting");
      return;
    }

    // Format detailed assessment into feedback
    const categories = [
      { key: "productivity", name: "Productivity" },
      { key: "quality", name: "Quality of Work" },
      { key: "compliance", name: "Compliance" },
      { key: "learning", name: "Learning & Certifications" },
      { key: "communication", name: "Communication" },
      { key: "adaptability", name: "Adaptability" },
      { key: "organization", name: "Organization Skills" }
    ];

    let detailedFeedback = reviewData.feedback + "\n\n--- Detailed Assessment ---\n";
    categories.forEach(cat => {
      const rating = reviewData[cat.key]?.rating;
      const comment = reviewData[cat.key]?.comment;
      if (rating) {
        detailedFeedback += `${cat.name}: ${rating}/5${comment ? ` - ${comment}` : ''}\n`;
      }
    });

    const submissionData = {
      ...reviewData,
      feedback: detailedFeedback
    };

    setIsSubmitting(true);
    try {
      await managerPerformanceService.submitManagerReview(id, submissionData);
      toast.success("Review submitted successfully");
      router.push(`/manager/performance-management/team-appraisals/${id}`);
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getRatingStars = (rating, interactive = false, onChange = null) => {
    // Convert enum to numeric if needed
    let numericRating = rating;
    if (typeof rating === 'string') {
      switch (rating) {
        case 'EXCEEDS_EXPECTATIONS': numericRating = 5; break;
        case 'MEETS_EXPECTATIONS': numericRating = 4; break;
        case 'NEEDS_IMPROVEMENT': numericRating = 3; break;
        case 'UNSATISFACTORY': numericRating = 2; break;
        default: numericRating = 3; break;
      }
    }
    
    // Ensure we have a number
    numericRating = parseInt(numericRating) || 3;
    
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const filled = i <= numericRating;
      if (interactive && onChange) {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="p-1 transition-colors"
          >
            <Star 
              size={20} 
              className={`${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
            />
          </button>
        );
      } else {
        stars.push(
          <Star 
            key={i} 
            size={20} 
            className={filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        );
      }
    }
    
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({numericRating}/5)</span>
      </div>
    );
  };

  if (isLoading) {
    return <HRMSLoader />;
  }

  if (!appraisalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Appraisal Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested appraisal could not be found.
          </p>
          <Link
            href="/manager/performance-management/team-appraisals"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Team Appraisals
          </Link>
        </div>
      </div>
    );
  }

  if (appraisalData.status !== "PENDING_MANAGER_REVIEW" && appraisalData.status !== "IN_PROGRESS") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Review Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This appraisal is not currently open for manager review.
          </p>
          <Link
            href={`/manager/performance-management/team-appraisals/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            View Appraisal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/manager/performance-management/team-appraisals/${id}`}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Review Employee Appraisal
              </h1>
            </div>
          </div>
        </div>

        {/* Employee Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User size={20} />
            Employee Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {appraisalData.employee.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Designation
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {appraisalData.employee.designation}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Appraisal Cycle
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {appraisalData.appraisalCycle.name}
              </p>
            </div>
          </div>
        </div>

        {/* Self Assessment Summary - Hidden during parallel review (IN_PROGRESS) */}
        {appraisalData.assessmentData && appraisalData.status !== "IN_PROGRESS" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={20} />
              Self Assessment Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(appraisalData.assessmentData).map(([category, data]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getRatingStars(data.rating)}
                  </div>
                  {(data.comment || data.comments) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {data.comment || data.comments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Manager Review
          </h2>

          <div className="space-y-6">
            {/* Assessment Categories */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="font-medium text-gray-900 dark:text-white">Detailed Assessment</h3>
              {[
                { key: "productivity", name: "Productivity", description: "Efficiency and output quality" },
                { key: "quality", name: "Quality of Work", description: "Attention to detail and excellence" },
                { key: "compliance", name: "Compliance", description: "Adherence to policies and procedures" },
                { key: "learning", name: "Learning & Certifications", description: "Continuous development and skill acquisition" },
                { key: "communication", name: "Communication", description: "Clarity and effectiveness in interactions" },
                { key: "adaptability", name: "Adaptability", description: "Flexibility and response to change" },
                { key: "organization", name: "Organization Skills", description: "Time management and prioritization" }
              ].map((category) => (
                <div key={category.key} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating
                    </label>
                    <div>
                      {getRatingStars(reviewData[category.key]?.rating || 0, true, (r) => {
                        setReviewData(prev => {
                          const updated = {
                            ...prev,
                            [category.key]: { ...(prev[category.key] || {}), rating: r }
                          };
                          
                          // Calculate new overall rating
                          const categories = ["productivity", "quality", "compliance", "learning", "communication", "adaptability", "organization"];
                          let sum = 0;
                          let count = 0;
                          categories.forEach(cat => {
                            if (updated[cat]?.rating) {
                              sum += updated[cat].rating;
                              count++;
                            }
                          });
                          updated.overallRating = count > 0 ? Math.round(sum / count) : 0;
                          
                          return updated;
                        });
                      })}
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comments
                    </label>
                    <textarea
                      value={reviewData[category.key]?.comment || ""}
                      onChange={(e) => setReviewData(prev => ({
                        ...prev,
                        [category.key]: { ...(prev[category.key] || {}), comment: e.target.value }
                      }))}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={`Comments on ${category.name.toLowerCase()}...`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Overall & Potential Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Overall Performance Rating *
                </label>
                <div className="pointer-events-none opacity-75">
                  {getRatingStars(reviewData.overallRating, false)}
                </div>
                <p className="text-xs text-gray-500 mt-2">Calculated average from detailed assessment</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Potential Rating *
                </label>
                <div>
                  {getRatingStars(reviewData.potentialRating, true, (r) => handleRatingChange('potentialRating', r))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Rate based on growth potential and future capabilities</p>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feedback *
              </label>
              <textarea
                value={reviewData.feedback}
                onChange={(e) => handleInputChange('feedback', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Provide detailed feedback on the employee's performance..."
                required
              />
            </div>

            {/* Strengths */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Strengths
              </label>
              <textarea
                value={reviewData.strengths}
                onChange={(e) => handleInputChange('strengths', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Highlight the employee's key strengths and achievements..."
              />
            </div>

            {/* Areas for Improvement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Areas for Improvement
              </label>
              <textarea
                value={reviewData.areasForImprovement}
                onChange={(e) => handleInputChange('areasForImprovement', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Identify areas where the employee can improve..."
              />
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goals for Next Period
              </label>
              <textarea
                value={reviewData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Set goals and objectives for the next appraisal period..."
              />
            </div>
            {/* 1-on-1 Discussion Confirmation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={reviewData.oneOnOneCompleted}
                    onChange={(e) => handleInputChange('oneOnOneCompleted', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    I confirm that I have conducted a 1-on-1 appraisal discussion with the employee.
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    The ratings and feedback have been discussed and finalized during this meeting.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <Save size={16} />
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/manager/performance-management/team-appraisals/${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmitting || !reviewData.oneOnOneCompleted}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send size={16} />
                {isSubmitting ? 'Submitting...' : 'Submit to HR'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
