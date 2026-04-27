'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function OnboardingDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    newTrialSignups: 0,
    trialsExpiring: 0,
    conversionRate: 0,
    pendingActions: 0
  });
  const [expiringTrials, setExpiringTrials] = useState([]);
  const [pendingFlows, setPendingFlows] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch Dashboard Stats (reusing master-admin dashboard stats for consistency)
      const statsResponse = await apiClient.get('/master-admin/dashboard/stats');
      const flowsResponse = await apiClient.get('/master-admin/onboarding-flow?limit=5');

      if (statsResponse.data.success) {
        const dashboardData = statsResponse.data.data;
        
        // Calculate New Signups (e.g., from weekly data or total)
        // For now using total companies count or growth trend if available
        // Assuming weeklyData is cumulative, last element is current total.
        const weeklyData = dashboardData.weeklyData || [];
        const currentTotal = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : 0;
        const previousTotal = weeklyData.length > 1 ? weeklyData[weeklyData.length - 2] : 0;
        const newSignups = Math.max(0, currentTotal - previousTotal) || 0; // Daily growth

        setExpiringTrials(dashboardData.expiringTrials || []);
        
        setStats(prev => ({
          ...prev,
          newTrialSignups: newSignups, // Using daily growth as proxy for "New"
          trialsExpiring: dashboardData.expiringTrials?.length || 0,
          // Conversion rate is not directly available, keeping default or calculating if possible
        }));
      }

      if (flowsResponse.data.success) {
        const flows = flowsResponse.data.flows || [];
        setPendingFlows(flows.filter(f => f.status !== 'COMPLETED'));
        
        setStats(prev => ({
          ...prev,
          pendingActions: flows.filter(f => f.status !== 'COMPLETED').length
        }));
      }

    } catch (error) {
      console.error('Failed to fetch onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dashboardStats = [
    { 
      label: 'New Trial Signups (Today)', 
      value: stats.newTrialSignups, 
      change: 'Daily', 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Trials Expiring Soon', 
      value: stats.trialsExpiring, 
      change: 'Alert', 
      icon: Clock, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Trial → Paid Conversion', 
      value: '0%', // Placeholder
      change: 'N/A', 
      icon: TrendingUp, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Pending Actions', 
      value: stats.pendingActions, 
      change: 'To Do', 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-50' 
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding Overview</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track trial performance, conversions, and pending onboarding tasks.
            </p>
          </div>
          <Link
            href="/master-admin/onboarding-flow/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
          >
            <Plus size={20} />
            <span className="font-semibold text-sm">New Onboarding</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                        String(stat.change).includes('+') || String(stat.change).includes('%') ? 'bg-green-100 text-green-700' :
                        String(stat.change).includes('Alert') ? 'bg-orange-100 text-orange-700' : 
                        String(stat.change).includes('Daily') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trials Expiring Soon */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="text-orange-500" size={18} />
                Trials Expiring Soon
              </h3>
              <Link href="/master-admin/company" className="text-xs font-bold text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {expiringTrials.length > 0 ? (
                    expiringTrials.map((trial) => (
                      <tr key={trial.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="p-5">
                          <div className="font-bold text-gray-900 dark:text-white mb-0.5">{trial.name || trial.company}</div>
                          <div className="text-xs text-gray-400">Trial Plan</div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <div className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-bold">
                              {trial.daysLeft} Days Left
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="p-8 text-center text-gray-500">No trials expiring soon.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Onboarding Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="text-blue-500" size={18} />
                Pending Actions ({pendingFlows.length})
              </h3>
              <Link href="/master-admin/onboarding-flow/list" className="text-xs font-bold text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            <div className="flex-1 overflow-auto max-h-[400px]">
              {pendingFlows.length > 0 ? (
                pendingFlows.map((flow) => (
                  <div key={flow.id} className="p-5 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        flow.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {flow.status || 'In Progress'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">Progress: {flow.progress}%</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {flow.companyName || 'Unknown Company'}
                    </h4>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Onboarding Flow</span>
                      <Link href={`/master-admin/onboarding-flow/${flow.id}`} className="flex items-center gap-1 text-primary-600 hover:underline font-medium text-xs">
                        Continue <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No pending actions.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}