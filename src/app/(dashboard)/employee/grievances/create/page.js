"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ShieldAlert,
    MessageSquare,
    ChevronLeft,
    Upload,
    X,
    EyeOff,
    Calendar as CalendarIcon,
    MapPin,
    Users,
    Send,
    Loader2,
    ShieldCheck,
    Info
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { grievanceService } from "@/services/grievance.service";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

const categories = {
    general: [
        "Workplace conflict",
        "Policy violation",
        "Managerial issues",
        "Harassment (non-POSH)",
        "Compensation concern",
        "Training & L&D issue",
        "IT/Asset issue",
        "Other workplace issue"
    ],
    posh: [
        "Sexual harassment complaint",
        "Verbal misconduct",
        "Physical misconduct",
        "Hostile work environment",
        "Quid-pro-quo situations"
    ]
};

export default function CreateGrievancePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialType = searchParams.get("type") || "general";

    const [form, setForm] = useState({
        type: initialType === "posh" ? "POSH Complaint" : "General Grievance",
        category: "",
        subject: "",
        description: "",
        incidentDate: "",
        location: "",
        accusedPerson: "",
        witnesses: "",
        isAnonymous: false,
        attachments: []
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const typeDisplay = form.type === "POSH Complaint" ? "POSH Complaint" : "General Grievance";
    const isPosh = form.type === "POSH Complaint";

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
        if (errors.attachments) {
            setErrors(prev => ({ ...prev, attachments: null }));
        }
    };

    const removeFile = (index) => {
        setForm(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.category) newErrors.category = "Please select a category";
        if (!form.subject) newErrors.subject = "Subject is required";
        if (!form.description) newErrors.description = "Detailed description is mandatory";
        if (!form.incidentDate) newErrors.incidentDate = "Incident date is required";
        if (form.attachments.length === 0) newErrors.attachments = "Supporting evidence is required";

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please fill all mandatory fields");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (key === 'attachments') {
                    form.attachments.forEach(file => formData.append('attachments', file));
                } else {
                    formData.append(key, form[key]);
                }
            });

            await grievanceService.submitGrievance(formData);
            toast.success(`${typeDisplay} submitted successfully!`);
            router.push("/employee/grievances");
        } catch (error) {
            toast.error(error.message || "Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 transition-colors duration-200">
            <div className="max-w-5xl mx-auto space-y-6">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/employee/dashboard" },
                        { label: "Grievance & POSH", href: "/employee/grievances" },
                        { label: isPosh ? "Lodge POSH" : "Raise Grievance" },
                    ]}
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ChevronLeft size={16} />
                        BACK
                    </button>

                    <div className={`rounded-sm border ${isPosh ? 'border-red-100 bg-red-50 text-red-800' : 'border-blue-100 bg-blue-50 text-blue-800'} p-3 flex-1 text-[11px] font-medium shadow-sm`}>
                        <div className="flex gap-2">
                            <span className={`font-bold uppercase tracking-[0.2em] ${isPosh ? 'bg-red-100' : 'bg-blue-100'} px-1.5 py-0.5 rounded`}>Policy:</span>
                            <span className="font-bold uppercase tracking-tight">{isPosh ? "Your identity is protected under the POSH Act 2013 and Internal Privacy Policy." : "All grievances are reviewed by the ethics committee within 48 business hours."}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Form Side */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden min-h-full">
                            <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isPosh ? 'bg-red-50/30' : 'bg-gray-50'} flex items-center gap-3`}>
                                <div className={`p-2 rounded-sm ${isPosh ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'}`}>
                                    {isPosh ? <ShieldAlert size={20} /> : <MessageSquare size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-[0.1em]">
                                        {isPosh ? "POSH Complaint Form" : "General Grievance Form"}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Confidential Record Initiation</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Category Selection */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-gray-800 focus:border-primary-400 outline-none transition-all text-xs font-semibold ${errors.category ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                                        >
                                            <option value="">Select Category</option>
                                            {categories[isPosh ? 'posh' : 'general'].map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-[9px] text-red-600 font-bold uppercase">{errors.category}</p>}
                                    </div>

                                    {/* Incident Date */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            Incident Date <span className="text-red-500">*</span>
                                            <CalendarIcon size={12} className="text-gray-400" />
                                        </label>
                                        <div className="relative">
                                            <DatePickerField
                                                value={form.incidentDate}
                                                onChange={(dateStr) => {
                                                    setForm(prev => ({ ...prev, incidentDate: dateStr }));
                                                    if (errors.incidentDate) {
                                                        setErrors(prev => ({ ...prev, incidentDate: null }));
                                                    }
                                                }}
                                                max="today"
                                                error={errors.incidentDate}
                                                className="!py-1.5"
                                            />
                                        </div>
                                        {errors.incidentDate && <p className="text-[9px] text-red-600 font-bold uppercase">{errors.incidentDate}</p>}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                                        Subject / Concern Summary <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        placeholder="Briefly state your concern"
                                        className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-gray-800 focus:border-primary-400 outline-none transition-all text-xs font-semibold ${errors.subject ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                                    />
                                    {errors.subject && <p className="text-[9px] text-red-600 font-bold uppercase">{errors.subject}</p>}
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Detailed Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Please provide a clear and detailed account of the incident..."
                                        className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-gray-800 focus:border-primary-400 outline-none transition-all text-xs font-medium resize-none leading-relaxed ${errors.description ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                                    />
                                    {errors.description && <p className="text-[9px] text-red-600 font-bold uppercase">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            Incident Location
                                            <MapPin size={12} className="text-gray-400" />
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={form.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Office, Remote"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-xs font-semibold outline-none focus:border-primary-400 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            Accused Person
                                            <Users size={12} className="text-gray-400" />
                                        </label>
                                        <input
                                            type="text"
                                            name="accusedPerson"
                                            value={form.accusedPerson}
                                            onChange={handleChange}
                                            placeholder="Name (if applicable)"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-xs font-semibold outline-none focus:border-primary-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Witnesses */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Witnesses</label>
                                    <input
                                        type="text"
                                        name="witnesses"
                                        value={form.witnesses}
                                        onChange={handleChange}
                                        placeholder="Names of potential witnesses"
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-xs font-semibold outline-none focus:border-primary-400 transition-all"
                                    />
                                </div>

                                {/* Attachments */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Supporting Evidence <span className="text-red-500">*</span></label>
                                    <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-sm p-6 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-gray-100 transition-all relative">
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload size={20} className="text-gray-400" />
                                            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">Click to upload files</p>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-tighter">(Max 10MB per file)</p>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                        </div>
                                    </div>

                                    {form.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {form.attachments.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-[10px] font-bold text-gray-700 group">
                                                    <span className="truncate max-w-[150px] uppercase">{file.name}</span>
                                                    <button type="button" onClick={() => removeFile(index)} className="text-red-400 hover:text-red-600 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.attachments && <p className="text-[9px] text-red-600 font-bold uppercase mt-2">{errors.attachments}</p>}
                                </div>

                                {/* Options */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-sm border ${form.isAnonymous ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-gray-400 border-gray-100'}`}>
                                            <EyeOff size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-800 uppercase tracking-tight">Remain Anonymous</p>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest italic leading-tight">Identity hidden from accused & committee</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isAnonymous"
                                            checked={form.isAnonymous}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50/50 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-sm text-white text-xs font-bold uppercase tracking-[0.2em] shadow-sm transition-all ${isPosh ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'} disabled:opacity-70 disabled:cursor-not-allowed`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Submit Ticket
                                        </>
                                    )}
                                </button>
                                <p className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-widest text-center">
                                    <ShieldCheck size={12} className="text-emerald-500" />
                                    Tamper-proof end-to-end encrypted record
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Info Side */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50">
                                <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-[0.1em] flex items-center gap-2">
                                    <Info size={14} className="text-primary-500" />
                                    Guidelines
                                </h4>
                            </div>
                            <div className="p-5">
                                <ul className="space-y-4">
                                    {[
                                        "Provide factual, clear descriptions",
                                        "Include dates and locations accurately",
                                        "Mention potential witnesses",
                                        "Upload all relevant proofs",
                                        "Retaliation is strictly prohibited"
                                    ].map((item, id) => (
                                        <li key={id} className="flex gap-3 text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-tight leading-normal">
                                            <div className="mt-1 h-1 w-1 rounded-full bg-primary-400 shrink-0"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-emerald-600 text-white p-5 rounded-sm shadow-md space-y-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={20} className="text-emerald-200" />
                                <h4 className="font-bold text-[11px] uppercase tracking-[0.2em]">Security Grid</h4>
                            </div>
                            <p className="text-[10px] font-medium uppercase tracking-tight leading-relaxed opacity-90">
                                Submitted records are stored in a non-editable audit trail compliant with global HR standards.
                            </p>
                            <div className="pt-2">
                                <div className="flex justify-between text-[9px] font-bold mb-1 uppercase tracking-widest">
                                    <span>ENCRYPTION</span>
                                    <span>ACTIVE</span>
                                </div>
                                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
