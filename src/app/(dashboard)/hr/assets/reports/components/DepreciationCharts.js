// src/app/(dashboard)/hr/assets/reports/components/DepreciationCharts.js
"use client";
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DepreciationCharts({ data }) {
  // Safely access data with fallbacks
  const byCategory = data?.byCategory || [];
  const forecast = data?.forecast || [];

  const depreciationOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: byCategory.map(item => item.category),
    },
    yaxis: {
      title: {
        text: 'Depreciation ($)',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '$' + val;
        },
      },
    },
    colors: ['#8B5CF6'],
  };

  const depreciationSeries = [
    {
      name: 'Depreciation',
      data: byCategory.map(item => item.depreciation),
    },
  ];

  const forecastOptions = {
    chart: {
      type: 'line',
      height: 350,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: forecast.map(item => item.year),
    },
    yaxis: {
      title: {
        text: 'Value ($)',
      },
    },
    colors: ['#F59E0B'],
    markers: {
      size: 5,
    },
  };

  const forecastSeries = [
    {
      name: 'Asset Value',
      data: forecast.map(item => item.value),
    },
  ];

  // Show loading state if data is not available
  if (!data || byCategory.length === 0 || forecast.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Depreciation by Category</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Loading chart data...
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Asset Value Forecast</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Loading chart data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Depreciation by Category</h3>
        <Chart
          options={depreciationOptions}
          series={depreciationSeries}
          type="bar"
          height={350}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Asset Value Forecast</h3>
        <Chart
          options={forecastOptions}
          series={forecastSeries}
          type="line"
          height={350}
        />
      </div>
    </div>
  );
}