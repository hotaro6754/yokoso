// src/app/(dashboard)/company-admin/dashboard/components/UserActivity.js (served via middleware rewrite)
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const UserActivity = () => {
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Mock data - replace with API call
    const mockActivities = [
      {
        id: 1,
        user: "Sarah Johnson",
        action: "logged_in",
        target: "System",
        time: "2 minutes ago",
        role: "HR Admin",
        avatar: "/images/users/user-01.jpg"
      },
      {
        id: 2,
        user: "Mike Chen",
        action: "updated",
        target: "User Permissions",
        time: "5 minutes ago",
        role: "Company Admin",
        avatar: "/images/users/user-02.jpg"
      },
      {
        id: 3,
        user: "Emily Davis",
        action: "created",
        target: "New Employee",
        time: "12 minutes ago",
        role: "HR Manager",
        avatar: "/images/users/user-03.jpg"
      },
      {
        id: 4,
        user: "Alex Rodriguez",
        action: "accessed",
        target: "Salary Reports",
        time: "18 minutes ago",
        role: "Finance",
        avatar: "/images/users/user-04.jpg"
      },
      {
        id: 5,
        user: "Lisa Wang",
        action: "modified",
        target: "System Settings",
        time: "25 minutes ago",
        role: "Company Admin",
        avatar: "/images/users/user-05.jpg"
      }
    ];
    setRecentActivities(mockActivities);
  }, []);

  const getActionColor = (action) => {
    switch(action) {
      case 'logged_in': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'created': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'updated': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'accessed': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'modified': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'logged_in': return '🔐';
      case 'created': return '➕';
      case 'updated': return '✏️';
      case 'accessed': return '👁️';
      case 'modified': return '⚙️';
      default: return '📋';
    }
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 overflow-hidden">
      <div className="card-header px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h5 className="text-base font-semibold text-gray-800 dark:text-white">
          Recent User Activity
        </h5>
        <Link
          href="/company-admin/security-audit-logs"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="card-body p-4">
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <img
                src={activity.avatar}
                alt={activity.user}
                className="w-8 h-8 rounded-full"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h6 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {activity.user}
                  </h6>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                    <span className="mr-1">{getActionIcon(activity.action)}</span>
                    {activity.action.replace('_', ' ')}
                  </span>
                  
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {activity.target}
                  </span>
                </div>
                
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">247</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">1.2K</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Today's Actions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">98%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivity;