// src/app/(dashboard)/company-admin/dashboard/components/AuditLogs.js (served via middleware rewrite)
"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { auditLogService } from "@/services/super-admin-services/audit-log.service";

const AuditLogs = () => {
  const [recentLogs, setRecentLogs] = useState([]);
  const [logStats, setLogStats] = useState({
    total: 0,
    today: 0,
    critical: 0,
    warnings: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Fetch recent logs (last 5 for dashboard)
      const recentResponse = await auditLogService.getAllLogs({
        page: 1,
        limit: 5
      });

      // Fetch total count
      const totalResponse = await auditLogService.getAllLogs({
        page: 1,
        limit: 1
      });

      // Fetch today's logs count
      const todayResponse = await auditLogService.getAllLogs({
        page: 1,
        limit: 1,
        startDate: today.toISOString(),
        endDate: todayEnd.toISOString()
      });

      // Fetch DELETE actions (critical)
      const criticalResponse = await auditLogService.getAllLogs({
        page: 1,
        limit: 1,
        action: 'DELETE'
      });

      // Fetch warnings (could be REJECT actions or other warning-level actions)
      const warningsResponse = await auditLogService.getAllLogs({
        page: 1,
        limit: 1,
        action: 'REJECT'
      });

      if (recentResponse.success && recentResponse.data) {
        // Transform backend logs to component format
        const transformedLogs = recentResponse.data.map((log) => {
          const timeAgo = getTimeAgo(log.createdAt);
          const level = getActionLevel(log.action);
          const type = getModuleType(log.module);

          return {
            id: log.id,
            type: type,
            level: level,
            message: log.description || `${log.action} in ${log.module}`,
            timestamp: timeAgo,
            user: log.userName || log.user?.email || 'System',
            action: log.action,
            module: log.module
          };
        });

        setRecentLogs(transformedLogs);
      }

      // Update stats
      if (totalResponse.success && totalResponse.pagination) {
        setLogStats(prev => ({
          ...prev,
          total: totalResponse.pagination.total || 0
        }));
      }

      if (todayResponse.success && todayResponse.pagination) {
        setLogStats(prev => ({
          ...prev,
          today: todayResponse.pagination.total || 0
        }));
      }

      if (criticalResponse.success && criticalResponse.pagination) {
        setLogStats(prev => ({
          ...prev,
          critical: criticalResponse.pagination.total || 0
        }));
      }

      if (warningsResponse.success && warningsResponse.pagination) {
        setLogStats(prev => ({
          ...prev,
          warnings: warningsResponse.pagination.total || 0
        }));
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      // Keep default/empty state on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Helper function to get time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Map action to level
  const getActionLevel = (action) => {
    switch (action) {
      case 'DELETE':
      case 'REJECT':
        return 'high';
      case 'UPDATE':
      case 'APPROVE':
        return 'medium';
      case 'CREATE':
      case 'LOGIN':
      case 'LOGOUT':
        return 'low';
      default:
        return 'medium';
    }
  };

  // Map module to type
  const getModuleType = (module) => {
    switch (module) {
      case 'AUTH':
        return 'security';
      case 'USER':
      case 'ROLE':
        return 'user';
      case 'COMPANY':
      case 'WORKFLOW':
        return 'system';
      default:
        return 'system';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'security': return '🛡️';
      case 'user': return '👤';
      case 'system': return '⚙️';
      case 'database': return '💾';
      default: return '📋';
    }
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-sm shadow-sm border-0 overflow-hidden">
      <div className="card-header px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h5 className="text-base font-semibold text-gray-800 dark:text-white">
          Audit Logs
        </h5>
        <Link
          href="/company-admin/security-audit-logs"
          className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="card-body p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : (
          <>
            {/* Log Statistics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Total Logs', value: logStats.total, color: 'text-gray-600' },
                { label: "Today's Logs", value: logStats.today, color: 'text-primary-600' },
                { label: 'Critical', value: logStats.critical, color: 'text-red-600' },
                { label: 'Warnings', value: logStats.warnings, color: 'text-yellow-600' }
              ].map((stat, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Logs */}
            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  No recent audit logs
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex-shrink-0">
                      <span className="text-sm">{getTypeIcon(log.type)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                          <span className="mr-1">{getLevelIcon(log.level)}</span>
                          {log.level}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {log.timestamp}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800 dark:text-white mb-1">
                        {log.message}
                      </p>

                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        By: {log.user}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex space-x-2">
              <Link
                href="/company-admin/security-audit-logs"
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs py-2 px-3 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-center"
              >
                View All Logs
              </Link>
              <Link
                href="/company-admin/security-audit-logs"
                className="flex-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs py-2 px-3 rounded border border-primary-200 dark:border-primary-800 hover:bg-primary-200 dark:hover:bg-primary-900/30 text-center"
              >
                Filter Logs
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;