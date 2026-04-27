"use client";

import { Calendar, UserCheck, Clock, AlertCircle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { leaveRequestService } from '@/services/hr-services/leaveRequestService';

export default function LeaveRequestsStatsCards() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leave statistics
  const fetchLeaveStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await leaveRequestService.getLeaveStats();
      
      if (response.success && response.data) {
        console.log('leave res', response.data);
        setStatsData(response.data);
      } else {
        setError(response.message || 'Failed to fetch leave statistics');
      }
    } catch (err) {
      console.error('Error fetching leave stats:', err);
      setError(err.message || 'Failed to fetch leave statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      fetchLeaveStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Use mock data if API fails or no data
  const safeStatsData = statsData || {
    todayPresent: 0,
    totalEmployees: 0,
    todayLeaves: 0,
    unplannedLeaves: 0,
    pendingLeaves: 0,
    attendanceRate: 0
  };

  const cards = [
    {
      title: "Today's Attendance",
      value: `${safeStatsData.todayPresent}/${safeStatsData.totalEmployees}`,
      subtitle: "Present/Total Employees",
      icon: UserCheck,
      iconBg: "bg-gradient-to-r from-green-500 to-green-400",
      iconColor: "text-white",
      growth: safeStatsData.attendanceRate,
      growthText: `${safeStatsData.attendanceRate}% Attendance Rate`,
      trend: safeStatsData.attendanceRate >= 80 ? "up" : "down",
      growthColor: safeStatsData.attendanceRate >= 80 
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      cardBg: "bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900",
      hoverEffect: "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
      loading: loading,
      error: error && error.includes('attendance')
    },
    {
      title: "Today Leaves",
      value: safeStatsData.todayLeaves,
      subtitle: "Planned Time Off",
      icon: Calendar,
      iconBg: "bg-gradient-to-r from-blue-500 to-blue-400",
      iconColor: "text-white",
      growth: 0, // You can calculate this if you have historical data
      growthText: safeStatsData.todayLeaves > 0 ? "Leave today" : "No leaves today",
      trend: safeStatsData.todayLeaves > 0 ? "up" : "neutral",
      growthColor: safeStatsData.todayLeaves > 0 
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" 
        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
      cardBg: "bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900",
      hoverEffect: "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
      loading: loading,
      error: error && error.includes('today')
    },
    {
      title: "Unplanned Leaves",
      value: safeStatsData.unplannedLeaves,
      subtitle: "Emergency Time Off",
      icon: AlertCircle,
      iconBg: "bg-gradient-to-r from-red-500 to-red-400",
      iconColor: "text-white",
      growth: 0, // You can calculate this if you have historical data
      growthText: safeStatsData.unplannedLeaves > 0 ? "Unplanned leave" : "No unplanned leaves",
      trend: safeStatsData.unplannedLeaves > 0 ? "up" : "down",
      growthColor: safeStatsData.unplannedLeaves > 0 
        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" 
        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cardBg: "bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-gray-900",
      hoverEffect: "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
      loading: loading,
      error: error && error.includes('unplanned')
    },
    {
      title: "Pending Leaves",
      value: safeStatsData.pendingLeaves,
      subtitle: "Awaiting Approval",
      icon: Clock,
      iconBg: "bg-gradient-to-r from-yellow-500 to-yellow-400",
      iconColor: "text-white",
      growth: 0, // You can calculate this if you have historical data
      growthText: `${safeStatsData.pendingLeaves} requests pending`,
      trend: safeStatsData.pendingLeaves > 0 ? "up" : "neutral",
      growthColor: safeStatsData.pendingLeaves > 0 
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" 
        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
      cardBg: "bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-gray-900",
      hoverEffect: "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
      loading: loading,
      error: error && error.includes('pending')
    }
  ];

  if (loading && !statsData) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[1, 2, 3, 4].map((_, index) => (
          <div 
            key={index}
            className="rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-800 animate-pulse"
          >
            <div className="flex items-center">
              <div className="rounded-sm sm:rounded-sm p-2 sm:p-3 mr-3 sm:mr-4 bg-gray-200 dark:bg-gray-700 w-12 h-12"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !statsData) {
    return (
      <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error loading leave statistics: {error}</span>
          <button 
            onClick={fetchLeaveStats}
            className="ml-auto text-sm font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6 cursor-pointer ${card.cardBg} ${card.hoverEffect}`}
          onClick={card.error ? fetchLeaveStats : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center overflow-hidden">
              <div className={`${card.iconBg} rounded-sm sm:rounded-sm p-2 sm:p-3 mr-3 sm:mr-4 shadow-md`}>
                {card.loading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white animate-spin" />
                ) : (
                  <card.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] xs:text-xs font-semibold text-gray-600 dark:text-gray-300 mb-0.5 xs:mb-1 uppercase tracking-wide truncate">
                  {card.title}
                </p>
                <h4 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
                  {card.loading ? '...' : card.value}
                </h4>
                <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {card.loading ? 'Loading...' : card.subtitle}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center mt-2 sm:mt-4">
            {!card.loading && (
              <>
                <span className={`${card.growthColor} text-[10px] xs:text-xs font-medium px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full flex items-center`}>
                  {card.trend === 'up' ? (
                    <TrendingUp className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-0.5 xs:mr-1" />
                  ) : card.trend === 'down' ? (
                    <TrendingDown className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-0.5 xs:mr-1" />
                  ) : null}
                  {card.growth > 0 ? '+' : ''}{card.growth}%
                </span>
                <span className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 ml-1 xs:ml-2 truncate">
                  {card.growthText}
                </span>
              </>
            )}
          </div>
          {card.error && (
            <div className="mt-2 text-[10px] text-red-600 dark:text-red-400">
              Error loading data. Click to retry.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}