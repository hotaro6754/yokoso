"use client";

import React, { useState } from "react";
import Breadcrumb from '@/components/common/Breadcrumb';
import { Receipt } from "lucide-react";
import ExpenseStatsCards from './components/ExpenseStatsCards';
import ExpenseTable from './components/ExpenseTable';

export default function ExpenseReimbursementPage() {
  const breadcrumbItems = [
    { label: "Finance", href: "/finance-role" },
    { label: "Expense Reimbursement", href: "/finance-role/expense-reimbursement" },
  ];

  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
    

        {/* Stats Cards */}
        <ExpenseStatsCards refreshKey={refreshKey} />

        {/* Expense Table */}
        <ExpenseTable
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onActionComplete={() => setRefreshKey((prev) => prev + 1)}
        />
      </div>
    </div>
  );
}
