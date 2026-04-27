"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileBarChart,
  FileText,
  Download,
  TrendingUp,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Loader2,
  Eye,
  Sparkles,
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { toast } from "react-hot-toast";
import dynamic from 'next/dynamic';
import ReportViewModal from "./components/ReportViewModal";
import { generateReportPDF } from "./utils/reportPDF";
import { generateReportExcel } from "./utils/reportExcel";
import { generateReportCSV } from "./utils/reportCSV_new";
import { payrollReportsAnalyticsService } from "@/services/payroll-role-services/reports-analytics.service";
import { departmentService } from "@/services/hr-services/departmentService";
import { payrollService } from "@/services/hr-services/payroll.service";

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const reportTypes = [
  {
    id: "payroll-summary",
    label: "Payroll Summary",
    icon: FileText,
    description: "Overall payroll summary report",
    color: "primary",
  },
  {
    id: "tax-report",
    label: "Tax Report",
    icon: FileBarChart,
    description: "TDS and tax compliance report",
    color: "secondary",
  },
  {
    id: "department-wise",
    label: "Department Wise",
    icon: BarChart3,
    description: "Department-wise payroll breakdown",
    color: "primary",
  },
  {
    id: "employee-wise",
    label: "Employee Wise",
    icon: FileText,
    description: "Individual employee payroll details",
    color: "secondary",
  },
  {
    id: "statutory",
    label: "Statutory Compliance",
    icon: FileBarChart,
    description: "PF, ESI, PT compliance reports",
    color: "primary",
  },
  {
    id: "reimbursement",
    label: "Reimbursement Report",
    icon: TrendingUp,
    description: "Employee reimbursement statements",
    color: "secondary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function PayrollReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState("payroll-summary");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [period, setPeriod] = useState("monthly");
  const [department, setDepartment] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("PDF");

  // Sync state with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type && reportTypes.some(r => r.id === type)) {
      setSelectedReportType(type);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await payrollReportsAnalyticsService.getPayrollReports({
        page: 1,
        limit: 20,
        type: selectedReportType
      });
      const reportList = response.data?.data || response.data?.reports || response.data || [];
      const normalized = (Array.isArray(reportList) ? reportList : []).map((report) => ({
        id: report.id || report.reportId || report.publicId,
        name: report.name,
        type: report.type,
        generatedDate: report.generatedDate,
        period: report.period,
        status: report.status || "COMPLETED",
        fileSize: report.size || report.fileSize || "-",
        format: report.format || "PDF",
        data: report.data || null,
        generatedBy: report.generatedByEmp || null
      }));
      setReports(normalized);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error(error.message || "Failed to fetch reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [selectedReportType]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await payrollReportsAnalyticsService.getPayrollAnalytics();
      const analyticsData = response.data?.data || response.data || {};
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics({
        totalReports: 0,
        reportsThisMonth: 0,
        totalDistributed: 0,
      });
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await departmentService.getAllDepartments({ limit: 100, page: 1 });
      const list = response.data || response.departments || response || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error(error.message || "Failed to fetch departments");
      setDepartments([]);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchAnalytics();
    fetchDepartments();
  }, [fetchAnalytics, fetchDepartments]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const startDate = dateRange.startDate;
      const endDate = dateRange.endDate;
      const end = new Date(endDate);
      const year = end.getFullYear();
      const month = end.getMonth() + 1;
      const selectedDepartment = departments.find((dept) => String(dept.id) === String(department));
      const departmentName = selectedDepartment?.name || null;

      let result;
      if (selectedReportType === "payroll-summary") {
        result = await payrollService.generatePayrollSummary({
          startDate,
          endDate,
          department: departmentName || "all"
        });
      } else if (selectedReportType === "tax-report") {
        const quarter = period === "quarterly" ? Math.ceil(month / 3) : null;
        result = await payrollService.generateTaxReport({
          year,
          quarter
        });
      } else if (selectedReportType === "department-wise") {
        result = await payrollService.generateDepartmentWiseReport({
          month,
          year,
          departmentId: department === "all" ? null : Number(department)
        });
      } else if (selectedReportType === "employee-wise") {
        result = await payrollService.generateEmployeeWiseReport({
          employeeId: 1, // Default or selected employee
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
      } else if (selectedReportType === "statutory") {
        const quarter = period === "quarterly" ? Math.ceil(month / 3) : null;
        result = await payrollService.generateStatutoryReport({
          year,
          quarter,
          month: period === "monthly" ? month : null,
          departmentId: department !== 'all' ? department : null
        });
      } else if (selectedReportType === "reimbursement") {
        result = await payrollService.generateReimbursementReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          departmentId: department !== 'all' ? department : null
        });
      } else {
        toast.error("Unsupported report type");
        return;
      }

      toast.success(result?.message || "Report generated successfully");
      fetchReports();
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const format = (selectedFormat || "PDF").toLowerCase();
      const response = await payrollService.downloadReport(report.id, format);
      const payload = response?.data ? response : { data: response };
      const reportData = payload.data?.data || payload.data || report;
      
      let result;
      switch (format) {
        case 'excel':
        case 'xlsx':
          result = generateReportExcel({
            format: selectedFormat || "Excel",
            fileSize: report.fileSize || "-",
            ...reportData
          });
          break;
        case 'csv':
          result = generateReportCSV({
            format: selectedFormat || "CSV",
            fileSize: report.fileSize || "-",
            ...reportData
          });
          break;
        case 'pdf':
        default:
          result = generateReportPDF({
            format: selectedFormat || "PDF",
            fileSize: report.fileSize || "-",
            ...reportData
          });
          break;
      }
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error(error.message || "Failed to download report");
    }
  };

  const handleExportFormat = async (format) => {
    if (!selectedReportType) {
      toast.error("Please select a report type first");
      return;
    }

    // Store the selected format for future downloads
    setSelectedFormat(format);

    try {
      setLoading(true);
      
      // Generate a mock report for export based on selected type
      const mockReport = {
        id: `export_${Date.now()}`,
        name: `${selectedReportType.replace('-', ' ').toUpperCase()} Report`,
        type: selectedReportType,
        period: period === 'custom' ? `${dateRange.startDate} to ${dateRange.endDate}` : period,
        generatedDate: new Date().toISOString(),
        format: format.toUpperCase(),
        fileSize: "-",
        data: getMockReportData(selectedReportType)
      };

      let result;
      switch (format.toLowerCase()) {
        case 'excel':
        case 'xlsx':
          result = generateReportExcel(mockReport);
          break;
        case 'csv':
          result = generateReportCSV(mockReport);
          break;
        case 'pdf':
        default:
          result = generateReportPDF(mockReport);
          break;
      }
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (reportType) => {
    // Generate mock data for export when no actual report is available
    switch (reportType) {
      case 'payroll-summary':
        return {
          summary: {
            totalEmployees: 150,
            totalPayroll: 15000000,
            averageSalary: 100000
          },
          departmentSummary: {
            'Engineering': { totalSalary: 8000000, employeeCount: 80 },
            'Sales': { totalSalary: 4000000, employeeCount: 40 },
            'HR': { totalSalary: 3000000, employeeCount: 30 }
          }
        };
      case 'tax-report':
        return {
          totalTax: 2250000,
          totalEmployees: 150,
          totalIncome: 15000000,
          averageTax: 15000
        };
      case 'department-wise':
        return {
          departmentData: [
            { departmentName: 'Engineering', totalSalary: 8000000, employeeCount: 80 },
            { departmentName: 'Sales', totalSalary: 4000000, employeeCount: 40 },
            { departmentName: 'HR', totalSalary: 3000000, employeeCount: 30 }
          ]
        };
      case 'employee-wise':
        return {
          employee: {
            employeeName: 'John Doe',
            department: 'Engineering',
            designation: 'Senior Developer'
          },
          totalPayroll: 1200000
        };
      case 'reimbursement':
        return {
          totalReimbursement: 500000,
          totalClaims: 25,
          approvedClaims: 20,
          pendingClaims: 5,
          claims: [
            { employeeName: 'John Doe', amount: 5000, status: 'Approved', date: '2024-01-15', type: 'Travel' },
            { employeeName: 'Jane Smith', amount: 3000, status: 'Pending', date: '2024-01-20', type: 'Medical' }
          ]
        };
      default:
        return {};
    }
  };

  const handleViewReport = async (report) => {
    try {
      if (!report?.data) {
        const response = await payrollService.getReportById(report.id);
        const reportData = response.data?.data || response.data || report;
        setSelectedReport(reportData);
      } else {
        setSelectedReport(report);
      }
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error(error.message || "Failed to load report");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedReportTypeData = reportTypes.find((r) => r.id === selectedReportType);
  const filteredReports = reports.filter((report) => {
    if (period !== "custom") return true;
    if (!report.generatedDate) return false;
    const reportDate = new Date(report.generatedDate);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);
    return reportDate >= start && reportDate <= end;
  });

  // Department breakdown chart
  const departmentChartOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    labels: analytics?.departmentBreakdown?.map(d => d.department) || [],
    colors: ['#070C8A', '#3032AD', '#5D5FEF', '#8183F4', '#A5A6F6'],
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toFixed(0) + '%'
    },
    legend: { position: 'bottom' },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'inherit',
        color: 'var(--foreground)'
      },
      y: {
        formatter: (val) => formatCurrency(val)
      }
    }
  };

  const departmentChartSeries = analytics?.departmentBreakdown?.map(d => d.amount) || [];

  // Payroll trend chart
  const trendChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    stroke: { curve: 'smooth', width: 3 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: analytics?.payrollTrend?.labels || [],
    },
    yaxis: {
      labels: {
        formatter: (val) => formatCurrency(val)
      }
    },
    colors: ['#070C8A'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100]
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'inherit',
        color: 'var(--foreground)'
      },
      y: {
        formatter: (val) => formatCurrency(val)
      }
    }
  };

  const trendChartSeries = [{
    name: 'Total Payroll',
    data: analytics?.payrollTrend?.totals || []
  }];

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-4 sm:p-6 space-y-6">
      <Breadcrumb />

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: "Total Reports", value: analytics?.totalReports || 0, icon: FileText, color: "primary" },
          { label: "This Month", value: analytics?.reportsThisMonth || 0, icon: TrendingUp, color: "secondary" },
          { label: "Total Distributed", value: formatCurrency(analytics?.totalDistributed || 0), icon: BarChart3, color: "primary" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all"
          >
            <motion.div
              className={`absolute top-0 right-0 w-32 h-32 ${stat.color === 'primary' ? 'bg-primary-500/10' : 'bg-secondary-500/10'} rounded-full blur-2xl -mr-16 -mt-16 transition-all`}
            />
            <div className="flex items-center gap-3 relative z-10 w-full">
              <div className={`p-3 flex-shrink-0 rounded-xl ${stat.color === 'primary' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400'}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-muted-foreground mb-0.5 truncate">{stat.label}</p>
                <p className="text-2xl font-extrabold text-foreground truncate" title={stat.value}>{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Payroll Trend (Wide) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-primary-600" />
            Payroll Trend
          </h3>
          <ReactApexChart
            options={trendChartOptions}
            series={trendChartSeries}
            type="area"
            height={300}
          />
        </div>

        {/* Department Breakdown (Narrow) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-secondary-600" />
            Department Breakdown
          </h3>
          {analytics?.departmentBreakdown && (
            <ReactApexChart
              options={departmentChartOptions}
              series={departmentChartSeries}
              type="donut"
              height={300}
            />
          )}
        </div>
      </motion.div>

      {/* Main Action Section: Generation & Quick Info */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Report Generation (2 Cols) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="xl:col-span-2 space-y-6"
        >
          {/* Report Type Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Select Report Type</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                const isSelected = selectedReportType === report.id;
                const isPrimary = report.color === 'primary';

                return (
                  <Link
                    key={report.id}
                    href={`?type=${report.id}`}
                    onClick={(e) => {
                      // Prevent full page reload but update state for immediate UI response
                      // e.preventDefault(); // Keep if you want purely SPA, but Link is fine
                      setSelectedReportType(report.id);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${isSelected
                      ? isPrimary
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-sm bg-transparent'
                      }`}
                  >
                    <div className="flex items-start gap-4 z-10 relative">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${isSelected
                        ? isPrimary ? 'bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300' : 'bg-secondary-200 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600'
                        }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm mb-1 ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{report.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Filters & Generate */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-foreground">Configuration & filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-background text-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-background text-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileBarChart className="w-4 h-4" />}
                  Generate Report
                </button>
              </div>
            </div>

            <AnimatePresence>
              {period === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800"
                >
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-background focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-background focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right: Insights & Export (1 Col) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* Quick Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary-600" />
              Quick Insights
            </h3>
            <div className="space-y-3">
              {[
                { label: "Avg. Payroll", value: formatCurrency(analytics?.averageSalary || 0), desc: "Per Employee", color: "primary" },
                { label: "Tax Deducted", value: formatCurrency(analytics?.totalTaxDeducted || 0), desc: "This Period", color: "secondary" },
                { label: "Statutory", value: formatCurrency(analytics?.statutoryPayments || 0), desc: "PF/ESI/PT", color: "primary" },
              ].map((item, i) => (
                <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${item.color === 'primary'
                  ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800'
                  : 'bg-secondary-50 dark:bg-secondary-900/10 border-secondary-100 dark:border-secondary-800'
                  }`}>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                    <p className="text-sm text-foreground font-bold">{item.value}</p>
                  </div>
                  <span className="text-xs text-muted-foreground text-right">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground mb-4">Export Options</h3>
            <div className="space-y-2">
              {["PDF", "Excel", "CSV"].map((format, i) => (
                <button 
                  key={i} 
                  onClick={() => handleExportFormat(format)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all group cursor-pointer ${
                    selectedFormat === format
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-600'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-primary-300'
                  }`}
                >
                  {format === 'PDF' && <FileText className={`w-5 h-5 ${selectedFormat === format ? 'text-primary-600' : 'text-primary-600'}`} />}
                  {format === 'Excel' && <BarChart3 className={`w-5 h-5 ${selectedFormat === format ? 'text-secondary-600' : 'text-secondary-600'}`} />}
                  {format === 'CSV' && <FileBarChart className={`w-5 h-5 ${selectedFormat === format ? 'text-primary-600' : 'text-primary-600'}`} />}
                  <div className="text-left">
                    <p className={`text-sm font-semibold transition-colors ${
                      selectedFormat === format 
                        ? 'text-primary-600' 
                        : 'text-foreground group-hover:text-primary-600'
                    }`}>{format}</p>
                    <p className="text-xs text-muted-foreground">
                      {format === 'PDF' && 'For Printing'}
                      {format === 'Excel' && 'Analysis'}
                      {format === 'CSV' && 'Data Import'}
                    </p>
                  </div>
                  {selectedFormat === format && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Reports List - Full Width Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Recent Reports</h3>
          <button className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline">View All</button>
        </div>

        {loading && filteredReports.length === 0 ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-primary-200 dark:hover:border-primary-800 transition-all group">
                <div className="p-2.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm text-primary-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.period} • {report.fileSize}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDownloadReport(report)} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded text-primary-600"><Download className="w-4 h-4" /></button>
                  <button onClick={() => handleViewReport(report)} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded text-secondary-600"><Eye className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground p-4 border-2 border-dashed border-gray-200 rounded-xl">
            No reports generated yet
          </div>
        )}
      </motion.div>

      {/* Report View Modal */}
      <ReportViewModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        report={selectedReport}
        onDownload={handleDownloadReport}
      />
    </div>
  );
}
