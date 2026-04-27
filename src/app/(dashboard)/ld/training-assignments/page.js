"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { UserCheck, Plus, Search, AlertTriangle, Star } from "lucide-react";
import Link from "next/link";
import ActionDropdown from "../components/ActionDropdown";

export default function TrainingAssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [filters, setFilters] = useState({ status: "", search: "" });

  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await ldService.getAllTrainingAssignments(filters);
      
      // Mock data with performance integration - in real app, this would come from API
      const mockAssignmentsWithPerformance = [
        {
          id: 1,
          courseTitle: "Advanced JavaScript",
          assignedTo: "Sarah Johnson",
          assignedType: "EMPLOYEE",
          startDate: "2024-12-01",
          completionDeadline: "2024-12-31",
          mandatory: true,
          status: "IN_PROGRESS",
          assignedBasedOnPerformance: true,
          performanceScore: 3.2,
          relatedSkillGap: "Technical Skills",
          priority: "High"
        },
        {
          id: 2,
          courseTitle: "Project Management Fundamentals",
          assignedTo: "Engineering Team",
          assignedType: "DEPARTMENT",
          startDate: "2024-12-15",
          completionDeadline: "2025-01-15",
          mandatory: false,
          status: "NOT_STARTED",
          assignedBasedOnPerformance: true,
          relatedSkillGap: "Time Management",
          priority: "Medium"
        },
        {
          id: 3,
          courseTitle: "React Best Practices",
          assignedTo: "Michael Chen",
          assignedType: "EMPLOYEE",
          startDate: "2024-11-15",
          completionDeadline: "2024-12-20",
          mandatory: true,
          status: "COMPLETED",
          assignedBasedOnPerformance: true,
          performanceScore: 4.3,
          relatedSkillGap: "Documentation",
          priority: "Low"
        },
        {
          id: 4,
          courseTitle: "Leadership Skills",
          assignedTo: "All Managers",
          assignedType: "ROLE",
          startDate: "2024-11-01",
          completionDeadline: "2024-12-31",
          mandatory: true,
          status: "IN_PROGRESS",
          assignedBasedOnPerformance: false,
          priority: "High"
        }
      ];
      
      setAssignments(mockAssignmentsWithPerformance);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load training assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      NOT_STARTED: { label: "Not Started", color: "bg-gray-100 text-gray-800" },
      IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
      OVERDUE: { label: "Overdue", color: "bg-red-100 text-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap.NOT_STARTED;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 4.0) return "text-emerald-600 bg-emerald-50";
    if (score >= 3.5) return "text-green-600 bg-green-50";
    if (score >= 3.0) return "text-yellow-600 bg-yellow-50";
    if (score >= 2.5) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const renderStars = (score) => {
    if (!score) return <span className="text-gray-400 text-sm">Not Rated</span>;
    
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={12} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star size={12} className="fill-yellow-200 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={12} className="text-gray-300" />
        ))}
        <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">{score}</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "L&D", href: "/ld" },
          { label: "Training Assignment", href: "/ld/training-assignments" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Training Assignment
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Assign courses to employees, departments, or roles
              </p>
            </div>
          </div>
          <Link
            href="/ld/training-assignments/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Assign Training
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No training assignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Performance-Based
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Mandatory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {assignment.courseTitle}
                        </div>
                        {assignment.relatedSkillGap && (
                          <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Addresses: {assignment.relatedSkillGap}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {assignment.assignedTo}
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          ({assignment.assignedType?.replace("_", " ")})
                        </span>
                        {assignment.performanceScore && (
                          <div className="mt-1">
                            {renderStars(assignment.performanceScore)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {assignment.assignedBasedOnPerformance ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {assignment.startDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {assignment.completionDeadline}
                    </td>
                    <td className="px-6 py-4">
                      {assignment.mandatory ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(assignment.status)}</td>
                    <td className="px-6 py-4">
                      <ActionDropdown
                        itemId={assignment.id}
                        viewUrl={`/ld/training-assignments/${assignment.id}`}
                        editUrl={`/ld/training-assignments/${assignment.id}/edit`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
