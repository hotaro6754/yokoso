"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import { 
  Calendar, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Lock,
  X,
  Target
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function AppraisalCycleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const cycleId = params?.id;

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchCycleDetails();
  }, [cycleId]);

  const fetchCycleDetails = async () => {
    try {
      setLoading(true);
      const response = await performanceManagementService.getAppraisalCycleById(cycleId);
      setCycle(response);
    } catch (error) {
      console.error("[DEBUG] Error fetching cycle details:", error);
      toast.error("Failed to load appraisal cycle details");
      router.push("/hr/performance/appraisal-cycles");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await performanceManagementService.updateAppraisalCycleStatus(cycleId, newStatus);
      
      setCycle(prev => ({ ...prev, status: newStatus }));
      toast.success(`Appraisal cycle ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(error.message || "Failed to update cycle status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setUpdating(true);
      await performanceManagementService.deleteAppraisalCycle(cycleId);
      toast.success("Appraisal cycle deleted successfully");
      router.push("/hr/performance/appraisal-cycles");
    } catch (error) {
      toast.error(error.message || "Failed to delete appraisal cycle");
    } finally {
      setUpdating(false);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-100 text-gray-800", icon: <Clock size={14} /> },
      ACTIVE: { color: "bg-[var(--color-primary-hover)] text-[#0b1220]", icon: <Play size={14} /> },
      IN_PROGRESS: { color: "bg-[var(--color-primary-hover)] text-[#0b1220]", icon: <Clock size={14} /> },
      COMPLETED: { color: "bg-[var(--color-primary-hover)] text-[#0b1220]", icon: <CheckCircle size={14} /> },
      CANCELLED: { color: "bg-red-100 text-red-800", icon: <X size={14} /> }
    };
    
    const config = statusConfig[status] || statusConfig.DRAFT;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getCompletionColor = (rate) => {
    if (rate >= 90) return "text-[#0b1220] bg-[var(--color-primary-hover)]";
    if (rate >= 70) return "text-[#0b1220] bg-[var(--color-primary-hover)]";
    if (rate >= 50) return "text-[#0b1220] bg-[var(--color-primary-hover)]";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Appraisal cycle not found
          </h2>
          <Link
            href="/hr/performance/appraisal-cycles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[#0b1220] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Cycles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Performance", href: "/hr/performance" },
          { label: "Appraisal Cycles", href: "/hr/performance/appraisal-cycles" },
          { label: cycle.name, href: `/hr/performance/appraisal-cycles/${cycleId}` },
        ]}
      />

      <div className="my-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/hr/performance/appraisal-cycles"
              className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
              title="Back"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-[var(--color-primary-hover)] p-3 text-[#0b1220] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)]">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {cycle.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Appraisal Cycle Details
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(cycle.status)}
            <Link
              href={`/hr/performance/appraisal-cycles/${cycleId}/edit`}
              className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <Edit size={16} />
              Edit
            </Link>
          </div>
        </div>

        {/* Cycle Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cycle Name</label>
                  <p className="text-gray-900 dark:text-white">{cycle.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</label>
                  <p className="text-gray-900 dark:text-white">{cycle.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Quarter</label>
                  <p className="text-gray-900 dark:text-white">{cycle.quarter}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">{getStatusBadge(cycle.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(cycle.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(cycle.endDate)}</p>
                </div>
              </div>
              {cycle.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="text-gray-900 dark:text-white mt-1">{cycle.description}</p>
                </div>
              )}
            </div>

            {/* Evaluation Metrics */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-blue-600" />
                Evaluation Metrics
              </h3>
              {cycle.evaluationParameters && cycle.evaluationParameters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cycle.evaluationParameters.map((metric, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{metric.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.description || "No description provided."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No custom evaluation metrics defined for this cycle. Standard categories will be used.</p>
              )}
            </div>

            {/* Deadlines */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} />
                Review Deadlines
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Employee Submission</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Self-assessment deadline</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(cycle.employeeSubmissionDeadline)}
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Manager Review</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manager evaluation deadline</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(cycle.managerReviewDeadline)}
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Department Head Review</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Final approval deadline</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(cycle.deptHeadReviewDeadline)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress & Actions */}
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                Progress Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overall Completion</span>
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getCompletionColor(cycle.completionRate)}`}>
                      {cycle.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${cycle.completionRate >= 50 ? "bg-[var(--color-primary)]" : "bg-red-500"}`}
                      style={{ width: `${cycle.completionRate}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Employee Submissions</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cycle.employeeSubmissions}/{cycle.totalEmployees}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Manager Reviews</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cycle.managerReviews}/{cycle.totalEmployees}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Dept Head Reviews</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cycle.deptHeadReviews}/{cycle.totalEmployees}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions</h3>
              <div className="space-y-3">
                {cycle.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange('ACTIVE')}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[#0b1220] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                  >
                    <Play size={16} />
                    {updating ? "Activating..." : "Activate Cycle"}
                  </button>
                )}
                
                {cycle.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange('COMPLETED')}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[#0b1220] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    {updating ? 'Completing...' : 'Complete Cycle'}
                  </button>
                )}
                
                {cycle.status === 'COMPLETED' && (
                  <button
                    onClick={() => handleStatusChange('CANCELLED')}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[#0b1220] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                  >
                    <X size={16} />
                    {updating ? 'Cancelling...' : 'Cancel Cycle'}
                  </button>
                )}
                
                {(cycle.status === 'DRAFT' || cycle.status === 'COMPLETED') && (
                  <button
                    onClick={handleDelete}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[#0b1220] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {updating ? 'Deleting...' : 'Delete Cycle'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Appraisal Cycle"
        description={`Are you sure you want to delete "${cycle?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Cycle"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
