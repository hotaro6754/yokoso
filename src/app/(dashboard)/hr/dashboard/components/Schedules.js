import React from "react";
import Link from "next/link";

const Schedules = ({ schedules = [], loading = false }) => {
  const getInitials = (name = "") => {
    const parts = String(name).trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const badgePalette = [
    "bg-gray-500",
    "bg-blue-600",
    "bg-indigo-500",
    "bg-emerald-600",
    "bg-amber-500",
    "bg-rose-500",
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 h-full w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 
                      flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Schedules
        </h5>
        <Link
          href="/hr/candidates"
          className="px-3 py-1.5 text-xs font-semibold rounded-md 
                     bg-brand-50 hover:bg-brand-100 text-brand-600 
                     dark:bg-brand-500/10 dark:hover:bg-brand-500/20 dark:text-brand-400 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">No upcoming schedules.</div>
        ) : (
          schedules.map((schedule, index) => (
            <div
              key={schedule.id || `${schedule.title}-${index}`}
              className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg"
            >
              {/* Badge */}
              <span
                className={`inline-block text-[10px] px-2 py-1 rounded-sm 
                            text-white mb-2 ${badgePalette[index % badgePalette.length]}`}
              >
                {schedule.position || "Interview"}
              </span>

              {/* Title */}
              <h6 className="text-sm font-semibold text-gray-800 dark:text-white truncate mb-2">
                {schedule.title}
              </h6>

              {/* Date & Time */}
              <div className="flex flex-wrap gap-3 mb-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {schedule.date}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {schedule.time}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 pt-3 
                              border-t border-gray-200 dark:border-gray-600">
                {/* Participants */}
                <div className="flex -space-x-2">
                  {(schedule.participants || []).slice(0, 5).map((participant, idx) => {
                    const avatar = participant?.avatar || participant?.profileImage;
                    const name = participant?.name || participant?.label || "Participant";
                    return avatar ? (
                      <img
                        key={idx}
                        src={avatar}
                        alt={name}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 
                                   object-cover transition-transform hover:-translate-y-1"
                      />
                    ) : (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 
                                   bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 
                                   text-[10px] flex items-center justify-center font-semibold"
                        title={name}
                      >
                        {getInitials(name)}
                      </div>
                    );
                  })}

                  {schedule.additionalParticipants > 0 && (
                    <div className="relative group">
                      <div
                        className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 
                                   bg-brand-500 text-white text-xs flex items-center justify-center font-semibold"
                      >
                        +{schedule.additionalParticipants}
                      </div>
                      <div
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                   bg-gray-800 text-white text-xs rounded px-2 py-1 
                                   opacity-0 group-hover:opacity-100 transition"
                      >
                        {schedule.additionalParticipants} more participants
                      </div>
                    </div>
                  )}
                </div>

                {/* Join Button */}
                <button
                  className="px-3 py-1.5 text-[10px] font-semibold rounded-md 
                             bg-brand-500 text-white hover:bg-brand-600 
                             dark:bg-brand-500 dark:hover:bg-brand-600 
                             transition-colors shadow-sm"
                >
                  Join Meeting
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedules;
