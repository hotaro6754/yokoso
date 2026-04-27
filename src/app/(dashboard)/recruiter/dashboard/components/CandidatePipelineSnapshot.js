"use client";

import React, { useState, useEffect } from "react";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CandidatePipelineSnapshot() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    screening: 0,
    interview: 0,
    offered: 0,
    selected: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getCandidatePipelineSnapshot();
      setData(response.data || response);
    } catch (error) {
      console.error("Error fetching pipeline snapshot:", error);
      toast.error("Failed to load pipeline snapshot");
      setData({
        screening: 0,
        interview: 0,
        offered: 0,
        selected: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { label: "Screening", count: data.screening, color: "bg-blue-500" },
    { label: "Interview", count: data.interview, color: "bg-purple-500" },
    { label: "Offered", count: data.offered, color: "bg-amber-500" },
    { label: "Selected", count: data.selected, color: "bg-emerald-500" },
  ];

  const total = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Candidate Pipeline Snapshot
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total: {total} candidates
            </p>
          </div>
        </div>
        <Link
          href="/recruiter/candidates"
          className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
        >
          View Pipeline
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stage.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {stage.count}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all`}
                    style={{
                      width: `${total > 0 ? (stage.count / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
