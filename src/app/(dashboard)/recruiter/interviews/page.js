"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Calendar, Plus, Clock, User, Video, MapPin } from "lucide-react";
import Link from "next/link";
import ActionDropdown from "../components/ActionDropdown";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function InterviewsPage() {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [filters, setFilters] = useState({ status: "", date: "" });

  useEffect(() => {
    fetchInterviews();
  }, [filters]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getAllInterviews(filters);
      setInterviews(response.data || response || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load interviews");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
      FEEDBACK_PENDING: { label: "Feedback Pending", color: "bg-amber-100 text-amber-800" },
      CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap.SCHEDULED;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Interviews", href: "/recruiter/interviews" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interview Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Schedule and manage interviews
              </p>
            </div>
          </div>
          <Link
            href="/recruiter/interviews/schedule"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Schedule Interview
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerField
            id="interview-filter-date"
            name="date"
            value={filters.date}
            onChange={(dateStr) => setFilters({ ...filters, date: dateStr })}
            placeholder="Select date"
            className="rounded-lg"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="FEEDBACK_PENDING">Feedback Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Interviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No interviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Interviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Round
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {interviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {interview.candidateName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {interview.jobTitle}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {interview.interviewer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {interview.interviewRound || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {interview.date}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {interview.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        {interview.mode === "Online" ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        {interview.mode}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(interview.status)}</td>
                    <td className="px-6 py-4">
                      <ActionDropdown
                        itemId={interview.id}
                        viewUrl={`/recruiter/interviews/${interview.id}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
