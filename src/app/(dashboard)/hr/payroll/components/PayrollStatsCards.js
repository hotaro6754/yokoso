// src/app/(dashboard)/hr/payroll/components/PayrollStatsCards.js
"use client";
import { IndianRupee, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function PayrollStatsCards() {
  const [statsData, setStatsData] = useState({
    totalPayroll: 0,
    employeesPaid: 0,
    pendingPayments: 0,
    averageSalary: 0,
    totalGrowth: 0,
    employeesGrowth: 0,
    pendingGrowth: 0,
    salaryGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getDashboardStats();
        setStatsData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching payroll stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-sm mb-6 text-left border border-red-100 dark:border-red-900/50">
        <p className="text-red-600 dark:text-red-400 text-sm font-medium">Error loading payroll stats: {error}</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Payroll",
      value: payrollService.formatCurrency(statsData.totalPayroll),
      icon: IndianRupee,
      iconBg: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      growth: statsData.totalGrowth || 0,
      growthColor: (statsData.totalGrowth || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      hoverEffect: "hover:border-green-200 dark:hover:border-green-800"
    },
    {
      title: "Employees Paid",
      value: statsData.employeesPaid,
      icon: Users,
      iconBg: "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400",
      growth: statsData.employeesGrowth || 0,
      growthColor: (statsData.employeesGrowth || 0) >= 0 ? "text-brand-600 dark:text-brand-400" : "text-red-600 dark:text-red-400",
      hoverEffect: "hover:border-brand-200 dark:hover:border-brand-800"
    },
    {
      title: "Pending Payments",
      value: statsData.pendingPayments,
      icon: Clock,
      iconBg: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
      growth: statsData.pendingGrowth || 0,
      growthColor: (statsData.pendingGrowth || 0) <= 0 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400",
      hoverEffect: "hover:border-orange-200 dark:hover:border-orange-800"
    },
    {
      title: "Average Salary",
      value: payrollService.formatCurrency(statsData.averageSalary),
      icon: CheckCircle,
      iconBg: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      growth: statsData.salaryGrowth || 0,
      growthColor: (statsData.salaryGrowth || 0) >= 0 ? "text-purple-600 dark:text-purple-400" : "text-red-600 dark:text-red-400",
      hoverEffect: "hover:border-purple-200 dark:hover:border-purple-800"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`group rounded-sm border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 ${card.hoverEffect}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-full ${card.iconBg}`}>
              <card.icon className="h-5 w-5" />
            </div>
            {card.growth !== 0 && (
              <div className={`flex items-center text-xs font-bold ${card.growthColor} bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-sm`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${card.growth < 0 ? 'rotate-180' : ''}`} />
                {card.growth > 0 ? '+' : ''}{card.growth}%
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {card.title}
            </p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {card.value}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}
