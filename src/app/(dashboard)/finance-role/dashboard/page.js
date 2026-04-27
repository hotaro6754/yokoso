"use client";



import React from "react";

import Breadcrumb from '@/components/common/Breadcrumb';

import FinanceGreetingCard from './components/FinanceGreetingCard';

import PayrollCostSummaryWidget from './components/PayrollCostSummaryWidget';

import ExpenseOverviewWidget from './components/ExpenseOverviewWidget';

import PayoutReadinessWidget from './components/PayoutReadinessWidget';

import CostTrendWidget from './components/CostTrendWidget';
import DashboardPunchWidget from "@/components/dashboard/DashboardPunchWidget";



export default function FinanceDashboard() {

  const breadcrumbItems = [

    { label: "Finance", href: "/finance-role" },

    { label: "Dashboard", href: "/finance-role/dashboard" },

  ];



  return (

    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Top Section: Punch Widget (Full Width) like Manager Dashboard */}
        <div>
          <DashboardPunchWidget />
        </div>

        {/* Greeting Card - Arranged below */}
        <div className="w-full">
          <FinanceGreetingCard />
        </div>

        {/* Main Dashboard Widgets - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PayrollCostSummaryWidget />
          <ExpenseOverviewWidget />
        </div>

        {/* Payout Readiness & Cost Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PayoutReadinessWidget />
          <CostTrendWidget />
        </div>
      </div>
    </div>
  );
}

