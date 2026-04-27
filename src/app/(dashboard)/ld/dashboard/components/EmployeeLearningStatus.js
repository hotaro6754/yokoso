"use client";

import React, { useState, useEffect } from "react";
import { ldService } from "@/services/ld-services/ld.service";
import { Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function EmployeeLearningStatus() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    employeesEnrolled: 120,
    employeesCompleted: 85,
    overdueTrainings: 5,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await ldService.getEmployeeLearningStatus();
      setData(response.data || response);
    } catch (error) {
      console.error("Error fetching employee learning status:", error);
      // Use mock data on error
    } finally {
      setLoading(false);
    }
  };

  const completionRate = data.employeesEnrolled > 0 
    ? ((data.employeesCompleted / data.employeesEnrolled) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Employee Learning Status
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Training completion overview
            </p>
          </div>
        </div>
        <Link
          href="/ld/progress/employee"
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Employees Enrolled</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {data.employeesEnrolled || 0}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Completed Training</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {data.employeesCompleted || 0}
            </span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {completionRate}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          {data.overdueTrainings > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {data.overdueTrainings} overdue training(s)
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
