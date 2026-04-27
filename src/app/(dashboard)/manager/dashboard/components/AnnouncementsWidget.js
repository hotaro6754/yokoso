"use client";

import { Bell, Megaphone, CalendarClock } from "lucide-react";

const iconMap = {
  INFO: Megaphone,
  WARNING: Bell,
  ERROR: Bell,
  SUCCESS: CalendarClock
};

export default function AnnouncementsWidget({ announcements }) {
  const items = announcements && announcements.length > 0
    ? announcements
    : [{ title: "No announcements", message: "You're all caught up." }];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between border-b pb-4 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Announcements & Alerts</h3>
          <p className="text-xs text-gray-500 mt-1">Latest priority updates</p>
        </div>
        <div className="p-2 bg-primary-100 text-primary-700 rounded-sm border border-primary-200 shadow-sm transition-transform hover:scale-110">
          <Megaphone size={16} />
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const Icon = iconMap[item.type] || Bell;
          return (
            <div key={idx} className="flex items-start gap-4 rounded-sm border border-gray-100 dark:border-gray-800 p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-primary-200">
              <div className="h-10 w-10 shrink-0 rounded-sm bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center border border-primary-100 dark:border-primary-500/20">
                <Icon size={18} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-tight truncate">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1 line-clamp-2">{item.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
