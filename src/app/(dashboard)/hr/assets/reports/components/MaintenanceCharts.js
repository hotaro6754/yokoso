// src/app/(dashboard)/hr/assets/reports/components/MaintenanceCharts.js
"use client";
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function MaintenanceCharts({ data }) {
  // Safely access data with fallbacks
  const byCategory = data?.byCategory || [];
  const byMonth = data?.byMonth || [];

  const costByCategoryOptions = {
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
        text: 'Cost ($)',
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
    colors: ['#3B82F6'],
  };

  const costByCategorySeries = [
    {
      name: 'Maintenance Cost',
      data: byCategory.map(item => item.cost),
    },
  ];

  const monthlyCostOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: byMonth.map(item => item.month),
    },
    yaxis: {
      title: {
        text: 'Cost ($)',
      },
    },
    colors: ['#10B981'],
    markers: {
      size: 5,
    },
  };

  // In the monthlyCostSeries, ensure we handle the byMonth data correctly:
  const monthlyCostSeries = [
    {
      name: 'Monthly Cost',
      data: byMonth.map(item => item.cost || 0),
    },
  ];

  // Show loading state if data is not available
  if (!data || byCategory.length === 0 || byMonth.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Maintenance Costs by Category</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Loading chart data...
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Maintenance Costs</h3>
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Maintenance Costs by Category</h3>
        <Chart
          options={costByCategoryOptions}
          series={costByCategorySeries}
          type="bar"
          height={350}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Maintenance Costs</h3>
        <Chart
          options={monthlyCostOptions}
          series={monthlyCostSeries}
          type="line"
          height={350}
        />
      </div>
    </div>
  );
}