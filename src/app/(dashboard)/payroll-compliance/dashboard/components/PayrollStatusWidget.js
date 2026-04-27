"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function PayrollStatusWidget({ data }) {
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

  const status = data?.status || "NOT_STARTED";
  const processedCount = data?.employeesProcessed || 0;
  const totalEmployees = data?.totalEmployees || 0;
  const progressPercentage = totalEmployees > 0 ? (processedCount / totalEmployees) * 100 : 0;

  const getStatusConfig = (status) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "Completed",
          icon: <CheckCircle2 className="w-5 h-5" />,
          color: "#10b981",
          bgColor: "bg-green-100 dark:bg-green-500/20",
          textColor: "text-green-600 dark:text-green-400",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          icon: <Clock className="w-5 h-5" />,
          color: "#070C8A",
          bgColor: "bg-primary-100 dark:bg-primary-500/20",
          textColor: "text-primary-600 dark:text-primary-400",
        };
      default:
        return {
          label: "Not Started",
          icon: <XCircle className="w-5 h-5" />,
          color: "#6b7280",
          bgColor: "bg-gray-100 dark:bg-gray-700",
          textColor: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  const chartOptions = {
    chart: {
      type: 'radialBar',
      offsetY: -10,
      toolbar: { show: false },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e5e7eb",
          strokeWidth: '97%',
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false
          },
          value: {
            offsetY: -2,
            fontSize: '20px',
            fontWeight: 600,
            formatter: function (val) {
              return Math.round(val) + "%";
            }
          }
        },
        hollow: {
          size: "65%"
        }
      }
    },
    fill: {
      type: 'solid',
      colors: [statusConfig.color]
    },
    labels: ['Progress'],
    stroke: {
      lineCap: 'round'
    },
  };

  const chartSeries = [progressPercentage];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg ${statusConfig.bgColor} flex items-center justify-center ${statusConfig.textColor}`}>
          {statusConfig.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Payroll Status</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Current Month</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {processedCount}
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium ml-1">/ {totalEmployees}</span>
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium mt-1">Employees Processed</span>
          </div>

          <div className="flex items-center gap-1.5 mt-4 bg-primary-50 dark:bg-primary-500/10 w-fit px-3 py-1.5 rounded-full border border-primary-200 dark:border-primary-500/20">
            <div className={`w-2 h-2 rounded-full ${statusConfig.textColor.replace('text-', 'bg-')}`}></div>
            <span className={`text-xs font-medium ${statusConfig.textColor}`}>{statusConfig.label}</span>
          </div>
        </div>

        <div className="h-32 flex items-center justify-center -mr-4">
          <ReactApexChart options={chartOptions} series={chartSeries} type="radialBar" height={180} />
        </div>
      </div>
    </div>
  );
}
