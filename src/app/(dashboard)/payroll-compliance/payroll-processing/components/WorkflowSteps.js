"use client";

import React from "react";
import { CheckCircle2, Calendar, Users, Download, Calculator, Eye, Lock, FileText } from "lucide-react";

const workflowSteps = [
  { id: 1, label: "Select Period", icon: Calendar },
  { id: 2, label: "Select Employees", icon: Users },
  { id: 3, label: "Fetch Data", icon: Download },
  { id: 4, label: "Calculate", icon: Calculator },
  { id: 5, label: "Preview", icon: Eye },
  { id: 6, label: "Lock", icon: Lock },
  { id: 7, label: "Payslips", icon: FileText },
];

export default function WorkflowSteps({ currentStep, processingStatus, onStepClick, getStepStatus }) {
  return (
    <div className="glass-card rounded-2xl p-4 overflow-x-auto premium-shadow">
      <div className="flex items-center justify-between min-w-[600px] px-2">
        {workflowSteps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 group">
              <button
                onClick={() => status !== 'pending' && onStepClick(step.id)}
                disabled={status === 'pending'}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm border-2 ${
                  status === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : status === 'current' 
                    ? 'bg-white dark:bg-gray-800 border-primary text-primary scale-110 shadow-lg shadow-primary/20' 
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                }`}
              >
                {status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </button>
              <span className={`text-xs font-bold mt-2 transition-colors ${
                status === 'current' 
                  ? 'text-primary' 
                  : status === 'completed' 
                  ? 'text-green-600' 
                  : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>

              {/* Connector Line */}
              {index < workflowSteps.length - 1 && (
                <div className={`absolute top-6 left-1/2 w-[calc(100%_+_2rem)] h-0.5 -z-10 -translate-y-1/2 ${
                  getStepStatus(workflowSteps[index + 1].id) !== 'pending'
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-800'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
