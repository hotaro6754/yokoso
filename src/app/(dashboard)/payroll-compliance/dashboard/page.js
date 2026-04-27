"use client";

import React from "react";
import { BarChart3, AlertCircle, RefreshCw } from "lucide-react";
import { usePayrollDashboard } from '@/hooks/usePayrollDashboard';
import PayrollStatusWidget from './components/PayrollStatusWidget';
import PayrollExceptionsWidget from './components/PayrollExceptionsWidget';
import StatutoryComplianceWidget from './components/StatutoryComplianceWidget';
import UpcomingActionsWidget from './components/UpcomingActionsWidget';
import GettingStartedCard from './components/GettingStartedCard';
import ComplianceGreetingCard from './components/ComplianceGreetingCard';

export default function PayrollComplianceDashboard() {
  const { data, loading, error, refetch } = usePayrollDashboard();
  console.log('dashboard data', data)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Loading Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{error}</p>
              <button
                onClick={refetch}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Greeting Card */}
        <ComplianceGreetingCard />

        {/* Getting Started Card */}
        {/* <GettingStartedCard /> */}

        {/* Main Dashboard Widgets - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PayrollStatusWidget data={data?.payrollStatus} />
          <PayrollExceptionsWidget data={data?.payrollExceptions
          } />
        </div>

        {/* Statutory Compliance & Upcoming Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatutoryComplianceWidget data={data?.statutoryCompliance} />
          <UpcomingActionsWidget data={data?.upcomingActions} />
        </div>
      </div>
    </div>
  );
}
