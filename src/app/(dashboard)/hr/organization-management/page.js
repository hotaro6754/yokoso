"use client";

import { useState } from "react";
import { Building, Briefcase, GitBranch, PlusCircle } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import DepartmentsTab from "./components/DepartmentsTab";
import DesignationsTab from "./components/DesignationsTab";
import OrgChartTab from "./components/OrgChartTab";
import { useAuth } from "@/context/AuthContext";

export default function OrganizationManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("departments");
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isManagerView = pathname.startsWith("/manager");
  const isRecruiterView = pathname.startsWith("/recruiter");
  const isDeptHeadView = pathname.startsWith("/dept-head");
  const isItAdminView = pathname.startsWith("/it-admin");
  const rawUserRole = user?.systemRole || user?.role || "";
  const userRole = String(rawUserRole).toUpperCase().replace(/[\s-]+/g, "_");
  const baseOrgPath = isManagerView
    ? "/manager/organization-management"
    : isRecruiterView
      ? "/recruiter/organization-management"
      : isDeptHeadView
        ? "/dept-head/organization-management"
        : isItAdminView
          ? "/it-admin/organization-management"
          : "/hr/organization-management";
  const baseLabel = isManagerView ? "Manager" : isRecruiterView ? "Recruiter" : isDeptHeadView ? "Dept Head" : isItAdminView ? "IT Admin" : "HR";
  const baseLabelHref = isManagerView ? "/manager/dashboard" : isRecruiterView ? "/recruiter/dashboard" : isDeptHeadView ? "/dept-head/dashboard" : isItAdminView ? "/it-admin/dashboard" : "/hr";
  const canFetch = !!userRole && [
    "MASTER_ADMIN",
    "SUPER_ADMIN",
    "COMPANY_OWNER",
    "COMPANY_ADMIN",
    "HR_ADMIN",
    "PAYROLL_ADMIN",
    "FINANCE_ADMIN",
    "MANAGER",
    "RECRUITER",
    "L_AND_D_MANAGER",
    "IT_ADMIN",
    "DEPT_HEAD",
    "DEPARTMENT_HEAD",
    "IT_ADMIN",
  ].includes(userRole);
  const isViewOnly = isManagerView
    || isRecruiterView
    || isDeptHeadView
    || isItAdminView
    || !canFetch
    || ["PAYROLL_ADMIN", "FINANCE_ADMIN", "MANAGER", "RECRUITER", "L_AND_D_MANAGER", "IT_ADMIN", "DEPT_HEAD", "DEPARTMENT_HEAD", "IT_ADMIN"].includes(userRole);

  const tabs = [
    {
      id: "departments",
      label: "Departments",
      icon: <Building size={18} />,
      component: <DepartmentsTab viewOnly={isViewOnly} allowFetch={canFetch} />,
    },
    {
      id: "designations",
      label: "Designations",
      icon: <Briefcase size={18} />,
      component: <DesignationsTab viewOnly={isViewOnly} allowFetch={canFetch} />,
    },
    {
      id: "org-chart",
      label: "Org Chart View",
      icon: <GitBranch size={18} />,
      component: <OrgChartTab allowFetch={canFetch} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="mb-6 flex flex-col gap-4">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: baseLabel, href: baseLabelHref },
            { label: "Organization Management", href: baseOrgPath },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Organization Structure
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage departments, designations, and view the organizational hierarchy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isViewOnly && activeTab === "departments" && (
              <Link
                href={`${baseOrgPath}/departments/add`}
                className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
              >
                <PlusCircle size={18} />
                Add Department
              </Link>
            )}
            {!isViewOnly && activeTab === "designations" && (
              <Link
                href={`${baseOrgPath}/designations/add`}
                className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
              >
                <PlusCircle size={18} />
                Add Designation
              </Link>
            )}
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

      {isViewOnly && (
        <div className="mb-6 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          View-only access: editing is restricted for this role.
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}
