"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Users, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import ActionDropdown from "../components/ActionDropdown";

const STAGES = [
  { id: "APPLIED", label: "Applied", color: "bg-gray-100" },
  { id: "SCREENING", label: "Screening", color: "bg-blue-100" },
  { id: "INTERVIEW", label: "Interview", color: "bg-purple-100" },
  { id: "SELECTED", label: "Selected", color: "bg-emerald-100" },
  { id: "OFFERED", label: "Offered", color: "bg-amber-100" },
  { id: "OFFER_ACCEPTED", label: "Offer Accepted", color: "bg-green-100" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-100" },
];

export default function CandidatesPipelinePage() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState({});

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getAllCandidates();
      const candidatesList = response.data || response || [];

      // Group by stage
      const grouped = {};
      STAGES.forEach((stage) => {
        grouped[stage.id] = candidatesList.filter((c) => c.currentStage === stage.id);
      });
      setCandidates(grouped);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
      const emptyGrouped = {};
      STAGES.forEach((stage) => {
        emptyGrouped[stage.id] = [];
      });
      setCandidates(emptyGrouped);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (candidateId, newStage) => {
    try {
      await recruiterService.moveCandidateToStage(candidateId, newStage);
      toast.success("Candidate moved successfully");
      fetchCandidates();
    } catch (error) {
      toast.error("Failed to move candidate");
    }
  };

  const handleRetriggerDocs = async (candidateId) => {
    try {
      toast.loading("Sending document upload link...");
      await recruiterService.retriggerDocumentUpload(candidateId);
      toast.dismiss();
      toast.success("Document upload link resent");
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Failed to resend link");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Candidates", href: "/recruiter/candidates" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Candidate Pipeline
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track candidates across hiring stages
              </p>
            </div>
          </div>
          <Link
            href="/recruiter/candidates/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Candidate
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {STAGES.map((stage) => (
              <div
                key={stage.id}
                className="w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className={`p-3 ${stage.color} dark:bg-gray-700 rounded-t-lg`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {stage.label} ({candidates[stage.id]?.length || 0})
                  </h3>
                </div>
                <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                  {candidates[stage.id]?.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {candidate.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 truncate max-w-[150px]">
                          {candidate.email}
                        </p>
                        {candidate.hasDocuments && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="h-2.5 w-2.5" /> Docs
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{candidate.jobTitle}</p>
                      {candidate.interviews?.[0] && (
                        <p className="text-xs font-medium text-brand-600 mt-1">
                          Round: {candidate.interviews[0].interviewRound}
                        </p>
                      )}
                      
                      {/* Removed redundant Resend Docs Link button as it's now in ActionDropdown */}

                      <div className="mt-2 flex items-center gap-2">
                        <ActionDropdown
                          itemId={candidate.id}
                          viewUrl={`/recruiter/candidates/${candidate.id}`}
                          editUrl={`/recruiter/candidates/${candidate.id}/edit`}
                          currentStage={candidate.currentStage}
                          latestOffer={candidate.offers?.[0]}
                        />
                        <select
                          value={candidate.currentStage}
                          onChange={(e) => handleMoveStage(candidate.id, e.target.value)}
                          className="flex-1 min-w-0 text-[11px] font-medium border border-gray-300 rounded px-2 py-1.5 dark:bg-gray-700 dark:border-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.id === candidate.currentStage ? s.label : `Move to ${s.label}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
