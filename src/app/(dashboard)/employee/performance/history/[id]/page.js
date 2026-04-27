"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  User,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  FileText,
  Star,
  Award,
  TrendingUp
} from "lucide-react";
import { toast } from "react-hot-toast";
import { employeePerformanceService } from "@/services/employee/performance.service";
import HRMSLoader from "@/components/common/HRMSLoader";

export default function EmployeeAppraisalDetails() {
  const params = useParams();
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
      const data = await employeePerformanceService.getAppraisalDetails(appraisalId);
      setAppraisal(data);
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
      'PENDING_MANAGER_REVIEW': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review' },
      'PENDING_EMPLOYEE_ACKNOWLEDGMENT': { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Pending Acknowledgment' },
      'PENDING_HR_MODERATION': { color: 'bg-purple-100 text-purple-800', icon: AlertCircle, label: 'Pending Moderation' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled' }
    };
    
    // Default to status name if not in config
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: status?.replace(/_/g, ' ') || 'Unknown' };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (!score) return "text-gray-400 bg-gray-50";
    if (score >= 4.5) return "text-emerald-600 bg-emerald-50";
    if (score >= 4.0) return "text-green-600 bg-green-50";
    if (score >= 3.5) return "text-blue-600 bg-blue-50";
    if (score >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  if (loading) {
    return <HRMSLoader text="Loading details..." variant="fullscreen" size="md" />;
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
              href="/employee/performance/history"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to History
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
              href="/employee/performance/history"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to History
            </Link>
          </div>
          <div className="flex justify-between items-start">
            <div>
               <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Appraisal Details
                {getStatusBadge(appraisal?.status)}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Submitted on {appraisal?.submittedAt ? new Date(appraisal.submittedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
             <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-lg text-lg font-bold border ${getScoreColor(appraisal?.finalScore || appraisal?.overallRating)}`}>
                   <Star className="mr-2" size={20} fill="currentColor" />
                   {appraisal?.finalScore ? appraisal.finalScore.toFixed(1) : (appraisal?.overallRating ? appraisal.overallRating.toFixed(1) : 'N/A')} / 5.0
                </div>
                <p className="text-xs text-gray-500 mt-1">Final Score</p>
             </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
               <div className="flex items-center gap-3 mb-2 text-primary-600">
                  <Calendar size={18} />
                  <span className="font-medium text-sm">Cycle</span>
               </div>
               <p className="text-gray-900 dark:text-white font-semibold">{appraisal?.appraisalCycle?.name || 'N/A'}</p>
            </div>
            
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
               <div className="flex items-center gap-3 mb-2 text-blue-600">
                  <User size={18} />
                  <span className="font-medium text-sm">Employee</span>
               </div>
               <p className="text-gray-900 dark:text-white font-semibold">{appraisal?.employee?.name || 'N/A'}</p>
               <p className="text-xs text-gray-500">{typeof appraisal?.employee?.designation === 'object' ? appraisal.employee.designation?.name || 'N/A' : appraisal?.employee?.designation || 'N/A'}</p>
            </div>

             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
               <div className="flex items-center gap-3 mb-2 text-purple-600">
                  <User size={18} />
                  <span className="font-medium text-sm">Reviewer</span>
               </div>
               <p className="text-gray-900 dark:text-white font-semibold">{appraisal?.managerFeedback?.manager?.name || 'Pending'}</p>
               <p className="text-xs text-gray-500">{appraisal?.completedAt ? `Completed: ${new Date(appraisal.completedAt).toLocaleDateString()}` : 'Not yet completed'}</p>
            </div>
        </div>

        {/* Manager Feedback Section */}
        {appraisal?.managerFeedback && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
              <FileText size={20} className="text-primary-600" />
              Manager Feedback & Rating
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
                        size={16}
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">({rating}/5)</span>
                  </div>
                );
              };

              return (
                <div className="space-y-8">
                  {/* Overall Rating */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Overall Manager Rating</span>
                      {renderStars(appraisal.managerFeedback.rating)}
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Comments</h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {isJson && feedbackData.feedback.includes("--- Detailed Assessment ---") 
                        ? feedbackData.feedback.split("--- Detailed Assessment ---")[0].trim() 
                        : feedbackData.feedback}
                    </div>
                  </div>

                  {/* Detailed Assessment Grid */}
                  {isJson && categories.some(cat => feedbackData[cat.key]) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Detailed Assessment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map(category => {
                          const catData = feedbackData[category.key];
                          if (!catData) return null;
                          return (
                            <div key={category.key} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                                   <Star size={12} className="mr-1 fill-current" />
                                   {catData.rating}
                                </div>
                              </div>
                              {catData.comment && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                  "{catData.comment}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {(appraisal.managerFeedback.strengths || feedbackData.strengths) && (
                        <div>
                           <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <TrendingUp size={16} /> Key Strengths
                           </h4>
                           <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg text-gray-700 dark:text-gray-300">
                              {appraisal.managerFeedback.strengths || feedbackData.strengths}
                           </div>
                        </div>
                     )}

                     {(appraisal.managerFeedback.areasForImprovement || feedbackData.areasForImprovement) && (
                        <div>
                           <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <Target size={16} /> Areas for Improvement
                           </h4>
                           <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg text-gray-700 dark:text-gray-300">
                              {appraisal.managerFeedback.areasForImprovement || feedbackData.areasForImprovement}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Goals */}
                  {feedbackData.goals && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Award size={16} /> Goals for Next Period
                      </h4>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg text-gray-700 dark:text-gray-300">
                        {feedbackData.goals}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Self Assessment Section (Read Only) */}
        {appraisal?.assessmentData && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <User size={20} className="text-gray-500" />
                  Your Self Assessment
                </h3>
                
                {(() => {
                    const data = appraisal.assessmentData;
                    
                    if (!data) return <p className="text-gray-500 italic">No self assessment provided.</p>;

                    // Check if it's just a simple comments object (fallback from service)
                    if (data.comments && Object.keys(data).length === 1) {
                        return <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{data.comments}</p>;
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

                    const hasStructuredData = categories.some(cat => data[cat.key]);

                     if (!hasStructuredData) {
                         // Fallback display for unstructured or other format
                         return (
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {typeof data === 'string' ? data : (data.comments || JSON.stringify(data, null, 2))}
                                </p>
                            </div>
                         );
                     }

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map(category => {
                                const catData = data[category.key];
                                if (!catData) return null;
                                return (
                                    <div key={category.key} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                            <div className="flex items-center bg-white dark:bg-gray-600 px-2 py-1 rounded border border-gray-200 dark:border-gray-500">
                                                <Star size={12} className="mr-1 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                                    {catData.rating}/5
                                                </span>
                                            </div>
                                        </div>
                                        {catData.comment && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{catData.comment}"</p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    );
                })()}
             </div>
        )}

      </div>
    </div>
  );
}
