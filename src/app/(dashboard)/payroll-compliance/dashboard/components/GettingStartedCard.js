"use client";

import { CheckCircle2, ArrowRight, Settings, FileText, Users, Calendar } from "lucide-react";
import Link from "next/link";

const gettingStartedSteps = [
  {
    id: 1,
    title: "Configure Company Settings",
    description: "Set up your company profile and basic information",
    icon: Settings,
    completed: true,
    href: "/payroll-compliance/settings",
  },
  {
    id: 2,
    title: "Add Employee Details",
    description: "Import or add employee information and bank details",
    icon: Users,
    completed: true,
    href: "/payroll-compliance/employees",
  },
  {
    id: 3,
    title: "Set Up Payroll Structure",
    description: "Configure salary components and pay scales",
    icon: FileText,
    completed: false,
    href: "/payroll-compliance/payroll-structure",
  },
  {
    id: 4,
    title: "Configure Compliance Rules",
    description: "Set up tax brackets and statutory compliance",
    icon: Calendar,
    completed: false,
    href: "/payroll-compliance/compliance",
  }
];

export default function GettingStartedCard() {
  const completedSteps = gettingStartedSteps.filter(step => step.completed).length;
  const totalSteps = gettingStartedSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Getting Started
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Complete these steps to set up your payroll system
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {completedSteps}/{totalSteps}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {gettingStartedSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              href={step.href}
              className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-500/10 transition-colors group"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                step.completed
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium mb-1 ${
                  step.completed
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
