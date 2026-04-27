"use client";

import {
  Shield,
  Building2,
  HeartPulse,
  Receipt,
  Users,
  FileText,
  Calculator,
  BookOpen,
  FileBarChart,
  Download,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowRight
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import { statutoryComplianceService } from "@/services/payroll-role-services/statutory-compliance.service";

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const complianceTypes = [
  {
    id: "pf",
    label: "Provident Fund (PF)",
    icon: Building2,
    color: "blue",
    description: "Employees' Provident Fund Organization (EPFO)"
  },
  {
    id: "gratuity",
    label: "Gratuity",
    icon: HeartPulse,
    color: "purple",
    description: "Payment of Gratuity Act, 1972",
    highlighted: true
  },
  {
    id: "esi",
    label: "Employee State Insurance (ESI)",
    icon: Users,
    color: "green",
    description: "ESI Corporation"
  },
  {
    id: "pt",
    label: "Professional Tax (PT)",
    icon: Receipt,
    color: "orange",
    description: "State-wise Professional Tax"
  },
  {
    id: "lwf",
    label: "Labour Welfare Fund (LWF)",
    icon: Shield,
    color: "indigo",
    description: "State Labour Welfare Fund"
  },
  {
    id: "tds",
    label: "Income Tax (TDS)",
    icon: FileText,
    color: "red",
    description: "Tax Deducted at Source"
  },
];

function StatutoryComplianceContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');

  const [activeCompliance, setActiveCompliance] = useState(typeParam || "pf");
  const [activeFeatureTab, setActiveFeatureTab] = useState("calculation");
  const [complianceOverview, setComplianceOverview] = useState(null);
  const [moduleData, setModuleData] = useState({});
  const [moduleLoading, setModuleLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (typeParam && complianceTypes.some(c => c.id === typeParam)) {
      setActiveCompliance(typeParam);
    }
  }, [typeParam]);

  useEffect(() => {
    fetchComplianceOverview();
  }, []);

  const fetchComplianceOverview = async () => {
    try {
      const response = await statutoryComplianceService.getComplianceOverview();
      setComplianceOverview(response.data || {});
    } catch (error) {
      console.error("Error fetching compliance overview:", error);
      toast.error(error.message || "Failed to fetch compliance overview");
    } finally {
    }
  };

  const fetchModuleData = async (type) => {
    try {
      setModuleLoading(true);
      const response = await statutoryComplianceService.getComplianceModuleData(type);
      setModuleData((prev) => ({
        ...prev,
        [type]: response.data
      }));
    } catch (error) {
      console.error("Error fetching module data:", error);
      toast.error(error.message || "Failed to fetch compliance module data");
    } finally {
      setModuleLoading(false);
    }
  };

  const handleRunCalculation = async () => {
    try {
      setIsCalculating(true);
      const response = await statutoryComplianceService.runCalculation(activeCompliance);
      toast.success(response.message || "Calculation completed successfully");

      // Refresh both overview and module data after calculation
      await Promise.all([
        fetchComplianceOverview(),
        fetchModuleData(activeCompliance)
      ]);
    } catch (error) {
      console.error("Error running calculation:", error);
      toast.error(error.message || "Failed to run calculation");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGenerateChallan = () => {
    toast.info(`Generating challan data for ${selectedCompliance?.label}...`);
    setTimeout(() => {
      toast.success(`${selectedCompliance?.label} challan data is ready for portal upload!`);
    }, 1500);
  };

  const handleDownloadReport = (name) => {
    toast.info(`Preparing ${name}...`);
    setTimeout(() => {
      toast.success(`${name} downloaded successfully!`);
    }, 1000);
  };

  const handleUploadToPortal = () => {
    toast.info(`Redirecting to ${selectedCompliance?.id.toUpperCase()} portal...`);
  };

  useEffect(() => {
    if (!moduleData[activeCompliance]) {
      fetchModuleData(activeCompliance);
    }
  }, [activeCompliance, moduleData]);

  const selectedCompliance = complianceTypes.find(c => c.id === activeCompliance);
  const selectedOverview = complianceOverview?.[activeCompliance];
  const activeModuleData = moduleData[activeCompliance] || {};

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-primary/10",
        text: "text-primary",
        border: "border-primary/20",
        gradient: "from-primary/10 via-primary/5 to-accent/10",
        iconBg: "bg-primary/20",
      },
      purple: {
        bg: "bg-accent/10",
        text: "text-accent",
        border: "border-accent/20",
        gradient: "from-accent/10 via-accent/5 to-primary/10",
        iconBg: "bg-accent/20",
      },
      green: {
        bg: "bg-success/10",
        text: "text-success",
        border: "border-success/20",
        gradient: "from-success/10 via-success/5 to-primary/10",
        iconBg: "bg-success/20",
      },
      orange: {
        bg: "bg-warning/10",
        text: "text-warning",
        border: "border-warning/20",
        gradient: "from-warning/10 via-warning/5 to-accent/10",
        iconBg: "bg-warning/20",
      },
      indigo: {
        bg: "bg-primary/10",
        text: "text-primary",
        border: "border-primary/20",
        gradient: "from-primary/10 via-primary/5 to-accent/10",
        iconBg: "bg-primary/20",
      },
      red: {
        bg: "bg-destructive/10",
        text: "text-destructive",
        border: "border-destructive/20",
        gradient: "from-destructive/10 via-destructive/5 to-warning/10",
        iconBg: "bg-destructive/20",
      },
    };
    return colors[color] || colors.blue;
  };

  const renderFeatureContent = () => {
    const colorClasses = getColorClasses(selectedCompliance?.color || "blue");

    if (moduleLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (activeFeatureTab) {
      case "calculation":
        const calculationData = activeModuleData.calculation?.rows || [];
        const calculationStats = activeModuleData.calculation?.stats || {};

        const chartOptions = {
          chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '60%',
              borderRadius: 8,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
          },
          xaxis: {
            categories: calculationData.map(d => d.name.split(' ')[0]),
            labels: { style: { colors: 'hsl(var(--muted-foreground))' } },
          },
          yaxis: {
            labels: {
              formatter: (val) => `₹${(val / 1000).toFixed(0)}k`,
              style: { colors: 'hsl(var(--muted-foreground))' },
            },
          },
          fill: {
            opacity: 1,
            colors: ['hsl(var(--primary))', 'hsl(var(--accent))'],
          },
          colors: ['hsl(var(--primary))'],
          tooltip: {
            y: {
              formatter: (val) => `₹${val.toLocaleString()}`,
            },
          },
          grid: {
            borderColor: 'hsl(var(--border))',
            strokeDashArray: 4,
          },
        };

        const chartSeries = [{
          name: 'Contribution Amount',
          data: calculationData.map(d => d.amount),
        }];

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6 premium-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Auto-Calculation Based on Salary
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic computation of {selectedCompliance?.label} based on employee salary structure
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRunCalculation}
                  disabled={isCalculating}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4" />
                  )}
                  {isCalculating ? "Calculating..." : "Run Calculation"}
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    label: "Employees Covered",
                    value: calculationStats.employeesCovered?.toString() || "0",
                    icon: Users,
                    color: "primary"
                  },
                  {
                    label: "Total Amount",
                    value: `₹${Number(calculationStats.totalAmount || 0).toLocaleString()}`,
                    icon: DollarSign,
                    color: "success"
                  },
                  {
                    label: "Last Calculated",
                    value: calculationStats.lastCalculated
                      ? new Date(calculationStats.lastCalculated).toLocaleDateString()
                      : "-",
                    icon: Calendar,
                    color: "accent"
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className={`glass-card rounded-2xl p-5 premium-shadow border-2 border-${stat.color}/30 relative overflow-hidden group/stat`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <Icon className={`w-4 h-4 text-${stat.color}`} />
                      </div>
                      <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-xl p-4 mb-6 premium-shadow"
              >
                <h4 className="text-lg font-semibold text-foreground mb-4">Contribution Overview</h4>
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="bar"
                  height={300}
                />
              </motion.div>

              <div className="glass-card rounded-xl overflow-hidden premium-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Salary Base</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Calculation Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {calculationData.map((row, index) => (
                        <motion.tr
                          key={`${row.id}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                          className="transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{row.name}</span>
                              <span className="text-xs text-muted-foreground">({row.id})</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">₹{row.base.toLocaleString()}</td>
                          <td className="px-4 py-3 text-foreground">{row.rate}%</td>
                          <td className="px-4 py-3 font-semibold text-primary">₹{row.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-semibold text-success">
                              {row.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "registers":
        const registers = activeModuleData.registers || [];

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6 premium-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Compliance Registers
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Maintain statutory registers and records for {selectedCompliance?.label}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  View Registers
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registers.map((register, index) => {
                  // Map string icon names from API to actual components
                  const iconMap = {
                    Shield, Building2, HeartPulse, Receipt, Users, FileText,
                    Calculator, BookOpen, FileBarChart, Download, Settings,
                    CheckCircle2, AlertCircle, Loader2, TrendingUp, Calendar,
                    DollarSign, ArrowRight
                  };

                  const Icon = iconMap[register.icon] || BookOpen;

                  return (
                    <motion.div
                      key={register.type}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="glass-card rounded-xl p-5 premium-shadow border border-border hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-lg ${colorClasses.iconBg} ${colorClasses.text}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{register.type}</h4>
                          <span className="text-xs text-muted-foreground">({register.period})</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {register.description}
                      </p>
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        View Details <ArrowRight className="w-3 h-3" />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case "reports":
        const reports = activeModuleData.reports?.list || [];
        const reportTrend = activeModuleData.reports?.trend || { labels: [], contribution: [], deduction: [] };

        const reportChartOptions = {
          chart: {
            type: 'line',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
          },
          stroke: {
            curve: 'smooth',
            width: 3,
          },
          markers: {
            size: 5,
            hover: { size: 7 },
          },
          xaxis: {
            categories: reportTrend.labels,
            labels: { style: { colors: 'hsl(var(--muted-foreground))' } },
          },
          yaxis: {
            labels: {
              formatter: (val) => `₹${(val / 1000).toFixed(0)}k`,
              style: { colors: 'hsl(var(--muted-foreground))' },
            },
          },
          colors: ['hsl(var(--primary))', 'hsl(var(--accent))'],
          tooltip: {
            y: {
              formatter: (val) => `₹${val.toLocaleString()}`,
            },
          },
          grid: {
            borderColor: 'hsl(var(--border))',
            strokeDashArray: 4,
          },
          legend: {
            labels: { colors: 'hsl(var(--foreground))' },
          },
        };

        const reportChartSeries = [
          { name: 'Contribution', data: reportTrend.contribution || [] },
          { name: 'Deduction', data: reportTrend.deduction || [] },
        ];

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6 premium-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Monthly / Annual Reports
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generate statutory compliance reports for {selectedCompliance?.label}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:ring-2 focus:ring-primary/20">
                    <option>Monthly</option>
                    <option>Annual</option>
                    <option>Quarterly</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownloadReport("Custom Report")}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors"
                  >
                    <FileBarChart className="w-4 h-4" />
                    Generate Report
                  </motion.button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-xl p-4 mb-6 premium-shadow"
              >
                <h4 className="text-lg font-semibold text-foreground mb-4">Contribution Trend</h4>
                <ReactApexChart
                  options={reportChartOptions}
                  series={reportChartSeries}
                  type="line"
                  height={300}
                />
              </motion.div>

              <div className="space-y-3">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="glass-card rounded-xl p-4 premium-shadow border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{report.title}</h4>
                          <span className="text-xs text-muted-foreground">• {report.date}</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownloadReport(report.title)}
                        className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case "challan":
        const challans = activeModuleData.challans?.items || [];

        const challanChartOptions = {
          chart: {
            type: 'donut',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
          },
          labels: ['Ready', 'Pending', 'Uploaded'],
          colors: ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--primary))'],
          dataLabels: {
            enabled: true,
            formatter: (val) => `${val.toFixed(0)}%`,
          },
          legend: {
            position: 'bottom',
            labels: { colors: 'hsl(var(--foreground))' },
          },
          tooltip: {
            theme: 'light',
            style: {
              fontSize: '12px',
              fontFamily: 'inherit',
              color: 'var(--foreground)',
              background: 'var(--card)',
            },
            y: {
              formatter: (val) => `${val} challans`,
            },
          },
        };

        const challanChartSeries = activeModuleData.challans?.series || [0, 0, 0];

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6 premium-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Challan Generation (Data-Ready)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generate payment challans for {selectedCompliance?.label} submission
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateChallan}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Generate Challan
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Data-Ready Format
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Challan data is pre-formatted and ready for direct upload to government portals. All calculations and validations are pre-verified.
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-xl p-4 premium-shadow"
                >
                  <h4 className="text-lg font-semibold text-foreground mb-4">Challan Status</h4>
                  <ReactApexChart
                    options={challanChartOptions}
                    series={challanChartSeries}
                    type="donut"
                    height={250}
                  />
                </motion.div>

                <div className="space-y-3">
                  {challans.map((challan, index) => (
                    <motion.div
                      key={challan.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="glass-card rounded-xl p-6 premium-shadow border border-border hover:border-primary/30 transition-all min-h-[220px] flex flex-col"
                    >
                      <div className="flex flex-col justify-between h-full flex-1 gap-4">
                        <div className="flex flex-col gap-2">
                          <h4 className="font-semibold text-lg text-foreground">{challan.title}</h4>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">
                              Amount: <span className="text-foreground font-medium text-base">₹{Number(challan.amount || 0).toLocaleString()}</span>
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Status: <span className={`font-medium ${challan.status === 'Ready' ? 'text-success' : 'text-warning'}`}>{challan.status}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row gap-2 mt-auto">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadReport(challan.title)}
                            className="px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap flex-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUploadToPortal}
                            className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors text-xs font-medium flex-1"
                          >
                            Upload to Portal
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-background min-h-screen p-4 sm:p-6">
      <Breadcrumb pageTitle="Statutory Compliance" rightContent={null} />


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Compliance Types Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-xl p-4 premium-shadow sticky top-6"
          >
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Compliance Types
            </h3>
            <div className="space-y-2">
              {complianceTypes.map((compliance, index) => {
                const Icon = compliance.icon;
                const colorClasses = getColorClasses(compliance.color);
                const isActive = activeCompliance === compliance.id;

                return (
                  <motion.button
                    key={compliance.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveCompliance(compliance.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left ${isActive
                      ? `${colorClasses.bg} ${colorClasses.text} border-2 ${colorClasses.border} shadow-md`
                      : "hover:bg-muted/50 border-2 border-transparent"
                      } ${compliance.highlighted ? "ring-2 ring-warning/50" : ""}`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? colorClasses.iconBg : "bg-muted"}`}>
                      <Icon className={`w-4 h-4 ${isActive ? colorClasses.text : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {compliance.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {compliance.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Selected Compliance Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCompliance}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`glass-card rounded-xl p-6 premium-shadow bg-gradient-to-r ${getColorClasses(selectedCompliance?.color || "blue").gradient} border ${getColorClasses(selectedCompliance?.color || "blue").border}`}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className={`p-3 rounded-xl ${getColorClasses(selectedCompliance?.color || "blue").iconBg} ${getColorClasses(selectedCompliance?.color || "blue").text}`}
                >
                  {selectedCompliance && (
                    <selectedCompliance.icon className="w-6 h-6" />
                  )}
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {selectedCompliance?.label}
                    {selectedCompliance?.highlighted && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="ml-2 px-2 py-0.5 bg-warning/20 text-warning text-xs font-semibold rounded-full"
                      >
                        Highlighted
                      </motion.span>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCompliance?.description}
                  </p>
                  {selectedOverview && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-foreground">
                        Status: {selectedOverview.status || "N/A"}
                      </span>
                      {typeof selectedOverview.employeesCovered === "number" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-foreground">
                          Covered: {selectedOverview.employeesCovered}
                        </span>
                      )}
                      {typeof selectedOverview.totalContribution === "number" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-foreground">
                          Total: ₹{Number(selectedOverview.totalContribution).toLocaleString()}
                        </span>
                      )}
                      {typeof selectedOverview.totalDeducted === "number" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-foreground">
                          Total: ₹{Number(selectedOverview.totalDeducted).toLocaleString()}
                        </span>
                      )}
                      {typeof selectedOverview.totalProvision === "number" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-foreground">
                          Total: ₹{Number(selectedOverview.totalProvision).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configure
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Feature Tabs */}
          <div className="glass-card rounded-xl premium-shadow">
            <div className="flex flex-wrap gap-2 border-b border-border px-4 sm:px-6 pt-4">
              {[
                { id: "calculation", label: "Auto-Calculation", icon: Calculator },
                { id: "registers", label: "Compliance Registers", icon: BookOpen },
                { id: "reports", label: "Reports", icon: FileBarChart },
                { id: "challan", label: "Challan Generation", icon: Download },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFeatureTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveFeatureTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${isActive
                      ? "border-primary text-primary bg-primary/10"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>

            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {renderFeatureContent()}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatutoryCompliancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <StatutoryComplianceContent />
    </Suspense>
  );
}
