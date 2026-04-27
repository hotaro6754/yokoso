"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useRouter } from "next/navigation";
import { hrOfferService } from "@/services/hr-services/offer-management.service";
import { toast } from "react-hot-toast";
import { Users, Search, MoveRight, UserCheck, Mail, ShieldCheck } from "lucide-react";

const STAGES = [
    { id: "APPLIED", label: "Applied", color: "bg-slate-100 border-slate-200 text-slate-700" },
    { id: "SCREENING", label: "Screening", color: "bg-blue-100 border-blue-200 text-blue-700" },
    { id: "INTERVIEW", label: "Interview", color: "bg-purple-100 border-purple-200 text-purple-700" },
    { id: "OFFERED", label: "Offered", color: "bg-amber-100 border-amber-200 text-amber-700" },
    { id: "SELECTED", label: "Selected", color: "bg-emerald-100 border-emerald-200 text-emerald-700" },
    { id: "ONBOARDING", label: "Onboarding", color: "bg-blue-100 border-blue-200 text-blue-700" },
    { id: "HIRED", label: "Hired", color: "bg-indigo-100 border-indigo-200 text-indigo-700" },
    { id: "REJECTED", label: "Rejected", color: "bg-rose-100 border-rose-200 text-rose-700" },
];

export default function CandidatePipelinePage() {
    const router = useRouter();
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
                    { label: "Pipeline", href: "/hr/offers/pipeline" },
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
                                Manage candidate transitions and final selection
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 text-xs font-medium">
                        <ShieldCheck className="h-4 w-4" />
                        Limited Access: Candidate Movement Only
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
                    <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading pipeline data...</p>
                </div>
            ) : (
                <div className="overflow-x-auto pb-6">
                    <div className="flex gap-6 min-w-max">
                        {STAGES.map((stage) => (
                            <div key={stage.id} className="w-80 flex flex-col">
                                <div className={`p-4 rounded-t-xl border-t border-x ${stage.color} flex items-center justify-between`}>
                                    <h3 className="font-bold uppercase tracking-wider text-xs">
                                        {stage.label}
                                    </h3>
                                    <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-bold">
                                        {pipeline[stage.id]?.length || 0}
                                    </span>
                                </div>

                                <div className="flex-1 bg-gray-100/50 dark:bg-gray-800/40 p-3 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-xl space-y-3 min-h-[500px]">
                                    {pipeline[stage.id]?.length === 0 ? (
                                        <div className="py-10 text-center">
                                            <p className="text-xs text-gray-400 font-medium italic">Empty Stage</p>
                                        </div>
                                    ) : (
                                        pipeline[stage.id]?.map((candidate) => (
                                            <div
                                                key={candidate.id}
                                                className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-900 transition-all duration-200"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">
                                                            {candidate.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" /> {candidate.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        {candidate.jobTitle}
                                                    </p>

                                                    {candidate.latestInterview && (
                                                        <div className="mt-2 text-[10px] bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400 px-2 py-1 rounded inline-block font-medium">
                                                            Interview: {candidate.latestInterview.interviewRound} ({candidate.latestInterview.status})
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-4 flex flex-col gap-2">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Move To:</label>
                                                    <div className="grid grid-cols-1 gap-1.5">
                                                        {stage.id === 'ONBOARDING' || stage.id === 'SELECTED' ? (
                                                            <button
                                                                onClick={() => router.push(`/hr/employees/add?candidateId=${candidate.id}`)}
                                                                className="text-[10px] font-bold py-2 px-2 rounded-lg border bg-blue-600 border-blue-600 text-white hover:bg-blue-700 transition-all"
                                                            >
                                                                <span className="flex items-center justify-center gap-1 text-xs py-1">
                                                                    <UserCheck className="h-4 w-4 text-white" /> CONVERT TO EMPLOYEE
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            STAGES.filter(s => s.id === 'SELECTED' && s.id !== stage.id).map(s => (
                                                                <button
                                                                    key={s.id}
                                                                    disabled={movingId === candidate.id}
                                                                    onClick={() => handleMoveStage(candidate.id, s.id)}
                                                                    className="text-[10px] font-bold py-2 px-2 rounded-lg border bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50"
                                                                >
                                                                    <span className="flex items-center justify-center gap-1 text-xs py-1">
                                                                        <UserCheck className="h-4 w-4 text-white" /> SELECT CANDIDATE & SEND CREDENTIALS
                                                                    </span>
                                                                </button>
                                                            ))
                                                        )}
                                                        {STAGES.filter(s => ['SELECTED', 'ONBOARDING'].includes(s.id) && s.id === stage.id).length === 0 && !['SELECTED', 'ONBOARDING'].includes(stage.id) && (
                                                            <p className="text-[10px] text-gray-400 italic text-center">No other actions available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
