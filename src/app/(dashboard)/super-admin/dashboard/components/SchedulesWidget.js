"use client";
import React from "react";

export default function SchedulesWidget() {
  const schedules = [
    {
      id: 1,
      position: "UI/UX Designer",
      badgeColor: "bg-gray-500",
      title: "Interview Candidates - UI/UX Designer",
      date: "Thu, 15 Feb 2025",
      time: "01:00 PM - 02:20 PM",
      participants: ["/images/users/user-05.jpg", "/images/users/user-06.jpg", "/images/users/user-07.jpg", "/images/users/user-08.jpg", "/images/users/user-09.jpg"],
      additionalParticipants: 3,
    },
    {
      id: 2,
      position: "iOS Developer",
      badgeColor: "bg-gray-800",
      title: "Interview Candidates - iOS Developer",
      date: "Thu, 15 Feb 2025",
      time: "02:00 PM - 04:20 PM",
      participants: ["/images/users/user-05.jpg", "/images/users/user-06.jpg", "/images/users/user-07.jpg", "/images/users/user-08.jpg", "/images/users/user-09.jpg"],
      additionalParticipants: 3,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full w-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Schedules
        </h5>
        <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors">
          View All
        </button>
      </div>

      <div className="p-4 space-y-4">
        {schedules.map((s) => (
          <div key={s.id} className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
            <span className={`inline-block text-[10px] px-2 py-1 rounded-sm text-white mb-2 ${s.badgeColor}`}>
              {s.position}
            </span>
            <h6 className="text-sm font-semibold text-gray-800 dark:text-white truncate mb-2">
              {s.title}
            </h6>
            <div className="flex flex-wrap gap-3 mb-3">
              <p className="text-xs text-gray-600 dark:text-gray-200 flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {s.date}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-200 flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {s.time}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex -space-x-2">
                {s.participants.slice(0, 5).map((p, idx) => (
                  <img
                    key={idx}
                    src={p}
                    alt="Participant"
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover transition-transform hover:-translate-y-1"
                  />
                ))}
                {s.additionalParticipants > 0 && (
                  <div className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                    +{s.additionalParticipants}
                  </div>
                )}
              </div>
              <button className="px-3 py-1.5 text-[10px] font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                Join Meeting
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

