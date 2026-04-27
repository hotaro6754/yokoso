// src/app/(dashboard)/company-admin/dashboard/components/ApiUsage.js (served via middleware rewrite)
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const ApiUsage = () => {
  const [apiMetrics, setApiMetrics] = useState([]);
  const [usageStats, setUsageStats] = useState({
    totalRequests: 12470,
    successRate: 98.2,
    averageLatency: 142,
    errorRate: 1.8
  });

  useEffect(() => {
    // Mock API usage data
    const mockData = [
      { endpoint: '/api/users', requests: 2450, errors: 12, latency: 120, successRate: 99.5 },
      { endpoint: '/api/employees', requests: 1870, errors: 8, latency: 95, successRate: 99.6 },
      { endpoint: '/api/attendance', requests: 1560, errors: 15, latency: 210, successRate: 99.0 },
      { endpoint: '/api/payroll', requests: 980, errors: 5, latency: 180, successRate: 99.5 },
      { endpoint: '/api/reports', requests: 760, errors: 3, latency: 320, successRate: 99.6 },
      { endpoint: '/api/auth', requests: 3120, errors: 45, latency: 85, successRate: 98.6 }
    ];
    setApiMetrics(mockData);
  }, []);

  const getSuccessRateColor = (rate) => {
    if (rate >= 99) return 'text-green-600';
    if (rate >= 97) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatencyColor = (latency) => {
    if (latency <= 100) return 'text-green-600';
    if (latency <= 200) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 overflow-hidden">
      <div className="card-header px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h5 className="text-base font-semibold text-gray-800 dark:text-white">
          Usage Overview
        </h5>
        <Link
          href="/company-admin/security-audit-logs"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Details
        </Link>
      </div>

      <div className="card-body p-4">
        {/* API Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Total Requests', value: usageStats.totalRequests.toLocaleString(), icon: '📊', color: 'text-blue-600' },
            { label: 'Success Rate', value: `${usageStats.successRate}%`, icon: '✅', color: getSuccessRateColor(usageStats.successRate) },
            { label: 'Avg Latency', value: `${usageStats.averageLatency}ms`, icon: '⏱️', color: getLatencyColor(usageStats.averageLatency) },
            { label: 'Error Rate', value: `${usageStats.errorRate}%`, icon: '❌', color: 'text-red-600' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-sm mb-1">{stat.icon}</div>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* API Usage Chart */}
        <div className="mb-4">
          <h6 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
            Requests by Endpoint
          </h6>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apiMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="endpoint" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value) => [value, 'Requests']}
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="requests" radius={[4, 4, 0, 0]}>
                  {apiMetrics.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.successRate >= 99 ? '#10b981' : entry.successRate >= 97 ? '#f59e0b' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Endpoints */}
        <div className="space-y-2">
          <h6 className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Top Endpoints
          </h6>
          {apiMetrics.slice(0, 3).map((api, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {api.endpoint}
              </span>
              <div className="flex items-center space-x-4">
                <span className={getSuccessRateColor(api.successRate)}>
                  {api.successRate}%
                </span>
                <span className={getLatencyColor(api.latency)}>
                  {api.latency}ms
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {api.requests} req
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex space-x-2">
          <button className="flex-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs py-2 px-3 rounded border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/30">
            API Docs
          </button>
          <button className="flex-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs py-2 px-3 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/30">
            Monitor
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiUsage;