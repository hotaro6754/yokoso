"use client";

import { CalendarCheck, BellRing } from "lucide-react";

const fallbackHolidays = [
  { name: "Republic Day", date: "26 Jan 2026" },
  { name: "Holi", date: "05 Mar 2026" },
  { name: "Independence Day", date: "15 Aug 2026" },
];

const fallbackNotices = [
  "Policy update: Leave encashment guidelines revised.",
  "Compliance: PF declaration due by 10th Feb.",
];

export default function HolidayListWidget({ holidays, notices }) {
  const list = holidays?.length ? holidays : fallbackHolidays;
  const updates = notices?.length ? notices : fallbackNotices;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-primary-100/50 dark:border-gray-700 h-full flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
            <CalendarCheck size={18} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Holiday List</h3>
        </div>
        <div className="space-y-2.5">
          {list.map((holiday, idx) => (
            <div
              key={`${holiday.name}-${idx}`}
              className="flex items-center justify-between text-sm bg-primary-50/30 dark:bg-primary-500/5 border border-primary-100/60 dark:border-primary-500/20 rounded-xl px-3 py-2"
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">{holiday.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{holiday.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
            <BellRing size={16} />
          </div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Need to know</h4>
        </div>
        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          {updates.map((notice, idx) => (
            <li key={`${notice}-${idx}`} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500"></span>
              <span>{notice}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
