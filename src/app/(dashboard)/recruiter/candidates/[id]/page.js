"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Users, Edit, ArrowLeft, Mail, Phone, Briefcase, FileText, File, Eye } from "lucide-react";
import Link from "next/link";

export default function ViewCandidatePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchCandidate();
    }
  }, [params.id]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getCandidateById(params.id);
      setCandidate(response.data || response);
    } catch (error) {
      console.error("Error fetching candidate:", error);
      toast.error("Failed to load candidate details");
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadge = (stage) => {
    const stageMap = {
      APPLIED: { label: "Applied", color: "bg-gray-100 text-gray-800" },
      SCREENING: { label: "Screening", color: "bg-blue-100 text-blue-800" },
      INTERVIEW: { label: "Interview", color: "bg-purple-100 text-purple-800" },
      OFFERED: { label: "Offered", color: "bg-amber-100 text-amber-800" },
      SELECTED: { label: "Selected", color: "bg-emerald-100 text-emerald-800" },
      REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
    };
    const stageInfo = stageMap[stage] || stageMap.APPLIED;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageInfo.color}`}>
        {stageInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Candidate not found</p>
          <Link
            href="/recruiter/candidates"
            className="mt-4 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Recruiter", href: "/recruiter" },
          { label: "Candidates", href: "/recruiter/candidates" },
          { label: candidate.name, href: `/recruiter/candidates/${params.id}` },
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
                Candidate Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View candidate information and status
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/recruiter/candidates"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/recruiter/candidates/${params.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {candidate.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {candidate.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {candidate.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Experience</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">{candidate.totalExperience || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Relevant Experience</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">{candidate.relevantExperience || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current CTC</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">{candidate.currentCtc || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Expected CTC</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">{candidate.expectedCtc || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">In Hand Offer</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">{candidate.inHandOffer || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Application Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Job Title</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {candidate.jobTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Applied Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {candidate.appliedDate}
                  </p>
                </div>
              </div>
              {candidate.resumeUrl && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Resume</p>
                    <a
                      href={candidate.resumeUrl.startsWith('http') ? candidate.resumeUrl : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '')}/${candidate.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-medium text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      View Resume
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {candidate.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {candidate.notes}
              </p>
            </div>
          )}

          {/* Uploaded Documents Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600" />
              Uploaded Documents
            </h3>
            
            {(() => {
              const getFullUrl = (url) => {
                if (!url) return null;
                if (url.startsWith('http')) return url;
                return `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '')}/uploads/${url.startsWith('/') ? url.substring(1) : url}`;
              };

              // Aggregate all documents
              const allDocs = [];
              
              // Add mandatory docs from candidate model
              if (candidate.aadhaarUrl) {
                allDocs.push({ 
                  type: 'AADHAAR', 
                  url: getFullUrl(candidate.aadhaarUrl), 
                  originalName: 'aadhaar.pdf',
                  fileSize: 0 
                });
              }
              if (candidate.panUrl) {
                allDocs.push({ 
                  type: 'PAN', 
                  url: getFullUrl(candidate.panUrl), 
                  originalName: 'pan.pdf',
                  fileSize: 0 
                });
              }
              if (candidate.photoUrl) {
                allDocs.push({ 
                  type: 'PHOTO', 
                  url: getFullUrl(candidate.photoUrl), 
                  originalName: 'photo.jpg',
                  fileSize: 0 
                });
              }

              // Add from candidate.uploadedDocuments (new flow)
              if (candidate.uploadedDocuments) {
                try {
                  const docs = JSON.parse(candidate.uploadedDocuments);
                  docs.forEach(d => {
                    allDocs.push({
                      ...d,
                      url: d.url // Already full URL or relative
                    });
                  });
                } catch(e) {}
              }

              // Legacy: Aggregate from offers
              (candidate.offers || []).forEach(offer => {
                if (offer.uploadedDocuments) {
                  try {
                    const docs = JSON.parse(offer.uploadedDocuments);
                    docs.forEach(d => {
                      if (!allDocs.find(ad => ad.url === d.url)) {
                        allDocs.push(d);
                      }
                    });
                  } catch(e) {}
                }
              });

              if (allDocs.length === 0) {
                return (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-sm text-gray-400 font-medium">No documents uploaded yet by candidate</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-brand-600 shadow-sm">
                          <File className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                            {doc.label || doc.type?.split('_').join(' ') || 'DOCUMENT'}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium lowercase tracking-wider truncate max-w-[150px]">
                            {doc.originalName || 'file'} {doc.fileSize > 0 ? `• ${Math.round(doc.fileSize / 1024)} KB` : ''}
                          </p>
                        </div>
                      </div>
                      <a 
                        href={doc.url?.startsWith('http') ? doc.url : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '')}/api/files/download?path=${encodeURIComponent(doc.url || doc.blobName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow-md"
                        title="View Document"
                      >
                        <Eye className="h-5 w-5" />
                      </a>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Status
            </h3>
            <div className="flex items-center justify-center py-4">
              {getStageBadge(candidate.currentStage)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
