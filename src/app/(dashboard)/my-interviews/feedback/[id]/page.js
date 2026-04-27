"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { myInterviewsService } from "@/services/my-interviews.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, Calendar, User, Briefcase, FileText } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function InterviewFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [interview, setInterview] = useState(null);
  const [feedbackType, setFeedbackType] = useState("L1");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const payrollPrefix = pathname?.startsWith('/payroll') ? '/payroll' : '';
  const interviewsBase = `${payrollPrefix}/my-interviews`;
  const dashboardHref = payrollPrefix ? '/payroll/dashboard' : '/dashboard';

  const [formData, setFormData] = useState({
    projectKnowledgeRating: "",
    projectKnowledgeComments: "",
    technicalKnowledgeRating: "",
    technicalKnowledgeComments: "",
    problemSolvingRating: "",
    problemSolvingComments: "",
    overallRating: "",
    panelDetails: "",
    evaluationDecision: "",
    currentCtc: "",
    expectedCtc: "",
    lastRaisePercent: "",
    offerInHands: "",
    redFlags: "",
    overallFeedback: "",
    interviewConducted: "true",
    cancelReason: "",
  });

  useEffect(() => {
    if (params.id && user) {
      fetchInterviewDetails();
    }
  }, [params.id, user]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      const data = await myInterviewsService.getInterviewById(params.id);
      const interviewData = data.data || data;
      setInterview(interviewData);

      // Check for existing feedback
      const existing = interviewData.feedbacks?.find(f => f.submittedByEmail === user?.email);
      
      if (existing) {
        setIsReadOnly(true);
        setFeedbackType(existing.feedbackType);
        setFormData({
          projectKnowledgeRating: existing.projectKnowledgeRating || "",
          projectKnowledgeComments: existing.projectKnowledgeComments || "",
          technicalKnowledgeRating: existing.technicalKnowledgeRating || "",
          technicalKnowledgeComments: existing.technicalKnowledgeComments || "",
          problemSolvingRating: existing.problemSolvingRating || "",
          problemSolvingComments: existing.problemSolvingComments || "",
          overallRating: existing.overallRating || "",
          panelDetails: existing.panelDetails || "",
          evaluationDecision: existing.evaluationDecision ? String(existing.evaluationDecision).toUpperCase() : "",
          currentCtc: existing.currentCtc || "",
          expectedCtc: existing.expectedCtc || "",
          lastRaisePercent: existing.lastRaisePercent || "",
          offerInHands: existing.offerInHands || "",
          redFlags: existing.redFlags || "",
          overallFeedback: existing.overallFeedback || "",
          interviewConducted: existing.interviewConducted ? "true" : "false",
          cancelReason: existing.cancelReason || "",
        });
      } else {
        setIsReadOnly(false);
        // Determine feedback type by round mapping
        const roundStr = String(interviewData.interviewRound).toLowerCase();
        if (roundStr.includes('1') || roundStr === 'screening' || roundStr === 'l1') {
          setFeedbackType('L1');
        } else if (roundStr.includes('2') || roundStr === 'l2') {
          setFeedbackType('L2');
        } else {
          setFeedbackType('HR');
        }
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
      toast.error(error.message || "Failed to load interview details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (name, value) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await myInterviewsService.submitFeedback(interview.id, {
        feedbackType,
        ...formData
      });
      toast.success("Feedback submitted successfully");
      router.push(interviewsBase);
    } catch (error) {
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Interview not found</p>
        <button onClick={() => router.push(interviewsBase)} className="mt-4 text-primary font-medium hover:underline">
          Back to Interviews
        </button>
      </div>
    );
  }

  const RatingSelect = ({ label, name, required = true }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            type="button"
            disabled={isReadOnly}
            onClick={() => handleRatingChange(name, num)}
            className={`w-10 h-10 rounded-full flex items-center justify-center border font-semibold transition-colors
              ${formData[name] === num 
                ? (isReadOnly ? 'bg-primary/70 text-white border-primary/70 cursor-not-allowed' : 'bg-primary text-white border-primary') 
                : (isReadOnly ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-slate-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-gray-600')
              } disabled:cursor-not-allowed`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Interview Feedback</h2>
          <Breadcrumb items={[
            { label: "Dashboard", href: dashboardHref },
            { label: "Assigned Interviews", href: interviewsBase },
            { label: `Feedback - ${interview.candidateName}`, href: `${interviewsBase}/feedback/${params.id}` },
          ]} />
        </div>
        <button
          onClick={() => router.push(interviewsBase)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interview Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Interview Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Candidate</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{interview.candidateName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Job Title</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{interview.jobTitle}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Round</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{interview.interviewRound}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Notes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{interview.notes || "No notes provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{feedbackType} Feedback Form</h3>
              {isReadOnly && (
                <p className="mt-1 text-sm text-amber-600 font-medium">This feedback has already been submitted and is read-only.</p>
              )}
            </div>
            
            {isReadOnly ? (
              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Was the interview conducted?</p>
                    <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white capitalize">
                      {formData.interviewConducted === "true" ? "Yes" : "No"}
                    </p>
                  </div>
                  {formData.interviewConducted === "false" && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason for not conducting</p>
                      <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                        {formData.cancelReason}
                      </p>
                    </div>
                  )}
                </div>

                {formData.interviewConducted === "true" && (
                  <div className="space-y-8">
                    {(feedbackType === 'L1' || feedbackType === 'L2') && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Knowledge Rating</p>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(num => (
                                <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${formData.projectKnowledgeRating === num ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                  {num}
                                </div>
                              ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 italic">"{formData.projectKnowledgeComments}"</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Technical Knowledge Rating</p>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(num => (
                                <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${formData.technicalKnowledgeRating === num ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                  {num}
                                </div>
                              ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 italic">"{formData.technicalKnowledgeComments}"</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Problem Solving Skills Rating</p>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(num => (
                                <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${formData.problemSolvingRating === num ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                  {num}
                                </div>
                              ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 italic">"{formData.problemSolvingComments}"</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Rating</p>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(num => (
                                <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${formData.overallRating === num ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                  {num}
                                </div>
                              ))}
                            </div>
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Panel Details</p>
                              <p className="text-base text-gray-900 dark:text-white font-medium">{formData.panelDetails}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {feedbackType === 'HR' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Current CTC</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">{formData.currentCtc}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Expected CTC</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">{formData.expectedCtc}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Last Raise %</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">{formData.lastRaisePercent}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Offer in Hands</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">{formData.offerInHands}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Red Flags / Concerns</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">{formData.redFlags || "No concerns noted."}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Feedback</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg italic">"{formData.overallFeedback}"</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Rating</p>
                              <div className="flex gap-1 mt-1">
                                 {[1, 2, 3, 4, 5].map(num => (
                                    <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${formData.overallRating === num ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                       {num}
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Panel Details</p>
                              <p className="text-base text-gray-900 dark:text-white font-medium">{formData.panelDetails}</p>
                           </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Evaluation Decision</p>
                      <div className="mt-2 inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-primary/10 text-primary border border-primary/20">
                        {formData.evaluationDecision}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-8 flex justify-end">
                   <button
                    type="button"
                    onClick={() => router.push(interviewsBase)}
                    className="px-8 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Conducted Check */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Was the interview conducted? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="interviewConducted"
                      required
                      disabled={isReadOnly}
                      value={formData.interviewConducted}
                      onChange={handleChange}
                      className="w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  
                  {formData.interviewConducted === "false" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reason for not conducting <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cancelReason"
                        required
                        disabled={isReadOnly}
                        value={formData.cancelReason}
                        onChange={handleChange}
                        className="w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Candidate no show, rescheduled, etc."
                      />
                    </div>
                  )}
                </div>

                {formData.interviewConducted === "true" && (
                  <div className="space-y-8">
                    {(feedbackType === 'L1' || feedbackType === 'L2') && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <RatingSelect label="Project Knowledge Rating" name="projectKnowledgeRating" />
                            <textarea
                              name="projectKnowledgeComments"
                              placeholder="Comments on project knowledge..."
                              required
                              disabled={isReadOnly}
                              value={formData.projectKnowledgeComments}
                              onChange={handleChange}
                              className="w-full h-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60 resize-none"
                            />
                          </div>

                          <div>
                            <RatingSelect label="Technical Knowledge Rating" name="technicalKnowledgeRating" />
                            <textarea
                              name="technicalKnowledgeComments"
                              placeholder="Comments on technical knowledge..."
                              required
                              disabled={isReadOnly}
                              value={formData.technicalKnowledgeComments}
                              onChange={handleChange}
                              className="w-full h-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60 resize-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <RatingSelect label="Problem Solving Skills Rating" name="problemSolvingRating" />
                            <textarea
                              name="problemSolvingComments"
                              placeholder="Comments on problem solving..."
                              required
                              disabled={isReadOnly}
                              value={formData.problemSolvingComments}
                              onChange={handleChange}
                              className="w-full h-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60 resize-none"
                            />
                          </div>
                          <div>
                            <RatingSelect label="Overall Rating" name="overallRating" />
                            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Panel Details <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="panelDetails"
                                required
                                disabled={isReadOnly}
                                value={formData.panelDetails}
                                onChange={handleChange}
                                className="w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 focus:ring-2 focus:ring-primary/50 outline-none"
                                placeholder="Enter panel names/details"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {feedbackType === 'HR' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current CTC <span className="text-red-500">*</span></label>
                          <input type="text" name="currentCtc" required disabled={isReadOnly} value={formData.currentCtc} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. 5 LPA" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected CTC <span className="text-red-500">*</span></label>
                          <input type="text" name="expectedCtc" required disabled={isReadOnly} value={formData.expectedCtc} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. 8 LPA" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Raise % <span className="text-red-500">*</span></label>
                          <input type="text" name="lastRaisePercent" required disabled={isReadOnly} value={formData.lastRaisePercent} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. 15%" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Offer In Hands <span className="text-red-500">*</span></label>
                          <input type="text" name="offerInHands" required disabled={isReadOnly} value={formData.offerInHands} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 outline-none focus:ring-2 focus:ring-primary/50" placeholder="Details of other offers" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Any Red Flags/Concerns <span className="text-red-500">*</span></label>
                          <textarea name="redFlags" required disabled={isReadOnly} value={formData.redFlags} onChange={handleChange} className="w-full h-20 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Any concerns..." />
                        </div>
                        <div>
                          <RatingSelect label="Overall Rating" name="overallRating" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Feedback <span className="text-red-500">*</span></label>
                          <textarea name="overallFeedback" required disabled={isReadOnly} value={formData.overallFeedback} onChange={handleChange} className="w-full h-20 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Overall impressions..." />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Panel Details <span className="text-red-500">*</span></label>
                          <input type="text" name="panelDetails" required disabled={isReadOnly} value={formData.panelDetails} onChange={handleChange} className="w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm disabled:opacity-60 outline-none focus:ring-2 focus:ring-primary/50" placeholder="Enter panel names/details" />
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Evaluation Decision <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="evaluationDecision"
                        required
                        disabled={isReadOnly}
                        value={formData.evaluationDecision}
                        onChange={handleChange}
                        className="w-full md:w-1/2 h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-60"
                      >
                        <option value="">Select Decision</option>
                        <option value="SELECT">Select</option>
                        <option value="REJECT">Reject</option>
                        <option value="HOLD">Hold</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-8 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => router.push(interviewsBase)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    {isReadOnly ? "Close" : "Cancel"}
                  </button>
                  {!isReadOnly && (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-8 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Submit Feedback
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
