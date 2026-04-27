"use client";

import React, { useState } from "react";
import Breadcrumb from '@/components/common/Breadcrumb';
import { Banknote } from "lucide-react";
import BankAccountsWidget from './components/BankAccountsWidget';
import BankExportWidget from './components/BankExportWidget';
import ExportHistoryTable from './components/ExportHistoryTable';

export default function AccountBankExportPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const breadcrumbItems = [
    { label: "Finance", href: "/finance-role" },
    { label: "Account & Bank Export", href: "/finance-role/account-bank-export" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
    

        {/* Bank Accounts and Export Widgets - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BankAccountsWidget refreshKey={refreshKey} />
          <BankExportWidget onExportGenerated={() => setRefreshKey((prev) => prev + 1)} />
        </div>

        {/* Export History Table */}
        <ExportHistoryTable refreshKey={refreshKey} />
      </div>
    </div>
  );
}
