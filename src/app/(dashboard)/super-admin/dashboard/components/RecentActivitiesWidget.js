"use client";
import React, { useEffect, useState } from "react";
import { dashboardService } from "@/services/super-admin-services/dashboard.service";

export default function RecentActivitiesWidget() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardService.getRecentActivities();
        if (!active) return;
        const data = response?.data || [];
        const formatted = data.map((x) => {
          const dt = x?.createdAt ? new Date(x.createdAt) : null;
          const time = dt
            ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";

          return {
            id: x?.id,
            user: x?.userName || "System",
            action: x?.description || x?.action || "Activity",
            time,
            avatar: "/images/users/default-avatar.png"
          };
        });
        setActivities(formatted);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load recent activities");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchActivities();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 h-full w-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Recent Activities
        </h5>
        <button className="px-3 py-1.5 text-xs font-semibold rounded-sm bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors">
          View All
        </button>
      </div>

      <div className="p-4 space-y-3">
        {activities.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <img src={a.avatar} alt={a.user} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.user}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300 truncate">{a.action}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-300 flex-shrink-0">{a.time}</div>
          </div>
        ))}

        {error ? (
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        ) : loading ? (
          <p className="text-xs text-gray-500 dark:text-gray-300">Loading activities...</p>
        ) : null}
      </div>
    </div>
  );
}

