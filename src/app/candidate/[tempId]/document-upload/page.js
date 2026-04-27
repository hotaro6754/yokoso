"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Upload, CheckCircle2, AlertCircle, Loader2, 
  CreditCard, User, ShieldCheck, Check, Eye, RefreshCw, X
} from "lucide-react";
import { toast } from "react-hot-toast";

const getBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const cleanUrl = baseUrl.replace(/\/$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const publicApiClient = {
  get: async (url) => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${url.startsWith('/') ? url : `/${url}`}`);
    return { data: await response.json() };
  },
  post: async (url, data) => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${url.startsWith('/') ? url : `/${url}`}`, {
      method: 'POST',
      body: data
    });
    return { data: await response.json() };
  }
};

function FileSelect({ label, file, existingUrl, onChange, onConfirm, onReplace, isConfirmed, icon: Icon, sub }) {
  return (
    <div className={`p-8 rounded-[32px] border-2 transition-all duration-500 flex flex-col items-center gap-6 text-center group ${isConfirmed ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-brand-200 hover:bg-white hover:shadow-2xl hover:shadow-brand-500/5'}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${isConfirmed ? 'bg-emerald-500 text-white rotate-0' : 'bg-white text-slate-400 border border-slate-100 group-hover:bg-brand-600 group-hover:text-white group-hover:rotate-6 shadow-sm'}`}>
        {isConfirmed ? <CheckCircle2 className="h-8 w-8" /> : (file || existingUrl ? <FileText className="h-8 w-8" /> : <Icon className="h-8 w-8" />)}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{sub}</p>
      </div>

      {!file && !existingUrl && !isConfirmed && (
        <label className="w-full">
          <input type="file" className="hidden" onChange={onChange} accept="image/*,.pdf" />
          <div className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer hover:border-brand-500 hover:text-brand-600 transition-all shadow-sm">
            Select File
          </div>
        </label>
      )}

      {existingUrl && !file && !isConfirmed && (
        <div className="w-full flex flex-col gap-2">
          <div className="bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-100 flex items-center justify-center gap-2 mb-2">
            <Check className="h-3 w-3 text-emerald-600" />
            <span className="text-emerald-700 text-[9px] font-bold uppercase tracking-widest">Already Uploaded</span>
          </div>
          <div className="flex gap-2">
            <a 
              href={existingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-600 cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="h-3 w-3" /> View
            </a>
            <button 
              onClick={onReplace} 
              className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-3 w-3" /> Replace
            </button>
          </div>
        </div>
      )}

      {file && !isConfirmed && (
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 px-2">
            <p className="text-[10px] font-bold text-brand-600 truncate italic flex-1">{file.name}</p>
            <button
              type="button"
              onClick={onReplace}
              className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
              title="Remove selected file"
              aria-label="Remove selected file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <label className="flex-1">
              <input type="file" className="hidden" onChange={onChange} />
              <div className="py-2 bg-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 cursor-pointer text-center flex items-center justify-center gap-1">
                <RefreshCw className="h-2.5 w-2.5" /> Change
              </div>
            </label>
            <button 
              onClick={onConfirm} 
              className="flex-[2] py-2 bg-brand-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-brand-600/20"
            >
              Verify & Link
            </button>
          </div>
        </div>
      )}

      {isConfirmed && (
        <div className="flex flex-col gap-4 items-center">
          <div className="bg-emerald-500/10 px-4 py-2 rounded-full flex items-center gap-2">
            <Check className="h-3 w-3 text-emerald-600" />
            <p className="text-emerald-700 text-[9px] font-black uppercase tracking-widest">Linked</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FileText(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

export default function DocumentUploadPage() {
  const params = useParams();
  const router = useRouter();
  const tempId = params?.tempId;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Files State
  const [files, setFiles] = useState({
    aadhaar: null,
    pan: null,
    photo: null
  });

  const [confirmedFiles, setConfirmedFiles] = useState({
    aadhaar: false,
    pan: false,
    photo: false
  });

  const [additionalFiles, setAdditionalFiles] = useState([
    { label: "Payslip 1", file: null, confirmed: false },
    { label: "Payslip 2", file: null, confirmed: false },
    { label: "Payslip 3", file: null, confirmed: false },
    { label: "Experience Letter", file: null, confirmed: false },
    { label: "Appraisal Letter", file: null, confirmed: false },
    { label: "Relieving Letter (Current Company)", file: null, confirmed: false },
  ]);

  useEffect(() => {
    if (tempId) {
      fetchCandidateDetails();
    }
  }, [tempId]);

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      const url = `/candidate/offers/candidate/${tempId}`;
      const response = await publicApiClient.get(url);
      
      if (response.data?.success) {
        const data = response.data;
        setCandidateDetails(data);
        setError(null);

        // Pre-confirm if URLs exist
        setConfirmedFiles({
          aadhaar: !!data.aadhaarUrl,
          pan: !!data.panUrl,
          photo: !!data.photoUrl
        });

        // Initialize with default slots, but merge with existing data
        const defaultSlots = [
          { label: "Payslip 1", file: null, confirmed: false },
          { label: "Payslip 2", file: null, confirmed: false },
          { label: "Payslip 3", file: null, confirmed: false },
          { label: "Experience Letter", file: null, confirmed: false },
          { label: "Appraisal Letter", file: null, confirmed: false },
          { label: "Relieving Letter (Current Company)", file: null, confirmed: false },
        ];

        if (data.uploadedDocuments && data.uploadedDocuments.length > 0) {
          const merged = [...defaultSlots];
          const orphans = [];
          
          data.uploadedDocuments.forEach(doc => {
            // Check if matches a default label (simple heuristic)
            const index = merged.findIndex(slot => slot.label.toLowerCase() === doc.originalName?.split('-')[0]?.toLowerCase() || slot.label === doc.type);

            // For now, let's just append or find by label if we stored it
            // Since we didn't store labels specifically in JSON, let's just use the first available slots or append
            const freeIndex = merged.findIndex(slot => !slot.existingUrl);
            if (freeIndex !== -1) {
              merged[freeIndex] = {
                label: doc.originalName || merged[freeIndex].label,
                existingUrl: doc.url,
                confirmed: true
              };
            } else {
              orphans.push({
                label: doc.originalName || "Other Document",
                existingUrl: doc.url,
                confirmed: true
              });
            }
          });
          setAdditionalFiles([...merged, ...orphans]);
        }
      } else {
        setError(response.data?.message || "Invalid link or link expired");
        toast.error(response.data?.message || "Invalid link or link expired");
      }
    } catch (error) {
      console.error("Fetch Details Error:", error);
      setCandidateDetails(null);
      setError(error.message || "Network error. Please check your connection.");
      toast.error("Failed to load portal");
    } finally {
      setLoading(false);
    }
  };

  const [error, setError] = useState(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFiles(prev => ({ ...prev, [type]: file }));
      setConfirmedFiles(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleConfirmFile = (type) => {
    setConfirmedFiles(prev => ({ ...prev, [type]: true }));
    toast.success(`${type.toUpperCase()} linked successfully`);
  };

  const handleReplaceFile = (type) => {
    setConfirmedFiles(prev => ({ ...prev, [type]: false }));
    setFiles(prev => ({ ...prev, [type]: null }));
    setCandidateDetails(prev => ({ ...prev, [`${type}Url`]: null }));
    toast.info(`Please select a new file for ${type.toUpperCase()}`);
  };

  const handleAdditionalFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setAdditionalFiles(prev => {
        const newList = [...prev];
        newList[index] = { ...newList[index], file: file };
        return newList;
      });
    }
  };

  const addAdditionalFile = () => {
    setAdditionalFiles(prev => [...prev, { label: '', file: null, confirmed: false }]);
  };

  const removeAdditionalFile = (index) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdditionalLabelChange = (index, val) => {
    setAdditionalFiles(prev => {
      const newList = [...prev];
      newList[index] = { ...newList[index], label: val };
      return newList;
    });
  };

  const handleConfirmAdditionalFile = (index) => {
    if (!additionalFiles[index].label.trim()) {
      toast.error("Please enter a name for the document");
      return;
    }
    setAdditionalFiles(prev => {
      const newList = [...prev];
      newList[index] = { ...newList[index], confirmed: true };
      return newList;
    });
    toast.success("Document linked");
  };

  const handleReplaceAdditionalFile = (index) => {
    setAdditionalFiles(prev => {
      const newList = [...prev];
      newList[index] = { ...newList[index], file: null, existingUrl: null, confirmed: false };
      return newList;
    });
    toast.info("Document cleared for replacement");
  };

  const isAllMandatoryConfirmed = confirmedFiles.aadhaar && confirmedFiles.pan && confirmedFiles.photo;

  const handleSubmit = async () => {
    if (!isAllMandatoryConfirmed) {
      toast.error("Aadhaar, PAN and Photo are mandatory");
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      
      if (files.aadhaar) data.append("aadhaar", files.aadhaar);
      if (files.pan) data.append("pan", files.pan);
      if (files.photo) data.append("photo", files.photo);

      const labels = [];
      additionalFiles.forEach((doc) => {
        if (doc.file && doc.confirmed) {
          data.append("documents", doc.file);
          labels.push(doc.label || 'Other');
        }
      });
      data.append("labels", JSON.stringify(labels));

      const response = await publicApiClient.post(`/candidate/offers/candidate/${tempId}/documents`, data);

      if (response.data?.success) {
        setSubmitted(true);
        toast.success("Documents uploaded successfully!");
      } else {
        toast.error(response.data?.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Error uploading documents");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFEFF] flex items-center justify-center">
        <div className="text-center group">
          <Loader2 className="h-16 w-16 animate-spin text-brand-600 mx-auto mb-6" strokeWidth={1} />
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Initializing Secure Portal</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FDFEFF] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-brand-500/10 p-16 max-w-2xl w-full text-center border border-slate-100/60 relative overflow-hidden group">
          <div className="bg-emerald-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Upload Complete!</h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">Your documents have been uploaded successfully. Our team will review them and proceed with the offer shortly.</p>
          <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">SECURE PORTAL | ZODECK</p>
        </div>
      </div>
    );
  }

  if (!candidateDetails) {
    return (
      <div className="min-h-screen bg-[#FDFEFF] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-red-500/10 p-12 max-w-md w-full text-center border border-red-50">
          <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-red-100">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Portal Link Issue</h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">
            {error || "This selection document upload link is invalid or has expired. Please contact HR."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFEFF]">
      <div className="max-w-4xl mx-auto px-4 py-20 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-[32px] bg-brand-600 flex items-center justify-center shadow-2xl shadow-brand-600/30">
              <ShieldCheck className="h-12 w-12 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-brand-600 font-black tracking-[0.3em] uppercase text-[10px] mb-2">Selection Phase</p>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">Upload Documents</h1>
              <p className="text-slate-400 font-bold text-lg">{candidateDetails.candidateName} <span className="text-slate-200 mx-3">|</span> {candidateDetails.jobTitle}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[48px] border border-slate-100/60 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[500px] p-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-slate-500 mb-12 text-center font-medium leading-relaxed">
              Congratulations on being selected! Please upload the following mandatory documents to proceed. You can also add optional documents like payslips or certificates.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <FileSelect 
                label="Aadhaar Front/Back *" 
                file={files.aadhaar} 
                existingUrl={candidateDetails.aadhaarUrl}
                onChange={(e) => handleFileChange(e, "aadhaar")} 
                onConfirm={() => handleConfirmFile("aadhaar")}
                onReplace={() => handleReplaceFile("aadhaar")}
                isConfirmed={confirmedFiles.aadhaar}
                icon={CreditCard}
                sub="Mandatory ID"
              />
              <FileSelect 
                label="PAN Card Copy *" 
                file={files.pan} 
                existingUrl={candidateDetails.panUrl}
                onChange={(e) => handleFileChange(e, "pan")} 
                onConfirm={() => handleConfirmFile("pan")}
                onReplace={() => handleReplaceFile("pan")}
                isConfirmed={confirmedFiles.pan}
                icon={CreditCard}
                sub="Mandatory Tax Record"
              />
              <FileSelect 
                label="Profile Photo *" 
                file={files.photo} 
                existingUrl={candidateDetails.photoUrl}
                onChange={(e) => handleFileChange(e, "photo")} 
                onConfirm={() => handleConfirmFile("photo")}
                onReplace={() => handleReplaceFile("photo")}
                isConfirmed={confirmedFiles.photo}
                icon={User}
                sub="Mandatory Photo"
              />
            </div>

            {/* Additional Documents */}
            <div className="border-t border-slate-100 pt-12 mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Other Documents (Optional)</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Payslips, Offer letters, Experience certificates, etc.</p>
                </div>
                <button 
                  onClick={addAdditionalFile}
                  className="bg-brand-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg"
                >
                  + Add More
                </button>
              </div>

              <div className="space-y-4">
                {additionalFiles.map((doc, idx) => (
                  <div key={idx} className="flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input 
                          disabled={doc.confirmed || doc.existingUrl}
                          className="bg-transparent border-none outline-none w-full text-xs font-bold text-slate-700 placeholder:text-slate-300"
                          placeholder="Document Name (e.g. Previous Payslip)"
                          value={doc.label}
                          onChange={(e) => handleAdditionalLabelChange(idx, e.target.value)}
                        />
                      </div>
                      
                      {!doc.confirmed && !doc.existingUrl && (
                        <label className="bg-white px-4 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all flex items-center gap-2">
                          <input type="file" className="hidden" onChange={(e) => handleAdditionalFileChange(e, idx)} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{doc.file ? doc.file.name : 'Select File'}</span>
                          {doc.file && (
                            <button
                              type="button"
                              onClick={(evt) => {
                                evt.preventDefault();
                                evt.stopPropagation();
                                handleReplaceAdditionalFile(idx);
                              }}
                              className="p-1 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                              title="Remove selected file"
                              aria-label="Remove selected file"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </label>
                      )}

                      {doc.existingUrl && !doc.confirmed && (
                        <div className="flex items-center gap-2">
                           <a 
                            href={doc.existingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-600 transition-all"
                            title="View existing"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </div>
                      )}

                      {doc.confirmed && (
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-500/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-700 text-[8px] font-black uppercase tracking-widest">Linked</span>
                          </div>
                        </div>
                      )}
                      
                      {!doc.existingUrl && (
                        <button
                          type="button"
                          onClick={() => removeAdditionalFile(idx)}
                          className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                          title="Remove document row"
                          aria-label="Remove document row"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {doc.file && !doc.confirmed && (
                      <button 
                        onClick={() => handleConfirmAdditionalFile(idx)}
                        className="w-full py-2 bg-brand-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-brand-600/20 mt-2"
                      >
                        Verify & Link {doc.label || 'Document'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={submitting || !isAllMandatoryConfirmed}
              className={`w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-4 hover:bg-brand-600 hover:shadow-2xl hover:shadow-brand-600/40 relative group h-16 ${submitting || !isAllMandatoryConfirmed ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Complete Selection Upload"}
            </button>
            {!isAllMandatoryConfirmed && (
              <p className="text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                Please verify and link Aadhaar, PAN, and Photo to enable upload
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
