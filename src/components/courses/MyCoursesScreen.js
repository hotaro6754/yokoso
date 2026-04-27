"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { courseManagementService } from "@/services/course-management/course.service";
import {
  BookOpen, Calendar, Clock, MessageSquare, Download, Eye,
  CheckCircle2, AlertCircle, Award, FileText, Search,
  X, Send
} from "lucide-react";

export default function MyCoursesScreen({ breadcrumbItems }) {
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("courses");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const statusConfig = {
    NOT_STARTED: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", icon: Calendar, label: "Assigned" },
    IN_PROGRESS: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", icon: Clock, label: "In Progress" },
    PENDING_APPROVAL: { color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400", icon: AlertCircle, label: "Pending Approval" },
    COMPLETED: { color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", icon: CheckCircle2, label: "Completed" },
    REJECTED: { color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: X, label: "Rejected" },
    OVERDUE: { color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: AlertCircle, label: "Overdue" },
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseManagementService.getEmployeeCourses();
      const fetchedCourses = response.data || [];
      setCourses(fetchedCourses);

      const derivedCertificates = fetchedCourses
        .filter((course) => course.certificateId)
        .map((course) => ({
          id: course.assignmentId,
          courseName: course.title,
          category: course.category,
          certificateId: course.certificateCode || course.certificateId,
          issuedDate: course.certificateIssuedAt || new Date().toISOString(),
        }));
      setCertificates(derivedCertificates);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedCourse) return;

    try {
      setSubmittingComment(true);
      await courseManagementService.submitCompletionComment(selectedCourse.assignmentId, commentText);

      setCourses(courses.map((course) =>
        course.id === selectedCourse.id
          ? { ...course, status: "PENDING_APPROVAL", completionComment: commentText }
          : course
      ));

      setShowCommentModal(false);
      setSelectedCourse(null);
      setCommentText("");
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Failed to submit completion comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const canAddComment = (course) => {
    return course.status === "NOT_STARTED" || course.status === "IN_PROGRESS" || course.status === "REJECTED";
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCertificates = certificates.filter((certificate) =>
    certificate.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    certificate.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatusIcon = ({ status }) => {
    const Icon = statusConfig[status]?.icon || FileText;
    return <Icon size={16} />;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {activeTab === "courses" ? "My Courses" : "My Certificates"}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {activeTab === "courses"
            ? "View and manage your assigned training courses"
            : "View and download your earned certificates"}
        </p>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("courses")}
            className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${activeTab === "courses"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              Courses ({courses.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${activeTab === "certificates"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <Award size={16} />
              Certificates ({certificates.length})
            </div>
          </button>
        </nav>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "courses" ? "courses" : "certificates"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {activeTab === "courses" ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              {Object.keys(statusConfig).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      {activeTab === "courses" ? (
        <div className="space-y-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course.id} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                    <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.category}</p>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>Start: {new Date(course.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={16} />
                    <span>Duration: {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>End: {new Date(course.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {course.description ? (
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{course.description}</p>
                ) : null}

                {course.completionComment ? (
                  <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                    <div className="mb-2 flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Completion Comment</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.completionComment}</p>
                  </div>
                ) : null}

                {course.rejectionReason && course.status === "REJECTED" ? (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                    <div className="mb-2 flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">Rejection Reason</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400">{course.rejectionReason}</p>
                  </div>
                ) : null}

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusConfig[course.status]?.color || "bg-gray-100 text-gray-800"}`}>
                    <StatusIcon status={course.status} />
                    {statusConfig[course.status]?.label || course.status}
                  </span>

                  {canAddComment(course) ? (
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowCommentModal(true);
                      }}
                      className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm text-white transition-colors hover:bg-primary-700"
                    >
                      <MessageSquare size={16} />
                      Submit Completion
                    </button>
                  ) : course.status === "PENDING_APPROVAL" ? (
                    <span className="text-sm italic text-gray-500">Waiting for approval</span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? "No courses found matching your search" : "No courses assigned to you yet"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <div key={certificate.id} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{certificate.courseName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{certificate.category}</p>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>Issued: {new Date(certificate.issuedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={16} />
                    <span>Certificate ID: {certificate.certificateId}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    <CheckCircle2 size={16} />
                    Available
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                        window.open(`${apiUrl}/employee/courses/certificates/${certificate.certificateId}/download?token=${localStorage.getItem("token")}&action=view`, "_blank");
                      }}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                        window.open(`${apiUrl}/employee/courses/certificates/${certificate.certificateId}/download?token=${localStorage.getItem("token")}&action=download`, "_blank");
                      }}
                      className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm text-white transition-colors hover:bg-primary-700"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <Award className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? "No certificates found matching your search" : "No certificates earned yet"}
              </p>
            </div>
          )}
        </div>
      )}

      {showCommentModal && selectedCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Completion Comment</h3>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setSelectedCourse(null);
                  setCommentText("");
                }}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Course: {selectedCourse.title}
              </label>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Completion Comment *
                </label>
                <textarea
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about the course, what you learned, and how it will help you..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  After submitting your comment, the course status will change to "Pending Approval" and your manager will review it.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setSelectedCourse(null);
                    setCommentText("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || submittingComment}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={16} />
                  {submittingComment ? "Submitting..." : "Submit Comment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
