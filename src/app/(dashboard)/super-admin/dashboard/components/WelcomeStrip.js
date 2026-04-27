"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function WelcomeStrip({
  userName,
  avatarUrl,
}) {
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
      const formatted = now.toLocaleDateString("en-GB", options).replace(",", ",");
      setCurrentTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 w-full overflow-hidden">
      <div className="relative bg-gradient-to-r from-blue-50 via-white to-white dark:from-blue-500/10 dark:via-gray-800 dark:to-gray-800">
        <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-[3px] border-blue-600 shadow-lg ring-2 ring-blue-100 dark:ring-blue-500/20">
                <Image
                  src={avatarUrl || "/images/users/default-avatar.png"}
                  alt={userName || "User"}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                <span className="truncate">Welcome Back, {userName}</span>
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/company-admin/workflow-management"
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Review Approvals
                </Link>
                <Link
                  href="/company-admin/custom-policies"
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  Custom Policies
                </Link>
                <Link
                  href="/company-admin/users"
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  User Management
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 border border-blue-200/50 dark:border-blue-500/20 px-4 py-3 sm:px-5 sm:py-4 rounded-sm flex items-center gap-3 shadow-sm w-full md:w-auto backdrop-blur-sm">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-blue-600 flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                Current Time
              </p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                {currentTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

