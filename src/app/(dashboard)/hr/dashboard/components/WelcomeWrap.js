"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const WelcomeWrap = ({
  userName,
  pendingApprovals,
  leaveRequests,
  avatarUrl,
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      const formatted = now
        .toLocaleDateString("en-GB", options)
        .replace(",", ",");
      setCurrentTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full overflow-hidden">
      <div className="relative bg-gradient-to-r from-brand-50 via-white to-white dark:from-brand-500/5 dark:via-gray-800 dark:to-gray-800">
        <div
          className="p-4 sm:p-6 flex flex-col md:flex-row 
                     md:items-center md:justify-between gap-4 relative z-10"
        >
          {/* Left */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Avatar with brand border */}
            <div className="flex-shrink-0">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden 
                           border-[3px] border-brand-500 dark:border-brand-400 shadow-lg ring-2 ring-brand-100 dark:ring-brand-500/20"
              >
                <Image
                  src={avatarUrl || "/images/users/default-avatar.png"}
                  alt={userName}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <h3
                className="text-base sm:text-xl md:text-2xl font-bold 
                           text-gray-900 dark:text-white flex items-center gap-2 mb-1"
              >
                <span className="truncate">Welcome Back, {userName}</span>
                <button
                  className="text-brand-500 hover:text-brand-600 
                             dark:text-brand-400 dark:hover:text-brand-500 
                             transition-colors p-1 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded"
                  aria-label="Edit name"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </h3>

              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">
                You have{" "}
                <span className="text-brand-600 dark:text-brand-400 font-semibold underline decoration-2 decoration-brand-300 dark:decoration-brand-500">
                  {pendingApprovals}
                </span>{" "}
                Pending Approvals &{" "}
                <span className="text-brand-600 dark:text-brand-400 font-semibold underline decoration-2 decoration-brand-300 dark:decoration-brand-500">
                  {leaveRequests}
                </span>{" "}
                Leave Requests
              </p>
            </div>
          </div>

          {/* Right – Time Card */}
          <div
            className="bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5 
                       border border-brand-200/50 dark:border-brand-500/20
                       px-4 py-3 sm:px-5 sm:py-4 rounded-xl 
                       flex items-center gap-3 shadow-sm w-full md:w-auto backdrop-blur-sm"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-brand-500 dark:bg-brand-400 flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                Current Time
              </p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-brand-700 dark:text-brand-300 tabular-nums">
                {currentTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWrap;
