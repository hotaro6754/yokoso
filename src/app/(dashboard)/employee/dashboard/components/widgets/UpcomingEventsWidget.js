"use client";

import { CalendarDays, MapPin } from "lucide-react";

const fallbackEvents = [
  { title: "Townhall Meeting", date: "28 Jan 2026", time: "11:00 AM", location: "Main Auditorium" },
  { title: "Wellness Session", date: "31 Jan 2026", time: "04:00 PM", location: "Online" },
];

export default function UpcomingEventsWidget({ data }) {
  const events = data?.length ? data : fallbackEvents;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-primary-100/50 dark:border-gray-700 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
          <CalendarDays size={18} />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Upcoming Events</h3>
      </div>

      <div className="space-y-3">
        {events.map((event, idx) => (
          <div
            key={`${event.title}-${idx}`}
            className="p-3 rounded-xl border border-primary-100/60 dark:border-primary-500/20 bg-primary-50/30 dark:bg-primary-500/5"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span>{event.date}</span>
              <span>•</span>
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin size={12} />
              {event.location}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
