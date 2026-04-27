"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import LeaveOverviewCards from "./LeaveOverviewCards";
import RequestLeaveForm from "./RequestLeaveForm";
import { ChevronLeft } from "lucide-react";

export default function ApplyLeavePageContent({ backPath }) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const handleBack = () => {
    if (backPath) {
      router.push(backPath);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          customTitle="Apply Leave"
          subtitle="Submit a new leave request"
          rightContent={
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          }
        />

        <LeaveOverviewCards selectedMonth={selectedMonth} />

        <div className="grid grid-cols-1 gap-6">
            <RequestLeaveForm 
                onSuccess={handleBack} 
            />
        </div>
      </div>
    </div>
  );
}
