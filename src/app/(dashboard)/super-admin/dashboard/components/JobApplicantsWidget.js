"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function JobApplicantsWidget() {
  const [activeTab, setActiveTab] = useState("applicants");

  const jobOpenings = [
    { id: 1, company: "Apple", logo: "/images/icons/apple.svg", title: "Senior iOS Developer", openings: 25 },
    { id: 2, company: "PHP", logo: "/images/icons/php.svg", title: "Junior PHP Developer", openings: 20 },
    { id: 3, company: "React", logo: "/images/icons/react.svg", title: "Junior React Developer", openings: 30 },
    { id: 4, company: "Laravel", logo: "/images/icons/laravel-icon.svg", title: "Senior Laravel Developer", openings: 40 },
  ];

  const applicants = [
    { id: 1, name: "Brian Villalobos", avatar: "/images/users/user-01.png", experience: "5+ Years", location: "USA", position: "UI/UX Designer", badgeColor: "bg-gray-500" },
    { id: 2, name: "Anthony Lewis", avatar: "/images/users/user-02.png", experience: "4+ Years", location: "USA", position: "Python Developer", badgeColor: "bg-blue-600" },
    { id: 3, name: "Stephan Peralt", avatar: "/images/users/user-03.png", experience: "6+ Years", location: "USA", position: "Android Developer", badgeColor: "bg-pink-500" },
    { id: 4, name: "Doglas Martini", avatar: "/images/users/user-04.png", experience: "2+ Years", location: "USA", position: "React Developer", badgeColor: "bg-purple-500" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 h-full w-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Job Applicants
        </h5>
        <Link
          href="/company-admin/users"
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 mb-4 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("openings")}
            className={`py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "openings"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Openings
          </button>
          <button
            onClick={() => setActiveTab("applicants")}
            className={`py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "applicants"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Applicants
          </button>
        </div>

        {activeTab === "openings" && (
          <div className="space-y-3">
            {jobOpenings.map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-3 p-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <img src={job.logo} alt={job.company} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Openings: {job.openings}</p>
                  </div>
                </div>

                <button className="p-2 rounded-sm bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "applicants" && (
          <div className="space-y-3">
            {applicants.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 p-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <img src={a.avatar} alt={a.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white truncate">{a.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Exp: {a.experience} • {a.location}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-sm text-white whitespace-nowrap ${a.badgeColor}`}>
                  {a.position}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

