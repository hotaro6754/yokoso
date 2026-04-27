"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  CalendarX2,
  ClipboardList,
  FileText,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  Award,
  DollarSign
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import StatsCard from "./components/StatsCard";
import AttendanceOverview from "./components/AttendanceOverview";
import JobApplicants from "./components/JobApplicants";
import Schedules from "./components/Schedules";
import Birthdays from "./components/Birthdays";
import { dashboardService } from "@/services/hr-services/dashboard.service";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { reportsAnalyticsService } from "@/services/hr-services/reports-analytics.service";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import DashboardPunchWidget from "@/components/dashboard/DashboardPunchWidget";
import DepartmentLeaveStats from "./components/DepartmentLeaveStats";
import DepartmentPerformanceChart from "@/components/dashboard/DepartmentPerformanceChart";

const InsightCard = ({ title, subtitle, items, cta, className = "" }) => (
  <div className={`rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          {cta.label}
        </Link>
      )}
    </div>
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
          </div>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const EmploymentTypeDistribution = ({ data = [] }) => {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const hasData = total > 0;

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <Users size={16} className="text-gray-400" />
        Employment Type
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center">
        {!hasData ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">No employment type data.</div>
        ) : (
          <>
            <div className="w-[160px] h-[160px] relative mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">Total</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2">
              {data.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[60px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const LocationHeadcount = ({ data = [] }) => {
  const hasData = data.some(item => (item.value || 0) > 0);

  return (
    <div className="break-inside-avoid mb-6 h-[400px]">
      <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Users size={16} className="text-gray-400" />
          Headcount by Location
        </h3>

        <div className="flex-1 w-full min-h-0">
          {!hasData ? (
            <div className="text-xs text-gray-500 dark:text-gray-400">No location data.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  width={80}
                />
                <RechartsTooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};



export default function HrDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [headcountReport, setHeadcountReport] = useState(null);
  const [recruitmentData, setRecruitmentData] = useState({
    openings: [],
    applicants: [],
    schedules: []
  });
  const [recruitmentLoading, setRecruitmentLoading] = useState(true);
  const [error, setError] = useState("");

  const pendingPayrollStats = dashboardData?.payrollApprovals || { totalPending: 0 };

  // Get current year for dynamic options
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const unwrapPayload = (payload) => {
    if (!payload) return payload;
    return payload.data !== undefined ? payload.data : payload;
  };

  const unwrapList = (payload) => {
    const unwrapped = unwrapPayload(payload);
    if (Array.isArray(unwrapped)) return unwrapped;
    if (Array.isArray(unwrapped?.data)) return unwrapped.data;
    return [];
  };

  const formatEmploymentType = (value) => {
    if (!value) return "Not Specified";
    const label = String(value).replace(/_/g, " ").toLowerCase();
    return label.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatScheduleDate = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "Date TBD";
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatScheduleTime = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "Time TBD";
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await dashboardService.getCompleteDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err?.message || "Unable to load HR dashboard");
    }
  }, []);

  const fetchHeadcountReport = useCallback(async () => {
    try {
      const report = await reportsAnalyticsService.getHeadcountReport();
      setHeadcountReport(unwrapPayload(report));
    } catch (err) {
      console.error("Error fetching headcount report:", err);
    }
  }, []);

  const fetchPerformanceData = useCallback(async () => {
    try {
      const [cyclesData, nineBoxData] = await Promise.all([
        performanceManagementService.getAppraisalCycles(),
        performanceManagementService.getNineBoxGridData()
      ]);

      setPerformanceData({
        cycles: cyclesData,
        nineBox: nineBoxData
      });
    } catch (err) {
      console.error("Error fetching performance data:", err);
    }
  }, []);

  const fetchRecruitmentData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        recruiterService.getAllJobPostings({ limit: 6 }),
        recruiterService.getAllCandidates({ limit: 6 }),
        recruiterService.getUpcomingInterviews({ limit: 4 })
      ]);

      const jobPostings = results[0].status === "fulfilled" ? unwrapList(results[0].value) : [];
      const candidates = results[1].status === "fulfilled" ? unwrapList(results[1].value) : [];
      const interviews = results[2].status === "fulfilled" ? unwrapList(results[2].value) : [];

      const openings = jobPostings.map((job) => ({
        id: job.id,
        title: job.jobTitle || job.title,
        openings: job.openings ?? job.openPositions ?? 0,
        location: job.location,
        employmentType: job.employmentType,
        status: job.status,
        logo: job.logo || job.companyLogo || null
      }));

      const applicants = candidates.map((candidate) => ({
        id: candidate.id,
        name: candidate.name || candidate.fullName,
        avatar: candidate.photoUrl || candidate.profileImage || candidate.avatar,
        experience: candidate.totalExperience ?? candidate.relevantExperience,
        location: candidate.location || candidate.currentLocation || candidate.city,
        position: candidate.jobTitle || candidate.position,
      }));

      const schedules = interviews.map((interview) => {
        const scheduledAt = interview.scheduledAt || (interview.date ? `${interview.date}T${interview.time || "00:00"}` : null);
        const interviewerNames = String(interview.interviewer || "")
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);
        const participants = interviewerNames.slice(0, 5).map((name) => ({ name }));
        return {
          id: interview.id,
          position: interview.jobTitle || "Interview",
          title: interview.jobTitle ? `Interview Candidates - ${interview.jobTitle}` : "Interview Candidates",
          date: formatScheduleDate(scheduledAt),
          time: formatScheduleTime(scheduledAt),
          participants,
          additionalParticipants: Math.max(interviewerNames.length - participants.length, 0),
          meetingLink: interview.meetingLink || null
        };
      });

      setRecruitmentData({ openings, applicants, schedules });
    } catch (err) {
      console.error("Error fetching recruitment data:", err);
    } finally {
      setRecruitmentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchPerformanceData();
    fetchHeadcountReport();
    fetchRecruitmentData();
  }, [fetchDashboard, fetchPerformanceData, fetchHeadcountReport, fetchRecruitmentData]);

  const headcountSummary = dashboardData?.headcountSummary;
  const attendanceSnapshot = dashboardData?.attendanceSnapshot;
  const leaveManagement = dashboardData?.leaveManagement;
  const onboardingExitStatus = dashboardData?.onboardingExitStatus;
  const documentCompliance = dashboardData?.documentCompliance;
  const leaveDistribution = dashboardData?.leaveDistribution;
  const departmentPerformance = dashboardData?.departmentPerformance || [];
  const payrollApprovals = dashboardData?.payrollApprovals || {};
  const headcountReportData = headcountReport?.summary ? headcountReport : headcountReport?.data ?? headcountReport;

  const employmentTypeData = useMemo(() => {
    const entries = headcountReportData?.summary?.byEmploymentType || headcountReportData?.byEmploymentType || [];
    const palette = ["#070C8A", "#F59E0B", "#10B981", "#6366F1", "#3B82F6", "#8B5CF6"];
    return entries.map((entry, index) => ({
      name: formatEmploymentType(entry.type || entry.employmentType || entry.label),
      value: entry.count ?? entry.value ?? 0,
      color: palette[index % palette.length]
    }));
  }, [headcountReportData]);

  const locationHeadcountData = useMemo(() => {
    const entries = headcountReportData?.summary?.byLocation || headcountReportData?.byLocation || [];
    const palette = ["#3B82F6", "#10B981", "#F59E0B", "#6366F1", "#8B5CF6", "#EF4444"];
    return entries
      .map((entry, index) => ({
        name: entry.location || entry.name || "Unassigned",
        value: entry.count ?? entry.value ?? 0,
        color: palette[index % palette.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [headcountReportData]);

  // Calculate performance metrics from dynamic data
  const cyclesData = Array.isArray(performanceData?.cycles?.data) ? performanceData.cycles.data :
    Array.isArray(performanceData?.cycles) ? performanceData.cycles : [];

  const activeCycles = cyclesData.filter(cycle => cycle.status === 'ACTIVE');

  // Handle new response structure { gridData: [], unassignedEmployees: [] }
  const nineBoxResponse = performanceData?.nineBox || {};
  let nineBoxData = [];

  if (Array.isArray(nineBoxResponse.gridData)) {
    nineBoxData = nineBoxResponse.gridData;
  } else if (nineBoxResponse.data && Array.isArray(nineBoxResponse.data.gridData)) {
    nineBoxData = nineBoxResponse.data.gridData;
  } else if (Array.isArray(nineBoxResponse.data)) {
    nineBoxData = nineBoxResponse.data;
  } else if (Array.isArray(nineBoxResponse)) {
    nineBoxData = nineBoxResponse;
  }

  // Filter out employees without valid performance data or box position
  const validEmployees = nineBoxData.filter(emp =>
    emp && (
      (typeof emp.performanceScore === 'number' && emp.performanceScore > 0) ||
      (emp.boxPosition && emp.boxPosition.row)
    )
  );

  const totalEmployees = validEmployees.length || 0;
  const avgPerformanceScore = totalEmployees > 0
    ? (validEmployees.reduce((sum, emp) => sum + emp.performanceScore, 0) / totalEmployees).toFixed(1)
    : 0;
  const highPerformers = validEmployees.filter(emp => emp.performanceScore >= 4.0)?.length || 0;

  // Calculate completion rate based on employees with performance data vs total employees
  const totalSystemEmployees = headcountSummary?.totalEmployees || 0;
  const completionRate = totalSystemEmployees > 0
    ? Math.round((totalEmployees / totalSystemEmployees) * 100)
    : 0;

  const kpiCards = useMemo(
    () => [
      {
        title: "Total Employees",
        value: headcountSummary?.totalEmployees ?? 0,
        comparison: "Updated",
        trend: "up",
        icon: <Users className="h-6 w-6 text-white" />,
        iconBgColor: "bg-brand-500",
        href: "/hr/employees",
      },
      {
        title: "Active Employees",
        value: headcountSummary?.activeEmployees ?? 0,
        comparison: "Updated",
        trend: "up",
        icon: <UserCheck className="h-6 w-6 text-white" />,
        iconBgColor: "bg-emerald-500",
        href: "/hr/employees",
      },
      {
        title: "New Joiners (Month)",
        value: headcountSummary?.newJoiners ?? 0,
        comparison: "Updated",
        trend: "up",
        icon: <UserPlus className="h-6 w-6 text-white" />,
        iconBgColor: "bg-indigo-500",
        href: "/hr/onboarding-exit",
      },
      {
        title: "Exits (Month)",
        value: headcountSummary?.exits ?? 0,
        comparison: "Updated",
        trend: "down",
        icon: <UserX className="h-6 w-6 text-white" />,
        iconBgColor: "bg-rose-500",
        href: "/hr/onboarding-exit",
      },
      {
        title: "Present Today",
        value: attendanceSnapshot?.presentToday ?? 0,
        comparison: "Updated",
        trend: "up",
        icon: <CalendarCheck2 className="h-6 w-6 text-white" />,
        iconBgColor: "bg-emerald-500",
        href: "/hr/attendance",
      },
      {
        title: "Absent Today",
        value: attendanceSnapshot?.absentToday ?? 0,
        comparison: "Updated",
        trend: "down",
        icon: <CalendarX2 className="h-6 w-6 text-white" />,
        iconBgColor: "bg-rose-500",
        href: "/hr/attendance",
      },
      {
        title: "Pending Leave Approvals",
        value: leaveManagement?.pendingLeaveApprovals ?? 0,
        comparison: "Updated",
        trend: "up",
        icon: <ClipboardList className="h-6 w-6 text-white" />,
        iconBgColor: "bg-amber-500",
        href: "/hr/leave/requests",
      },
      {
        title: "Missing Documents",
        value: documentCompliance?.missingDocumentsCount ?? 0,
        comparison: "Updated",
        trend: "down",
        icon: <FileText className="h-6 w-6 text-white" />,
        iconBgColor: "bg-slate-600",
        href: "/hr/document-management",
      },
      {
        title: "Payroll Approvals (Pending)",
        value: pendingPayrollStats?.totalPending ?? 0,
        comparison: "Updated",
        trend: "up",
        icon: <DollarSign className="h-6 w-6 text-white" />,
        iconBgColor: "bg-brand-600",
        href: "/payroll-compliance/payroll-processing",
      },
      {
        title: "Active Appraisals",
        value: activeCycles.length,
        comparison: "Updated",
        trend: "up",
        icon: <Target className="h-6 w-6 text-white" />,
        iconBgColor: "bg-purple-600",
        href: "/hr/performance/monitoring",
      },
      {
        title: "Avg Performance Score",
        value: avgPerformanceScore,
        comparison: "Updated",
        trend: "up",
        icon: <TrendingUp className="h-6 w-6 text-white" />,
        iconBgColor: "bg-teal-600",
        href: "/hr/performance/analytics",
      },
      {
        title: "High Performers",
        value: highPerformers,
        comparison: "Updated",
        trend: "up",
        icon: <Award className="h-6 w-6 text-white" />,
        iconBgColor: "bg-emerald-600",
        href: "/hr/performance/high-performers",
      },
    ],
    [
      attendanceSnapshot?.absentToday,
      attendanceSnapshot?.presentToday,
      documentCompliance?.missingDocumentsCount,
      headcountSummary?.activeEmployees,
      headcountSummary?.exits,
      headcountSummary?.newJoiners,
      headcountSummary?.totalEmployees,
      leaveManagement?.pendingLeaveApprovals,
      pendingPayrollStats?.totalPending,
      activeCycles.length,
      avgPerformanceScore,
      highPerformers,
    ],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        {error ? (
          <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        {/* Debug Info - Temporary - Removed */}

        <div className="mb-6 flex flex-col gap-4">
          <Breadcrumb items={[{ label: "HR Dashboard", href: "/hr/dashboard" }]} />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                HR Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Real-time visibility into workforce health, approvals, and exceptions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <Link
                  href="/hr/employees/add"
                  className="rounded-sm bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 whitespace-nowrap"
                >
                  Add Employee
                </Link>
                <Link
                  href="/hr/leave/requests"
                  className="rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 whitespace-nowrap"
                >
                  Review Leave Requests
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <DashboardPunchWidget onPunchSuccess={fetchDashboard} />
        </div>


        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">

          <div className="break-inside-avoid mb-6">
            <AttendanceOverview
              snapshot={attendanceSnapshot}
              absentees={attendanceSnapshot?.absentees || attendanceSnapshot?.absentEmployees || []}
            />
          </div>
          <div className="break-inside-avoid mb-6">
            <EmploymentTypeDistribution data={employmentTypeData} />
          </div>
          <LocationHeadcount data={locationHeadcountData} />
          <div className="break-inside-avoid mb-6">
            <DepartmentLeaveStats data={leaveDistribution} />
          </div>

          <div className="break-inside-avoid mb-6">
            <InsightCard
              title="Onboarding & Exit Status"
              subtitle="Track lifecycle cases needing attention"
              cta={{ label: "View flow", href: "/hr/onboarding-exit" }}
              className="h-full"
              items={[
                { label: "Pending onboarding cases", value: onboardingExitStatus?.pendingOnboardingCases ?? 0, dot: "bg-amber-400" },
                { label: "Employees in notice period", value: onboardingExitStatus?.employeesInNoticePeriod ?? 0, dot: "bg-slate-400" },
                { label: "Pending exit clearances", value: onboardingExitStatus?.pendingExitTasks ?? 0, dot: "bg-rose-400" },
              ]}
            />
          </div>
          <div className="break-inside-avoid mb-6">
            <InsightCard
              title="Document Compliance"
              subtitle="Missing or expiring documents"
              cta={{ label: "Manage docs", href: "/hr/document-management" }}
              className="h-full"
              items={[
                { label: "Missing documents", value: documentCompliance?.missingDocumentsCount ?? 0, dot: "bg-rose-400" },
                { label: "Expired documents", value: documentCompliance?.expiredDocumentsCount ?? 0, dot: "bg-amber-400" },
                { label: "Expiring in 30 days", value: "N/A", dot: "bg-sky-400" },
              ]}
            />
          </div>
          <div className="break-inside-avoid mb-6">
            <JobApplicants
              openings={recruitmentData.openings}
              applicants={recruitmentData.applicants}
              loading={recruitmentLoading}
            />
          </div>
          <div className="break-inside-avoid mb-6">
            <Schedules schedules={recruitmentData.schedules} loading={recruitmentLoading} />
          </div>
          <div className="break-inside-avoid mb-6">
            <Birthdays />
          </div>
          <div className="break-inside-avoid mb-6">
            <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Performance Insights
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Organization-wide performance metrics
                  </p>
                </div>
                <Link
                  href="/hr/performance-management/appraisals"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  View All Appraisals
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Active Appraisal Cycle", value: activeCycles[0]?.name || "None", tone: "bg-purple-50 text-purple-700" },
                  { label: "Completion Rate", value: `${completionRate}%`, tone: "bg-teal-50 text-teal-700" },
                  { label: "Average Score", value: avgPerformanceScore ? `${avgPerformanceScore}/5.0` : "N/A", tone: "bg-emerald-50 text-emerald-700" },
                  { label: "High Performers", value: `${highPerformers} employees`, tone: "bg-amber-50 text-amber-700" },
                  { label: "Needs Improvement", value: `${validEmployees.filter(emp => emp.performanceScore < 3.0)?.length || 0} employees`, tone: "bg-rose-50 text-rose-700" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-xs font-semibold ${item.tone}`}
                  >
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  Performance cycles: {activeCycles.length} active, {cyclesData.filter(cycle => cycle.status === 'COMPLETED')?.length || 0} completed this year
                </div>
              </div>
            </div>
          </div>

          <div className="break-inside-avoid mb-6">
            <Link
              href="/hr/performance-management/appraisals"
              className="block rounded-sm border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-950"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Manage</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Employee Appraisals
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                View and manage all employee performance appraisals across the organization
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activeCycles.length} active cycles
                </span>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  View all →
                </span>
              </div>
            </Link>
          </div>

          <div className="break-inside-avoid mb-6">
            <Link
              href="/hr/performance/analytics"
              className="block rounded-sm border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-950"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="p-2 bg-teal-50 rounded-lg dark:bg-teal-900/20">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">Analyze</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Performance Analytics
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Deep dive into performance metrics, trends, and insights
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {validEmployees.length} employees tracked
                </span>
                <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                  Analytics →
                </span>
              </div>
            </Link>
          </div>

          <div className="break-inside-avoid mb-6">
            <Link
              href="/hr/performance/monitoring"
              className="block rounded-sm border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-950"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg dark:bg-emerald-900/20">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Monitor</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Performance Monitoring
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Real-time monitoring of appraisal cycles and completion rates
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {completionRate}% completion rate
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Monitor →
                </span>
              </div>
            </Link>
          </div>

          <div className="break-inside-avoid mb-6">
            <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Performance Distribution
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Employee performance bands breakdown
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option>Q4 {previousYear}</option>
                    <option>Q3 {previousYear}</option>
                    <option>Q2 {previousYear}</option>
                    <option>Q1 {currentYear}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {(() => {
                  const distribution = {
                    "Outstanding (4.5-5.0)": validEmployees.filter(emp => emp.performanceScore >= 4.5).length,
                    "Exceeds (4.0-4.4)": validEmployees.filter(emp => emp.performanceScore >= 4.0 && emp.performanceScore < 4.5).length,
                    "Meets (3.5-3.9)": validEmployees.filter(emp => emp.performanceScore >= 3.5 && emp.performanceScore < 4.0).length,
                    "Needs Improvement (3.0-3.4)": validEmployees.filter(emp => emp.performanceScore >= 3.0 && emp.performanceScore < 3.5).length,
                    "Unsatisfactory (<3.0)": validEmployees.filter(emp => emp.performanceScore < 3.0).length,
                  };

                  const total = validEmployees.length || 1;

                  return [
                    { label: "Outstanding (4.5-5.0)", count: distribution["Outstanding (4.5-5.0)"], percentage: Math.round((distribution["Outstanding (4.5-5.0)"] / total) * 100), color: "bg-emerald-500" },
                    { label: "Exceeds (4.0-4.4)", count: distribution["Exceeds (4.0-4.4)"], percentage: Math.round((distribution["Exceeds (4.0-4.4)"] / total) * 100), color: "bg-blue-500" },
                    { label: "Meets (3.5-3.9)", count: distribution["Meets (3.5-3.9)"], percentage: Math.round((distribution["Meets (3.5-3.9)"] / total) * 100), color: "bg-indigo-500" },
                    { label: "Needs Improvement (3.0-3.4)", count: distribution["Needs Improvement (3.0-3.4)"], percentage: Math.round((distribution["Needs Improvement (3.0-3.4)"] / total) * 100), color: "bg-yellow-500" },
                    { label: "Unsatisfactory (<3.0)", count: distribution["Unsatisfactory (<3.0)"], percentage: Math.round((distribution["Unsatisfactory (<3.0)"] / total) * 100), color: "bg-red-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className={`h-1.5 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>


          <div className="break-inside-avoid mb-6">
            <DepartmentPerformanceChart data={departmentPerformance} />
          </div>

          <div className="break-inside-avoid mb-6">
            <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Appraisal Completion Rates
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Self / Manager / Dept Head completion
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option>Q4 {previousYear}</option>
                    <option>Q3 {previousYear}</option>
                    <option>Q2 {previousYear}</option>
                    <option>Q1 {currentYear}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {(() => {
                  const activeCycle = activeCycles[0];
                  if (!activeCycle) {
                    return (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No active appraisal cycles
                      </div>
                    );
                  }

                  const totalEmployees = activeCycle.totalEmployees || 1;
                  const stages = [
                    {
                      name: "Self Review",
                      completed: activeCycle.employeeSubmissions || 0,
                      total: totalEmployees,
                      percentage: Math.round(((activeCycle.employeeSubmissions || 0) / totalEmployees) * 100),
                      color: "text-blue-500"
                    },
                    {
                      name: "Manager Review",
                      completed: activeCycle.managerReviews || 0,
                      total: totalEmployees,
                      percentage: Math.round(((activeCycle.managerReviews || 0) / totalEmployees) * 100),
                      color: "text-green-500"
                    }
                  ];

                  return stages.map((stage) => (
                    <div key={stage.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative">
                          <svg className="w-12 h-12 transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 20}`}
                              strokeDashoffset={`${2 * Math.PI * 20 * (1 - stage.percentage / 100)}`}
                              className={stage.color}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {stage.percentage}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{stage.name}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stage.completed} / {stage.total} completed
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          <div className="break-inside-avoid mb-6">
            <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    9-Box Summary
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Employee distribution by performance & potential
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">High Potential</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Medium Potential</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Low Potential</div>
                </div>
                {/* Grid */}
                {[1, 2, 3].map(row => (
                  <div key={row} className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map(col => {
                      // Use boxPosition from API to ensure consistency with main grid page
                      const count = validEmployees.filter(emp =>
                        emp.boxPosition &&
                        emp.boxPosition.row === row &&
                        emp.boxPosition.col === col
                      ).length;

                      let color = 'bg-gray-500 text-white';
                      let label = 'Empty';

                      // Set color and label based on position
                      if (count > 0) {
                        const positions = {
                          '1-1': { color: 'bg-emerald-500 text-white', label: 'Stars' },
                          '1-2': { color: 'bg-blue-500 text-white', label: 'Solid' },
                          '1-3': { color: 'bg-purple-500 text-white', label: 'Future' },
                          '2-1': { color: 'bg-orange-500 text-white', label: 'High Pot' },
                          '2-2': { color: 'bg-gray-500 text-white', label: 'Core' },
                          '2-3': { color: 'bg-yellow-500 text-white', label: 'Steady' },
                          '3-1': { color: 'bg-red-500 text-white', label: 'Problem' },
                          '3-2': { color: 'bg-indigo-500 text-white', label: 'Potential' },
                          '3-3': { color: 'bg-gray-400 text-white', label: 'Under' },
                        };

                        const position = positions[`${row}-${col}`];
                        color = position.color;
                        label = position.label;
                      }

                      return (
                        <div
                          key={col}
                          className={`p-2 rounded text-center ${color}`}
                        >
                          <div className="text-sm font-bold">{count}</div>
                          <div className="text-xs opacity-90">{label}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {/* Row Labels */}
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">High Perf</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Med Perf</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Low Perf</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
