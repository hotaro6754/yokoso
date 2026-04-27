// src/app/(dashboard)/hr/assets/reports/components/InventoryCharts.js
"use client";
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function InventoryCharts({ data }) {
  // Safely access data with fallbacks
  const byCategory = data?.byCategory || [];
  const byStatus = data?.byStatus || [];

  const categoryOptions = {
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: byCategory.map(item => item.category),
    legend: {
      position: 'bottom',
    },
    colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6366F1'],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + '%';
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Assets',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
  };

  // In the categorySeries definition, update to use count instead of value:
const categorySeries = byCategory.map(item => item.count);

  const statusOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: true,
      },
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
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: byStatus.map(item => item.status),
    },
    yaxis: {
      title: {
        text: 'Count',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + ' assets';
        },
      },
    },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  };

  const statusSeries = [
    {
      name: 'Assets',
      data: byStatus.map(item => item.count),
    },
  ];

  // Show loading state if data is not available
  if (!data || byCategory.length === 0 || byStatus.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assets by Category</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Loading chart data...
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assets by Status</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Loading chart data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assets by Category</h3>
        <Chart
          options={categoryOptions}
          series={categorySeries}
          type="donut"
          height={350}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assets by Status</h3>
        <Chart
          options={statusOptions}
          series={statusSeries}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
}