'use client';

import { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  FileText,
  TrendingDown,
  Users,
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import CustomDropdown from "../leave/components/CustomDropdown";
import { organizationService } from "@/services/hr-services/organization.service";
import DatePickerField from "@/components/form/input/DatePickerField";

import HeadcountReportTab from "./components/HeadcountReportTab";
import AttritionReportTab from "./components/AttritionReportTab";
import AttendanceSummaryTab from "./components/AttendanceSummaryTab";
import LeaveUtilizationTab from "./components/LeaveUtilizationTab";
import LeaveReportTab from "./components/LeaveReportTab";
import MissingTimesheetsReportTab from "./components/MissingTimesheetsReportTab";
import PerformanceReportTab from "./components/PerformanceReportTab";
import AssetReportTab from "./components/AssetReportTab";
import ProjectReportTab from "./components/ProjectReportTab";
import PayrollReportTab from "./components/PayrollReportTab";

export default function ReportsAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [departments, setDepartments] = useState([]);
  const [globalFilters, setGlobalFilters] = useState({
    startDate: "",
    endDate: "",
    departmentId: "all",
    location: "",
    employmentType: "all",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await organizationService.getAllDepartments({ limit: 100 });
        const deptData = response.success ? response.data?.departments || response.data : response.data || [];
        setDepartments(Array.isArray(deptData) ? deptData : []);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  const tabs = [
    {
      id: "dashboard",
      label: "Reports Dashboard",
      icon: <BarChart3 size={16} />,
    },
    {
      id: "headcount",
      label: "Headcount Report",
      icon: <Users size={16} />,
    },
    {
      id: "attrition",
      label: "Attrition Report",
      icon: <TrendingDown size={16} />,
    },
    {
      id: "attendance",
      label: "Attendance Summary",
      icon: <Calendar size={16} />,
    },
    {
      id: "leave",
      label: "Leave Utilization",
      icon: <CalendarDays size={16} />,
    },
    {
      id: "leave-report",
      label: "Leave Report",
      icon: <FileText size={16} />,
    },
    {
      id: "missing-timesheets",
      label: "Missing Timesheets",
      icon: <FileText size={16} />,
    },
    {
      id: "performance",
      label: "Performance Report",
      icon: <TrendingDown size={16} />,
    },
    {
      id: "asset",
      label: "Asset Report",
      icon: <FileText size={16} />,
    },
    {
      id: "project",
      label: "Project Report",
      icon: <FileText size={16} />,
    },
    {
      id: "payroll",
      label: "Payroll Reports",
      icon: <FileText size={16} />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <ReportsDashboard
            onSelect={(tabId) => setActiveTab(tabId)}
          />
        );
      case "headcount":
        return <HeadcountReportTab globalFilters={globalFilters} />;
      case "attrition":
        return <AttritionReportTab globalFilters={globalFilters} />;
      case "attendance":
        return <AttendanceSummaryTab globalFilters={globalFilters} />;
      case "leave":
        return <LeaveUtilizationTab globalFilters={globalFilters} />;
      case "leave-report":
        return <LeaveReportTab globalFilters={globalFilters} />;
      case "missing-timesheets":
        return <MissingTimesheetsReportTab globalFilters={globalFilters} />;
      case "performance":
        return <PerformanceReportTab globalFilters={globalFilters} />;
      case "asset":
        return <AssetReportTab globalFilters={globalFilters} />;
      case "project":
        return <ProjectReportTab globalFilters={globalFilters} />;
      case "payroll":
        return <PayrollReportTab />;
      default:
        return <ReportsDashboard onSelect={(tabId) => setActiveTab(tabId)} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-3 sm:p-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Data-driven insights on headcount, attrition, attendance, and leave usage
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Global Filters
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              Start Date
            </label>
            <DatePickerField
              value={globalFilters.startDate}
              onChange={(value) => setGlobalFilters((prev) => ({ ...prev, startDate: value }))}
              className="w-full px-3 py-2 text-sm border-gray-200 rounded-sm focus:ring-1 focus:ring-brand-500"
              placeholder="Start date"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              End Date
            </label>
            <DatePickerField
              value={globalFilters.endDate}
              onChange={(value) => setGlobalFilters((prev) => ({ ...prev, endDate: value }))}
              className="w-full px-3 py-2 text-sm border-gray-200 rounded-sm focus:ring-1 focus:ring-brand-500"
              placeholder="End date"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              Department
            </label>
            <CustomDropdown
              value={globalFilters.departmentId}
              onChange={(value) => setGlobalFilters((prev) => ({ ...prev, departmentId: value }))}
              options={[
                { value: "all", label: "All Departments" },
                ...departments.map((dept) => ({ value: dept.id, label: dept.name })),
              ]}
              placeholder="All Departments"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              Location
            </label>
            <input
              type="text"
              value={globalFilters.location}
              onChange={(e) => setGlobalFilters((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="All locations"
              className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white h-10"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              Employment Type
            </label>
            <CustomDropdown
              value={globalFilters.employmentType}
              onChange={(value) => setGlobalFilters((prev) => ({ ...prev, employmentType: value }))}
              options={[
                { value: "all", label: "All Types" },
                { value: "FULL_TIME", label: "Full-time" },
                { value: "CONTRACT", label: "Contract" },
                { value: "INTERNSHIP", label: "Internship" },
              ]}
              placeholder="All Types"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-nowrap gap-1 -mb-px overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                  ? "border-brand-600 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                <div className={`p-1 rounded-sm ${activeTab === tab.id ? 'bg-brand-50 dark:bg-brand-900/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800'}`}>
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

function ReportsDashboard({ onSelect }) {
  const cards = [
    {
      id: "headcount",
      title: "Headcount Report",
      description: "Active workforce distribution and demographics.",
      icon: Users,
    },
    {
      id: "attrition",
      title: "Attrition Report",
      description: "Track exits, tenure trends, and reasons.",
      icon: TrendingDown,
    },
    {
      id: "attendance",
      title: "Attendance Summary",
      description: "Presence patterns, lateness, and WFH usage.",
      icon: Calendar,
    },
    {
      id: "leave",
      title: "Leave Utilization",
      description: "Leave usage by type, month, and department.",
      icon: CalendarDays,
    },
    {
      id: "leave-report",
      title: "Leave Report",
      description: "Employee-wise leave balances and usage.",
      icon: CalendarDays,
    },
    {
      id: "missing-timesheets",
      title: "Missing Timesheets",
      description: "Employees without timesheet submissions.",
      icon: FileText,
    },
    {
      id: "performance",
      title: "Performance Report",
      description: "Appraisal status and ratings overview.",
      icon: TrendingDown,
    },
    {
      id: "asset",
      title: "Asset Report",
      description: "Asset inventory and assignments.",
      icon: FileText,
    },
    {
      id: "project",
      title: "Project Report",
      description: "Project portfolio status summary.",
      icon: FileText,
    },
    {
      id: "payroll",
      title: "Payroll Reports",
      description: "Payroll files, summaries, and downloads.",
      icon: FileText,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            className="group text-left rounded-sm border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/30 transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
