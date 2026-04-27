"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Building,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { employeeService } from "@/services/hr-services/employeeService";

export default function EmployeePerformanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id;

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
    }
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);

      // Fetch employee details and performance data
      const [employeeResponse, nineBoxResponse] = await Promise.all([
        employeeService.getEmployeeById(employeeId),
        performanceManagementService.getNineBoxGridData()
      ]);

      const employeeData = employeeResponse.data;

      // Updated to handle the new Nine-Box grid data structure (object with gridData and unassignedEmployees)
      const gridEmployees = nineBoxResponse.data?.gridData || (Array.isArray(nineBoxResponse.data) ? nineBoxResponse.data : []);
      const unassignedEmployees = nineBoxResponse.data?.unassignedEmployees || [];

      // Find employee's performance record from either grid data or unassigned list
      let performanceRecord = gridEmployees.find(nb => nb.employee?.id === parseInt(employeeId));

      if (!performanceRecord) {
        const unassigned = unassignedEmployees.find(u => u.id === parseInt(employeeId));
        if (unassigned) {
          performanceRecord = {
            ...unassigned,
            employee: { id: unassigned.id },
            performanceScore: null,
            potentialScore: null,
            managerReviewDate: null,
            status: 'Unassigned'
          };
        }
      }

      setEmployee(employeeData);
      setPerformanceData(performanceRecord);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast.error("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      NOT_STARTED: { color: "bg-gray-100 text-gray-800", icon: <Clock size={14} /> },
      IN_PROGRESS: { color: "bg-blue-100 text-blue-800", icon: <AlertTriangle size={14} /> },
      COMPLETED: { color: "bg-green-100 text-green-800", icon: <CheckCircle size={14} /> },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} /> }
    };

    const config = statusConfig[status] || statusConfig.NOT_STARTED;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.icon}
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getCompletionRate = () => {
    if (!performanceData) return 0;

    let completed = 0;
    let total = 3;

    // Use same logic as monitoring page
    const hasPerformanceData = !!performanceData.performanceScore;
    const hasManagerReview = performanceData.managerReviewDate || hasPerformanceData;
    const hasDeptHeadReview = performanceData.deptHeadReviewDate || hasPerformanceData;

    if (hasPerformanceData) completed++; // Self review completed
    if (hasManagerReview) completed++; // Manager review completed
    if (hasDeptHeadReview) completed++; // Dept head review completed

    return Math.round((completed / total) * 100);
  };

  const getCompletionColor = (rate) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-blue-500";
    if (rate >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Employee not found
          </h2>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "HR", href: "/hr" },
              { label: "Performance", href: "/hr/performance" },
              { label: "Monitoring", href: "/hr/performance/monitoring" },
              { label: "Employee Details", href: `/hr/performance/monitoring/${employeeId}` }
            ]}
          />

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => router.push('/hr/performance/monitoring')}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Monitoring
            </button>
          </div>
        </div>

        {/* Employee Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {employee.firstName} {employee.lastName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{employee.email}</p>
              </div>
            </div>

            {performanceData?.performanceScore && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Performance Score</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {performanceData.performanceScore}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Employee Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Building className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Department</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {employee.department?.name || 'Not assigned'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Designation</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {employee.designation?.name || 'Not assigned'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Joining Date</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'Not available'}
            </p>
          </div>
        </div>

        {/* Performance Review Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Review Status
          </h2>

          <div className="space-y-4">
            {/* Self Review */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Self Review</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {performanceData?.createdAt ? new Date(performanceData.createdAt).toLocaleDateString() : 'Not submitted'}
                </p>
              </div>
              {performanceData?.performanceScore ? getStatusBadge("COMPLETED") : getStatusBadge("IN_PROGRESS")}
            </div>

            {/* Manager Review */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Manager Review</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {performanceData?.managerReviewDate ? new Date(performanceData.managerReviewDate).toLocaleDateString() : 'Not reviewed'}
                </p>
              </div>
              {performanceData?.managerReviewDate ? getStatusBadge("COMPLETED") :
                performanceData?.performanceScore ? getStatusBadge("IN_PROGRESS") : getStatusBadge("PENDING")}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Overall Progress</h3>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {getCompletionRate()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getCompletionColor(getCompletionRate())}`}
                style={{ width: `${getCompletionRate()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Performance Score Details */}
        {performanceData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Performance Score</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {performanceData.performanceScore || 'N/A'}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Potential Score</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {performanceData.potentialScore || 'N/A'}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Potential Level</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {performanceData.potential || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
