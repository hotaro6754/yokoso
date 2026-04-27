"use client";
import React, { useState } from "react";
import Link from "next/link";

const JobApplicants = ({ openings = [], applicants = [], loading = false }) => {
  const [activeTab, setActiveTab] = useState("applicants");

  const normalizeText = (value, fallback = "N/A") => {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
  };

  const formatExperience = (value) => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "number") return `${value}+ Years`;
    const str = String(value);
    return str.toLowerCase().includes("year") ? str : `${str} Years`;
  };

  const getInitials = (name = "") => {
    const parts = String(name).trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const badgePalette = [
    "bg-indigo-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-purple-500",
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 h-full w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 
                      flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Jobs Applicants
        </h5>
        <Link
          href="/hr/recruitment"
          className="px-3 py-1.5 text-xs font-semibold rounded-md 
                     bg-brand-50 hover:bg-brand-100 text-brand-600 
                     dark:bg-brand-500/10 dark:hover:bg-brand-500/20 dark:text-brand-400 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Tabs */}
        <div className="grid grid-cols-2 mb-4 rounded-md overflow-hidden 
                        border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("openings")}
            className={`py-1.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === "openings"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
          >
            Openings
          </button>
          <button
            onClick={() => setActiveTab("applicants")}
            className={`py-1.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === "applicants"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
          >
            Applicants
          </button>
        </div>

        {/* Openings */}
        {activeTab === "openings" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">Loading openings...</div>
            ) : openings.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">No openings available.</div>
            ) : (
              openings.map((job, index) => (
                <div
                  key={job.id || `${job.title}-${index}`}
                  className="flex items-center justify-between gap-3 p-2 
                             rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-md bg-gray-100 dark:bg-gray-700 
                                    flex items-center justify-center flex-shrink-0">
                      {job.logo ? (
                        <img src={job.logo} alt={job.title || "Opening"} className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-200">
                          {getInitials(job.title)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                        {normalizeText(job.title, "Untitled Role")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Openings: {job.openings ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {normalizeText(job.location, "Location N/A")}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Applicants */}
        {activeTab === "applicants" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">Loading applicants...</div>
            ) : applicants.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">No applicants yet.</div>
            ) : (
              applicants.map((applicant, index) => (
                <div
                  key={applicant.id || `${applicant.name}-${index}`}
                  className="flex items-center justify-between gap-3 p-2
                             rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {applicant.avatar ? (
                      <img
                        src={applicant.avatar}
                        alt={applicant.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-700 
                                      text-gray-600 dark:text-gray-200 flex items-center justify-center font-semibold text-xs sm:text-sm">
                        {getInitials(applicant.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white truncate">
                        {normalizeText(applicant.name, "Candidate")}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                        Exp: {formatExperience(applicant.experience)} • {normalizeText(applicant.location)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-1 rounded-sm text-white whitespace-nowrap ${badgePalette[index % badgePalette.length]}`}
                  >
                    {normalizeText(applicant.position, "Applicant")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicants;
