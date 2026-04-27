"use client";

import { useState, useEffect } from "react";
import {
  Network,
  User,
  Mail,
  Building,
  Briefcase,
  Users,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import { organizationService } from "@/services/hr-services/organization.service";
import { toast } from "react-hot-toast";
import ReportingHierarchyTab from "@/app/(dashboard)/super-admin/company-orgranization/components/ReportingHierarchyTab";

export default function ReportingStructureTab({ companyId } = {}) {
  // Company Admin (UI-only) mode: reuse the Company Admin hierarchy builder/preview.
  if (companyId) {
    return <ReportingHierarchyTab companyId={companyId} headerLayout="twoLine" />;
  }

  const [reportingStructure, setReportingStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedManagers, setExpandedManagers] = useState(new Set());

  useEffect(() => {
    const fetchReportingStructure = async () => {
      try {
        setLoading(true);
        const response = await organizationService.getReportingStructure();
        const structure = response.success ? response.data : response;
        setReportingStructure(structure);
        // Auto-expand top-level managers
        if (structure?.topLevelManagers) {
          setExpandedManagers(
            new Set(structure.topLevelManagers.map((m) => m.id.toString()))
          );
        }
      } catch (error) {
        console.error("Error fetching reporting structure:", error);
        toast.error("Failed to load reporting structure");
      } finally {
        setLoading(false);
      }
    };

    fetchReportingStructure();
  }, []);

  const toggleManager = (managerId) => {
    setExpandedManagers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(managerId.toString())) {
        newSet.delete(managerId.toString());
      } else {
        newSet.add(managerId.toString());
      }
      return newSet;
    });
  };

  const renderEmployee = (employee, level = 0) => {
    const isExpanded = expandedManagers.has(employee.id.toString());
    const hasReports = employee.directReports && employee.directReports.length > 0;

    return (
      <div key={employee.id} className="mb-2">
        <div
          className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all ${level === 0
              ? "bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50 border-gray-200 dark:border-gray-700 shadow-sm"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            } hover:shadow-lg hover:scale-[1.01]`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasReports && (
            <button
              onClick={() => toggleManager(employee.id)}
              className="p-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <ChevronRight
                className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""
                  } group-hover:text-gray-700 dark:group-hover:text-gray-300`}
              />
            </button>
          )}
          {!hasReports && <div className="w-6" />}

          <div className="flex-1 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {employee.name || `${employee.firstName} ${employee.lastName}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {employee.employeeId || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-sm">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                {employee.email || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-secondary-100 dark:bg-secondary-500/20 rounded-sm">
                <Building className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                {employee.department || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-secondary-100 dark:bg-secondary-500/20 rounded-sm">
                <Briefcase className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                {employee.designation || "N/A"}
              </span>
              {employee.orgLevel !== undefined && employee.orgLevel !== null && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                  L{employee.orgLevel}
                </span>
              )}
            </div>
          </div>

          {hasReports && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-sm">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {employee.directReports.length} reports
              </span>
            </div>
          )}
        </div>

        {hasReports && isExpanded && (
          <div className="mt-2">
            {employee.directReports.map((report) => renderEmployee(report, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!reportingStructure) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-primary-50 dark:bg-primary-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Network className="w-10 h-10 text-primary-500 dark:text-primary-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">No reporting structure data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-500/20 dark:to-primary-500/10 p-5 rounded-sm border-2 border-primary-200 dark:border-primary-500/30 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Top-Level Managers</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {reportingStructure.topLevelManagers?.length || 0}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Top-Level Managers
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {reportingStructure.topLevelManagers?.length || 0}
              </p>
            </div>
            <div className="rounded-lg bg-primary-50 p-2 dark:bg-primary-500/20">
              <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/20 dark:to-emerald-500/10 p-5 rounded-sm border-2 border-emerald-200 dark:border-emerald-500/30 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Total Reporting Lines</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {reportingStructure.reportingLines?.length || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100/50 dark:from-secondary-500/20 dark:to-secondary-500/10 p-5 rounded-sm border-2 border-secondary-200 dark:border-secondary-500/30 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Total Employees</p>
          <p className="text-3xl font-bold text-secondary-600 dark:text-secondary-400">
            {reportingStructure.totalEmployees ||
              (reportingStructure.topLevelManagers?.length || 0) +
              (reportingStructure.reportingLines?.length || 0)}
          </p>
        </div>
      </div>

      {/* Reporting Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-sm">
            <Network className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Reporting Hierarchy
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Expand a manager to see direct reports.
            </p>
          </div>
        </div>

        <div className="mt-4 hidden md:grid grid-cols-4 gap-4 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          <span>Employee</span>
          <span>Email</span>
          <span>Department</span>
          <span>Designation</span>
        </div>

        {reportingStructure.topLevelManagers && reportingStructure.topLevelManagers.length > 0 ? (
          <div className="mt-3 space-y-2">
            {reportingStructure.topLevelManagers.map((manager) =>
              renderEmployee(manager, 0)
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No top-level managers found
          </div>
        )}
      </div>

      {/* Reporting Lines List (Alternative View) */}
      {reportingStructure.reportingLines && reportingStructure.reportingLines.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-sm">
              <Network className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                All Reporting Lines
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Complete employee to manager mapping.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {reportingStructure.reportingLines.map((line, index) => (
              <div
                key={index}
                className="p-4 bg-white dark:bg-gray-800 rounded-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-sm border border-gray-200 dark:border-gray-600">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {line.employee?.name || `${line.employee?.firstName} ${line.employee?.lastName}`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {line.employee?.designation}
                      </p>
                    </div>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-sm border border-emerald-200 dark:border-emerald-500/20">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {line.reportsTo?.name || `${line.reportsTo?.firstName} ${line.reportsTo?.lastName}`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {line.reportsTo?.designation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
