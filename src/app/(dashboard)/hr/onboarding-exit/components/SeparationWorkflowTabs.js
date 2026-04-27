"use client";

import { useState } from "react";
import { AlertCircle, CheckSquare, Package, UserCheck, MessageSquare } from "lucide-react";
import ResignationTrackingDetailTab from "./separation/ResignationTrackingDetailTab";
import SeparationChecklistTab from "./separation/SeparationChecklistTab";
import AssetClearanceTab from "./separation/AssetClearanceTab";
import SeparationStatusTab from "./separation/SeparationStatusTab";
import ExitInterviewTab from "./separation/ExitInterviewTab";

export default function SeparationWorkflowTabs({ resignationId }) {
  const [activeSubTab, setActiveSubTab] = useState("resignations");

  const subTabs = [
    { id: "resignations", label: "Resignation Tracking", icon: <AlertCircle size={16} /> },
    { id: "checklist", label: "Separation Checklist", icon: <CheckSquare size={16} /> },
    { id: "assets", label: "Asset & Clearance", icon: <Package size={16} /> },
    { id: "status", label: "Separation Status", icon: <UserCheck size={16} /> },
    { id: "interview", label: "Exit Interview", icon: <MessageSquare size={16} /> },
  ];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "resignations":
        return <ResignationTrackingDetailTab resignationId={resignationId} />;
      case "checklist":
        return <SeparationChecklistTab resignationId={resignationId} />;
      case "assets":
        return <AssetClearanceTab resignationId={resignationId} />;
      case "status":
        return <SeparationStatusTab resignationId={resignationId} />;
      case "interview":
        return <ExitInterviewTab resignationId={resignationId} />;
      default:
        return <ResignationTrackingDetailTab resignationId={resignationId} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-t-lg px-2">
        <div className="flex flex-wrap gap-1">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${
                activeSubTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-800 shadow-sm"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-600/50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">{renderSubTabContent()}</div>
    </div>
  );
}
