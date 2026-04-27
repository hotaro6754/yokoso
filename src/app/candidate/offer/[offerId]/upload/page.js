"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Loader2, 
  CreditCard, User, FileJson, Check, ShieldCheck, 
  MapPin, Landmark, Phone, Mail, Calendar, 
  Briefcase, Heart, Globe, ArrowRight, Trash2,
  Plus, FilePlus, File, X
} from "lucide-react";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

// Constants for Documentation Verification
const REQUIRED_DOCS = [
  { id: "aadhaar", label: "Aadhaar Card Copy", icon: CreditCard },
  { id: "pan", label: "PAN Card Copy", icon: CreditCard },
  { id: "photo", label: "Profile Photo", icon: User }
];

const OTHER_DOC_TYPES = [
  { id: "payslip", label: "Previous Payslip" },
  { id: "experience", label: "Experience Certificate" },
  { id: "educational", label: "Educational Degree" },
  { id: "other", label: "Other Supporting Document" }
];

// Public API client
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", 
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

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

// Dynamic List Editor Component
function DynamicList({ label, items, onAdd, onRemove, onChange, fields, emptyMessage, errors = [] }) {
  return (
    <div className="flex flex-col gap-6 mt-8 p-8 bg-slate-50/50 rounded-[32px] border border-slate-100/60">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{label}</h3>
        <button 
          onClick={onAdd}
          className="bg-brand-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
        >
          + Add New
        </button>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-100">
          <p className="text-slate-400 text-xs font-medium">{emptyMessage || "No items added yet"}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
              <button 
                onClick={() => onRemove(index)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-600"
              >
                <Check className="h-4 w-4 rotate-45" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map(field => (
                  <div key={field.name}>
                    {field.type === 'select' ? (
                      <Select 
                        label={field.label} 
                        name={field.name} 
                        value={item[field.name]} 
                        onChange={(e) => onChange(index, field.name, e.target.value)} 
                        options={field.options}
                        error={errors[index]?.[field.name]}
                      />
                    ) : field.type === 'date' ? (
                      <DateInput
                        label={field.label}
                        name={field.name}
                        value={item[field.name]}
                        onChange={(e) => onChange(index, field.name, e.target.value)}
                        placeholder={field.placeholder}
                        error={errors[index]?.[field.name]}
                      />
                    ) : (
                      <Input 
                        label={field.label} 
                        name={field.name} 
                        value={item[field.name]} 
                        onChange={(e) => onChange(index, field.name, e.target.value)} 
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        error={errors[index]?.[field.name]}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DateInput({ label, name, value, onChange, placeholder, className = "", error }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center pl-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
        {error && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{error}</span>}
      </div>
      <DatePickerField
        id={name}
        name={name}
        value={value}
        onChange={(val) => onChange({ target: { name, value: val } })}
        placeholder={placeholder}
        className={`bg-[#FDFEFF] border-2 ${error ? 'border-rose-200 focus:border-rose-500' : 'border-slate-100/80 focus:border-brand-500'} rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-4 ${error ? 'focus:ring-rose-500/5' : 'focus:ring-brand-500/5'} transition-all outline-none md:w-full placeholder:text-slate-300 shadow-sm ${className}`}
      />
    </div>
  );
}

export default function CandidateOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params?.offerId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [offerDetails, setOfferDetails] = useState(null);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    personalEmail: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    bloodGroup: "",
    nationality: "Indian",
    birthPlace: "",
    height: "",
    weight: "",
    dateOfBirthUnofficial: "",
    
    // Address & Emergency Info
    currentAddress: "",
    permanentAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    
    // Bank Info
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    accountType: "SAVINGS",
    
    // Identification
    panNumber: "",
    aadhaarNumber: "",
    uanNumber: "",
    passportNumber: "",
    taxRegime: "NEW",

    // New Fields
    familyDetails: [],
    educationDetails: [],
    employmentDetails: []
  });

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

  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, filename: null });
  const [newRows, setNewRows] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});

  useEffect(() => {
    if (offerId) {
      fetchOfferDetails();
      fetchDocuments();
    }
  }, [offerId]);

  const fetchDocuments = async () => {
    try {
      const response = await publicApiClient.get(`/candidate/offers/${offerId}/documents`);
      if (response.data?.success) {
        setDocuments(response.data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await publicApiClient.get(`/candidate/offers/${offerId}`);
      
      if (response.data?.success) {
        const data = response.data; // Corrected: response.data is the actual data object
        setOfferDetails(data);
        
        // Pre-fill form with candidate data
        const nameParts = (data.candidateName || "").trim().split(/\s+/);
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          personalEmail: data.personalEmail || data.candidateEmail || "",
          phone: data.phone || ""
        }));

        setTouched({
          firstName: true,
          lastName: true,
          personalEmail: true,
          phone: !!data.phone
        });

        if (data.status === 'ACCEPTED') {
          setSubmitted(true);
        }
      } else {
        toast.error(response.data?.message || "Invalid link");
      }
    } catch (error) {
      toast.error("Failed to load portal");
    } finally {
      setLoading(false);
    }
  };

  const [touched, setTouched] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Numeric filtering for phone and year
    if (name === 'phone' || name === 'emergencyContactPhone' || name === 'year' || name === 'pincode') {
      const numericValue = value.replace(/\D/g, '').slice(0, (name === 'year' || name === 'pincode' ? 6 : 10));
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'aadhaarNumber') {
      const aadhaarValue = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: aadhaarValue }));
    } else if (name === 'panNumber') {
      const panValue = value.toUpperCase().slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: panValue }));
    } else if (name === 'passportNumber') {
      const passportValue = value.toUpperCase().slice(0, 8);
      setFormData(prev => ({ ...prev, [name]: passportValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleListItemChange = (listName, index, field, value) => {
    let finalValue = value;
    if (field === 'year' || field === 'pincode') {
      finalValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData(prev => {
      const newList = [...prev[listName]];
      newList[index] = { ...newList[index], [field]: finalValue };
      return { ...prev, [listName]: newList };
    });
  };

  const addListItem = (listName, emptyObj) => {
    setFormData(prev => ({
      ...prev,
      [listName]: [...prev[listName], emptyObj]
    }));
  };

  const removeListItem = (listName, index) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFiles(prev => ({ ...prev, [type]: file }));
      // Reset confirmed state when file changes
      if (confirmedFiles.hasOwnProperty(type)) {
        setConfirmedFiles(prev => ({ ...prev, [type]: false }));
      }
    }
  };

  const handleConfirmFile = (type) => {
    setConfirmedFiles(prev => ({ ...prev, [type]: true }));
    toast.success(`${type.toUpperCase()} verified successfully`);
  };

  const handleFileSelect = (file, type, tempRowId = null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (tempRowId) {
      setNewRows(prev => prev.map(row => row.tempId === tempRowId ? { ...row, selectedFile: file } : row));
    } else {
      setSelectedFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocStatus = (type) => {
    return documents.find(doc => doc.type === type);
  };

  const openDeleteModal = (filename) => {
    setDeleteModal({ open: true, filename });
  };

  const confirmDelete = async () => {
    try {
      const { filename } = deleteModal;
      const response = await publicApiClient.post(`/candidate/offers/${offerId}/documents/delete`, { filename });
      if (response.data?.success) {
        toast.success("Document deleted!");
        fetchDocuments();
      }
    } catch (error) {
      toast.error("Failed to delete document");
    } finally {
      setDeleteModal({ open: false, filename: null });
    }
  };

  const addNewRow = () => {
    const tempId = Date.now().toString();
    setNewRows(prev => [...prev, { tempId, type: 'other', selectedFile: null }]);
  };

  const removeNewRow = (tempId) => {
    setNewRows(prev => prev.filter(row => row.tempId !== tempId));
  };

  const updateRowType = (tempId, type) => {
    setNewRows(prev => prev.map(row => row.tempId === tempId ? { ...row, type } : row));
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
    setAdditionalFiles(prev => [...prev, { label: '', file: null }]);
  };

  const removeAdditionalFile = (index) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = async (type, tempRowId = null) => {
    const file = tempRowId
      ? newRows.find(r => r.tempId === tempRowId)?.selectedFile
      : selectedFiles[type];

    if (!file) return;

    try {
      setUploading(tempRowId || type);
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", type);

      const response = await publicApiClient.post(`/candidate/offers/${offerId}/upload`, formData);

      if (response.data?.success) {
        toast.success("Document uploaded!");
        if (tempRowId) {
          setNewRows(prev => prev.filter(row => row.tempId !== tempRowId));
        } else {
          setSelectedFiles(prev => {
            const next = { ...prev };
            delete next[type];
            return next;
          });
        }
        fetchDocuments();
      } else {
        toast.error(response.data?.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(null);
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.panNumber || !formData.aadhaarNumber) {
      toast.error("PAN and Aadhaar numbers are mandatory");
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        let value = formData[key];
        if (Array.isArray(value)) {
          value = JSON.stringify(value);
        }
        data.append(key, value);
      });

      const response = await publicApiClient.post(`/candidate/offers/${offerId}/onboarding`, data);

      if (response.data?.success) {
        setSubmitted(true);
        toast.success("Welcome aboard! Onboarding submitted.");
      } else {
        toast.error(response.data?.message || "Submission failed");
      }
    } catch (error) {
      toast.error("Error submitting documentation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFEFF] flex items-center justify-center">
        <div className="text-center group">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full group-hover:bg-brand-500/30 transition-all duration-500"></div>
            <Loader2 className="h-16 w-16 animate-spin text-brand-600 relative z-10 mx-auto" strokeWidth={1} />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Initializing Secure Portal</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FDFEFF] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-brand-500/10 p-16 max-w-2xl w-full text-center border border-slate-100/60 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-700"></div>
          <div className="bg-emerald-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-all duration-500">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Onboarding Complete!</h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">We've received your details and documents. Our HR team will review them and update you shortly. Welcome to the team!</p>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-4 text-left mb-10">
            <ShieldCheck className="h-8 w-8 text-brand-500" />
            <div>
              <p className="text-sm font-bold text-slate-900">Next Steps</p>
              <p className="text-xs text-slate-500 tracking-wide leading-relaxed font-medium">Verification usually takes 24-48 business hours. You'll receive your login credentials once verified.</p>
            </div>
          </div>
          <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">SECURE PORTAL | ZODECK</p>
        </div>
      </div>
    );
  }

  if (!offerDetails) {
    return (
      <div className="min-h-screen bg-[#FDFEFF] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-red-500/10 p-12 max-w-md w-full text-center border border-red-50">
          <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-red-100">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Session Expired</h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">The link you're using is either invalid or has reached its security expiry. Please contact your coordinator.</p>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
            Retry Initialization
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { title: "Personal Details", icon: User },
    { title: "Contact & Address", icon: MapPin },
    { title: "Family & Career", icon: Briefcase },
    { title: "Banking & Identification", icon: Landmark }
  ];

  const uploadedRequired = REQUIRED_DOCS.filter(doc => !!getDocStatus(doc.id)).length;
  const progressPercent = (uploadedRequired / REQUIRED_DOCS.length) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Modern Header - Standardized */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Verify Identity</h1>
              <p className="text-slate-500 font-medium text-sm">
                <span className="text-brand-600 font-semibold">{offerDetails.candidateName}</span> <span className="text-slate-300 font-normal mx-2">|</span> {offerDetails.jobTitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Verification Status</span>
              <span className="text-slate-900 font-bold text-sm">{uploadedRequired}/{REQUIRED_DOCS.length}</span>
            </div>
            <div className="w-full md:w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 transition-all duration-1000 ease-in-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* The Listing Section - Horizontal Flow Standardized */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Document Tracking</h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-semibold">Secure Upload</span>
          </div>

          {/* Grid Layout for horizontal cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Required Documents */}
            {REQUIRED_DOCS.map((doc) => {
              const status = getDocStatus(doc.id);
              const isUploading = uploading === doc.id;
              const selectedFile = selectedFiles[doc.id];
              const Icon = doc.icon;

              return (
                <div key={doc.id} className="bg-white rounded-3xl p-6 flex flex-col gap-6 shadow-sm border border-slate-200 hover:border-brand-200 transition-colors relative">
                  {/* Status Indicator at top right */}
                  <div className="absolute top-6 right-6">
                    {status ? (
                      <span className="inline-flex items-center bg-emerald-50 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-md">
                        Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-brand-50 text-brand-700 font-semibold text-xs px-2.5 py-1 rounded-md">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${status ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {status ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <div className="pt-1 pr-16">
                      <h3 className="text-base font-semibold text-slate-900 mb-1 leading-tight">{doc.label}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-normal">
                        {status ? (
                          `Processed on ${new Date(status.uploadedAt).toLocaleDateString()}`
                        ) : `Mandatory proof of identity needed`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {status ? (
                      <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 pl-2 overflow-hidden">
                          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-slate-700 truncate w-[140px]">{status.originalName}</span>
                            <span className="text-xs text-slate-400">{formatFileSize(status.fileSize)}</span>
                          </div>
                        </div>
                        <button onClick={() => openDeleteModal(status.filename)} className="p-2.5 bg-white shadow-sm shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Remove Document">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : selectedFile ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3 p-2 bg-brand-50 rounded-2xl border border-brand-100">
                          <div className="flex items-center gap-3 pl-2 overflow-hidden">
                            <FileText className="h-4 w-4 shrink-0 text-brand-600" />
                            <span className="text-sm font-medium text-brand-700 truncate w-[150px]">{selectedFile.name}</span>
                          </div>
                          <button onClick={() => setSelectedFiles(prev => {
                            const next = { ...prev };
                            delete next[doc.id];
                            return next;
                          })} className="p-2.5 bg-white shadow-sm shrink-0 text-brand-400 hover:text-brand-600 rounded-full transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleUploadClick(doc.id)}
                          disabled={isUploading}
                          className="w-full bg-brand-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-brand-700 shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Confirm Upload
                        </button>
                      </div>
                    ) : (
                      <label className={`flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${isUploading ? 'bg-slate-50 border-slate-200' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50 bg-white'}`}>
                        <Upload className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 mt-0.5">Select File</span>
                        <input type="file" className="hidden" disabled={isUploading} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => handleFileSelect(e.target.files[0], doc.id)} />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 2. Already Uploaded "Other" Documents */}
            {documents.filter(d => !REQUIRED_DOCS.find(r => r.id === d.type)).map((doc, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 flex flex-col gap-6 shadow-sm border border-slate-200 hover:border-brand-200 transition-colors relative">
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center bg-emerald-50 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-md">
                    Uploaded
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400">
                    <File className="h-6 w-6" />
                  </div>
                  <div className="pt-1 pr-16">
                    <h3 className="text-base font-semibold text-slate-900 mb-1 leading-tight">{doc.type.split('_').join(' ')}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-normal">
                      Additional Document • Processed {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3 pl-2 overflow-hidden">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-slate-700 truncate w-[140px]">{doc.originalName}</span>
                        <span className="text-xs text-slate-400">{formatFileSize(doc.fileSize)}</span>
                      </div>
                    </div>
                    <button onClick={() => openDeleteModal(doc.filename)} className="p-2.5 bg-white shadow-sm shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* 3. Dynamically Added New Rows */}
            {newRows.map((row) => {
              const isUploadingRow = uploading === row.tempId;
              return (
                <div key={row.tempId} className="bg-white rounded-3xl p-6 flex flex-col gap-6 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300 relative">
                  <button onClick={() => removeNewRow(row.tempId)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
                        <FilePlus className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">Select Category</h3>
                    </div>

                    <select
                      value={row.type}
                      onChange={(e) => updateRowType(row.tempId, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm transition-all outline-none w-full appearance-none"
                    >
                      {OTHER_DOC_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-auto">
                    {row.selectedFile ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3 p-2 bg-brand-50 rounded-2xl border border-brand-100">
                          <div className="flex items-center gap-3 pl-2 overflow-hidden">
                            <FileText className="h-4 w-4 shrink-0 text-brand-600" />
                            <span className="text-sm font-medium text-brand-700 truncate w-[150px]">{row.selectedFile.name}</span>
                          </div>
                          <button onClick={() => setNewRows(prev => prev.map(r => r.tempId === row.tempId ? { ...r, selectedFile: null } : r))} className="p-2.5 bg-white shadow-sm shrink-0 text-brand-400 hover:text-brand-600 rounded-full transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleUploadClick(row.type, row.tempId)}
                          disabled={isUploadingRow}
                          className="w-full bg-brand-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-brand-700 shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isUploadingRow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Confirm Upload
                        </button>
                      </div>
                    ) : (
                      <label className={`flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${isUploadingRow ? 'bg-slate-50 border-slate-200' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50 bg-white'}`}>
                        <Upload className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 mt-0.5">Select File</span>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => handleFileSelect(e.target.files[0], row.type, row.tempId)} />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plus Button */}
          <div className="mt-8 flex justify-center">
            <button onClick={addNewRow} className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-3.5 rounded-xl text-slate-700 font-semibold text-sm hover:border-brand-500 hover:text-brand-600 hover:shadow-md transition-all active:scale-95 group shadow-sm">
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors text-slate-500 group-hover:text-brand-600">
                <Plus className="h-4 w-4" />
              </div>
              Attach Additional Document
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="h-4 w-4 text-brand-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">End-to-End Encryption Enabled</p>
          </div>
          <p className="text-[11px] text-slate-400 font-medium max-w-xs text-center leading-relaxed">
            Zodeck HRMS ensures all uploaded documents are automatically purged from temporary buffers and stored in secure private vaults.
          </p>
        </div>
      </div>

      {/* Modern Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 slide-in-from-bottom-8">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Document?</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">This action will permanently remove the uploaded file from our secure vault. You will need to re-upload if needed again.</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeleteModal({ open: false, filename: null })}
                className="py-3.5 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-3.5 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-all uppercase tracking-widest shadow-lg shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
