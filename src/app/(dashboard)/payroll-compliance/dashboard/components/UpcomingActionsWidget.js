"use client";

import { useState, useEffect } from "react";
import { Calendar, Bell, FileText, Loader2 } from "lucide-react";

export default function UpcomingActionsWidget({ data }) {
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const upcomingSource = data?.upcomingActions || data || {};
  const payrollRun = upcomingSource?.payrollRun || null;
  const payrollRunDueDate = payrollRun?.nextDueDate || null;
  const filingReminders = upcomingSource?.statutoryReminders || [];

  const upcomingActions = [
    ...(payrollRunDueDate
      ? [
          {
            type: "payrollRun",
            title: "Payroll Run Due Date",
            date: payrollRunDueDate,
            description: payrollRun?.lastRunStatus
              ? `Last run: ${payrollRun.lastRunStatus}`
              : undefined,
            icon: <Calendar className="w-4 h-4" />,
            color: "text-primary-600 dark:text-primary-400",
            bgColor: "bg-primary-50 dark:bg-primary-500/10",
            borderColor: "border-primary-200 dark:border-primary-500/20",
          },
        ]
      : []),
    ...filingReminders.map((reminder) => ({
      type: "filing",
      title: reminder.label || "Statutory Filing",
      date: reminder.dueDate,
      description: reminder.id ? reminder.id.toUpperCase() : undefined,
      icon: <FileText className="w-4 h-4" />,
      color: "text-primary-600 dark:text-primary-400",
      bgColor: "bg-primary-50 dark:bg-primary-500/10",
      borderColor: "border-primary-200 dark:border-primary-500/20",
    })),
  ];

  const getUrgencyColor = (days) => {
    if (days === null || days === undefined) return "text-gray-600 dark:text-gray-400";
    if (days < 0) return "text-red-600 dark:text-red-400";
    if (days <= 3) return "text-amber-600 dark:text-amber-400";
    if (days <= 7) return "text-primary-600 dark:text-primary-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getUrgencyBadge = (days) => {
    if (days === null || days === undefined) return null;
    if (days < 0)
      return (
        <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          Overdue
        </span>
      );
    if (days <= 3)
      return (
        <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          Urgent
        </span>
      );
    if (days <= 7)
      return (
        <span className="px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-semibold">
          Soon
        </span>
      );
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Actions</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Reminders & deadlines</p>
        </div>
      </div>

      <div className="space-y-3">
        {upcomingActions.length > 0 ? (
          upcomingActions.map((action, index) => {
            const daysUntil = getDaysUntil(action.date);
            const urgencyColor = getUrgencyColor(daysUntil);
            const urgencyBadge = getUrgencyBadge(daysUntil);

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${action.borderColor} ${action.bgColor} transition-colors`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${action.bgColor} ${action.color} mt-0.5`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.title}
                      </p>
                      {action.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {action.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Due:</span>
                        <span className={`text-xs font-semibold ${urgencyColor}`}>
                          {formatDate(action.date)}
                        </span>
                        {daysUntil !== null && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            ({daysUntil < 0
                              ? `${Math.abs(daysUntil)} days ago`
                              : daysUntil === 0
                                ? "Today"
                                : `${daysUntil} day${daysUntil > 1 ? "s" : ""} left`}
                            )
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {urgencyBadge && (
                    <div className="flex-shrink-0">
                      {urgencyBadge}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No upcoming actions scheduled
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
