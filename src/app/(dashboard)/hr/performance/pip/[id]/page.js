"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { AlertTriangle, CheckCircle2, UserX, Clock, CalendarDays, ArrowLeft } from "lucide-react";

const PIPDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [pip, setPip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (typeof window !== "undefined") {
          const rawSelected = window.localStorage.getItem("zodeck_pip_selected");
          const cachedSelected = rawSelected ? JSON.parse(rawSelected) : null;
          if (cachedSelected && String(cachedSelected.id) === String(id)) {
            setPip(cachedSelected);
            setLoading(false);
            return;
          }

          const rawList = window.localStorage.getItem("zodeck_pip_cache");
          const cachedList = rawList ? JSON.parse(rawList) : [];
          if (Array.isArray(cachedList)) {
            const cachedMatch = cachedList.find((item) => String(item.id) === String(id));
            if (cachedMatch) {
              setPip(cachedMatch);
              setLoading(false);
              return;
            }
          }
        }

        const data = await performanceManagementService.getPIPs({});
        const found = Array.isArray(data) ? data.find((item) => String(item.id) === String(id)) : null;
        if (found) {
          setPip(found);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("zodeck_pip_selected", JSON.stringify(found));
          }
        } else {
          setPip(null);
        }
      } catch (error) {
        setPip(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            <AlertTriangle size={12} /> Active
          </span>
        );
      case "COMPLETED_SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <CheckCircle2 size={12} /> Closed Successfully
          </span>
        );
      case "COMPLETED_FAILURE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            <UserX size={12} /> Closed Unsuccessful
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            <Clock size={12} /> Draft
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr/dashboard" },
            { label: "Performance Management", href: "/hr/performance-management/appraisals" },
            { label: "PIP Management", href: "/hr/performance/pip" },
            { label: "PIP Details" },
          ]}
        />

        <button
          onClick={() => router.push("/hr/performance/pip")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to PIP List
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">PIP Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review the improvement plan details.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading PIP details...</p>
          </div>
        ) : !pip ? (
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">PIP details not found.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {pip.employee.firstName} {pip.employee.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pip.employee.email}</p>
                </div>
                <div>{getStatusBadge(pip.status)}</div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {pip.manager.firstName} {pip.manager.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{pip.progress}%</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reason</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">{pip.reason}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Period</p>
                <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                  <CalendarDays size={14} />
                  {new Date(pip.startDate).toLocaleDateString()} - {new Date(pip.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PIPDetailsPage;
