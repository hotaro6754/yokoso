"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { courseManagementService } from "@/services/course-management/course.service";
import {
  BookOpen, Users, Calendar, Clock, MessageSquare, CheckCircle2,
  X, AlertCircle, UserPlus, Search, ThumbsUp, ThumbsDown,
  Send, FileText
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function ManagerCoursesTeamPage() {
  const pathname = usePathname();
  const isDeptHeadView = pathname?.startsWith("/dept-head");
  const isItAdminView = pathname?.startsWith("/it-admin");
  const [courses, setCourses] = useState([]);
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("courses");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAction, setReviewAction] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const breadcrumbItems = [
    {
      label: isDeptHeadView ? "Dept Head" : isItAdminView ? "IT Admin" : "Manager",
      href: isDeptHeadView ? "/dept-head/dashboard" : isItAdminView ? "/it-admin/dashboard" : "/manager/dashboard"
    },
    {
      label: "Courses (Team)",
      href: isDeptHeadView ? "/dept-head/courses/team" : isItAdminView ? "/it-admin/courses/team" : "/manager/courses-team"
    }
  ];

  const statusConfig = {
    NOT_STARTED: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", icon: Calendar, label: "Assigned" },
    IN_PROGRESS: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", icon: Clock, label: "In Progress" },
    PENDING_APPROVAL: { color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400", icon: AlertCircle, label: "Pending Approval" },
    COMPLETED: { color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", icon: CheckCircle2, label: "Completed" },
    REJECTED: { color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: X, label: "Rejected" },
    OVERDUE: { color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: AlertCircle, label: "Overdue" }
  };

  useEffect(() => {
    fetchDepartmentCourses();
    fetchTeamAssignments();
    fetchTeamMembers();
  }, []);

  const fetchDepartmentCourses = async () => {
    try {
      setLoading(true);
      const response = await courseManagementService.getDepartmentCourses();
      setCourses(response.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamAssignments = async () => {
    try {
      const response = await courseManagementService.getTeamCourseAssignments();
      setTeamAssignments(response.data || []);
    } catch (err) {
      console.error("Error fetching team assignments:", err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await courseManagementService.getMyTeamEmployees();
      setTeamMembers(response.data || []);
    } catch (err) {
      console.error("Error fetching team:", err);
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedCourse || selectedTeamMembers.length === 0) return;

    try {
      await courseManagementService.assignCoursesToTeam(selectedCourse.id, selectedTeamMembers);
      toast.success("Course assigned to team members successfully");
      setShowAssignModal(false);
      setSelectedCourse(null);
      setSelectedTeamMembers([]);
      fetchDepartmentCourses();
    } catch (err) {
      console.error("Error assigning course:", err);
      setError("Failed to assign course");
    }
  };

  const handleReviewAssignment = async () => {
    if (!selectedAssignment || !reviewAction) return;

    try {
      setSubmittingReview(true);
      await courseManagementService.reviewCourseCompletion(
        selectedAssignment.id,
        reviewAction === "approve" ? "COMPLETED" : "REJECTED",
        reviewComment
      );

      fetchTeamAssignments();

      setShowReviewModal(false);
      setSelectedAssignment(null);
      setReviewComment("");
      setReviewAction("");
    } catch (err) {
      console.error("Error reviewing assignment:", err);
      setError("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase())
      || course.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredAssignments = teamAssignments.filter((assignment) => {
    const matchesSearch = assignment.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      || assignment.assignedToName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatusIcon = ({ status }) => {
    const config = statusConfig[status] || { icon: FileText };
    const Icon = config.icon;
    return <Icon size={16} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Toaster position="top-right" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeTab === "courses" ? "Available Courses" : "Team Course Approvals"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {activeTab === "courses"
              ? "Assign available courses to your team members"
              : "Review and approve team member course completions"
            }
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("courses")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "courses"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              Available Courses ({courses.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "approvals"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              Team Approvals ({teamAssignments.filter((a) => a.status === "PENDING_APPROVAL").length})
            </div>
          </button>
        </nav>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "courses" ? "courses" : "assignments"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {activeTab === "approvals" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="COMPLETED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          )}
        </div>
      </div>

      {activeTab === "courses" && (
        <div className="space-y-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {course.category}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={16} />
                        <span>Duration: {course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={16} />
                        <span>Date: {new Date(course.startDate || course.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users size={16} />
                        <span>{course.assignedCount || 0} assigned</span>
                      </div>
                    </div>

                    {course.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowAssignModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <UserPlus size={16} />
                      Assign to Team
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? "No courses found matching your search" : "No courses available for your department"}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "approvals" && (
        <div className="space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {assignment.courseTitle}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Assigned to: {assignment.assignedToName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={16} />
                        <span>Assigned: {new Date(assignment.assignmentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={16} />
                        <span>Submitted: {new Date(assignment.submittedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {assignment.completionComment && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={16} className="text-gray-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Employee Completion Comment
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {assignment.completionComment}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusConfig[assignment.status]?.color || "bg-gray-100 text-gray-600"}`}>
                        <StatusIcon status={assignment.status} />
                        {statusConfig[assignment.status]?.label || assignment.status}
                      </span>

                      {assignment.status === "PENDING_APPROVAL" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setReviewAction("reject");
                              setShowReviewModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <ThumbsDown size={16} />
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setReviewAction("approve");
                              setShowReviewModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <ThumbsUp size={16} />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? "No assignments found matching your search" : "No course assignments pending review"}
              </p>
            </div>
          )}
        </div>
      )}

      {showAssignModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assign Course: {selectedCourse.title}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCourse(null);
                  setSelectedTeamMembers([]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Team Members
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {teamMembers.length > 0 ? teamMembers.map((member) => (
                    <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTeamMembers.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeamMembers([...selectedTeamMembers, member.id]);
                          } else {
                            setSelectedTeamMembers(selectedTeamMembers.filter((id) => id !== member.id));
                          }
                        }}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {member.position}
                        </div>
                      </div>
                    </label>
                  )) : (
                    <p className="text-sm text-gray-500">No team members found.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedCourse(null);
                    setSelectedTeamMembers([]);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCourse}
                  disabled={selectedTeamMembers.length === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign to {selectedTeamMembers.length} member{selectedTeamMembers.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {reviewAction === "approve" ? "Approve" : "Reject"} Course Completion
              </h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedAssignment(null);
                  setReviewComment("");
                  setReviewAction("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course: {selectedAssignment.courseTitle}
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee: {selectedAssignment.assignedToName}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Review Comment
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={`Add your feedback for ${reviewAction === "approve" ? "approval" : "rejection"}...`}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className={`rounded-lg p-3 ${reviewAction === "approve"
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <p className={`text-sm ${reviewAction === "approve"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {reviewAction === "approve"
                    ? "Approving this completion will mark the course as completed."
                    : "Rejecting this completion will require the employee to resubmit their completion comment."
                  }
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedAssignment(null);
                    setReviewComment("");
                    setReviewAction("");
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewAssignment}
                  disabled={submittingReview}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${reviewAction === "approve"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                >
                  <Send size={16} />
                  {submittingReview ? "Submitting..." : (reviewAction === "approve" ? "Approve" : "Reject")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
