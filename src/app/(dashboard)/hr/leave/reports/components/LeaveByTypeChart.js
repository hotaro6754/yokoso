"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { leaveReportsService } from '@/services/hr-services/leaveReports.service';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const LeaveByTypeChart = ({ filters }) => {
  const [leaveData, setLeaveData] = useState({ labels: [], series: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveByType = async () => {
      try {
        setLoading(true);
        const response = await leaveReportsService.getLeaveByType(filters);
        setLeaveData({
          labels: response.data?.labels || [],
          series: response.data?.series || []
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching leave by type:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveByType();
  }, [filters]);

  // Chart options
  const chartOptions = {
    chart: {
      type: 'donut',
      height: 350
    },
    colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'],
    labels: leaveData.labels,
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Leaves',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return opts.w.globals.labels[opts.seriesIndex] + ': ' + val.toFixed(1) + '%';
      },
      dropShadow: {
        enabled: false
      }
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: '#6b7280'
      }
    },
    tooltip: {
      y: {
        formatter: function (value, { seriesIndex, w }) {
          return value + ' leaves';
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
        Leave Distribution by Type
      </h3>
      {error ? (
        <div className="text-red-600 dark:text-red-400 p-4">Error loading data: {error}</div>
      ) : (
        <Chart
          options={chartOptions}
          series={leaveData.series}
          type="donut"
          height={350}
        />
      )}
    </div>
  );
};

export default LeaveByTypeChart;
