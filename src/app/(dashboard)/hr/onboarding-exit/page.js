"use client";

import { useState } from "react";
import { UserPlus, LogOut } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

// Import tab components
import OnboardingTab from "./components/OnboardingTab";
import SeparationTab from "./components/SeparationTab";

export default function OnboardingExitManagementPage() {
  const [activeTab, setActiveTab] = useState("onboarding");

  const tabs = [
    {
      id: "onboarding",
      label: "Onboarding",
      icon: <UserPlus size={18} />,
    },
    {
      id: "separation",
      label: "Separation",
      icon: <LogOut size={18} />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "onboarding":
        return <OnboardingTab />;
      case "separation":
        return <SeparationTab />;
      default:
        return <OnboardingTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Onboarding & Exit", href: "/hr/onboarding-exit" },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Onboarding & Exit Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage employee lifecycles, workflows, and separation processes.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
                }
              `}
            >
              <span className={`
                ${activeTab === tab.id ? "text-brand-600 dark:text-brand-400" : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"}
              `}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
