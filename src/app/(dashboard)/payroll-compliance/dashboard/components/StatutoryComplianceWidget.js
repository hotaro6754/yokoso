"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle2, AlertCircle, Clock, Loader2, ArrowRight } from "lucide-react";
import dynamic from 'next/dynamic';
import Link from "next/link";

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function StatutoryComplianceWidget({ data }) {
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "COMPLIANT":
      case "ON_TRACK":
        return {
          label: "Compliant",
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-500/10",
          borderColor: "border-green-200 dark:border-green-500/20",
        };
      case "PENDING_SETUP":
        return {
          label: "Pending",
          icon: <Clock className="w-4 h-4" />,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-500/10",
          borderColor: "border-blue-200 dark:border-blue-500/20",
        };
      case "NO_ELIGIBLE_EMPLOYEES":
        return {
          label: "No Eligible Employees",
          icon: <Shield className="w-4 h-4" />,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-700",
          borderColor: "border-gray-200 dark:border-gray-600",
        };
      case "WARNING":
        return {
          label: "Warning",
          icon: <AlertCircle className="w-4 h-4" />,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-500/10",
          borderColor: "border-amber-200 dark:border-amber-500/20",
        };
      case "OVERDUE":
        return {
          label: "Overdue",
          icon: <AlertCircle className="w-4 h-4" />,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-500/10",
          borderColor: "border-red-200 dark:border-red-500/20",
        };
      default:
        return {
          label: "Pending",
          icon: <Clock className="w-4 h-4" />,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-700",
          borderColor: "border-gray-200 dark:border-gray-600",
        };
    }
  };

  const complianceSource = data?.statutoryCompliance || data?.compliance || data || {};
  const getStatusValue = (value) =>
    typeof value === "string" ? value : value?.status || "PENDING_SETUP";

  const complianceItems = [
    {
      name: "PF Calculation",
      id: "pf",
      status: getStatusValue(complianceSource?.pf),
      description: "Provident Fund",
      href: "/payroll-compliance/statutory-compliance?type=pf"
    },
    {
      name: "Gratuity Status",
      id: "gratuity",
      status: getStatusValue(complianceSource?.gratuity),
      description: "Gratuity calculations",
      href: "/payroll-compliance/statutory-compliance?type=gratuity"
    },
    {
      name: "ESI Calculation",
      id: "esi",
      status: getStatusValue(complianceSource?.esi),
      description: "Employee State Insurance",
      href: "/payroll-compliance/statutory-compliance?type=esi"
    },
    {
      name: "Professional Tax",
      id: "pt",
      status: getStatusValue(complianceSource?.pt),
      description: "Professional Tax",
      href: "/payroll-compliance/statutory-compliance?type=pt"
    },
    {
      name: "TDS Calculation",
      id: "tds",
      status: getStatusValue(complianceSource?.tds),
      description: "Tax Deducted at Source",
      href: "/payroll-compliance/statutory-compliance?type=tds"
    },
  ];

  const compliantCount = complianceItems.filter((item) => item.status === "COMPLIANT" || item.status === "ON_TRACK").length;

  const counts = {
    COMPLIANT: 0,
    PENDING: 0,
    WARNING: 0,
    OVERDUE: 0
  };

  complianceItems.forEach(item => {
    const status = item.status === "ON_TRACK" ? "COMPLIANT" : item.status;
    if (counts[status] !== undefined) {
      counts[status]++;
      return;
    }
    if (status === "NO_ELIGIBLE_EMPLOYEES" || status === "PENDING_SETUP") {
      counts.PENDING++;
      return;
    }
    counts.PENDING++;
  });

  const chartSeries = [counts.COMPLIANT, counts.PENDING, counts.WARNING + counts.OVERDUE];
  const chartLabels = ['Compliant', 'Pending', 'Action Needed'];
  const chartColors = ['#10b981', '#3b82f6', '#f59e0b'];

  const chartOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      toolbar: { show: false },
    },
    labels: chartLabels,
    colors: chartColors,
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: false,
            },
            value: {
              show: true,
              fontSize: '18px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: '#1f2937',
              offsetY: 0,
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '12px',
              fontFamily: 'inherit',
              fontWeight: 500,
              color: '#6b7280',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: false,
    },
    legend: {
      show: false
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: function (val) {
          return val + " Items"
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Statutory Compliance
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {compliantCount} / {complianceItems.length} Compliant
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Chart Section */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <ReactApexChart options={chartOptions} series={chartSeries} type="donut" width={160} />
        </div>

        {/* List Section */}
        <div className="flex-1 space-y-3">
          {complianceItems.map((item) => {
            const config = getStatusConfig(item.status);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor} transition-colors flex items-center justify-between group cursor-pointer hover:shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight group-hover:text-primary-600 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">{config.label}</p>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 ${config.color} transition-opacity`} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* {complianceItems.length > 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <span className="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors font-medium">
            View all {complianceItems.length} compliances
          </span>
        </div>
      )} */}
    </div>
  );
}
