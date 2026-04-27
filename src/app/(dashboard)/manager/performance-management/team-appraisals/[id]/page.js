"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { use } from "react";
import { ArrowLeft, User, Calendar, Star, CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import HRMSLoader from "@/components/common/HRMSLoader";
import { managerPerformanceService } from "@/services/manager/performance.service";
import { toast } from "react-hot-toast";

export default function EmployeeAppraisalView({ params }) {
  const router = useRouter();
  const [appraisalData, setAppraisalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(null);

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
        console.log("Fetching appraisal data for ID:", id);
        const data = await managerPerformanceService.getEmployeeAppraisal(id);
        console.log("Received appraisal data:", data);
        setAppraisalData(data);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "yellow", icon: Clock, text: "Pending" },
      IN_PROGRESS: { color: "blue", icon: AlertCircle, text: "In Progress" },
      PENDING_MANAGER_REVIEW: { color: "orange", icon: Clock, text: "Pending Review" },
      REVIEWED: { color: "green", icon: CheckCircle, text: "Reviewed" },
      SUBMITTED: { color: "purple", icon: FileText, text: "Submitted" }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/20 dark:text-${config.color}-300`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    if (!rating) return <span className="text-gray-400">Not Rated</span>;
    
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
    numericRating = parseFloat(numericRating) || 3;
    
    const stars = [];
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="fill-yellow-200 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(numericRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />);
    }
    
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">({numericRating.toFixed(1)})</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/manager/performance-management/team-appraisals"
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Employee Appraisal Details
              </h1>
            </div>
            {appraisalData.status === "PENDING_MANAGER_REVIEW" && (
              <Link
                href={`/manager/performance-management/team-appraisals/${id}/review`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText size={16} />
                Review Appraisal
              </Link>
            )}
          </div>
        </div>

        {/* Employee Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User size={20} />
            Employee Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Email
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {appraisalData.employee.email}
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
                Status
              </label>
              <div>
                {getStatusBadge(appraisalData.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Appraisal Cycle Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Appraisal Cycle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cycle Name
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {appraisalData.appraisalCycle.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDate(appraisalData.appraisalCycle.startDate)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDate(appraisalData.appraisalCycle.endDate)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Submission Deadline
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDate(appraisalData.appraisalCycle.employeeSubmissionDeadline)}
              </p>
            </div>
          </div>
        </div>

        {/* Self Assessment */}
        {appraisalData.assessmentData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={20} />
              Self Assessment
            </h2>
            <div className="space-y-4">
              {Object.entries(appraisalData.assessmentData).map(([category, data]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rating
                      </label>
                      <div>
                        {getRatingStars(data.rating)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Comments
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {data.comments || "No comments provided"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manager Feedback */}
        {appraisalData.managerFeedback && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star size={20} />
              Manager Feedback
            </h2>
            
            {(() => {
              let feedbackData = {};
              let isJson = false;
              try {
                feedbackData = JSON.parse(appraisalData.managerFeedback.feedback);
                isJson = true;
              } catch (e) {
                feedbackData = { feedback: appraisalData.managerFeedback.feedback };
              }

              const categories = [
                { key: "productivity", name: "Productivity" },
                { key: "quality", name: "Quality of Work" },
                { key: "compliance", name: "Compliance" },
                { key: "learning", name: "Learning & Certifications" },
                { key: "communication", name: "Communication" },
                { key: "adaptability", name: "Adaptability" },
                { key: "organization", name: "Organization Skills" }
              ];

              return (
                <div className="space-y-6">
                  {/* Overall Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Overall Rating
                    </label>
                    <div>
                      {getRatingStars(appraisalData.managerFeedback.rating)}
                    </div>
                  </div>

                  {/* Main textual feedback */}
                  {feedbackData.feedback && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Overall Feedback
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {isJson && feedbackData.feedback.includes("--- Detailed Assessment ---") 
                          ? feedbackData.feedback.split("--- Detailed Assessment ---")[0].trim() 
                          : feedbackData.feedback}
                      </p>
                    </div>
                  )}

                  {/* Detailed Category Ratings */}
                  {isJson && categories.some(cat => feedbackData[cat.key]) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Detailed Assessment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map(category => {
                          const catData = feedbackData[category.key];
                          if (!catData) return null;
                          return (
                            <div key={category.key} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                                <div className="scale-75 origin-right">
                                  {getRatingStars(catData.rating)}
                                </div>
                              </div>
                              {catData.comment && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                                  "{catData.comment}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {(appraisalData.managerFeedback.strengths || feedbackData.strengths) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Strengths
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {appraisalData.managerFeedback.strengths || feedbackData.strengths}
                      </p>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {(appraisalData.managerFeedback.areasForImprovement || feedbackData.areasForImprovement) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Areas for Improvement
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {appraisalData.managerFeedback.areasForImprovement || feedbackData.areasForImprovement}
                      </p>
                    </div>
                  )}
                  
                  {/* Goals */}
                  {feedbackData.goals && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Goals for Next Period
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {feedbackData.goals}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Submission Info */}
        {appraisalData.submittedAt && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Submitted on {formatDate(appraisalData.submittedAt)}
          </div>
        )}
      </div>
    </div>
  );
}
