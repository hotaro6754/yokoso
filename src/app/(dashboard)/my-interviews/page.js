"use client";

import React, { useState, useEffect } from "react";
import { myInterviewsService } from "@/services/my-interviews.service";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import { Loader2, Video, MessageSquare } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function MyInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "" });
  const router = useRouter();
  const pathname = usePathname();
  const payrollPrefix = pathname?.startsWith('/payroll') ? '/payroll' : '';
  const interviewsBase = `${payrollPrefix}/my-interviews`;
  const dashboardHref = payrollPrefix ? '/payroll/dashboard' : '/dashboard';

  useEffect(() => {
    fetchInterviews();
  }, [filters]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const data = await myInterviewsService.getMyInterviews(filters);
      setInterviews(data.data || data || []);
    } catch (error) {
      console.error("Error fetching my interviews:", error);
      toast.error(error.message || "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: dashboardHref },
    { label: "Assigned Interviews", href: interviewsBase },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-[rgba(187,189,236,0.12)] dark:text-[#E0E2FE]",
      COMPLETED: "bg-green-100 text-green-800 dark:bg-[rgba(187,189,236,0.12)] dark:text-[#E0E2FE]",
      CANCELLED: "bg-red-100 text-red-800 dark:bg-[rgba(187,189,236,0.12)] dark:text-[#E0E2FE]",
      NO_SHOW: "bg-gray-100 text-gray-800 dark:bg-[rgba(187,189,236,0.12)] dark:text-[#E0E2FE]",
    };
    const styles = statusConfig[status] || "bg-gray-100 text-gray-800";
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles}`}>
        {status?.replace(/_/g, " ")}
      </span>
    );
  };

  const handleOpenFeedback = (interview) => {
    router.push(`${interviewsBase}/feedback/${interview.id}`);
  };

  const handleFeedbackSubmitSuccess = () => {
     fetchInterviews(); // Refresh list to get updated feedbacks
  };

  return (
    <div className="space-y-2">
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E0E2FE] mb-2">Assigned Interviews</h2>
          <Breadcrumb items={breadcrumbs} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-[rgba(187,189,236,0.06)] dark:border-[rgba(187,189,236,0.2)]">
        <div className="p-4 border-b border-gray-200 dark:border-[rgba(187,189,236,0.2)]">
           <div className="flex justify-between items-center">
              <div className="w-1/3">
                 <select
                    className="w-full h-11 px-4 border border-gray-300 dark:border-[rgba(187,189,236,0.25)] rounded-lg bg-gray-50 dark:bg-[rgba(187,189,236,0.06)] text-gray-900 dark:text-[#E0E2FE]"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                 >
                    <option value="">All Status</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                 </select>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : interviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-[#BBBDEC]">
              No interviews assigned to you found.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600 dark:text-[#BBBDEC]">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[rgba(187,189,236,0.08)] dark:text-[#E0E2FE]">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Round</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-[rgba(187,189,236,0.15)] hover:bg-gray-50 dark:hover:bg-[rgba(187,189,236,0.08)]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-[#E0E2FE]">
                        {item.date ? new Date(item.date).toLocaleDateString('en-GB') : '-'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#BBBDEC]">{item.time}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-[#E0E2FE]">
                      {item.candidateName}
                    </td>
                    <td className="px-6 py-4">{item.jobTitle}</td>
                    <td className="px-6 py-4">{item.interviewRound}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 relative z-50 overflow-visible">
                        {item.meetingLink && (
                          <a
                            href={item.meetingLink.startsWith('http') ? item.meetingLink : `https://${item.meetingLink}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-[#E0E2FE] dark:hover:bg-[rgba(187,189,236,0.12)]"
                             title="Join Meeting"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        )}
                        <button
                           onClick={() => handleOpenFeedback(item)}
                           className="p-2 text-primary hover:bg-primary/10 rounded-lg dark:text-[#E0E2FE] dark:hover:bg-[rgba(187,189,236,0.12)]"
                           title="Submit Feedback"
                        >
                           <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
