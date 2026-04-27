"use client";

import { useState } from "react";
import { BarChart3, CheckCircle, MessageSquare, ShieldCheck, Target, Settings, Workflow } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

// Import tab components
import AppraisalCyclesTab from "./components/AppraisalCyclesTab";
import GoalCompletionTab from "./components/GoalCompletionTab";
import ManagerFeedbackTab from "./components/ManagerFeedbackTab";
import HRModerationTab from "./components/HRModerationTab";
import ReviewTrackingTab from "./components/ReviewTrackingTab";
import PerformanceSummaryTab from "./components/PerformanceSummaryTab";

export default function PerformanceManagementPage() {
  const [activeTab, setActiveTab] = useState("cycles");

  const tabs = [
    {
      id: "cycles",
      label: "Appraisal Cycles",
      icon: <Settings size={18} />,
    },
    {
      id: "goals",
      label: "Goal Monitoring",
      icon: <CheckCircle size={18} />,
    },
    {
      id: "tracking",
      label: "Review Tracking",
      icon: <Workflow size={18} />,
    },
    {
      id: "feedback",
      label: "Manager Feedback",
      icon: <MessageSquare size={18} />,
    },
    {
      id: "moderation",
      label: "HR Moderation",
      icon: <ShieldCheck size={18} />,
    },
    {
      id: "summary",
      label: "Summary Dashboard",
      icon: <BarChart3 size={18} />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "cycles":
        return <AppraisalCyclesTab />;
      case "goals":
        return <GoalCompletionTab />;
      case "tracking":
        return <ReviewTrackingTab />;
      case "feedback":
        return <ManagerFeedbackTab />;
      case "moderation":
        return <HRModerationTab />;
      case "summary":
        return <PerformanceSummaryTab />;
      default:
        return <AppraisalCyclesTab />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-3 sm:p-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      <div className="mt-6 mb-6 rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-sm bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ZODECK – Manifesting Growth. Monitor cycles, goals, reviews, and HR moderation.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
