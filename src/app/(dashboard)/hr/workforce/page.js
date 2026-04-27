"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Briefcase, Calendar, Users, Fingerprint } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

// Import components
import ShiftAssignmentTab from "./components/ShiftAssignmentTab";
import RosterPlanningTab from "./components/RosterPlanningTab";
import WorkforceAvailabilityTab from "./components/WorkforceAvailabilityTab";

export default function WorkforceManagementPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "shift-assignment");
  const isItAdminView = pathname?.startsWith("/it-admin");
  const homeLabel = isItAdminView ? "IT Admin" : "HR";
  const homeHref = isItAdminView ? "/it-admin/dashboard" : "/hr";
  const workforceHref = isItAdminView ? "/it-admin/roster" : "/hr/workforce";

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const tabs = [
    {
      id: "shift-assignment",
      label: "Shift Assignment",
      icon: <Briefcase size={18} />,
    },
    {
      id: "roster-planning",
      label: "Roster Planning",
      icon: <Calendar size={18} />,
    },
    {
      id: "availability",
      label: "Workforce Availability",
      icon: <Users size={18} />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "shift-assignment":
        return <ShiftAssignmentTab />;
      case "roster-planning":
        return <RosterPlanningTab />;
      case "availability":
        return <WorkforceAvailabilityTab />;
      default:
        return <ShiftAssignmentTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: homeLabel, href: homeHref },
            { label: "Workforce Management", href: workforceHref },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Workforce Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tag WFO/WFH/WFA modes, assign shifts, plan rosters, and track availability.
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
