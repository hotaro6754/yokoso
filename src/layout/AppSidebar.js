"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { getProfileImageUrl } from "@/utils/fileUrl";
import {
  LayoutDashboard, Users, Target, Grid, Building, Calendar, CalendarDays,
  GitBranch, Plug, FileCheck, Shield, CalendarCheck, Briefcase, UserPlus,
  BarChart3, FileBarChart, ShieldCheck, Wallet, TrendingUp, Banknote,
  Receipt, Box, FolderKanban, DollarSign, Clock, Bell, FileText,
  UserCircle, Settings, ChevronRight, X, LogOut, Building2, UserCheck, UserX, FileSignature,
  HelpCircle, CheckCircle2, BookOpen, Brain, PanelLeftOpen, PanelLeftClose,
  Laptop, Smartphone, Monitor, Wrench, History, Package, Award, Zap,
  ChevronLeft, ClipboardCheck, AlertTriangle, CalendarRange, RefreshCw, Gavel, Scale, ShieldAlert, Megaphone
} from "lucide-react";
import announcementService from "@/services/announcement.service";


// --- Navigation Data Definitions (Preserved) ---

const companyAdminNavItems = [
  { icon: <UserCircle size={20} />, name: "My Profile", path: "/profile" },
  { icon: <LayoutDashboard size={20} />, name: "Dashboard", path: "/company-admin/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Company Details", path: "/company-admin/company-orgranization?tab=company" },
      { name: "Locations / Branches", path: "/company-admin/organization/locations" },
      { name: "Departments", path: "/company-admin/company-orgranization?tab=departments" },
      { name: "Designations", path: "/company-admin/company-orgranization?tab=designations" },
      { name: "Reporting Hierarchy", path: "/company-admin/company-orgranization?tab=hierarchy" },
      { name: "Company Settings", path: "/company-admin/company-orgranization?tab=settings" },
      { name: "Subscription", path: "/company-admin/subscription" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Interview", path: "/my-interviews" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "User Management", path: "/company-admin/users" },
      { name: "Policy Management", path: "/company-admin/policy-rule" },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      {
        name: "Leave Management",
        subItems: [
          { name: "My Leaves", path: "/company-admin/leave/leave-history" },
          { name: "Leave Balance", path: "/company-admin/leave/leave-balance" },
          { name: "Leave Approvals", path: "/company-admin/leave/approvals" },
        ],
      },
      { name: "Project Management", path: "/projects" },
      { name: "My Timesheets", path: "/attendance/timesheets" },
      { name: "Team Timesheets", path: "/attendance/timesheets/team" },
      { name: "Timesheet Approvals", path: "/timesheet-approvals" },
      { name: "Roster", path: "/company-admin/shift-management" },
      { name: "Holidays", path: "/company-admin/leave/holidays" },
    ],
  },
  {
    icon: <Target size={20} />,
    name: "Performance Management",
    subItems: [
      { name: "Annual Appraisals", path: "/hr/performance/annual-appraisals" }, // New
      { name: "Probation Management", path: "/hr/performance/probation" },
      { name: "Appraisals", path: "/hr/performance-management/appraisals" },
      { name: "Quarterly Reviews", path: "/hr/performance/quarterly-reviews" },
      { name: "PIP Management", path: "/hr/performance/pip" },
      { name: "Appraisal Cycles", path: "/hr/performance/appraisal-cycles" },
      { name: "KPI Configuration", path: "/hr/performance/kpi-configuration" },
      { name: "KPI Assignment", path: "/hr/performance/kpi-assignment" },
      // { name: "Achievement Bands", path: "/hr/performance/achievement-bands" },
      { name: "Monitoring", path: "/hr/performance/monitoring" },
      { name: "9-Box Grid", path: "/hr/performance/nine-box-grid" },
      { name: "Performance Analytics", path: "/hr/performance/analytics" },
    ],
  },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/helpdesk" },
      { name: "Pulse Surveys", path: "/employee-pulse-surveys" },
      { name: "Announcements", path: "/announcements" },
      { name: "Grievance Management", path: "/hr/grievance-management" },
    ],
  },
  {
    icon: <Shield size={20} />,
    name: "Security & Audit Logs",
    path: "/company-admin/security-audit-logs",
  },
];

const hrNavItems = [
  {
    icon: <UserCircle size={20} />,
    name: "My Profile",
    path: "/profile",
  },
  { icon: <LayoutDashboard size={20} />, name: "HR Dashboard", path: "/hr/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Organization Structure", path: "/hr/organization-management" },
      { name: "Policy Management", path: "/hr/policy-rule" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Job Management", path: "/hr/jobs" },
      { name: "Interview", path: "/my-interviews" },
      { name: "Offer Management", path: "/hr/offers" },
      { name: "Candidate Management", path: "/hr/offers/candidates" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "Employee Master", path: "/hr/employees" },
      { name: "Employee Onboarding", path: "/hr/onboarding-exit" },
      { name: "Document Management", path: "/hr/document-management" },
      {
        name: "Separation Management",
        subItems: [
          { name: "Separation", path: "/hr/separation" },
          { name: "My Separation", path: "/my-separation" },
          { name: "Team Separation", path: "/team-separation" },
        ],
      },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      {
        name: "Leave Management",
        subItems: [
          { name: "My Leaves", path: "/hr/leave/leave-history" },
          { name: "Leave Balance", path: "/hr/leave/leave-balance" },
          { name: "Leave Approvals", path: "/hr/leave/approvals" },
          { name: "Leave Analytics", path: "/hr/leave" },
        ],
      },
      { name: "Project Management", path: "/projects" },
      {
        name: "Attendance Management",
        subItems: [
          { name: "Attendance", path: "/hr/attendance" },
          { name: "Biometric Management", path: "/hr/attendance?tab=biometric" },
          { name: "My Attendance", path: "/my-attendance" },
        ],
      },
      {
        name: "Timesheet Management",
        subItems: [
          { name: "My Timesheets", path: "/attendance/timesheets" },
          { name: "Team Timesheets", path: "/attendance/timesheets/team" },
          { name: "Timesheet Approvals", path: "/timesheet-approvals" },
        ],
      },
      { name: "Roster", path: "/hr/workforce" },
      { name: "Holidays", path: "/hr/leave/holidays" },
    ]
  },
  {
    icon: <Target size={20} />,
    name: "Performance Management",
    subItems: [
      { name: "Annual Appraisals", path: "/hr/performance/annual-appraisals" }, // New
      { name: "Probation Management", path: "/hr/performance/probation" },
      { name: "Appraisals", path: "/hr/performance-management/appraisals" },
      { name: "Quarterly Reviews", path: "/hr/performance/quarterly-reviews" },
      { name: "PIP Management", path: "/hr/performance/pip" },
      { name: "Appraisal Cycles", path: "/hr/performance/appraisal-cycles" },
      { name: "KPI Configuration", path: "/hr/performance/kpi-configuration" },
      { name: "KPI Assignment", path: "/hr/performance/kpi-assignment" },
      { name: "Achievement Bands", path: "/hr/performance/achievement-bands" },
      { name: "Monitoring", path: "/hr/performance/monitoring" },
      { name: "9-Box Grid", path: "/hr/performance/nine-box-grid" },
      { name: "Performance Analytics", path: "/hr/performance/analytics" },
    ],
  },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/helpdesk" },
      { name: "Pulse Surveys", path: "/employee-pulse-surveys" },
      { name: "Announcements", path: "/announcements" },
      { name: "Grievance Management", path: "/hr/grievance-management" },
    ],
  },
  {
    icon: <DollarSign size={20} />,
    name: "Payroll Management",
    subItems: [
      { name: "Payroll Overview", path: "/hr/payroll" },
      { name: "Payroll Approvals", path: "/payroll-compliance/payroll-processing" },
      { name: "Salary Revision Approval", path: "/payroll-compliance/salary-structure/revisions" },
      { name: "Payroll Reports", path: "/hr/payroll/reports" },
      { name: "Payslips", path: "/hr/payroll/payslips" },
      { name: "Investment Declaration", path: "/employee/investment-declaration" },
      { name: "Expense Management", path: "/expense-management/claims" },
      { name: "Reimbursement Management", path: "/hr/expense-reimbursement" },
    ],
  },
  {
    icon: <Box size={20} />,
    name: "Asset Management",
    subItems: [
      { name: "Asset Inventory", path: "/hr/assets" },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    name: "Talent Development",
    subItems: [
      { name: "Overall Employee Courses / Learning Data", path: "/hr/courses-certifications" },
      { name: "My Courses", path: "/hr/my-courses" },
      { name: "Learning", path: "/hr/learning" },
    ],
  },
  {
    icon: <BarChart3 size={20} />,
    name: "Analytics",
    subItems: [
      { name: "All Reports", path: "/hr/reports-analytics" },
    ],
  },
];

const masterAdminNavItems = [
  { icon: <LayoutDashboard size={20} />, name: "Dashboard", path: "/master-admin/dashboard" },
  { icon: <Users size={20} />, name: "CRM Lead", path: "/master-admin/crm-lead" },
  { icon: <CheckCircle2 size={20} />, name: "Customers", path: "/master-admin/customers" },
  { icon: <Building2 size={20} />, name: "Company", path: "/master-admin/company" },
  { icon: <Zap size={20} />, name: "Subscriptions", path: "/master-admin/subscriptions" },
  { icon: <UserCheck size={20} />, name: "Onboarding Flow", path: "/master-admin/onboarding-flow" },
  { icon: <Shield size={20} />, name: "Policy & Rule", path: "/master-admin/policy-rule" },
  { icon: <FileText size={20} />, name: "Audit Logs", path: "/master-admin/audit-logs" },
  { icon: <Package size={20} />, name: "Biometric Agent", path: "/master-admin/biometric-agent" },
];

const employeeNavItems = [
  { icon: <UserCircle size={20} />, name: "My Profile", path: "/profile" },
  { icon: <LayoutDashboard size={20} />, name: "Employee Dashboard", path: "/employee/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Organization Structure", path: "/employee/organization-structure" },
      { name: "Policy Management", path: "/employee/policy-rule" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Interview (Assigned Interview)", path: "/my-interviews" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "Separation Management", path: "/my-separation" },
      { name: "Probation", path: "/employee/performance/probation" },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      { name: "Attendance", path: "/my-attendance" },
      {
        name: "Leave Management",
        subItems: [
          { name: "My Leaves", path: "/employee/leave/leave-history" },
          { name: "Leave Balance", path: "/employee/leave/leave-balance" },
          { name: "Leave Approvals", path: "/employee/leave/approvals" },
        ],
      },
      { name: "Timesheets", path: "/attendance/timesheets" },
      { name: "Roster", path: "/employee/shift-management" },
      { name: "Holidays", path: "/employee/holiday" },
    ],
  },
  {
    icon: <Target size={20} />,
    name: "Performance Management",
    subItems: [
      { name: "Annual Appraisals", path: "/employee/performance/annual-appraisals" },
      { name: "My Quarterly Reviews", path: "/employee/performance/my-reviews" },
      { name: "Appraisal History", path: "/employee/performance/history" },
    ],
  },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/helpdesk" },
      { name: "Pulse Surveys", path: "/employee-pulse-surveys" },
      { name: "Announcements", path: "/announcements" },
      { name: "Grievance Management", path: "/employee/grievances" },
    ],
  },
  {
    icon: <DollarSign size={20} />,
    name: "Payroll Management",
    subItems: [
      { name: "Payslips", path: "/employee/payslips/pay-slips" },
      { name: "Investment Declaration", path: "/employee/investment-declaration" },
      { name: "Expense Management", path: "/expense-management/claims" },
      { name: "Reimbursement Management", path: "/employee/reimbursement" },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    name: "Talent Development",
    subItems: [
      { name: "Courses : Self", path: "/employee/courses" },
      { name: "Learning - Self", path: "/employee/learning" },
    ],
  },
];

const recruiterNavItems = [
  { icon: <UserCircle size={20} />, name: "My Profile", path: "/recruiter/profile" },
  { icon: <LayoutDashboard size={20} />, name: "Dashboard", path: "/recruiter/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Organization Structure", path: "/recruiter/organization-management" },
      { name: "Policy Management", path: "/recruiter/policy-rule" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Job Requisitions", path: "/recruiter/requisitions" },
      { name: "Job Posting", path: "/recruiter/job-postings" },
      { name: "Candidate Pipeline", path: "/recruiter/candidates" },
      { name: "Candidate Management", path: "/recruiter/candidates/list" },
      { name: "Interview", path: "/recruiter/interviews" },
      { name: "Offer Management", path: "/recruiter/offers" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "Employee Master", path: "/hr/employees" },
      { name: "Separation Management", path: "/hr/separation" },
      { name: "Probation", path: "/hr/probation-notice-period" },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      { name: "Attendance", path: "/my-attendance" },
      {
        name: "Leave Management",
        subItems: [
          { name: "My Leaves", path: "/recruiter/leave/leave-history" },
          { name: "Leave Balance", path: "/recruiter/leave/leave-balance" },
          { name: "Leave Approvals", path: "/recruiter/leave/approvals" },
        ],
      },
      { name: "Timesheets", path: "/attendance/timesheets" },
      { name: "Roster", path: "/hr/workforce" },
      { name: "Holidays", path: "/hr/leave/holidays" },
    ],
  },
  {
    icon: <Target size={20} />,
    name: "Performance Management",
    path: "/employee/performance/annual-appraisals",
  },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/helpdesk" },
      { name: "Pulse Surveys", path: "/employee-pulse-surveys" },
      { name: "Announcements", path: "/announcements" },
      { name: "Grievance Management", path: "/employee/grievances" },
    ],
  },
  {
    icon: <DollarSign size={20} />,
    name: "Payroll Management",
    subItems: [
      { name: "Payslips", path: "/employee/payslips/pay-slips" },
      { name: "Investment Declaration", path: "/employee/investment-declaration" },
      { name: "Expense Management", path: "/expense-management/claims" },
      { name: "Reimbursement Management", path: "/employee/reimbursement" },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    name: "Talent Development",
    subItems: [
      { name: "Courses : Self", path: "/employee/courses" },
      { name: "Learning - Self", path: "/employee/learning" },
    ],
  },
  {
    icon: <BarChart3 size={20} />,
    name: "Analytics",
    subItems: [
      { name: "Talent Acquisition Reports and Insights", path: "/recruiter/reports" },
    ],
  },
];

const deptHeadNavItems = [
  { icon: <UserCircle size={20} />, name: "My Profile", path: "/dept-head/profile" },
  { icon: <LayoutDashboard size={20} />, name: "Dashboard", path: "/dept-head/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Organization Structure", path: "/dept-head/organization-management" },
      { name: "Policy Management", path: "/dept-head/policy-rule" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Job Requisition", path: "/dept-head/job-requisitions" },
      { name: "Interview (Assigned Interview)", path: "/my-interviews" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "Employee Master", path: "/dept-head/employees" },
      {
        name: "Separation Management",
        subItems: [
          { name: "Self Separation", path: "/my-separation" },
          { name: "Team Separation", path: "/team-separation" },
        ],
      },
      { name: "Team Management", path: "/dept-head/team-management" },
      { name: "Probation & Confirmations", path: "/dept-head/probation-confirmations" },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      { name: "Attendance", path: "/dept-head/attendance" },
      { name: "Project Management", path: "/projects" },
      {
        name: "Leave Management",
        subItems: [
          { name: "My Leaves", path: "/dept-head/leave/leave-history" },
          { name: "Leave Balance", path: "/dept-head/leave/leave-balance" },
          { name: "Leave Approvals", path: "/dept-head/leave/approvals" },
        ],
      },
      { name: "Timesheets", path: "/dept-head/timesheets" },
      { name: "Roster", path: "/dept-head/roster" },
      { name: "Holidays", path: "/dept-head/holidays" },
    ],
  },
  { icon: <Target size={20} />, name: "Performance Management", path: "/dept-head/performance" },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/dept-head/helpdesk" },
      { name: "Pulse Surveys", path: "/employee-pulse-surveys" },
      { name: "Announcements", path: "/announcements" },
      { name: "Grievance Management", path: "/employee/grievances" },
    ],
  },
  {
    icon: <DollarSign size={20} />,
    name: "Payroll Management",
    subItems: [
      { name: "Payroll & Payslips", path: "/dept-head/payroll/payslips" },
      { name: "Investment Declaration", path: "/employee/investment-declaration" },
      { name: "Expense Management", path: "/dept-head/expense-management/claims" },
      { name: "Reimbursement Management", path: "/dept-head/reimbursement" },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    name: "Talent Development",
    subItems: [
      { name: "Courses - Self", path: "/dept-head/courses/self" },
      { name: "Courses - Team", path: "/dept-head/courses/team" },
      { name: "Learning - Self", path: "/dept-head/learning/self" },
      { name: "Learning - Team", path: "/dept-head/learning/team" },
    ],
  },
  {
    icon: <BarChart3 size={20} />,
    name: "Analytics",
    subItems: [
      { name: "Department Reports", path: "/dept-head/analytics/department-reports" },
    ],
  },
];

const financeAdminNavItems = [
  { icon: <UserCircle size={20} />, name: "My Profile", path: "/profile" },
  { icon: <LayoutDashboard size={20} />, name: "Dashboard", path: "/finance-role/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Organization Structure", path: "/finance-role/organization-management" },
      { name: "Policy Management", path: "/finance-role/policy-rule" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Interview", path: "/finance-role/my-interviews" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "Employee Master", path: "/finance-role/employees" },
      { name: "Separation Management", path: "/finance-role/separation" },
      { name: "Probation", path: "/finance-role/probation-notice-period" },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      {
        name: "Leave Management",
        subItems: [
          { name: "My Leaves", path: "/finance-role/leave/leave-history" },
          { name: "Leave Balance", path: "/finance-role/leave/leave-balance" },
          { name: "Leave Approvals", path: "/finance-role/leave/approvals" },
          { name: "Time Off", path: "/finance-role/leave" },
        ],
      },
      {
        name: "Attendance Management",
        subItems: [
          { name: "Attendance", path: "/finance-role/attendance" },
          { name: "My Attendance", path: "/finance-role/my-attendance" },
        ],
      },
      {
        name: "Timesheet Management",
        subItems: [
          { name: "My Timesheets", path: "/finance-role/attendance/timesheets" },
          { name: "Team Timesheets", path: "/finance-role/attendance/timesheets/team" },
          { name: "Timesheet Approvals", path: "/finance-role/timesheet-approvals" },
        ],
      },
      { name: "Roster", path: "/finance-role/workforce" },
      { name: "Holidays", path: "/finance-role/leave/holidays" },
    ],
  },
  {
    icon: <Target size={20} />,
    name: "Performance Management",
    path: "/finance-role/performance/annual-appraisals",
  },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/finance-role/helpdesk" },
      { name: "Pulse Surveys", path: "/finance-role/employee-pulse-surveys" },
      { name: "Announcements", path: "/finance-role/announcements" },
      { name: "Grievance Management", path: "/finance-role/grievance-management" },
    ],
  },
  {
    icon: <DollarSign size={20} />,
    name: "Payroll Management",
    subItems: [
      { name: "Account & Bank Export", path: "/finance-role/account-bank-export" },
      { name: "Payroll Approvals", path: "/payroll-compliance/payroll-processing" },
      { name: "Payroll Cost", path: "/finance-role/payroll-cost" },
      { name: "Finance Clearance", path: "/clearance" },
      { name: "Payslips", path: "/finance-role/payroll" },
      { name: "Investment Declaration", path: "/employee/investment-declaration" },
      { name: "Expense Management", path: "/finance-role/expense-management" },
      { name: "Reimbursement Management", path: "/finance-role/expense-reimbursement" },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    name: "Talent Development",
    subItems: [
      { name: "Courses: Self", path: "/finance-role/ld/courses" },
      { name: "Courses: Team", path: "/finance-role/ld/courses/team" },
      { name: "Learning: Self", path: "/finance-role/ld/progress/employee" },
      { name: "Learning: Team", path: "/finance-role/ld/progress/team" },
    ],
  },
  {
    icon: <BarChart3 size={20} />,
    name: "Analytics",
    subItems: [
      { name: "Payroll Reports and Insights", path: "/finance-role/reports" },
    ],
  },
];

const payrollComplianceNavItems = [
  { icon: <UserCircle size={20} />, name: "My Profile", path: "/profile" },
  { icon: <LayoutDashboard size={20} />, name: "Dashboard", path: "/payroll-compliance/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Organization Structure", path: "/payroll/organization-management" },
      { name: "Policy Management", path: "/payroll/policy-rule" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Interview (Assigned Interview)", path: "/my-interviews" },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      {
        name: "Leave Management",
        subItems: [
          { name: "My Leaves", path: "/payroll/leave/leave-history" },
          { name: "Leave Balance", path: "/payroll/leave/leave-balance" },
          { name: "Leave Approvals", path: "/payroll/leave/approvals" },
        ],
      },
      { name: "Employee Master", path: "/payroll/employees" },
      { name: "Separation Management", path: "/payroll/separation" },
      { name: "Probation", path: "/payroll/probation-notice-period" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "Attendance", path: "/payroll/attendance" },
      { name: "Time Off", path: "/payroll/leave" },
      { name: "Timesheets", path: "/attendance/timesheets" },
      { name: "Roster", path: "/payroll/shift-management" },
      { name: "Holidays", path: "/payroll/leave/holidays" },
    ],
  },
  { icon: <Target size={20} />, name: "Performance Management", path: "/payroll/performance-management" },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/helpdesk" },
      { name: "Pulse Surveys", path: "/employee-pulse-surveys" },
      { name: "Announcements", path: "/announcements" },
      { name: "Grievance Management", path: "/hr/grievance-management" },
    ],
  },
  {
    icon: <DollarSign size={20} />,
    name: "Payroll Management",
    subItems: [
      {
        name: "Payroll Compliance",
        subItems: [
          { name: "Salary Component", path: "/payroll-compliance/salary-component" },
          { name: "Salary Template", path: "/payroll-compliance/salary-template" },
          { name: "Salary Structure", path: "/payroll-compliance/salary-structure/ctc" },
          { name: "Tax Declarations", path: "/payroll-compliance/tax-declarations" },
          { name: "Payroll Processing", path: "/payroll-compliance/payroll-processing" },
          { name: "Salary Revision Approval", path: "/payroll-compliance/salary-structure/revisions" },
          { name: "Full & Final Settlement", path: "/payroll-compliance/full-final-settlement" },
          { name: "Payroll Automation", path: "/payroll-compliance/payroll-automation" },
          { name: "Payroll Reports", path: "/payroll-compliance/payroll-reports" },
        ],
      },
      { name: "Payroll & Payslips", path: "/payroll/payroll/payslips" },
      { name: "Investment Declaration", path: "/employee/investment-declaration" },
      { name: "Expense Management", path: "/expense-management/claims" },
      { name: "Reimbursement Management", path: "/payroll/expense-reimbursement" },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    name: "Talent Development",
    subItems: [
      { name: "Courses : Self", path: "/payroll/courses" },
      { name: "Learning - Self", path: "/payroll/learning" },
    ],
  },
  {
    icon: <BarChart3 size={20} />,
    name: "Analytics",
    subItems: [
      { name: "Payroll Reports and Insights", path: "/payroll/payroll-reports" },
    ],
  },
];

const managerNavItems = [
  { icon: <UserCircle size={20} />, name: "My Profile", path: "/profile" },
  { icon: <LayoutDashboard size={20} />, name: "Dashboard", path: "/manager/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Organization Structure", path: "/manager/organization-management" },
      { name: "Policy Management", path: "/company-admin/policy-rule" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Interview (Assigned Interview)", path: "/my-interviews" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "Employee Master", path: "/manager/employees" },
      {
        name: "Separation Management",
        subItems: [
          { name: "Self Separation", path: "/my-separation" },
          { name: "Team Separation", path: "/team-separation" },
        ],
      },
      { name: "Team Management", path: "/manager/my-team" },
      { name: "Probation & Confirmations", path: "/manager/probation-confirmations" },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      { name: "Attendance", path: "/manager/attendance-approvals" },
      { name: "Project Management", path: "/projects" },
      {
        name: "Leave Management",
        subItems: [
          { name: "My Leaves", path: "/manager/leave/leave-history" },
          { name: "Leave Balance", path: "/manager/leave/leave-balance" },
          { name: "Leave Approvals", path: "/manager/leave/approvals" },
        ],
      },
      { name: "My Timesheets", path: "/attendance/timesheets" },
      { name: "Team Timesheets", path: "/manager/timesheet-approvals" },
      { name: "Roster", path: "/manager/shift-management" },
      { name: "Holidays", path: "/manager/holiday" },
    ],
  },
  { icon: <Target size={20} />, name: "Performance Management", path: "/manager/performance-management" },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/helpdesk" },
      { name: "Pulse Surveys", path: "/employee-pulse-surveys" },
      { name: "Announcements", path: "/announcements" },
      { name: "Grievance Management", path: "/employee/grievances" },
    ],
  },
  {
    icon: <DollarSign size={20} />,
    name: "Payroll Management",
    subItems: [
      { name: "Payslips", path: "/manager/payroll-payslips" },
      { name: "Investment Declaration", path: "/employee/investment-declaration" },
      { name: "Expense Management", path: "/expense-management/claims" },
      { name: "Reimbursement Management", path: "/manager/reimbursement" },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    name: "Talent Development",
    subItems: [
      { name: "Courses (Self)", path: "/manager/courses" },
      { name: "Courses (Team)", path: "/manager/courses-team" },
      { name: "Learning (Self)", path: "/manager/learning" },
      { name: "Learning (Team)", path: "/manager/learning-team" },
    ],
  },
  {
    icon: <BarChart3 size={20} />,
    name: "Analytics",
    subItems: [
      { name: "Reports: Team Reports & Insights", path: "/manager/team-reports" },
    ],
  },
];

const itAdminNavItems = [
  { icon: <UserCircle size={20} />, name: "My Profile", path: "/profile" },
  { icon: <LayoutDashboard size={20} />, name: "Dashboard", path: "/it-admin/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Organization Structure", path: "/it-admin/organization-management" },
      { name: "Policy Management", path: "/it-admin/policy-rule" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Interview (Assigned Interview)", path: "/my-interviews" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "Employee Master", path: "/it-admin/employees" },
      { name: "Separation Management", path: "/it-admin/separation" },
      { name: "Probation", path: "/it-admin/probation-notice-period" },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      { name: "Attendance", path: "/it-admin/attendance" },
      { name: "Time Off", path: "/it-admin/leave/leave-history" },
      { name: "Timesheets", path: "/attendance/timesheets" },
      { name: "Roster", path: "/it-admin/roster" },
      { name: "Holidays", path: "/it-admin/holiday" },
    ],
  },
  { icon: <Target size={20} />, name: "Performance Management", path: "/it-admin/performance-management" },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/helpdesk" },
      { name: "Pulse Surveys", path: "/employee-pulse-surveys" },
      { name: "Announcements", path: "/announcements" },
      { name: "Grievance Management", path: "/employee/grievances" },
    ],
  },
  {
    icon: <DollarSign size={20} />,
    name: "Payroll Management",
    subItems: [
      { name: "Payroll & Payslips", path: "/it-admin/payroll/payslips" },
      { name: "Expense Management", path: "/expense-management/claims" },
      { name: "Reimbursement Management", path: "/it-admin/reimbursement" },
    ],
  },
  {
    icon: <Box size={20} />,
    name: "Asset Management",
    subItems: [
      { name: "Device Management", path: "/it-admin/devices" },
      { name: "Device Assignment", path: "/it-admin/assignments" },
      { name: "Device Returns", path: "/it-admin/returns" },
      { name: "Missing Assets", path: "/it-admin/missing-assets" },
      { name: "Maintenance Management", path: "/it-admin/maintenance" },
      { name: "Asset Clearance", path: "/clearance" },
      { name: "Device History", path: "/it-admin/history" },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    name: "Talent Development",
    subItems: [
      { name: "Courses : Self", path: "/it-admin/courses/self" },
      { name: "Courses : Team", path: "/it-admin/courses/team" },
      { name: "Learning : Self", path: "/it-admin/learning/self" },
      { name: "Learning : Team", path: "/it-admin/learning/team" },
    ],
  },
  {
    icon: <BarChart3 size={20} />,
    name: "Analytics",
    subItems: [
      { name: "Payroll Reports and Insights", path: "/it-admin/payroll-reports" },
    ],
  },
];

const ldManagerNavItems = [
  { icon: <UserCircle size={20} />, name: "My Profile", path: "/profile" },
  { icon: <LayoutDashboard size={20} />, name: "Dashboard", path: "/ld/dashboard" },
  {
    icon: <Building size={20} />,
    name: "Organization",
    subItems: [
      { name: "Organization Structure", path: "/recruiter/organization-management" },
      { name: "Policy Management", path: "/recruiter/policy-rule" },
    ],
  },
  {
    icon: <Award size={20} />,
    name: "Talent Growth",
    subItems: [
      { name: "Interview (Assigned Interview)", path: "/my-interviews" },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "The Workforce",
    subItems: [
      { name: "Employee Master", path: "/ld/employees" },
      { name: "Separation Management", path: "/hr/separation" },
      { name: "Probation", path: "/hr/probation-notice-period" },
    ],
  },
  {
    icon: <ClipboardCheck size={20} />,
    name: "People Operations",
    subItems: [
      { name: "Attendance", path: "/ld/attendance" },
      {
        name: "Leave Management",
        subItems: [
          { name: "My Leaves", path: "/ld/leave/leave-history" },
          { name: "Leave Balance", path: "/ld/leave/leave-balance" },
          { name: "Leave Approvals", path: "/ld/leave/approvals" },
        ],
      },
      { name: "Timesheets", path: "/ld/timesheets" },
      { name: "Roster", path: "/ld/roster" },
      { name: "Holidays", path: "/ld/leave/holidays" },
    ],
  },
  {
    icon: <Target size={20} />,
    name: "Performance Management",
    path: "/ld/performance-management",
  },
  {
    icon: <HelpCircle size={20} />,
    name: "Talent Care",
    subItems: [
      { name: "Helpdesk", path: "/ld/helpdesk" },
      { name: "Pulse Surveys", path: "/employee-pulse-surveys" },
      { name: "Announcements", path: "/announcements" },
      { name: "Grievance Management", path: "/employee/grievances" },
    ],
  },
  {
    icon: <DollarSign size={20} />,
    name: "Payroll Management",
    subItems: [
      { name: "Payroll & Payslips", path: "/ld/payroll/payslips" },
      { name: "Investment Declaration", path: "/employee/investment-declaration" },
      { name: "Expense Management", path: "/ld/expense-management/claims" },
      { name: "Reimbursement Management", path: "/ld/reimbursement" },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    name: "Talent Development",
    subItems: [
      { name: "Course Management", path: "/ld/courses" },
      { name: "Training Assignment", path: "/ld/training-assignments" },
      { name: "Training Status", path: "/ld/training-status" },
      { name: "Learning Progress", path: "/ld/progress/employee" },
      { name: "Skills & Competency", path: "/ld/skills" },
      { name: "Talent & Succession", path: "/ld/succession" },
    ],
  },
  {
    icon: <BarChart3 size={20} />,
    name: "Analytics",
    subItems: [
      { name: "Course Reports", path: "/ld/progress/course" },
      { name: "Skill Reports", path: "/ld/skills/employee" },
      { name: "Insights", path: "/ld/progress/employee" },
    ],
  },
];

const announcementNavItem = {
  icon: <Megaphone size={20} />,
  name: "Announcement",
  path: "/announcements",
  isAnnouncement: true
};

const isAnnouncementPath = (path) =>
  typeof path === "string" &&
  (path === "/announcements" || path.endsWith("/announcements"));

const navHasAnnouncement = (items = []) =>
  items.some(item => {
    if (isAnnouncementPath(item.path)) return true;
    if (item.subItems) return navHasAnnouncement(item.subItems);
    return false;
  });

// Add announcementNavItem to specific nav items arrays (excluding those handled manually)
[
  employeeNavItems,
  recruiterNavItems, deptHeadNavItems, financeAdminNavItems, payrollComplianceNavItems,
  managerNavItems, itAdminNavItems, ldManagerNavItems
].forEach(nav => {
  const hasAnnouncement = navHasAnnouncement(nav);
  if (!hasAnnouncement) {
    const helpdeskIndex = nav.findIndex(item => item.name === "Helpdesk" || item.path === "/helpdesk");
    if (helpdeskIndex !== -1) {
      nav.splice(helpdeskIndex + 1, 0, announcementNavItem);
    } else {
      const profileIndex = nav.findIndex(item => item.name === "My Profile" || item.path === "/profile" || item.path === "/it-admin/profile");
      if (profileIndex !== -1) {
        nav.splice(profileIndex, 0, announcementNavItem);
      } else {
        nav.push(announcementNavItem);
      }
    }
  }
});

// --- Component Start ---

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();

  // State for submenus
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState(null);
  const [openNestedKey, setOpenNestedKey] = useState(null);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!user?.id) return;
        const storageKey = `lastViewedAnnouncements_${user.id}`;
        const lastViewedAt = localStorage.getItem(storageKey);
        const response = await announcementService.getUnreadCount(lastViewedAt);
        setUnreadAnnouncements(response.count || 0);
      } catch (error) {
        console.info("Announcement count fetch failed - likely unauthenticated or network issue");
      }
    };

    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 2 * 60 * 1000); // Check every 2 mins

      const handleRead = () => setUnreadAnnouncements(0);
      window.addEventListener("announcementsRead", handleRead);

      return () => {
        clearInterval(interval);
        window.removeEventListener("announcementsRead", handleRead);
      };
    }
  }, [user]);

  // Determine user role
  const userRole = user?.systemRole || user?.role || 'EMPLOYEE';

  // Helper to resolve navigation items based on role
  const getNavItems = () => {
    switch (userRole) {
      case "MASTER_ADMIN": return masterAdminNavItems;
      case "SUPER_ADMIN":
      case "COMPANY_ADMIN":
      case "COMPANY_OWNER": return companyAdminNavItems;
      case "HR_ADMIN": return hrNavItems;
      case "PAYROLL_ADMIN": return payrollComplianceNavItems;
      case "FINANCE_ADMIN": return financeAdminNavItems;
      case "MANAGER": return managerNavItems;
      case "L_AND_D_MANAGER": return ldManagerNavItems;
      case "RECRUITER": return recruiterNavItems;
      case "IT_ADMIN": return itAdminNavItems;
      case "DEPARTMENT_HEAD":
      case "DEPT-HEAD":
      case "DEPT_HEAD": return deptHeadNavItems;
      default: return employeeNavItems;
    }
  };

  const mapPayrollPaths = (items) => items.map((item) => {
    const mapped = { ...item };
    if (mapped.path) {
      let nextPath = mapped.path;
      if (nextPath.startsWith("/payroll-compliance")) {
        mapped.path = nextPath;
        return mapped;
      }
      if (nextPath.startsWith("/hr/")) {
        nextPath = nextPath.replace(/^\/hr\//, "/payroll/");
      }
      if (!nextPath.startsWith("/payroll/")) {
        nextPath = `/payroll${nextPath.startsWith("/") ? "" : "/"}${nextPath}`;
      }
      mapped.path = nextPath;
    }
    if (mapped.subItems) {
      mapped.subItems = mapPayrollPaths(mapped.subItems);
    }
    return mapped;
  });

  const getFilteredNavItems = (items) => {
    const taxRegime = user?.employee?.taxRegime || 'NEW';
    if (taxRegime === 'NEW') {
      return items.map(item => {
        if (item.name === "Payroll Management" && item.subItems) {
          return {
            ...item,
            subItems: item.subItems.filter(sub => sub.name !== "Investment Declaration")
          };
        }
        return item;
      });
    }
    return items;
  };

  const rawNavItems = getNavItems();
  const filteredNavItems = getFilteredNavItems(rawNavItems);
  const navItems = userRole === "PAYROLL_ADMIN" ? mapPayrollPaths(filteredNavItems) : filteredNavItems;

  // Check if a nav item is active (including sub-items)
  const isActive = useCallback((path) => pathname === path, [pathname]);
  const isParentActive = useCallback((nav) => {
    if (nav.path && isActive(nav.path)) return true;
    if (nav.subItems) {
      return nav.subItems.some(sub => {
        if (isActive(sub.path)) return true;
        if (sub.subItems) {
          return sub.subItems.some(nested => isActive(nested.path));
        }
        return false;
      });
    }
    return false;
  }, [isActive]);

  // Handle submenu interactions
  const handleSubmenuClick = (index) => {
    // If sidebar is collapsed, clicking a submenu parent should expand the sidebar first
    if (!isExpanded && !isMobileOpen) {
      toggleSidebar();
      setOpenSubmenuIndex(index);
    } else {
      setOpenSubmenuIndex(prev => prev === index ? null : index);
    }
  };

  const handleNestedToggle = (key) => {
    setOpenNestedKey(prev => (prev === key ? null : key));
  };

  // Auto-expand submenu if a child is active on load
  useEffect(() => {
    if (isExpanded) {
      const activeIndex = navItems.findIndex(nav => isParentActive(nav));
      if (activeIndex !== -1 && navItems[activeIndex].subItems) {
        setOpenSubmenuIndex(activeIndex);
      }
    }
  }, [pathname, isExpanded]); // Run when path changes or sidebar expands

  // Profile Image Logic
  const profileImageUrl = getProfileImageUrl(
    user?.employee?.profileImage || user?.profileImage || "",
    ""
  );

  // Role Label formatting
  const getRoleLabel = () => {
    return userRole.replace(/_/g, " ").replace("ADMIN", "Admin").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#050510]/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-[#0A0A0A] border-r border-gray-200 dark:border-white/10 z-50 transition-all duration-300 ease-[0.16,1,0.3,1] flex flex-col
          ${isExpanded ? "w-[280px]" : "w-[80px]"}
          ${isMobileOpen ? "translate-x-0 w-[280px]" : "lg:translate-x-0 -translate-x-full"}
        `}
      >
        {/* Toggle Button (Desktop Only) - Placed on the border */}
        <button
          onClick={toggleSidebar}
          className={`absolute -right-3 top-6 z-50 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:scale-110 hover:shadow-md dark:border-white/20 dark:bg-[#111] dark:text-gray-400 dark:hover:bg-[#222] dark:hover:text-white
            ${!isExpanded ? "rotate-180" : ""}
          `}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Header (Logo) */}
        <div className={`flex h-16 items-center border-b border-gray-200/50 dark:border-white/10 px-4 transition-all duration-300 ${isExpanded ? "justify-between" : "justify-center"}`}>
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            {/* Logo Icon */}
            <div className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-brand-500/10 border border-brand-500/20 group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tighter">Z</span>
            </div>

            {/* Text (Hidden when collapsed) */}
            <div className={`flex flex-col transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 w-0 hidden"}`}>
              <span className="font-display text-lg font-bold text-gray-900 dark:text-white leading-none tracking-tight">
                Zodeck<span className="text-brand-400">.</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mt-0.5 opacity-80">
                {getRoleLabel()}
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 custom-scrollbar">
          <ul className="space-y-1.5">
            {navItems.map((item, index) => {
              const active = isParentActive(item);
              const isOpen = openSubmenuIndex === index;

              return (
                <li key={index}>
                  {item.subItems ? (
                    /* Collapsible Menu Item */
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleSubmenuClick(index)}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200
                          ${active
                            ? "bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-white shadow-sm dark:shadow-[inset_2px_0_0_0_#818CF8]"
                            : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"}
                          ${!isExpanded && !isMobileOpen ? "justify-center px-2" : ""}
                        `}
                      >
                        <span className={`shrink-0 transition-colors ${active ? "text-brand-600 dark:text-brand-400" : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400"}`}>
                          {item.icon}
                        </span>

                        {(isExpanded || isMobileOpen) && (
                          <>
                            <span className="flex-1 text-left tracking-tight">{item.name}</span>
                            <ChevronRight
                              size={14}
                              className={`transition-transform duration-200 opacity-60 ${isOpen ? "rotate-90" : ""}`}
                            />
                          </>
                        )}
                      </button>

                      {/* Submenu List */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-[0.16,1,0.3,1] 
                          ${isOpen && (isExpanded || isMobileOpen) ? "max-h-[500px] opacity-100 mt-1.5" : "max-h-0 opacity-0"}
                        `}
                      >
                        <ul className="ml-4 space-y-1 border-l border-gray-200 pl-2.5 dark:border-white/10">
                          {item.subItems.map((sub, subIdx) => {
                            const isSubActive = isActive(sub.path);
                            const nestedKey = `${index}-${subIdx}`;
                            const hasNested = Array.isArray(sub.subItems) && sub.subItems.length > 0;
                            const isNestedOpen = openNestedKey === nestedKey;
                            const isNestedActive = hasNested
                              ? sub.subItems.some(nested => isActive(nested.path))
                              : false;
                            return (
                              <li key={subIdx}>
                                {hasNested ? (
                                  <>
                                    <button
                                      onClick={() => handleNestedToggle(nestedKey)}
                                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors duration-200
                                        ${(isSubActive || isNestedActive)
                                          ? "text-gray-900 font-semibold bg-gray-50 dark:text-white dark:bg-white/5"
                                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"}
                                      `}
                                    >
                                      <span className="text-left tracking-tight">{sub.name}</span>
                                      <ChevronRight
                                        size={14}
                                        className={`transition-transform duration-200 opacity-60 ${isNestedOpen ? "rotate-90" : ""}`}
                                      />
                                    </button>
                                    <div
                                      className={`overflow-hidden transition-all duration-300 ease-[0.16,1,0.3,1] 
                                        ${isNestedOpen ? "max-h-[400px] opacity-100 mt-1" : "max-h-0 opacity-0"}
                                      `}
                                    >
                                      <ul className="ml-3 space-y-1 border-l border-gray-200 pl-2.5 dark:border-white/10">
                                        {sub.subItems.map((nested, nestedIdx) => {
                                          const isNestedItemActive = isActive(nested.path);
                                          return (
                                            <li key={nestedIdx}>
                                              <Link
                                                href={nested.path}
                                                className={`block rounded-lg px-3 py-1.5 text-[13px] transition-colors duration-200
                                                  ${isNestedItemActive
                                                    ? "text-gray-900 font-semibold dark:text-white"
                                                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"}
                                                `}
                                              >
                                                {nested.name}
                                              </Link>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  </>
                                ) : (
                                  <Link
                                    href={sub.path}
                                    className={`block rounded-lg px-3 py-2 text-[13px] transition-colors duration-200
                                      ${isSubActive
                                        ? "text-gray-900 font-semibold bg-gray-50 dark:text-white dark:bg-white/5"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"}
                                    `}
                                  >
                                    {sub.name}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    /* Direct Link Item */
                    <Link
                      href={item.path}
                      onClick={() => isMobileOpen && toggleMobileSidebar()}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200
                        ${active
                          ? "bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-white shadow-sm dark:shadow-[inset_2px_0_0_0_#818CF8]"
                          : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"}
                        ${!isExpanded && !isMobileOpen ? "justify-center px-2" : ""}
                      `}
                    >
                      <span className={`shrink-0 transition-colors ${active ? "text-brand-600 dark:text-brand-400" : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400"} relative`}>
                        {item.icon}
                        {item.isAnnouncement && unreadAnnouncements > 0 && !(userRole === "HR_ADMIN" || userRole === "COMPANY_ADMIN" || userRole === "COMPANY_OWNER" || userRole === "MASTER_ADMIN" || userRole === "SUPER_ADMIN") && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center bg-brand-500 text-white text-[10px] font-bold rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] border border-[#0A0A0A]">
                            {unreadAnnouncements}
                          </span>
                        )}
                      </span>

                      {(isExpanded || isMobileOpen) && (
                        <span className="tracking-tight">{item.name}</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer (Profile) - Redesigned as a floating premium card */}
        <div className="p-3">
          <div className={`rounded-xl border border-gray-200/50 bg-gray-50/50 p-2 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md transition-all ${!isExpanded ? "justify-center flex" : "flex items-center gap-3"}`}>
            {/* Profile Pic / Avatar */}
            <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-white border border-gray-200 p-0.5 shadow-sm dark:bg-[#111] dark:border-white/10 ${!isExpanded ? "h-10 w-10" : "h-10 w-10"}`}>
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="User" className="h-full w-full rounded-md object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-md bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 font-bold">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
              )}
            </div>

            {/* User Info (Hidden when collapsed) */}
            {isExpanded && (
              <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                <span className="truncate text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="truncate text-[11px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                  {user?.email}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            {isExpanded && (
              <button
                onClick={logout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>

          {/* Logout button for Collapsed State */}
          {!isExpanded && (
            <button
              onClick={logout}
              className="mt-2 flex w-full items-center justify-center rounded-xl p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;





