"use client";

import React, { useState, useEffect } from "react";
import { ldService } from "@/services/ld-services/ld.service";
import { Calendar, Clock, Award, Users } from "lucide-react";
import Link from "next/link";

export default function UpcomingActivities() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    scheduledSessions: [],
    certificationDeadlines: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await ldService.getUpcomingActivities();
      setData(response.data || response);
    } catch (error) {
      console.error("Error fetching upcoming activities:", error);
      // Mock data
      setData({
        scheduledSessions: [
          {
            id: 1,
            courseTitle: "Leadership Fundamentals",
            date: "2026-01-28",
            time: "10:00 AM",
            participants: 15,
          },
          {
            id: 2,
            courseTitle: "Project Management",
            date: "2026-01-30",
            time: "2:00 PM",
            participants: 20,
          },
        ],
        certificationDeadlines: [
          {
            id: 1,
            employeeName: "John Doe",
            certification: "PMP Certification",
            deadline: "2026-02-15",
          },
          {
            id: 2,
            employeeName: "Jane Smith",
            certification: "AWS Certified",
            deadline: "2026-02-20",
          },
        ],
      });
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
              Upcoming Learning Activities
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Scheduled sessions and deadlines
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Scheduled Training Sessions */}
          {data.scheduledSessions && data.scheduledSessions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Scheduled Training Sessions
              </h4>
              <div className="space-y-2">
                {data.scheduledSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {session.courseTitle}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {session.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {session.participants} participants
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certification Deadlines */}
          {data.certificationDeadlines && data.certificationDeadlines.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Certification Deadlines
              </h4>
              <div className="space-y-2">
                {data.certificationDeadlines.slice(0, 3).map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {cert.employeeName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {cert.certification}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <Award className="h-3 w-3" />
                      Deadline: {cert.deadline}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!data.scheduledSessions || data.scheduledSessions.length === 0) &&
            (!data.certificationDeadlines || data.certificationDeadlines.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No upcoming activities</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
