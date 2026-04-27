"use client";

import { useState } from "react";
import { Clock, TrendingDown, TrendingUp, Calendar, Users } from "lucide-react";
import LateArrivalsTable from "./LateArrivalsTable";
import EarlyLeavesTable from "./EarlyLeavesTable";

export default function LateEarlyTrackingTab() {
  const [activeView, setActiveView] = useState("late");

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-t-lg px-2">
        <button
          onClick={() => setActiveView("late")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${
            activeView === "late"
              ? "border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-800 shadow-sm"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-600/50"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Late Arrivals
        </button>
        <button
          onClick={() => setActiveView("early")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${
            activeView === "early"
              ? "border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-800 shadow-sm"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-600/50"
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Early Leaves
        </button>
      </div>

      {/* Content */}
      {activeView === "late" ? <LateArrivalsTable /> : <EarlyLeavesTable />}
    </div>
  );
}
