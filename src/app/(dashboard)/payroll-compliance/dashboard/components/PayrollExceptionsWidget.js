"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Calendar, UserCheck, Pause, Loader2, ExternalLink, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function PayrollExceptionsWidget({ data }) {
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

  const exceptions = [
    {
      type: "missingAttendance",
      label: "Missing Attendance",
      count: data?.missingAttendance || 0,
      icon: <Calendar className="w-4 h-4" />,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
      borderColor: "border-amber-200 dark:border-amber-500/20",
      href: "/payroll-compliance/timesheet-approvals",
    },
    {
      type: "missingSalaryStructure",
      label: "Missing Salary",
      count: data?.missingSalaryStructure || 0,
      icon: <UserCheck className="w-4 h-4" />,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-500/10",
      borderColor: "border-red-200 dark:border-red-500/20",
      href: "/payroll-compliance/salary-structure",
    },
    {
      type: "onHoldEmployees",
      label: "On-Hold",
      count: data?.onHoldEmployees || 0,
      icon: <Pause className="w-4 h-4" />,
      color: "text-secondary-600 dark:text-secondary-400",
      bgColor: "bg-secondary-50 dark:bg-secondary-500/10",
      borderColor: "border-secondary-200 dark:border-secondary-500/20",
      href: "/payroll-compliance/payroll-processing", // Fallback to processing or employee list
    },
  ];

  const totalExceptions = exceptions.reduce((sum, ex) => sum + ex.count, 0);

  const chartSeries = [{
    name: 'Exceptions',
    data: exceptions.map(ex => ex.count)
  }];

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: '40%',
        margin: 5,
        distributed: true
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#ffffff'],
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'inherit'
      },
      formatter: function (val) {
        return val > 0 ? val : ''
      },
      offsetX: 0,
    },
    xaxis: {
      categories: exceptions.map(ex => ex.label),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    grid: {
      show: false,
    },
    colors: ['#f59e0b', '#ef4444', '#3032AD'],
    legend: { show: false },
    tooltip: {
      theme: 'light',
      y: {
        formatter: function (val) {
          return val + ' exceptions'
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Payroll Exceptions</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Requires attention</p>
        </div>
        {totalExceptions > 0 && (
          <div className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold">
            {totalExceptions}
          </div>
        )}
      </div>

      {/* Chart */}
      {totalExceptions > 0 && (
        <div className="mb-4 h-32 -ml-2">
          <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height="100%" />
        </div>
      )}

      <div className="space-y-3">
        {exceptions.map((exception) => (
          exception.count > 0 && (
            <Link
              href={exception.href}
              key={exception.type}
              className={`p-3 rounded-lg border ${exception.borderColor} ${exception.bgColor} hover:opacity-80 transition-all flex items-center justify-between group`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${exception.bgColor} ${exception.color}`}>
                  {exception.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {exception.label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {exception.count} Affected
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </Link>
          )
        ))}

        {totalExceptions === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 dark:text-green-400 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">All clear! No exceptions found.</p>
          </div>
        )}

        {totalExceptions > 0 && (
          <Link
            href="/payroll-compliance/payroll-processing"
            className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Review All Exceptions
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
