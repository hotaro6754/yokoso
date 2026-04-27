// src/app/(dashboard)/company-admin/dashboard/components/SystemHealth.js (served via middleware rewrite)
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const SystemHealth = () => {
  const [systemStatus, setSystemStatus] = useState({
    server: 'online',
    database: 'online',
    cache: 'degraded',
    storage: 'online'
  });

  const [metrics, setMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 52,
    networkLatency: 28
  });

  useEffect(() => {
    // Simulate live data updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpuUsage: Math.min(100, Math.max(5, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.min(100, Math.max(10, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        diskUsage: Math.min(100, Math.max(20, prev.diskUsage + (Math.random() - 0.3) * 4)),
        networkLatency: Math.min(100, Math.max(10, prev.networkLatency + (Math.random() - 0.5) * 8))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUsageColor = (usage) => {
    if (usage > 80) return 'text-red-600';
    if (usage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 overflow-hidden">
      <div className="card-header px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h5 className="text-base font-semibold text-gray-800 dark:text-white">
          Operational Health
        </h5>
        <Link
          href="/company-admin/security-audit-logs"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Logs
        </Link>
      </div>

      <div className="card-body p-4">
        {/* Service Status */}
        <div className="mb-6">
          <h6 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
            Core Services
          </h6>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(systemStatus).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {service}
                </span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} mr-2`}></div>
                  <span className="text-xs font-medium capitalize">{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div>
          <h6 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
            Live Metrics
          </h6>
          <div className="space-y-3">
            {[
              { label: 'CPU Usage', value: metrics.cpuUsage, unit: '%' },
              { label: 'Memory Usage', value: metrics.memoryUsage, unit: '%' },
              { label: 'Disk Usage', value: metrics.diskUsage, unit: '%' },
              { label: 'Network Latency', value: metrics.networkLatency, unit: 'ms' }
            ].map((metric, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>{metric.label}</span>
                  <span className={getUsageColor(metric.value)}>
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.value > 80 ? 'bg-red-500' : 
                      metric.value > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;