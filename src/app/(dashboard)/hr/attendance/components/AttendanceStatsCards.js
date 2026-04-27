"use client";

import { Users, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AttendanceStatsCards({ selectedDate, statsData, loading = false }) {
  // Default stats
  const defaultStats = {
    totalEmployees: 0,
    presentEmployees: 0,
    absentEmployees: 0,
    lateEmployees: 0,
    attendanceRate: 0
  };

  const currentStats = statsData || defaultStats;

  const cards = [
    {
      title: "Total Employees",
      value: currentStats.totalEmployees,
      icon: Users,
      iconBg: "bg-gradient-to-r from-gray-800 to-gray-600",
      iconColor: "text-white",
      cardBg: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
      hoverEffect: "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
      description: "Total workforce count"
    },
    {
      title: "Present Today",
      value: currentStats.presentEmployees,
      icon: UserCheck,
      iconBg: "bg-gradient-to-r from-green-500 to-green-400",
      iconColor: "text-white",
      cardBg: "bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900",
      hoverEffect: "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
      description: "Employees marked present"
    },
    {
      title: "Absent Today",
      value: currentStats.absentEmployees,
      icon: UserX,
      iconBg: "bg-gradient-to-r from-red-500 to-red-400",
      iconColor: "text-white",
      cardBg: "bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-gray-900",
      hoverEffect: "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
      description: "Employees not present"
    },
    {
      title: "Late Arrivals",
      value: currentStats.lateEmployees,
      icon: Clock,
      iconBg: "bg-gradient-to-r from-yellow-500 to-yellow-400",
      iconColor: "text-white",
      cardBg: "bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-gray-900",
      hoverEffect: "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
      description: "Employees arrived late"
    }
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center overflow-hidden">
                  <div className="rounded-lg sm:rounded-xl p-2 sm:p-3 mr-3 sm:mr-4 bg-gray-200 dark:bg-gray-700 w-10 h-10"></div>
                  <div className="overflow-hidden">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Date Display */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Attendance Overview for {formatDate(selectedDate)}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {selectedDate.toDateString() === new Date().toDateString() 
            ? "Today's attendance records" 
            : "Past attendance data"}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6 cursor-pointer ${card.cardBg} ${card.hoverEffect}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center overflow-hidden">
                <div className={`${card.iconBg} rounded-lg sm:rounded-xl p-2 sm:p-3 mr-3 sm:mr-4 shadow-md`}>
                  <card.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] xs:text-xs font-semibold text-gray-600 dark:text-gray-300 mb-0.5 xs:mb-1 uppercase tracking-wide truncate">
                    {card.title}
                  </p>
                  <h4 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
                    {card.value.toLocaleString()}
                  </h4>
                  <p className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}