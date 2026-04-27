"use client";

import React, { useState, useEffect } from "react";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { AlertCircle, MessageSquare, FileCheck } from "lucide-react";
import Link from "next/link";

export default function PendingActions() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    feedbackPending: [],
    offersPendingApproval: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getPendingActions();
      setData(response.data || response);
    } catch (error) {
      console.error("Error fetching pending actions:", error);
      toast.error("Failed to load pending actions");
      setData({ feedbackPending: [], offersPendingApproval: [] });
    } finally {
      setLoading(false);
    }
  };

  const totalPending = (data.feedbackPending?.length || 0) + (data.offersPendingApproval?.length || 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Actions
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalPending} action(s) require attention
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Feedback Pending */}
          {data.feedbackPending && data.feedbackPending.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Feedback Pending ({data.feedbackPending.length})
                </h4>
                <Link
                  href="/recruiter/interviews?status=feedback_pending"
                  className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {data.feedbackPending.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20"
                  >
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {item.candidateName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.jobTitle} • {item.interviewer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offers Pending Approval */}
          {data.offersPendingApproval && data.offersPendingApproval.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Offers Pending Approval ({data.offersPendingApproval.length})
                </h4>
                <Link
                  href="/recruiter/offers?status=pending_approval"
                  className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {data.offersPendingApproval.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20"
                  >
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {item.candidateName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.jobTitle} • {item.ctc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalPending === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No pending actions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
