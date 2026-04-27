"use client";

import { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import BreadcrumbRightContent from "../components/BreadcrumbRightContent";
import TeamCalendar from "../components/TeamCalendar";

export default function TeamCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb
          customTitle="Team Calendar"
          subtitle="View team leaves and schedule"
          rightContent={
            <BreadcrumbRightContent
              selectedDate={selectedMonth}
              setSelectedDate={setSelectedMonth}
            />
          }
        />

        <TeamCalendar selectedMonth={selectedMonth} />
      </div>
    </div>
  );
}
