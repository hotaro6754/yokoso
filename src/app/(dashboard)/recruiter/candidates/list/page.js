"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Users, Search, Mail, ShieldCheck, Plus } from "lucide-react";
import Link from "next/link";
import ActionDropdown from "../../components/ActionDropdown";

const STAGES = [
  { id: "APPLIED", label: "Applied", color: "bg-gray-100 text-gray-700" },
  { id: "SCREENING", label: "Screening", color: "bg-blue-100 text-blue-700" },
  { id: "INTERVIEW", label: "Interview", color: "bg-purple-100 text-purple-700" },
  { id: "SELECTED", label: "Selected", color: "bg-emerald-100 text-emerald-700" },
  { id: "OFFERED", label: "Offered", color: "bg-amber-100 text-amber-700" },
  { id: "OFFER_ACCEPTED", label: "Offer Accepted", color: "bg-green-100 text-green-700" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-700" },
];

export default function RecruiterCandidateListPage() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, [search]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getAllCandidates({ search });
      // recruiterService.getAllCandidates returns either direct array or { data: [] }
      const list = response.data || response || [];
      setCandidates(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (candidateId, newStage) => {
    try {
      setMovingId(candidateId);
      await recruiterService.moveCandidateToStage(candidateId, newStage);
      toast.success(`Candidate moved to ${newStage} successfully`);
      fetchCandidates();
    } catch (error) {
      toast.error(error.message || "Failed to move candidate");
    } finally {
      setMovingId(null);
    }
  };

  const getStageStyle = (stageId) => {
    return STAGES.find(s => s.id === stageId)?.color || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Candidates", href: "/recruiter/candidates" },
          { label: "Management", href: "/recruiter/candidates/list" },
        ]}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Candidate Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed listing and management of all candidates
              </p>
            </div>
          </div>
          <Link
            href="/recruiter/candidates/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Candidate
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading recruitment data...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No candidates found. Try a different search term or add a new candidate.
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm">
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-bold text-gray-900 dark:text-white capitalize">{candidate.name}</div>
                              {candidate.hasDocuments && (
                                <div className="p-0.5 bg-brand-100 dark:bg-brand-500/20 rounded text-brand-600 dark:text-brand-400" title="Documents Uploaded">
                                  <ShieldCheck className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                              <Mail className="h-3 w-3" /> {candidate.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{candidate.jobTitle}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Added: {new Date(candidate.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStageStyle(candidate.currentStage)}`}>
                          {candidate.currentStage?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {candidate.interviews?.[0] ? (
                            <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
                              Round {candidate.interviews[0].interviewRound}: {candidate.interviews[0].status}
                            </div>
                          ) : (
                            <div className="text-[11px] text-gray-400 italic">No interview scheduled</div>
                          )}
                          {candidate.offers?.[0] && (
                            <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                              Offer: {candidate.offers[0].status}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ActionDropdown
                            itemId={candidate.id}
                            viewUrl={`/recruiter/candidates/${candidate.id}`}
                            editUrl={`/recruiter/candidates/${candidate.id}/edit`}
                            currentStage={candidate.currentStage}
                            latestOffer={candidate.offers?.[0]}
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
