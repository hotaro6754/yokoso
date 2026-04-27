"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, Calendar, TrendingUp } from "lucide-react";
import { employeePerformanceService } from "@/services/employee/performance.service";
import { toast } from "react-hot-toast";

export default function AppraisalWidget() {
  const [currentAppraisal, setCurrentAppraisal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toastShownRef = useRef(false);

  useEffect(() => {
    const fetchCurrentAppraisal = async () => {
      try {
        const appraisal = await employeePerformanceService.getCurrentAppraisal();
        setCurrentAppraisal(appraisal);

        // Show notification for new pending appraisal
        if (appraisal && appraisal.status === "Pending") {
          const toastKey = `appraisal_toast_${appraisal.id || appraisal.cycle || "current"}`;
          const alreadyShown = typeof window !== "undefined" && sessionStorage.getItem(toastKey);
          if (!toastShownRef.current && !alreadyShown) {
            toastShownRef.current = true;
            toast.success(`New appraisal available: ${appraisal.cycle}`, {
              duration: 5000,
            });
            if (typeof window !== "undefined") {
              sessionStorage.setItem(toastKey, "1");
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch current appraisal", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentAppraisal();
  }, []);

  const normalizeStatus = (status) => {
    if (!status) return "";
    // Handle specific cases or generic camel/snake case
    if (status === "PENDING_MANAGER_REVIEW") return "Manager Review";

    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusConfig = (status) => {
    const normalized = (status || "").toUpperCase();

    if (normalized === "PENDING" || normalized === "DRAFT") {
      return {
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
        badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock size={16} className="text-yellow-600" />,
        action: "Complete Now",
        actionColor: "bg-yellow-600 hover:bg-yellow-700 text-white"
      };
    }

    if (normalized === "SUBMITTED" || normalized === "PENDING_MANAGER_REVIEW" || normalized === "PENDING_REVIEW") {
      return {
        color: "bg-blue-50 border-blue-200 text-blue-800",
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircle size={16} className="text-blue-600" />,
        action: "View Submitted",
        actionColor: "bg-blue-600 hover:bg-blue-700 text-white"
      };
    }

    if (normalized === "REVIEWED" || normalized === "COMPLETED" || normalized === "APPROVED") {
      return {
        color: "bg-green-50 border-green-200 text-green-800",
        badge: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle size={16} className="text-green-600" />,
        action: "View Results",
        actionColor: "bg-green-600 hover:bg-green-700 text-white"
      };
    }

    return {
      color: "bg-gray-50 border-gray-200 text-gray-800",
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      icon: <AlertCircle size={16} className="text-gray-600" />,
      action: "No Active Appraisal",
      actionColor: "bg-gray-600 hover:bg-gray-700 text-white"
    };
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;

    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "Due Tomorrow";
    return `${diffDays} days left`;
  };

  const getDeadlineColor = (deadline) => {
    if (!deadline) return "text-gray-500";

    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600 font-medium";
    if (diffDays <= 3) return "text-orange-600 font-medium";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!currentAppraisal) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Calendar size={20} className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Performance Appraisal</h3>
            <p className="text-sm text-gray-600">No active appraisal cycles</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Check back later for new appraisal opportunities
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(currentAppraisal.status);
  const daysLeft = getDaysUntilDeadline(currentAppraisal.submissionDeadline);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 transition-all duration-300 hover:shadow-md ${statusConfig.color.split(' ')[2]}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
            <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">Performance Appraisal</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentAppraisal.cycle}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${statusConfig.badge}`}>
          {statusConfig.icon && React.cloneElement(statusConfig.icon, { size: 12 })}
          <span className="whitespace-nowrap">{normalizeStatus(currentAppraisal.status)}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {currentAppraisal.submissionDeadline && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Deadline:</span>
            <span className={getDeadlineColor(currentAppraisal.submissionDeadline)}>
              {currentAppraisal.submissionDeadline}
            </span>
          </div>
        )}

        {daysLeft && currentAppraisal.status === "Pending" && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Time left:</span>
            <span className={getDeadlineColor(currentAppraisal.submissionDeadline)}>
              {daysLeft}
            </span>
          </div>
        )}

        {currentAppraisal.finalScore && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Final Score:</span>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} className="text-green-600" />
              <span className="font-medium">{currentAppraisal.finalScore}/5.0</span>
            </div>
          </div>
        )}
      </div>

      {currentAppraisal.status === "Pending" && daysLeft && parseInt(daysLeft) <= 3 && (
        <div className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-800 text-sm">
            <AlertCircle size={14} />
            <span>Deadline approaching! Submit your appraisal soon.</span>
          </div>
        </div>
      )}

      <Link
        href="/employee/performance/my-appraisal"
        className={`block w-full text-center px-4 py-2 rounded-lg font-medium transition-colors ${statusConfig.actionColor}`}
      >
        {statusConfig.action}
      </Link>
    </div>
  );
}
