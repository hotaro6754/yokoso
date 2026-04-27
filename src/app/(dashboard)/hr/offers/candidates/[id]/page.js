"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { hrOfferService } from "@/services/hr-services/offer-management.service";
import { toast } from "react-hot-toast";
import { Users, ArrowLeft, Mail, Phone, Briefcase, FileText, File, Eye, UserCheck, ShieldCheck, FileJson } from "lucide-react";
import Link from "next/link";

export default function HRViewCandidatePage() {
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
      const response = await hrOfferService.getCandidateById(params.id);
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
      APPLIED: { label: "Applied", color: "bg-slate-100 text-slate-700" },
      SCREENING: { label: "Screening", color: "bg-blue-100 text-blue-700" },
      INTERVIEW: { label: "Interview", color: "bg-purple-100 text-purple-700" },
      OFFERED: { label: "Offered", color: "bg-amber-100 text-amber-700" },
      SELECTED: { label: "Selected", color: "bg-emerald-100 text-emerald-700" },
      ONBOARDING: { label: "Onboarding", color: "bg-blue-100 text-blue-700" },
      HIRED: { label: "Hired", color: "bg-indigo-100 text-indigo-700" },
      REJECTED: { label: "Rejected", color: "bg-rose-100 text-rose-700" },
    };
    const stageInfo = stageMap[stage] || stageMap.APPLIED;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${stageInfo.color}`}>
        {stageInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Candidate not found</p>
          <Link
            href="/hr/offers/candidates"
            className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pipeline
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Offers", href: "/hr/offers" },
          { label: "Pipeline", href: "/hr/offers/candidates" },
          { label: candidate.name, href: `/hr/offers/candidates/${params.id}` },
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
                Candidate Profile
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed view of candidate assessment and documents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/hr/offers/candidates"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 transition-all shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 flex items-center gap-2">
               Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {candidate.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {candidate.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Contact Number</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {candidate.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 flex items-center gap-2">
               Professional Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Exp.</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{candidate.totalExperience || '-'}</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Relevant Exp.</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{candidate.relevantExperience || '-'}</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Current CTC</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{candidate.currentCtc || '-'}</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Expected CTC</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{candidate.expectedCtc || '-'}</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Notice Period</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{candidate.noticePeriod || '-'}</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">In Hand Offer</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{candidate.inHandOffer || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 flex items-center gap-2">
               Application Status
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Position Applied For</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {candidate.jobTitle}
                  </p>
                </div>
              </div>
              
              {candidate.resumeUrl && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Official Resume</p>
                    <a
                      href={candidate.resumeUrl.startsWith('http') ? candidate.resumeUrl : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '')}/${candidate.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-base font-bold text-emerald-600 hover:text-emerald-700 transition-all"
                    >
                      <Eye className="h-4 w-4" /> View Resume Details
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

           {/* Onboarding Form Submission Data */}
           {candidate.onboardingData && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 flex items-center gap-2">
                 <FileJson className="h-5 w-5 text-indigo-600" />
                 Submitted Onboarding Form Details
               </h3>
               {(() => {
                 const data = typeof candidate.onboardingData === 'string' ? JSON.parse(candidate.onboardingData) : candidate.onboardingData;
                 const calculateAge = (dateValue) => {
                   if (!dateValue) return '';
                   const birthDate = new Date(dateValue);
                   if (Number.isNaN(birthDate.getTime())) return '';

                   const today = new Date();
                   let age = today.getFullYear() - birthDate.getFullYear();
                   const monthDiff = today.getMonth() - birthDate.getMonth();
                   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                     age -= 1;
                   }
                   return age >= 0 ? String(age) : '';
                 };
                 const sections = [
                   { title: "Personal", fields: ["firstName", "lastName", "personalEmail", "phone", "gender", "maritalStatus", "bloodGroup", "dateOfBirth", "dateOfBirthUnofficial", "birthPlace", "height", "weight"] },
                   { title: "Address", fields: ["currentAddress", "permanentAddress", "city", "state", "pincode", "country"] },
                   { title: "Banking", fields: ["bankName", "accountNumber", "ifscCode", "accountHolderName", "accountType"] },
                   { title: "Identification", fields: ["panNumber", "aadhaarNumber", "uanNumber", "passportNumber", "taxRegime"] }
                 ];

                 const listSections = [
                   { title: "Education", data: data.educationDetails, fields: ["degree", "institute", "year", "percentage"] },
                   { title: "Employment", data: data.employmentDetails, fields: ["company", "designation", "from", "to"] },
                   { title: "Family", data: data.familyDetails, fields: ["name", "relation", "dob", "age"] }
                 ];

                 return (
                   <div className="space-y-10">
                     {sections.map(section => (
                       <div key={section.title}>
                         <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                            {section.title} Information
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {section.fields.map(field => data[field] ? (
                             <div key={field} className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                               <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{field.replace(/([A-Z])/g, ' $1')}</p>
                               <p className="text-sm font-bold text-slate-700">{data[field]}</p>
                             </div>
                           ) : null)}
                         </div>
                       </div>
                     ))}

                     {listSections.map(section => section.data && section.data.length > 0 ? (
                       <div key={section.title}>
                         <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                            {section.title} Details
                         </h4>
                         <div className="space-y-3">
                           {section.data.map((item, idx) => (
                             <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                               {section.fields.map(f => (
                                 <div key={f}>
                                   <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">{f}</p>
                                   <p className="text-sm font-bold text-slate-600">
                                     {(() => {
                                       if (section.title === 'Family') {
                                         if (f === 'dob') return item.dob || item.dateOfBirth || '-';
                                         if (f === 'age') return item.age || calculateAge(item.dob || item.dateOfBirth) || '-';
                                       }
                                       return item[f] || '-';
                                     })()}
                                   </p>
                                 </div>
                               ))}
                             </div>
                           ))}
                         </div>
                       </div>
                     ) : null)}
                   </div>
                 );
               })()}
             </div>
           )}

          {/* Uploaded Documents Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Onboarding Documents
            </h3>
            
            {(() => {
              // Aggregate all documents
              const allDocs = [];
              
              // Direct URLs from candidate
              if (candidate.aadhaarUrl) allDocs.push({ type: 'AADHAAR', url: candidate.aadhaarUrl, originalName: 'Aadhaar Card' });
              if (candidate.panUrl) allDocs.push({ type: 'PAN', url: candidate.panUrl, originalName: 'PAN Card' });
              if (candidate.photoUrl) allDocs.push({ type: 'PHOTO', url: candidate.photoUrl, originalName: 'Profile Photo' });

              // Documents from new upload flow (candidate.uploadedDocuments)
              if (candidate.uploadedDocuments) {
                try {
                  const docs = JSON.parse(candidate.uploadedDocuments);
                  allDocs.push(...docs);
                } catch (e) {}
              }

              // Documents from all offers (legacy flow)
              (candidate.offers || []).forEach(offer => {
                if (offer.uploadedDocuments) {
                  try {
                    const docs = JSON.parse(offer.uploadedDocuments);
                    allDocs.push(...docs);
                  } catch (e) {}
                }
              });

              if (allDocs.length === 0) {
                return (
                  <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-sm text-gray-400 font-bold">No onboarding documents uploaded yet</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allDocs.map((doc, idx) => {
                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
                    let fileUrl = '#';
                    
                    if (doc.url) {
                      if (doc.url.startsWith('http')) {
                        fileUrl = doc.url;
                      } else {
                        // For relative paths, use the backend download proxy
                        fileUrl = `${baseUrl}/api/files/download?path=${encodeURIComponent(doc.url)}`;
                      }
                    } else if (doc.blobName) {
                      fileUrl = `${baseUrl}/api/files/download?path=${encodeURIComponent(doc.blobName)}`;
                    }
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-emerald-600 shadow-sm">
                              <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors uppercase letter-tracking-wider">
                                {doc.label || doc.type?.split('_').join(' ') || 'DOCUMENT'}
                              </p>
                              <p className="text-[10px] text-gray-500 font-medium truncate max-w-[200px]">
                                {doc.originalName || 'document'} {doc.fileSize ? `• ${Math.round(doc.fileSize / 1024)} KB` : ''}
                              </p>
                            </div>
                          </div>
                          <a 
                            href={doc.url?.startsWith('http') ? doc.url : `${baseUrl}/api/files/download?path=${encodeURIComponent(doc.url || doc.blobName || doc.filename)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"
                            title="View Document"
                          >
                            <Eye className="h-5 w-5" />
                          </a>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 sticky top-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              Recruitment Progress
            </h3>
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-10 animate-pulse rounded-full"></div>
                {getStageBadge(candidate.currentStage)}
              </div>
              
              <div className="w-full space-y-4 pt-4 border-t">
                {candidate.onboardingStatus && (
                   <div>
                     <p className="text-xs text-gray-400 font-bold uppercase mb-2">Onboarding Status</p>
                     <p className={`text-sm font-black uppercase tracking-wider ${candidate.onboardingStatus === 'SUBMITTED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                       {candidate.onboardingStatus}
                     </p>
                   </div>
                )}
                
                {(candidate.currentStage === 'SELECTED' || candidate.currentStage === 'ONBOARDING') && (
                   <button 
                     onClick={() => router.push(`/hr/employees/add?candidateId=${candidate.id}`)}
                     className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all"
                   >
                     <UserCheck className="h-5 w-5" />
                     Hire Candidate
                   </button>
                )}

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-2">Applied On</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(() => {
                      const dateVal = candidate.appliedDate || candidate.createdAt;
                      if (!dateVal) return '-';
                      const d = new Date(dateVal);
                      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB');
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
