// src/app/(dashboard)/company-admin/dashboard/components/SystemStats.js (served via middleware rewrite)
import React from "react";
import Link from "next/link";

const SystemStats = () => {
  const statsData = [
    {
      title: "Employees",
      value: "247",
      comparison: "Active",
      trend: "stable",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      iconBgColor: "bg-green-500",
      href: "/company-admin/users",
    },
    {
      title: "Pending Approvals",
      value: "18",
      comparison: "This week",
      trend: "up",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconBgColor: "bg-blue-500",
      href: "/company-admin/workflow-management",
    },
    {
      title: "Open Roles",
      value: "6",
      comparison: "Hiring",
      trend: "up",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      iconBgColor: "bg-purple-500",
      href: "/company-admin/workflow-management",
    },
    {
      title: "Security Alerts",
      value: "2",
      comparison: "Critical",
      trend: "down",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      iconBgColor: "bg-red-500",
      href: "/company-admin/security-audit-logs",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="card bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 overflow-hidden"
        >
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.iconBgColor}`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <h6 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {stat.title}
                </h6>
                <div className="flex items-baseline">
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                    {stat.value}
                  </h4>
                  <span
                    className={`ml-2 text-xs font-medium ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : stat.trend === "down"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {stat.comparison}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
            <Link
              href={stat.href}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SystemStats;