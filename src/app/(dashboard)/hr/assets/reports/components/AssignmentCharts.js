// src/app/(dashboard)/hr/assets/reports/components/AssignmentCharts.js
"use client";
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AssignmentCharts({ data }) {
  // Safely access data with fallbacks
  const byDepartment = data?.byDepartment || [];
  const byMonth = data?.byMonth || [];

  const departmentOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: byDepartment.map(item => item.department),
    },
    yaxis: {
      title: {
        text: 'Assignments',
      },
    },
    fill: {
      opacity: 1,
    },
    colors: ['#3B82F6'],
  };

  const departmentSeries = [
    {
      name: 'Assignments',
      data: byDepartment.map(item => item.count),
    },
  ];

  const monthlyActivityOptions = {
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
        text: 'Count',
      },
    },
    colors: ['#10B981', '#EF4444'],
    markers: {
      size: 5,
    },
  };

  const monthlyActivitySeries = [
    {
      name: 'Assignments',
      data: byMonth.map(item => item.assignments),
    },
    {
      name: 'Returns',
      data: byMonth.map(item => item.returns),
    },
  ];

  // Show loading state if data is not available
  if (!data || byDepartment.length === 0 || byMonth.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assignments by Department</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Loading chart data...
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Assignment Activity</h3>
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assignments by Department</h3>
        <Chart
          options={departmentOptions}
          series={departmentSeries}
          type="bar"
          height={350}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Assignment Activity</h3>
        <Chart
          options={monthlyActivityOptions}
          series={monthlyActivitySeries}
          type="line"
          height={350}
        />
      </div>
    </div>
  );
}