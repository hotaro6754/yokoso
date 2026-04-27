"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Calendar, ArrowLeft, User, Clock, Video, MapPin, FileText } from "lucide-react";
import Link from "next/link";

export default function ViewInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchInterview();
    }
  }, [params.id]);

  const fetchInterview = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getInterviewById(params.id);
      setInterview(response.data || response);
    } catch (error) {
      console.error("Error fetching interview:", error);
      toast.error("Failed to load interview details");
      setInterview(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
      FEEDBACK_PENDING: { label: "Feedback Pending", color: "bg-amber-100 text-amber-800" },
      CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap.SCHEDULED;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Interview not found</p>
          <Link
            href="/recruiter/interviews"
            className="mt-4 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Interviews", href: "/recruiter/interviews" },
          { label: `Interview - ${interview.candidateName}`, href: `/recruiter/interviews/${params.id}` },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interview Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View interview information and status
              </p>
            </div>
          </div>
          <Link
            href="/recruiter/interviews"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Interview Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Candidate</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {interview.candidateName}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Job Title</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {interview.jobTitle}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Interviewer</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {interview.interviewer}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Interview Round</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  Round {interview.interviewRound}
                </p>
              </div>
              {interview.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {interview.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {interview.feedbacks && interview.feedbacks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Interview Feedback
              </h3>
              <div className="space-y-6">
                {interview.feedbacks.map((fb, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300 mb-1">
                          {fb.feedbackType} Feedback
                        </span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          by {fb.submittedByName} ({fb.submittedByEmail})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Decision</p>
                        <p className={`font-semibold ${fb.evaluationDecision === 'SELECT' ? 'text-green-600' : fb.evaluationDecision === 'REJECT' ? 'text-red-600' : 'text-amber-500'}`}>
                          {fb.evaluationDecision}
                        </p>
                      </div>
                    </div>
                    
                    {fb.interviewConducted ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fb.overallRating && (
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                              <p className="text-xs text-gray-500 uppercase font-semibold">Overall Rating</p>
                              <p className="text-base font-bold text-brand-600">{fb.overallRating}/5</p>
                            </div>
                          )}
                          {fb.panelDetails && (
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                              <p className="text-xs text-gray-500 uppercase font-semibold">Panel Details</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{fb.panelDetails}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {fb.projectKnowledgeRating && (
                            <div className="border-l-4 border-brand-500 pl-4 py-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Project Knowledge:</span>
                                <span className="text-sm font-bold text-brand-600">{fb.projectKnowledgeRating}/5</span>
                              </div>
                              {fb.projectKnowledgeComments && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">{fb.projectKnowledgeComments}</p>
                              )}
                            </div>
                          )}

                          {fb.technicalKnowledgeRating && (
                            <div className="border-l-4 border-blue-500 pl-4 py-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Technical Knowledge:</span>
                                <span className="text-sm font-bold text-blue-600">{fb.technicalKnowledgeRating}/5</span>
                              </div>
                              {fb.technicalKnowledgeComments && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">{fb.technicalKnowledgeComments}</p>
                              )}
                            </div>
                          )}

                          {fb.problemSolvingRating && (
                            <div className="border-l-4 border-purple-500 pl-4 py-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Problem Solving:</span>
                                <span className="text-sm font-bold text-purple-600">{fb.problemSolvingRating}/5</span>
                              </div>
                              {fb.problemSolvingComments && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">{fb.problemSolvingComments}</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-2">
                          {fb.overallFeedback && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Overall Feedback</p>
                              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                {fb.overallFeedback}
                              </div>
                            </div>
                          )}
                          {fb.redFlags && (
                            <div>
                              <p className="text-xs text-red-500 uppercase font-semibold mb-1">Red Flags / Concerns</p>
                              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400">
                                {fb.redFlags}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm font-semibold text-red-600">Interview Not Conducted</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Reason: {fb.cancelReason || 'Not specified'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Schedule
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {interview.date}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {interview.time}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {interview.mode === "ONLINE" ? (
                  <Video className="h-5 w-5 text-gray-400 mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mode</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {interview.mode === "ONLINE" ? "Online" : "In-person"}
                  </p>
                </div>
              </div>
              {interview.mode === "ONLINE" && interview.meetingLink && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Meeting Link</p>
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:text-brand-700 break-all"
                  >
                    {interview.meetingLink}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status
            </h3>
            <div className="flex items-center justify-center py-4">
              {getStatusBadge(interview.status)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
