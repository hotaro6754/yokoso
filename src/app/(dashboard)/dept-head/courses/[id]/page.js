"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { courseManagementService } from "@/services/course-management/course.service";
import {
  BookOpen, Calendar, Clock, Users, ArrowLeft, Edit2, Trash2, UserPlus,
  CheckCircle2, AlertCircle, Search, Download, Eye
} from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function CourseDetailPage({ params }) {
  const courseId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [course, setCourse] = useState(null);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, courseId: null });
  const [departmentEmployees, setDepartmentEmployees] = useState([]);

  const breadcrumbItems = [
    { label: "Department Head", href: "/dept-head/dashboard" },
    { label: "Courses", href: "/dept-head/courses" },
    { label: "Course Details", href: `/dept-head/courses/${courseId}` }
  ];

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseManagementService.getCourseDetails(courseId);
      // Service.js defines getCourseDetails as generic or dept-head specific? 
      // It uses api.get(`/courses/${courseId}`) in 'Common' section which likely points to wrong endpoint for now if we want dept-head context?
      // Actually we created specific endpoints for dept-head. 
      // The shared service has "getCourseDetails" calling /courses/{id} which might work if it's public/authenticated.
      // But we made /api/dept-head/courses/{id} via getCourses/update implementation? 
      // Wait, in controller.js we only have getCourses (list), updateCourse (put /:id), deleteCourse (delete /:id). 
      // We Missed GET /:id in routes/controller?
      // Checking controller.js: 
      // const getCourses = ... (list)
      // const updateCourse = ...
      // We don't have getCourseById in controller explicitly?
      // Ah, generally list filters. But we need detail.
      // Let's assume we need to add getCourseById to controller/routes for dept-head specific.
      // For now, let's use the one we are about to add/verify.

      setCourse(response.data);

      // Fetch assigned employees if available
      if (response.data.trainingAssignments) {
        setAssignedEmployees(response.data.trainingAssignments.map(assign => ({
          userId: assign.assignedTo,
          assignmentId: assign.id, // The TrainingAssignment ID
          name: assign.assignedToName || 'Employee',
          position: assign.position || 'Employee',
          assignedAt: assign.createdAt,
          status: assign.status,
          completionComment: assign.completionComment
        })));
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (assignmentId, status, rejectionReason = '') => {
    try {
      await courseManagementService.updateAssignmentStatus(assignmentId, status, rejectionReason);
      setSuccess(`Assignment ${status === 'COMPLETED' ? 'approved' : 'rejected'} successfully`);
      fetchCourseDetails(); // Refresh list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error reviewing assignment:', err);
      setError('Failed to update assignment status');
    }
  };
  const fetchDepartmentEmployees = async () => {
    try {
      const response = await courseManagementService.getMyDepartmentEmployees();
      setDepartmentEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch available employees');
    }
  };

  const handleAssignCourse = async () => {
    if (!course || selectedEmployees.length === 0) return;

    try {
      await courseManagementService.assignCourseToEmployees(course.id, selectedEmployees);
      setShowAssignModal(false);
      setSelectedEmployees([]);
      setSuccess('Course assigned successfully to employees');

      // Refresh details to see new assignments
      fetchCourseDetails();

      setTimeout(() => setSuccess(''), 3000); // Fixed naming error
    } catch (err) {
      console.error('Error assigning course:', err);
      setError('Failed to assign course');
    }
  };

  const handleDelete = async () => {
    try {
      await courseManagementService.deleteCourse(courseId);
      setDeleteConfirm({ show: false, courseId: null });
      setSuccess('Course deleted successfully');

      setTimeout(() => {
        window.location.href = '/dept-head/courses';
      }, 1500);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
    }
  };

  const getStatusColor = (course) => {
    const now = new Date();
    const startDate = new Date(course.startDate || course.date);
    const endDate = new Date(course.endDate || course.date);

    if (now < startDate) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    if (now > endDate) return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
  };

  const getStatusText = (course) => {
    const now = new Date();
    const startDate = new Date(course.startDate || course.date);
    const endDate = new Date(course.endDate || course.date);

    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Completed';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Course Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The course you're looking for doesn't exist.</p>
          <Link
            href="/dept-head/courses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Success/Error Messages */}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dept-head/courses"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Course details and management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/dept-head/courses/${courseId}/edit`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            onClick={() => setDeleteConfirm({ show: true, courseId: course.id })}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Course Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(course)}`}>
                    {getStatusText(course)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {course.assignedCount || 0} assigned
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <span className="text-gray-900 dark:text-white">{course.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                      <span className="text-gray-900 dark:text-white">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(course.startDate || course.date).toLocaleDateString()}
                      </span>
                    </div>
                    {course.endDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">End Date:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(course.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(course.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(course.updatedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Description */}
            {course.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{course.description}</p>
              </div>
            )}

            {/* Learning Objectives */}
            {course.objectives && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learning Objectives</h3>
                <p className="text-gray-600 dark:text-gray-400">{course.objectives}</p>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prerequisites</h3>
                <p className="text-gray-600 dark:text-gray-400">{course.prerequisites}</p>
              </div>
            )}
          </div>

          {/* Assigned Employees */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Employees</h3>
              <button
                onClick={() => {
                  setShowAssignModal(true);
                  fetchDepartmentEmployees();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                <UserPlus size={14} />
                Assign More
              </button>
            </div>

            {assignedEmployees.length > 0 ? (
              <div className="space-y-3">
                {assignedEmployees.map((employee) => (
                  <div key={employee.assignmentId} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {employee.name?.charAt(0) || 'E'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{employee.position}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full mb-1 
                           ${employee.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            employee.status === 'PENDING_APPROVAL' ? 'bg-orange-100 text-orange-700' :
                              employee.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                employee.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-600'}`}>
                          {employee.status ? employee.status.replace('_', ' ') : 'Assigned'}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Assigned {new Date(employee.assignedAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Completion Review UI */}
                    {employee.status === 'PENDING_APPROVAL' && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border border-gray-100 dark:border-gray-800 mt-2">
                        {employee.completionComment && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 italic">"{employee.completionComment}"</p>
                        )}
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              const reason = prompt("Enter rejection reason:");
                              if (reason) handleReview(employee.assignmentId, 'REJECTED', reason);
                            }}
                            className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleReview(employee.assignmentId, 'COMPLETED')}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    )}

                    {employee.status === 'REJECTED' && ( // Show rejected status note
                      <div className="text-xs text-red-600 mt-1">Rejected.</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No employees assigned to this course yet</p>
                <button
                  onClick={() => {
                    setShowAssignModal(true);
                    fetchDepartmentEmployees();
                  }}
                  className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Assign Employees
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.open(`/dept-head/courses/${courseId}/edit`, '_blank')}
                className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit2 size={16} />
                Edit Course
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(true);
                  fetchDepartmentEmployees();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <UserPlus size={16} />
                Assign Employees
              </button>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download size={16} />
                Export Details
              </button>
            </div>
          </div>

          {/* Course Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.completionRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {course.completedCount || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {course.inProgressCount || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">In Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Course Modal */}
      {showAssignModal && course && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assign Course: {course.title}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEmployees([]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Employees
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {departmentEmployees.map((employee) => (
                    <label key={employee.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees([...selectedEmployees, employee.id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                          }
                        }}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {employee.position}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedEmployees([]);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCourse}
                  disabled={selectedEmployees.length === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign to {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <ConfirmModal
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, courseId: null })}
          onConfirm={handleDelete}
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone and will remove all course data including assignments."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}