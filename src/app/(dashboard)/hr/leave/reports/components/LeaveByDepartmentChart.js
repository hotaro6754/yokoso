"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { leaveReportsService } from '@/services/hr-services/leaveReports.service';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const LeaveByDepartmentChart = ({ filters }) => {
  const [deptData, setDeptData] = useState({ categories: [], series: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeptData = async () => {
      try {
        setLoading(true);
        const response = await leaveReportsService.getLeaveByDepartment(filters);
        setDeptData({
          categories: response.data?.categories || [],
          series: response.data?.series || []
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching leave by department:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeptData();
  }, [filters]);

  // Chart options
  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    colors: ['#3b82f6', '#10b981'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        borderRadiusApplication: 'end'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: deptData.categories,
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Leaves',
        style: {
          color: '#6b7280',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    fill: {
      opacity: 1
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#6b7280'
      }
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex }) {
          if (seriesIndex === 0) {
            return val + ' leaves';
          } else {
            return val + '% utilization';
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Leave by Department
      </h3>
      {error ? (
        <div className="text-red-600 dark:text-red-400 p-4">Error loading data: {error}</div>
      ) : (
        <Chart
          options={chartOptions}
          series={deptData.series}
          type="bar"
          height={350}
        />
      )}
    </div>
  );
};

export default LeaveByDepartmentChart;
