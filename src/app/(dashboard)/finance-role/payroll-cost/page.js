"use client";

import React from "react";
import Breadcrumb from '@/components/common/Breadcrumb';
import { FileCheck } from "lucide-react";
import PayrollSummaryWidget from './components/PayrollSummaryWidget';
import DepartmentWiseCostWidget from './components/DepartmentWiseCostWidget';
import CostCenterWiseWidget from './components/CostCenterWiseWidget';
import DiscrepancyFlaggingWidget from './components/DiscrepancyFlaggingWidget';

export default function PayrollCostReviewPage() {
  const breadcrumbItems = [
    { label: "Finance", href: "/finance-role" },
    { label: "Payroll Cost", href: "/finance-role/payroll-cost" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
   

        {/* Payroll Summary - Read Only */}
        <PayrollSummaryWidget />

        {/* Department-wise and Cost Center-wise - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepartmentWiseCostWidget />
          <CostCenterWiseWidget />
        </div>

        {/* Discrepancy Flagging */}
        <DiscrepancyFlaggingWidget />
      </div>
    </div>
  );
}
