"use client";

import React, { useState, useEffect } from "react";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Calendar, Clock, User, Video } from "lucide-react";
import Link from "next/link";

export default function InterviewSchedule() {
  const [loading, setLoading] = useState(true);
  const [todaysInterviews, setTodaysInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const todayResponse = await recruiterService.getTodaysInterviews();
      const upcomingResponse = await recruiterService.getUpcomingInterviews({ limit: 5 });

      setTodaysInterviews(todayResponse.data || todayResponse || []);
      setUpcomingInterviews(upcomingResponse.data || upcomingResponse || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load interviews");
      setTodaysInterviews([]);
      setUpcomingInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
            <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Interview Schedule
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Today: {todaysInterviews.length} | Upcoming: {upcomingInterviews.length}
            </p>
          </div>
        </div>
        <Link
          href="/recruiter/interviews"
          className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Today's Interviews */}
          {todaysInterviews.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Today's Interviews
              </h4>
              <div className="space-y-2">
                {todaysInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {interview.candidateName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {interview.jobTitle}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <User className="h-3 w-3" />
                            {interview.interviewer}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {interview.time}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            {interview.mode === "Online" ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            {interview.mode}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Upcoming
              </h4>
              <div className="space-y-2">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {interview.candidateName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {interview.jobTitle}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {interview.date || "Tomorrow"}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {interview.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {todaysInterviews.length === 0 && upcomingInterviews.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No interviews scheduled</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
