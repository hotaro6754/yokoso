"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { hrOfferService } from "@/services/hr-services/offer-management.service";
import { toast } from "react-hot-toast";
import { Users, Search, MoveRight, UserCheck, Mail, ShieldCheck, Eye } from "lucide-react";
import Link from "next/link";
import ActionDropdown from "../../components/ActionDropdown";

const STAGES = [
  { id: "APPLIED", label: "Applied", color: "bg-slate-100 border-slate-200 text-slate-700" },
  { id: "SCREENING", label: "Screening", color: "bg-blue-100 border-blue-200 text-blue-700" },
  { id: "INTERVIEW", label: "Interview", color: "bg-purple-100 border-purple-200 text-purple-700" },
  { id: "SELECTED", label: "Selected", color: "bg-emerald-100 border-emerald-200 text-emerald-700" },
  { id: "OFFERED", label: "Offered", color: "bg-amber-100 border-amber-200 text-amber-700" },
  { id: "OFFER_ACCEPTED", label: "Offer Accepted", color: "bg-green-100 border-green-200 text-green-700" },
  { id: "REJECTED", label: "Rejected", color: "bg-rose-100 border-rose-200 text-rose-700" },
];

export default function CandidatePipelinePage() {
  const [loading, setLoading] = useState(true);
  const [pipeline, setPipeline] = useState({});
  const [search, setSearch] = useState("");
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    fetchPipeline();
  }, [search]);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const response = await hrOfferService.getCandidatePipeline({ search });
      if (response.success) {
        setPipeline(response.data?.data || response.data || {});
      }
    } catch (error) {
      console.error("Error fetching pipeline:", error);
      toast.error("Failed to load recruitment pipeline");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (candidateId, newStage) => {
    try {
      setMovingId(candidateId);
      const response = await hrOfferService.moveCandidate(candidateId, newStage);

      if (newStage === 'SELECTED') {
        toast.success("Candidate selected! Credentials have been sent via email.");
      } else {
        toast.success(`Candidate moved to ${newStage} successfully`);
      }

      fetchPipeline();
    } catch (error) {
      toast.error(error.message || "Failed to move candidate");
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Offers", href: "/hr/offers" },
          { label: "Pipeline", href: "/hr/offers/candidates" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Recruitment Pipeline
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage candidate transitions and final selection (HR Mode)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 text-xs font-medium">
            <ShieldCheck className="h-4 w-4" />
            Selection Mode: Automated Credential Generation Enabled
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading candidate data...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Stage</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.values(pipeline).flat().length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No candidates found matching your search.
                    </td>
                  </tr>
                ) : (
                  Object.values(pipeline).flat().map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{candidate.name}</div>
                              {candidate.hasDocuments && (
                                <div className="p-1 bg-emerald-100 rounded text-emerald-600" title="Documents Uploaded">
                                  <ShieldCheck className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {candidate.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{candidate.jobTitle}</div>
                        {candidate.latestInterview && (
                          <div className="text-[10px] text-purple-600 font-medium">
                            Round: {candidate.latestInterview.interviewRound}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${candidate.currentStage === 'SELECTED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : candidate.currentStage === 'OFFERED'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                          {candidate.currentStage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">                          
                          <ActionDropdown
                            itemId={candidate.id}
                            viewUrl={`/hr/offers/candidates/${candidate.id}`}
                            onSelect={() => handleMoveStage(candidate.id, 'SELECTED')}
                            currentStage={candidate.currentStage}
                            latestOffer={candidate.latestOffer}
                            isMoving={movingId === candidate.id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
