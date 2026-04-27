'use client';

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import {
  BarChart3,
  PieChart,
  Grid3X3,
  Filter,
  Download,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Building2,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCw,
  X
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";
import { employeeService } from "@/services/hr-services/employeeService";

export default function PerformanceAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Get current year for dynamic options
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const [filters, setFilters] = useState({
    cycle: "",
    department: ""
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch real data from APIs
      const [nineBoxData, departmentsData, cyclesData] = await Promise.all([
        performanceManagementService.getNineBoxGridData(filters),
        employeeService.getDepartments(),
        // Add cycles API call when available
      ]);

      // Process analytics data
      const processedData = processAnalyticsData(nineBoxData, departmentsData);

      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");

      // Fallback to mock data if API fails
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (nineBoxData, departmentsData) => {
    // Handle the new object structure { gridData, unassignedEmployees }
    const employees = nineBoxData.data?.gridData || (Array.isArray(nineBoxData.data) ? nineBoxData.data : []);

    // Calculate performance distribution
    const performanceDistribution = {
      outstanding: { count: 0, percentage: 0, color: "bg-emerald-500" },
      exceeds: { count: 0, percentage: 0, color: "bg-[var(--color-primary)]" },
      meets: { count: 0, percentage: 0, color: "bg-[var(--color-secondary)]" },
      needsImprovement: { count: 0, percentage: 0, color: "bg-yellow-500" },
      unsatisfactory: { count: 0, percentage: 0, color: "bg-red-500" }
    };

    // Calculate department scores
    const departmentScores = {};
    const nineBoxSummary = {};

    employees.forEach(emp => {
      // Performance distribution
      const score = emp.performanceScore || 3;
      if (score >= 4.5) performanceDistribution.outstanding.count++;
      else if (score >= 4.0) performanceDistribution.exceeds.count++;
      else if (score >= 3.5) performanceDistribution.meets.count++;
      else if (score >= 3.0) performanceDistribution.needsImprovement.count++;
      else performanceDistribution.unsatisfactory.count++;

      // Department scores
      const dept = emp.employee?.department || 'Unknown';
      if (!departmentScores[dept]) {
        departmentScores[dept] = { total: 0, count: 0 };
      }
      departmentScores[dept].total += score;
      departmentScores[dept].count++;

      // Nine-Box summary
      const row = emp.boxPosition?.row || 2;
      const col = emp.boxPosition?.col || 2;
      const key = `${row}-${col}`;
      if (!nineBoxSummary[key]) {
        nineBoxSummary[key] = { count: 0, row, col };
      }
      nineBoxSummary[key].count++;
    });

    // Calculate percentages
    const totalEmployees = employees.length;
    Object.keys(performanceDistribution).forEach(key => {
      performanceDistribution[key].percentage = totalEmployees > 0
        ? Math.round((performanceDistribution[key].count / totalEmployees) * 100)
        : 0;
    });

    // Format department scores
    const formattedDepartmentScores = Object.entries(departmentScores).map(([name, data]) => ({
      name,
      avgScore: Math.round((data.total / data.count) * 10) / 10,
      totalEmployees: data.count
    }));

    // Format Nine-Box summary
    const nineBoxLabels = {
      '1-1': 'Stars',
      '1-2': 'High Performers',
      '1-3': 'Solid Performers',
      '2-1': 'Future Stars',
      '2-2': 'Core',
      '2-3': 'Steady Performers',
      '3-1': 'High Potentials',
      '3-2': 'Potential Issues',
      '3-3': 'Problem Performers'
    };

    const formattedNineBoxSummary = Object.values(nineBoxSummary).map(item => ({
      ...item,
      label: nineBoxLabels[`${item.row}-${item.col}`] || 'Unknown'
    }));

    return {
      employees: employees,
      cycles: [
        { id: 1, name: `Q4 ${previousYear}`, status: "ACTIVE" },
        { id: 2, name: `Q3 ${previousYear}`, status: "CLOSED" },
        { id: 3, name: `Q2 ${previousYear}`, status: "CLOSED" },
        { id: 4, name: `Q1 ${previousYear}`, status: "CLOSED" }
      ],
      departments: departmentsData.data || [],
      performanceDistribution,
      departmentScores: formattedDepartmentScores,
      completionRates: {
        selfReview: { completed: 120, total: 150, percentage: 80 },
        managerReview: { completed: 95, total: 150, percentage: 63 },
        deptHeadReview: { completed: 85, total: 150, percentage: 57 }
      },
      nineBoxSummary: formattedNineBoxSummary
    };
  };

  const getMockAnalyticsData = () => {
    return {
      cycles: [
        { id: 1, name: `Q4 ${previousYear}`, status: "ACTIVE" },
        { id: 2, name: `Q3 ${previousYear}`, status: "CLOSED" },
        { id: 3, name: `Q2 ${previousYear}`, status: "CLOSED" },
        { id: 4, name: `Q1 ${previousYear}`, status: "CLOSED" }
      ],
      departments: [
        { id: 1, name: "Engineering", totalEmployees: 50 },
        { id: 2, name: "Sales", totalEmployees: 30 },
        { id: 3, name: "Marketing", totalEmployees: 25 },
        { id: 4, name: "HR", totalEmployees: 15 },
        { id: 5, name: "Finance", totalEmployees: 20 },
        { id: 6, name: "Quality", totalEmployees: 10 }
      ],
      performanceDistribution: {
        outstanding: { count: 15, percentage: 10, color: "bg-emerald-500" },
        exceeds: { count: 52, percentage: 35, color: "bg-[var(--color-primary)]" },
        meets: { count: 45, percentage: 30, color: "bg-[var(--color-secondary)]" }, // Using brand color for meets/average
        needsImprovement: { count: 22, percentage: 15, color: "bg-yellow-500" },
        unsatisfactory: { count: 8, percentage: 5, color: "bg-red-500" }
      },
      departmentScores: [
        { name: "Engineering", avgScore: 4.2, totalEmployees: 50 },
        { name: "Sales", avgScore: 3.8, totalEmployees: 30 },
        { name: "Marketing", avgScore: 4.0, totalEmployees: 25 },
        { name: "HR", avgScore: 3.9, totalEmployees: 15 },
        { name: "Finance", avgScore: 3.7, totalEmployees: 20 },
        { name: "Quality", avgScore: 3.6, totalEmployees: 10 }
      ],
      completionRates: {
        selfReview: { completed: 120, total: 150, percentage: 80 },
        managerReview: { completed: 95, total: 150, percentage: 63 },
        deptHeadReview: { completed: 85, total: 150, percentage: 57 }
      },
      nineBoxSummary: [
        { row: 1, col: 1, count: 15, label: "Stars" },
        { row: 1, col: 2, count: 25, label: "High Performers" },
        { row: 1, col: 3, count: 10, label: "Solid Performers" },
        { row: 2, col: 1, count: 20, label: "Future Stars" },
        { row: 2, col: 2, count: 35, label: "Core" },
        { row: 2, col: 3, count: 15, label: "Steady Performers" },
        { row: 3, col: 1, count: 8, label: "Problem Performers" },
        { row: 3, col: 2, count: 12, label: "Potential Issue" },
        { row: 3, col: 3, count: 10, label: "Underperformers" }
      ]
    };
  };

  const getPerformanceColor = (score) => {
    if (score >= 4.5) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400";
    if (score >= 4.0) return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
    if (score >= 3.5) return "text-[#0b1220] bg-[var(--color-secondary)]";
    if (score >= 3.0) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
    return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
  };

  const getProgressBarColor = (score) => {
    if (score >= 4.5) return "bg-emerald-500";
    if (score >= 4.0) return "bg-green-500";
    if (score >= 3.5) return "bg-[var(--color-primary)]";
    if (score >= 3.0) return "bg-yellow-500";
    return "bg-red-500";
  }

  const getNineBoxColor = (row, col) => {
    if (row === 1 && col === 1) return "bg-emerald-500 text-white"; // Stars
    if (row === 1 && col === 2) return "bg-[var(--color-primary)] text-[#0b1220]"; // Solid Performers
    if (row === 1 && col === 3) return "bg-purple-500 text-white"; // Future Stars
    if (row === 2 && col === 1) return "bg-orange-500 text-white"; // High Potentials
    if (row === 2 && col === 2) return "bg-[var(--color-primary)] text-[#0b1220]"; // Core
    if (row === 2 && col === 3) return "bg-yellow-500 text-white"; // Steady Performers
    if (row === 3 && col === 1) return "bg-red-500 text-white"; // Problem Performers
    if (row === 3 && col === 2) return "bg-indigo-500 text-white"; // Potential Issue
    return "bg-gray-400 text-white"; // Underperformers
  };

  const handleExport = () => {
    if (!analyticsData) return;

    // Create CSV content
    const csvContent = generateCSVReport(analyticsData);

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-analytics-${filters.cycle || 'current'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Analytics report exported successfully");
  };

  const generateCSVReport = (data) => {
    const headers = ['Metric', 'Value', 'Percentage', 'Details'];
    const rows = [];

    // Performance distribution
    rows.push(['Performance Distribution', '', '', '']);
    Object.entries(data.performanceDistribution).forEach(([key, value]) => {
      rows.push([key, value.count.toString(), `${value.percentage}%`, '']);
    });

    // Department scores
    rows.push(['', '', '', '']);
    rows.push(['Department Scores', '', '', '']);
    data.departmentScores.forEach(dept => {
      rows.push([dept.name, dept.avgScore.toString(), '', `${dept.totalEmployees} employees`]);
    });

    // Nine-Box summary
    rows.push(['', '', '', '']);
    rows.push(['Nine-Box Summary', '', '', '']);
    data.nineBoxSummary.forEach(box => {
      rows.push([box.label, box.count.toString(), '', `Position (${box.row},${box.col})`]);
    });

    // Create CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success("Analytics data refreshed");
  };

  const handleMetricClick = (metric) => {
    setSelectedMetric(metric);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Performance", href: "/hr/performance" },
            { label: "Analytics", href: "/hr/performance/analytics" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Performance Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Organization-wide performance insights and metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0b1220] bg-[var(--color-secondary)] border border-[var(--color-primary)] rounded-sm hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExport}
              disabled={!analyticsData}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0b1220] bg-[var(--color-primary)] rounded-sm hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 shadow-sm"
            >
              <Download size={14} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-[var(--color-primary-hover)] rounded-full">
                  <Users size={14} className="text-[#0b1220]" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {Object.values(analyticsData?.performanceDistribution || {}).reduce((sum, cat) => sum + cat.count, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-[var(--color-primary-hover)] rounded-full">
                  <TrendingUp size={14} className="text-[#0b1220]" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analyticsData?.departmentScores?.reduce((sum, dept) => sum + dept.avgScore, 0) / (analyticsData?.departmentScores?.length || 1) ? (analyticsData?.departmentScores?.reduce((sum, dept) => sum + dept.avgScore, 0) / (analyticsData?.departmentScores?.length || 1)).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-[var(--color-primary-hover)] rounded-full">
                  <Target size={14} className="text-[#0b1220]" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">High Performers</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {(analyticsData?.performanceDistribution?.outstanding?.count || 0) + (analyticsData?.performanceDistribution?.exceeds?.count || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-[var(--color-primary-hover)] rounded-full">
                  <Calendar size={14} className="text-[#0b1220]" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analyticsData?.completionRates?.selfReview?.percentage || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap lg:flex-nowrap items-center gap-4">
        <div className="flex items-center gap-2 px-3 h-10 bg-white border border-gray-200 rounded-sm text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-700">
          <Filter size={14} />
          <span className="font-medium">Filter by:</span>
        </div>
        <select
          value={filters.cycle}
          onChange={(e) => setFilters({ ...filters, cycle: e.target.value })}
          className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-w-[200px]"
        >
          <option value="">All Cycles</option>
          {analyticsData?.cycles?.map(cycle => (
            <option key={cycle.id} value={cycle.name}>{cycle.name}</option>
          ))}
        </select>
        <select
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          className="h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-w-[200px]"
        >
          <option value="">All Departments</option>
          {analyticsData?.departments?.map(dept => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Performance Distribution Chart */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--color-primary-hover)] rounded-full">
                <PieChart size={16} className="text-[#0b1220]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Performance Distribution
              </h3>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
              Total: {Object.values(analyticsData?.performanceDistribution || {}).reduce((sum, cat) => sum + cat.count, 0)}
            </span>
          </div>
          <div className="space-y-4">
            {analyticsData?.performanceDistribution && Object.entries(analyticsData.performanceDistribution).map(([key, data]) => (
              <div
                key={key}
                className="group flex items-center justify-between p-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => handleMetricClick({ type: 'performance', category: key, data })}
              >
                <div className="flex items-center gap-3 w-1/3">
                  <div
                    className={`w-3 h-3 rounded-sm flex-shrink-0 ${data.color}`}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize truncate group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-primary)] transition-colors">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>

                <div className="flex items-center gap-4 w-2/3 justify-end">
                  <div className="flex-1 max-w-[200px] h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${data.color}`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 min-w-[80px] justify-end">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium w-8 text-right">
                      {data.percentage}%
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">
                      {data.count}
                    </span>
                  </div>
                  <Eye size={14} className="text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Average Score Bar Chart */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--color-primary-hover)] rounded-full">
                <BarChart3 size={16} className="text-[#0b1220]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Department Average Scores
              </h3>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
              {filters.cycle || 'Current Cycle'}
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {analyticsData?.departmentScores?.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Building2 size={16} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {dept.name}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">
                      {dept.totalEmployees} Employees
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 w-1/2 justify-end">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(dept.avgScore)}`}
                      style={{ width: `${(dept.avgScore / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">
                    {dept.avgScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Appraisal Completion Donut Chart */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--color-primary-hover)] rounded-full">
                <Target size={16} className="text-[#0b1220]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Appraisal Completion Rates
              </h3>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
              {filters.cycle || 'Current'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analyticsData?.completionRates && Object.entries(analyticsData.completionRates).map(([key, data]) => (
              <div key={key} className="flex flex-col items-center justify-center p-4 rounded-sm border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - data.percentage / 100)}`}
                      className={key === 'selfReview' ? 'text-[var(--color-primary)]' : key === 'managerReview' ? 'text-green-500' : 'text-purple-500'}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {data.percentage}%
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold text-gray-900 dark:text-white capitalize block mb-0.5">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {data.completed} / {data.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 9-Box Summary Heatmap */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--color-primary-hover)] rounded-full">
                <Grid3X3 size={16} className="text-[#0b1220]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                9-Box Summary
              </h3>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
              Employee Distribution
            </span>
          </div>
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 text-center mb-2">
              <div className="text-[10px] uppercase tracking-wide font-bold text-gray-500 dark:text-gray-400">High Potential</div>
              <div className="text-[10px] uppercase tracking-wide font-bold text-gray-500 dark:text-gray-400">Med Potential</div>
              <div className="text-[10px] uppercase tracking-wide font-bold text-gray-500 dark:text-gray-400">Low Potential</div>
            </div>
            {/* Grid */}
            {[1, 2, 3].map(row => (
              <div key={row} className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(col => {
                  const cell = analyticsData?.nineBoxSummary?.find(item => item.row === row && item.col === col);
                  return (
                    <div
                      key={col}
                      className={`p-3 rounded-sm text-center ${getNineBoxColor(row, col)} cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all shadow-sm`}
                      onClick={() => handleMetricClick({ type: 'ninebox', row, col, data: cell })}
                    >
                      <div className="text-xl font-bold mb-0.5">{cell?.count || 0}</div>
                      <div className="text-[10px] font-medium opacity-90 uppercase tracking-tight truncate px-1">{cell?.label}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Details Modal */}
      {showDetails && selectedMetric && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedMetric.type === 'performance' ? 'Performance Details' : 'Nine-Box Category Details'}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {selectedMetric.type === 'performance' ? (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-3 h-10 rounded-sm ${selectedMetric.data.color}`}></div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        {selectedMetric.category.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Performance Category Analysis</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employee Count</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{selectedMetric.data.count}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Percentage</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{selectedMetric.data.percentage}%</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Top Employees in this Category</h5>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 uppercase font-medium">
                          <tr>
                            <th className="px-4 py-2 text-left">Employee</th>
                            <th className="px-4 py-2 text-right">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {analyticsData?.employees
                            ?.filter(emp => {
                              const score = emp.performanceScore || 3;
                              if (selectedMetric.category === 'outstanding') return score >= 4.5;
                              if (selectedMetric.category === 'exceeds') return score >= 4.0 && score < 4.5;
                              if (selectedMetric.category === 'meets') return score >= 3.5 && score < 4.0;
                              if (selectedMetric.category === 'needsImprovement') return score >= 3.0 && score < 3.5;
                              if (selectedMetric.category === 'unsatisfactory') return score < 3.0;
                              return false;
                            })
                            .slice(0, 5)
                            .map(emp => (
                              <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900 dark:text-white">{emp.employee?.name || `${emp.employee?.firstName} ${emp.employee?.lastName}`}</div>
                                  <div className="text-xs text-gray-500">{emp.employee?.department}</div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${getPerformanceColor(emp.performanceScore)}`}>
                                    {emp.performanceScore}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                // Nine Box Details
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-3 h-10 rounded-sm ${getNineBoxColor(selectedMetric.row, selectedMetric.col).split(' ')[0]}`}></div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        {selectedMetric.data?.label || 'Unknown Category'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Position ({selectedMetric.row}, {selectedMetric.col})</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-100 dark:border-gray-700 mb-6">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Employees</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{selectedMetric.data?.count || 0}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-right">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
