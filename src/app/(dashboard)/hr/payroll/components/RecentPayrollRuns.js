// src/app/(dashboard)/hr/payroll/components/RecentPayrollRuns.js
"use client";
import { useState, useEffect } from 'react';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function RecentPayrollRuns() {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayrollRuns = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getRecentPayrollRuns({
          page: 1,
          limit: 12
        });
        const runs = response.data?.payrollRuns || response.data || [];
        setPayrollRuns(Array.isArray(runs) ? runs : []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching payroll runs:', err);
        setPayrollRuns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollRuns();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
      case 'PROCESSED':
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending':
      case 'DRAFT':
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Failed':
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const sortedRuns = [...payrollRuns].sort((a, b) => {
    const dateA = new Date(a.processedDate || a.period || 0);
    const dateB = new Date(b.processedDate || b.period || 0);
    return dateB - dateA;
  });



  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">Error loading payroll runs: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Payroll Status Overview
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            High-level payroll status tracking (Read-only)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Month
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Payroll Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedRuns.length > 0 ? (
              sortedRuns.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {run.period || (run.processedDate ? payrollService.formatDate(run.processedDate) : "N/A")}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(run.status)}`}>
                      {run.status === "PROCESSED" || run.status === "PAID" || run.status === "Completed"
                        ? "Processed"
                        : run.status === "DRAFT" || run.status === "Pending" || run.status === "IN_PROGRESS"
                        ? "In Progress"
                        : run.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No payroll status data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}