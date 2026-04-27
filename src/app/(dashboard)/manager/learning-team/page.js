"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { TrendingUp, Search, AlertTriangle, Star, Award } from "lucide-react";
import ActionDropdown from "@/app/(dashboard)/ld/components/ActionDropdown";
import { usePathname } from "next/navigation";

export default function ManagerLearningTeamPage() {
  const pathname = usePathname();
  const isDeptHeadView = pathname?.startsWith("/dept-head");
  const isItAdminView = pathname?.startsWith("/it-admin");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState([]);
  const [filters, setFilters] = useState({ search: "" });

  useEffect(() => {
    fetchProgress();
  }, [filters]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await ldService.getEmployeeProgress(filters);
      
      const mockProgressWithPerformance = [
        {
          id: 1,
          employeeName: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          department: "Engineering",
          assignedCourses: 8,
          completed: 5,
          inProgress: 2,
          overdue: 1,
          performanceScore: 3.2,
          skillGaps: ["Technical Skills", "Time Management"],
          certifications: ["React Developer", "AWS Cloud Practitioner"],
          pendingCertifications: ["Advanced JavaScript", "Project Management"],
          lastAppraisalDate: "2024-12-15"
        },
        {
          id: 2,
          employeeName: "Michael Chen",
          email: "michael.chen@company.com",
          department: "Engineering",
          assignedCourses: 6,
          completed: 4,
          inProgress: 2,
          overdue: 0,
          performanceScore: 4.3,
          skillGaps: ["Documentation"],
          certifications: ["Python Developer", "Data Science"],
          pendingCertifications: ["Machine Learning"],
          lastAppraisalDate: "2024-12-14"
        },
        {
          id: 3,
          employeeName: "Emily Davis",
          email: "emily.davis@company.com",
          department: "Quality",
          assignedCourses: 7,
          completed: 3,
          inProgress: 3,
          overdue: 1,
          performanceScore: 2.8,
          skillGaps: ["Automation Skills", "Communication", "Technical Knowledge"],
          certifications: ["QA Fundamentals"],
          pendingCertifications: ["Test Automation", "Agile Testing", "Performance Testing"],
          lastAppraisalDate: "2024-12-13"
        }
      ];
      
      setProgress(response?.data?.length ? response.data : mockProgressWithPerformance);
    } catch (error) {
      console.error("Error fetching employee progress:", error);
      const message = String(error?.message || "");
      const mockProgressWithPerformance = [
        {
          id: 1,
          employeeName: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          department: "Engineering",
          assignedCourses: 8,
          completed: 5,
          inProgress: 2,
          overdue: 1,
          performanceScore: 3.2,
          skillGaps: ["Technical Skills", "Time Management"],
          certifications: ["React Developer", "AWS Cloud Practitioner"],
          pendingCertifications: ["Advanced JavaScript", "Project Management"],
          lastAppraisalDate: "2024-12-15"
        },
        {
          id: 2,
          employeeName: "Michael Chen",
          email: "michael.chen@company.com",
          department: "Engineering",
          assignedCourses: 6,
          completed: 4,
          inProgress: 2,
          overdue: 0,
          performanceScore: 4.3,
          skillGaps: ["Documentation"],
          certifications: ["Python Developer", "Data Science"],
          pendingCertifications: ["Machine Learning"],
          lastAppraisalDate: "2024-12-14"
        },
        {
          id: 3,
          employeeName: "Emily Davis",
          email: "emily.davis@company.com",
          department: "Quality",
          assignedCourses: 7,
          completed: 3,
          inProgress: 3,
          overdue: 1,
          performanceScore: 2.8,
          skillGaps: ["Automation Skills", "Communication", "Technical Knowledge"],
          certifications: ["QA Fundamentals"],
          pendingCertifications: ["Test Automation", "Agile Testing", "Performance Testing"],
          lastAppraisalDate: "2024-12-13"
        }
      ];
      if (message.toLowerCase().includes("access denied") || message.toLowerCase().includes("insufficient permissions")) {
        setProgress(mockProgressWithPerformance);
      } else {
        toast.error("Failed to load progress");
        setProgress([]);
      }
    } finally {
      setLoading(false);
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
          { label: isDeptHeadView ? "Dept Head" : isItAdminView ? "IT Admin" : "Manager", href: isDeptHeadView ? "/dept-head/dashboard" : isItAdminView ? "/it-admin/dashboard" : "/manager/dashboard" },
          { label: "Learning (Team)", href: isDeptHeadView ? "/dept-head/learning/team" : isItAdminView ? "/it-admin/learning/team" : "/manager/learning-team" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Learning Progress
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor learning completion by team member
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : progress.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No progress data found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Skill Gaps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Certifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Assigned Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    In Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Overdue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {progress.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.employeeName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.email} • {item.department}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Last Appraisal: {item.lastAppraisalDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(item.performanceScore)}`}>
                        {renderStars(item.performanceScore)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {item.skillGaps.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.skillGaps.slice(0, 2).map((gap, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1"
                              >
                                <AlertTriangle size={10} />
                                {gap}
                              </span>
                            ))}
                            {item.skillGaps.length > 2 && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{item.skillGaps.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">No gaps identified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {item.certifications.slice(0, 2).map((cert, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1"
                            >
                              <Award size={10} />
                              {cert}
                            </span>
                          ))}
                          {item.certifications.length > 2 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{item.certifications.length - 2}
                            </span>
                          )}
                        </div>
                        {item.pendingCertifications.length > 0 && (
                          <div className="text-xs text-orange-600 font-medium">
                            {item.pendingCertifications.length} pending
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.assignedCourses}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {item.completed}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.inProgress}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.overdue}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ActionDropdown
                        itemId={item.id}
                        viewUrl={`/manager/learning-team/${encodeURIComponent(item.id)}`}
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
