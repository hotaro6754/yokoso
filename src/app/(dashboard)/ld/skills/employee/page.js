"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ldService } from "@/services/ld-services/ld.service";
import { toast } from "react-hot-toast";
import { Brain, Plus, Search, User, AlertTriangle, Star, Award } from "lucide-react";
import ActionDropdown from "../../components/ActionDropdown";

export default function EmployeeSkillsPage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ search: "" });

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await ldService.getEmployeeSkillsSummary(filters);
      
      // Mock data with performance integration - in real app, this would come from API
      const mockEmployeesWithPerformance = [
        {
          id: 1,
          employeeName: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          department: "Engineering",
          designation: "Product Designer",
          skillsCount: 8,
          skills: ["UI/UX Design", "React", "Figma", "User Research", "Prototyping", "CSS", "JavaScript", "Design Systems"],
          performanceScore: 3.2,
          skillGaps: ["Technical Skills", "Time Management"],
          certifications: ["React Developer", "AWS Cloud Practitioner"],
          lastAppraisalDate: "2024-12-15",
          recommendedSkills: ["Advanced JavaScript", "Project Management", "Node.js"]
        },
        {
          id: 2,
          employeeName: "Michael Chen",
          email: "michael.chen@company.com",
          department: "Engineering",
          designation: "Senior Developer",
          skillsCount: 12,
          skills: ["Python", "React", "Node.js", "AWS", "Docker", "MongoDB", "PostgreSQL", "Git", "CI/CD", "Testing", "Agile", "Mentoring"],
          performanceScore: 4.3,
          skillGaps: ["Documentation"],
          certifications: ["Python Developer", "Data Science", "AWS Solutions Architect"],
          lastAppraisalDate: "2024-12-14",
          recommendedSkills: ["Technical Writing", "Knowledge Management"]
        },
        {
          id: 3,
          employeeName: "Emily Davis",
          email: "emily.davis@company.com",
          department: "Quality",
          designation: "QA Engineer",
          skillsCount: 6,
          skills: ["Manual Testing", "Test Planning", "Bug Tracking", "Regression Testing", "Selenium", "JIRA"],
          performanceScore: 2.8,
          skillGaps: ["Automation Skills", "Communication", "Technical Knowledge", "Performance Testing"],
          certifications: ["QA Fundamentals"],
          lastAppraisalDate: "2024-12-13",
          recommendedSkills: ["Test Automation", "API Testing", "Performance Testing", "JMeter", "Communication Skills"]
        }
      ];
      
      setEmployees(mockEmployeesWithPerformance);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employee skills");
      setEmployees([]);
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
          { label: "L&D", href: "/ld" },
          { label: "Skills & Competency", href: "/ld/skills" },
          { label: "Employee Skills", href: "/ld/skills/employee" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Employee Skills
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and manage employee skill tags
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No employees found</p>
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
                    Skills Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.employeeName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {employee.email} • {employee.designation}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Last Appraisal: {employee.lastAppraisalDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(employee.performanceScore)}`}>
                        {renderStars(employee.performanceScore)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {employee.skillGaps.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {employee.skillGaps.slice(0, 2).map((gap, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1"
                              >
                                <AlertTriangle size={10} />
                                {gap}
                              </span>
                            ))}
                            {employee.skillGaps.length > 2 && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{employee.skillGaps.length - 2}
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
                          {employee.certifications.slice(0, 2).map((cert, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1"
                            >
                              <Award size={10} />
                              {cert}
                            </span>
                          ))}
                          {employee.certifications.length > 2 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{employee.certifications.length - 2}
                            </span>
                          )}
                        </div>
                        {employee.recommendedSkills && employee.recommendedSkills.length > 0 && (
                          <div className="text-xs text-blue-600 font-medium">
                            {employee.recommendedSkills.length} recommended
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {employee.skillsCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {employee.skills?.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {employee.skills?.length > 3 && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{employee.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ActionDropdown
                        itemId={employee.id}
                        viewUrl={`/ld/skills/employee/${employee.id}`}
                        editUrl={`/ld/skills/employee/${employee.id}/edit`}
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
