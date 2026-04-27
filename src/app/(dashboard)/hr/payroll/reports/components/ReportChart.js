// src/app/(dashboard)/hr/payroll/reports/components/ReportChart.js
"use client";
import { useEffect, useRef } from 'react';
import { BarChart3, Download } from 'lucide-react';
import {
  Chart as ChartJS,
  registerables
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(...registerables);

const ReportChart = ({ title, type, data }) => {
  const chartRef = useRef(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#6B7280'
        }
      }
    },
    scales: type === 'line' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    } : {},
  };

  const handleDownloadChart = () => {
    if (chartRef.current) {
      const imageUrl = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
        <button
          onClick={handleDownloadChart}
          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
          title="Download Chart"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="h-64">
        <Chart
          ref={chartRef}
          type={type}
          data={data}
          options={options}
        />
      </div>
    </div>
  );
};

export default ReportChart;