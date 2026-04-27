"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { TrendingUp, ArrowLeft, Calendar, Clock, Star, AlertTriangle, Award, BookOpen } from "lucide-react";
import Link from "next/link";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function ManagerLearningTeamDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await ldService.getEmployeeProgressDetail(params.id);
      
      const mockDetailWithPerformance = {
        employee: {
          id: params.id,
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          department: "Engineering",
          designation: "Product Designer",
          lastAppraisalDate: "2024-12-15"
        },
        summary: {
          assignedCourses: 8,
          completed: 5,
          inProgress: 2,
          overdue: 1
        },
        performance: {
          overallScore: 3.2,
          categoryScores: {
            productivity: 3.5,
            quality: 3.0,
            compliance: 3.8,
            learning: 2.8,
            competencies: 2.9
          },
          skillGaps: ["Technical Skills", "Time Management"],
          strengths: ["Creativity", "User Research", "Collaboration"],
          managerFeedback: "Sarah shows strong creative skills but needs improvement in technical areas and time management.",
          recommendedTrainings: [
            { title: "Advanced JavaScript", priority: "High", relatedSkillGap: "Technical Skills" },
            { title: "Project Management Fundamentals", priority: "Medium", relatedSkillGap: "Time Management" },
            { title: "React Best Practices", priority: "High", relatedSkillGap: "Technical Skills" }
          ]
        },
        certifications: {
          completed: ["React Developer", "AWS Cloud Practitioner"],
          inProgress: ["Advanced JavaScript"],
          pending: ["Project Management", "UI/UX Advanced"]
        },
        assignments: [
          {
            id: 1,
            courseTitle: "Advanced JavaScript",
            startDate: "2024-12-01",
            completionDeadline: "2024-12-31",
            mandatory: true,
            status: "IN_PROGRESS",
            relatedSkillGap: "Technical Skills",
            assignedBasedOnPerformance: true
          },
          {
            id: 2,
            courseTitle: "Project Management Fundamentals",
            startDate: "2024-12-15",
            completionDeadline: "2025-01-15",
            mandatory: false,
            status: "NOT_STARTED",
            relatedSkillGap: "Time Management",
            assignedBasedOnPerformance: true
          },
          {
            id: 3,
            courseTitle: "React Best Practices",
            startDate: "2024-11-15",
            completionDeadline: "2024-12-20",
            mandatory: true,
            status: "COMPLETED",
            relatedSkillGap: "Technical Skills",
            assignedBasedOnPerformance: true
          }
        ]
      };
      
      setDetail(response?.data?.employee ? response.data : mockDetailWithPerformance);
    } catch (error) {
      console.error("Error fetching employee progress detail:", error);
      toast.error("Failed to load employee progress detail");
      setDetail(null);
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
          <Star key={`full-${i}`} size={14} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star size={14} className="fill-yellow-200 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-gray-300" />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">{score}</span>
      </div>
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

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Employee progress not found</p>
          <Link
            href="/manager/learning-team"
            className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team Learning
          </Link>
        </div>
      </div>
    );
  }

  const { employee, summary, performance, certifications, assignments } = detail;

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Manager", href: "/manager/dashboard" },
          { label: "Learning (Team)", href: "/manager/learning-team" },
          { label: employee.name, href: `/manager/learning-team/${params.id}` },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {employee.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Team member learning details
              </p>
            </div>
          </div>
          <Link
            href="/manager/learning-team"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-500">Assigned Courses</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">{summary.assignedCourses}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-xl font-semibold text-emerald-600">{summary.completed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-xl font-semibold text-blue-600">{summary.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-xl font-semibold text-red-600">{summary.overdue}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Insights</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Appraisal: {employee.lastAppraisalDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Overall Performance</h4>
            <div className={`inline-flex items-center px-3 py-2 rounded-lg ${getPerformanceColor(performance.overallScore)}`}>
              {renderStars(performance.overallScore)}
            </div>
            
            <div className="mt-4 space-y-2">
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400">Category Breakdown</h5>
              {Object.entries(performance.categoryScores).map(([category, score]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{category}</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{score}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Identified Skill Gaps</h4>
            <div className="flex flex-wrap gap-2">
              {performance.skillGaps.map((gap, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1"
                >
                  <AlertTriangle size={10} />
                  {gap}
                </span>
              ))}
            </div>
            
            <div className="mt-4">
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Strengths</h5>
              <div className="flex flex-wrap gap-2">
                {performance.strengths.map((strength, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Manager Feedback</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              "{performance.managerFeedback}"
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Trainings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Based on performance appraisal results</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performance.recommendedTrainings.map((training, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">{training.title}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(training.priority)}`}>
                  {training.priority}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Addresses: {training.relatedSkillGap}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certification Status</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current and pending certifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Completed</h5>
            <div className="space-y-2">
              {certifications.completed.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Award size={12} className="text-emerald-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{cert}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">In Progress</h5>
            <div className="space-y-2">
              {certifications.inProgress.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <BookOpen size={12} className="text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{cert}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pending</h5>
            <div className="space-y-2">
              {certifications.pending.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Clock size={12} className="text-orange-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No assignments found</p>
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
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Mandatory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Performance-Based
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {assignment.courseTitle}
                        </div>
                        {assignment.relatedSkillGap && (
                          <div className="text-xs text-orange-600 mt-1">
                            Addresses: {assignment.relatedSkillGap}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(assignment.startDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {formatDate(assignment.completionDeadline)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {assignment.mandatory ? "Yes" : "No"}
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
                    <td className="px-6 py-4">{getStatusBadge(assignment.status)}</td>
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
