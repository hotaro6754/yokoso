// src/app/(dashboard)/company-admin/dashboard/components/SecurityOverview.js (served via middleware rewrite)
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const SecurityOverview = () => {
  const [securityMetrics, setSecurityMetrics] = useState({
    failedLogins: 12,
    firewallBlocks: 8,
    suspiciousActivities: 3,
    passwordChanges: 5
  });

  const [threatLevel, setThreatLevel] = useState('low');
  const [lastScan, setLastScan] = useState('2024-01-15T10:30:00');

  useEffect(() => {
    // Simulate security data updates
    const interval = setInterval(() => {
      setSecurityMetrics(prev => ({
        failedLogins: Math.max(0, prev.failedLogins + Math.floor(Math.random() * 3 - 1)),
        firewallBlocks: Math.max(0, prev.firewallBlocks + Math.floor(Math.random() * 2)),
        suspiciousActivities: Math.max(0, prev.suspiciousActivities + Math.floor(Math.random() * 2 - 1)),
        passwordChanges: prev.passwordChanges + Math.floor(Math.random() * 2)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getThreatLevelColor = () => {
    switch(threatLevel) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getThreatLevelText = () => {
    switch(threatLevel) {
      case 'high': return 'High Threat';
      case 'medium': return 'Medium Threat';
      case 'low': return 'Low Threat';
      default: return 'Unknown';
    }
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 overflow-hidden">
      <div className="card-header px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h5 className="text-base font-semibold text-gray-800 dark:text-white">
          Security Overview
        </h5>
        <Link
          href="/company-admin/security-audit-logs"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Logs
        </Link>
      </div>

      <div className="card-body p-4">
        {/* Threat Level Indicator */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-2">
            <div className={`w-2 h-2 rounded-full ${getThreatLevelColor()} mr-2`}></div>
            {getThreatLevelText()}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Last scan: {new Date(lastScan).toLocaleString()}
          </p>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Failed Logins', value: securityMetrics.failedLogins, icon: '🔒', color: 'text-red-600' },
            { label: 'Firewall Blocks', value: securityMetrics.firewallBlocks, icon: '🛡️', color: 'text-yellow-600' },
            { label: 'Suspicious Activities', value: securityMetrics.suspiciousActivities, icon: '⚠️', color: 'text-orange-600' },
            { label: 'Password Changes', value: securityMetrics.passwordChanges, icon: '🔑', color: 'text-green-600' }
          ].map((metric, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-1">{metric.icon}</div>
              <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Security Recommendations */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <h6 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            🔒 Security Recommendations
          </h6>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Enable 2FA for all admin accounts</li>
            <li>• Review failed login attempts</li>
            <li>• Update SSL certificates</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex space-x-2">
          <button className="flex-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs py-2 px-3 rounded border border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/30">
            Run Security Scan
          </button>
          <button className="flex-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs py-2 px-3 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/30">
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityOverview;