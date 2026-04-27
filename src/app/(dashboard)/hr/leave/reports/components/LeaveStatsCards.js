"use client";
import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { leaveReportsService } from '@/services/hr-services/leaveReports.service';

const LeaveStatsCards = ({ filters }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await leaveReportsService.getLeaveStats(filters);
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching leave stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filters]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Leaves',
      value: stats?.totalLeaves || 0,
      icon: <Calendar className="w-5 h-5" />,
      change: stats?.totalLeavesChange || '0%',
      trend: stats?.totalLeavesTrend || 'up',
      description: 'This period'
    },
    {
      title: 'Approved Leaves',
      value: stats?.approvedLeaves || 0,
      icon: <Users className="w-5 h-5" />,
      change: stats?.approvedLeavesChange || '0%',
      trend: stats?.approvedLeavesTrend || 'up',
      description: `${stats?.approvalRate || 0}% approval rate`
    },
    {
      title: 'Avg. Duration',
      value: `${stats?.averageLeaveDuration || 0} days`,
      icon: <Clock className="w-5 h-5" />,
      change: stats?.durationChange || '0',
      trend: stats?.durationTrend || 'down',
      description: 'Per leave request'
    },
    {
      title: 'Utilization Rate',
      value: `${stats?.leaveUtilization || 0}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      change: stats?.utilizationChange || '0%',
      trend: stats?.utilizationTrend || 'up',
      description: 'Of available leave days'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.description}</p>
            </div>
            <div className={`p-3 rounded-lg ${index === 0 ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' :
              index === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                index === 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              }`}>
              {card.icon}
            </div>
          </div>
          <div className={`flex items-center mt-3 text-xs ${card.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
            <span>{card.change}</span>
            <span className="ml-1">from previous period</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveStatsCards;
