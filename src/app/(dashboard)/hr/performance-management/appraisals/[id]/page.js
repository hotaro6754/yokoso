"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  User,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Target,
  FileText,
  Download,
  Edit,
  Eye,
  Star
} from "lucide-react";
import { toast } from "react-hot-toast";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";

export default function HRAppraisalDetails() {
  const params = useParams();
  const router = useRouter();
  const [appraisal, setAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [id, setId] = useState(null);

  useEffect(() => {
    // Handle async params in Next.js 15
    const handleParams = async () => {
      const resolvedParams = await params;
      if (resolvedParams.id) {
        setId(resolvedParams.id);
        fetchAppraisalDetails(resolvedParams.id);
      }
    };
    
    handleParams();
  }, [params]);

  const fetchAppraisalDetails = async (appraisalId) => {
    try {
      console.log("Frontend: Fetching appraisal details for ID:", appraisalId);
      setLoading(true);
      const response = await performanceManagementService.getAppraisalById(appraisalId);
      setAppraisal(response.data);
    } catch (error) {
      console.error("Failed to fetch appraisal details:", error);
      setError(error.message || "Failed to load appraisal details");
      toast.error("Failed to load appraisal details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
      'PENDING_MANAGER_REVIEW': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Manager Review' },
      'PENDING_EMPLOYEE_ACKNOWLEDGMENT': { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Pending Acknowledgment' },
      'PENDING_HR_MODERATION': { color: 'bg-purple-100 text-purple-800', icon: AlertCircle, label: 'Pending HR Moderation' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig['DRAFT'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return "text-emerald-600 bg-emerald-50";
    if (score >= 4.0) return "text-green-600 bg-green-50";
    if (score >= 3.5) return "text-blue-600 bg-blue-50";
    if (score >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const handleExport = () => {
    toast.success("Export functionality coming soon!");
  };

  const handleEdit = () => {
    toast.success("Edit functionality coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Appraisal</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link
              href="/hr/performance-management/appraisals"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Appraisals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/hr/performance-management/appraisals"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Appraisals
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Appraisal Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View detailed information about this performance appraisal
          </p>
        </div>

        {/* Appraisal Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Employee</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center dark:bg-gray-600">
                  <User size={20} className="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {appraisal?.employee?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {appraisal?.employee?.email || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Department</h3>
              <div className="flex items-center gap-2">
                <Building size={16} className="text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {appraisal?.employee?.department || 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Appraisal Cycle</h3>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {appraisal?.appraisalCycle?.name || 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
              {getStatusBadge(appraisal?.status)}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-blue-600" />
              Performance Scores
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold ${getScoreColor(appraisal?.employeeSelfRating)}`}>
                  {appraisal?.employeeSelfRating ? appraisal.employeeSelfRating.toFixed(1) : 'N/A'}
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">Employee Self-Rating</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold ${getScoreColor(appraisal?.overallRating)}`}>
                  {appraisal?.overallRating ? appraisal.overallRating.toFixed(1) : 'N/A'}
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">Manager Rating</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg col-span-2 md:col-span-1">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold ${getScoreColor(appraisal?.potentialRating)}`}>
                  {appraisal?.potentialRating ? appraisal.potentialRating.toFixed(1) : 'N/A'}
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">Potential Rating</p>
              </div>
            </div>
            {appraisal?.finalScore && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Final Consolidated Score</p>
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-4xl font-bold ${getScoreColor(appraisal.finalScore).split(' ')[0]}`}>
                    {appraisal.finalScore.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-400">/ 5.0</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-green-600" />
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Submitted:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {appraisal?.submittedAt ? new Date(appraisal.submittedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Completed:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {appraisal?.completedAt ? new Date(appraisal.completedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              {appraisal?.manager && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Reviewer:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {appraisal.manager.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manager Feedback */}
        {appraisal?.managerFeedback && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-purple-600" />
              Manager Feedback
            </h3>
            
            {(() => {
              let feedbackData = {};
              let isJson = false;
              try {
                feedbackData = JSON.parse(appraisal.managerFeedback.feedback);
                isJson = true;
              } catch (e) {
                feedbackData = { feedback: appraisal.managerFeedback.feedback };
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

              const renderStars = (rating) => {
                return (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                    <span className="ml-1 text-xs text-gray-500">({rating}/5)</span>
                  </div>
                );
              };

              return (
                <div className="space-y-6">
                  {/* Main textual feedback */}
                  {feedbackData.feedback && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Feedback</h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
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
                                {renderStars(catData.rating)}
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
                  {(appraisal.managerFeedback.strengths || feedbackData.strengths) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Strengths</h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {appraisal.managerFeedback.strengths || feedbackData.strengths}
                      </p>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {(appraisal.managerFeedback.areasForImprovement || feedbackData.areasForImprovement) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Areas for Improvement</h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {appraisal.managerFeedback.areasForImprovement || feedbackData.areasForImprovement}
                      </p>
                    </div>
                  )}

                  {/* Goals */}
                  {feedbackData.goals && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goals for Next Period</h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {feedbackData.goals}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
