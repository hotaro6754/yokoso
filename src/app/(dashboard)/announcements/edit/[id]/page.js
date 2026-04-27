"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import announcementService from "@/services/announcement.service";
import {
    Megaphone, ChevronLeft, CheckCircle2, AlertCircle, Loader2, Save,
    Info, FileText, Settings, Globe, XCircle, ArrowLeft, Send
} from "lucide-react";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function EditAnnouncementPage() {
    const router = useRouter();
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        isPublished: true,
        category: "HR"
    });

    const isAdmin = user?.role === "HR" || user?.role === "HR_ADMIN" || user?.systemRole === "HR_ADMIN" || user?.role === "COMPANY_ADMIN" || user?.systemRole === "COMPANY_ADMIN" || user?.systemRole === "SUPER_ADMIN";

    useEffect(() => {
        if (user && !isAdmin) {
            toast.error("You are not authorized to access this page");
            router.push("/announcements");
            return;
        }

        const fetchAnnouncement = async () => {
            try {
                const response = await announcementService.getAnnouncements();
                const item = response.data.find(a => a.id.toString() === id || a.publicId === id);
                if (item) {
                    setFormData({
                        title: item.title,
                        description: item.description,
                        isPublished: item.isPublished,
                        category: item.category || "HR"
                    });
                } else {
                    toast.error("Resource not found");
                    router.push("/announcements");
                }
            } catch (error) {
                toast.error("Failed to fetch record");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchAnnouncement();
    }, [id, user, isAdmin, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await announcementService.updateAnnouncement(id, formData);
            toast.success("Record updated successfully");
            router.push("/announcements");
        } catch (error) {
            toast.error(error.response?.data?.message || "Transmission failure");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-gray-950">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Fetching Resource Node...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header and Breadcrumb */}
                <div className="space-y-4">
                    <Breadcrumb
                        items={[
                            { label: "Announcements", href: "/announcements" },
                            { label: "Edit Record" },
                        ]}
                    />
                    <div className="flex items-center justify-between pb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Record Modification</h1>
                            <p className="text-sm text-gray-500 font-medium">Update the parameters of an existing company broadcast</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                            <ArrowLeft size={14} /> Return
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm overflow-hidden flex flex-col">
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1">

                        {/* Title Section */}
                        <div className="p-8 sm:p-10 space-y-4 border-b border-gray-50 dark:border-gray-800">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Broadcast Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-sm text-base font-bold text-gray-900 dark:text-white outline-none focus:border-primary-400 transition-all placeholder:text-gray-200"
                                placeholder="Enter updated designation..."
                            />
                        </div>

                        {/* Content Section */}
                        <div className="p-8 sm:p-10 space-y-4 flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Message Configuration</label>
                            <textarea
                                required
                                rows={12}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-6 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-sm text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-primary-400 transition-all resize-none leading-relaxed placeholder:text-gray-200"
                                placeholder="Update the core intent of this broadcast..."
                            />
                        </div>

                        {/* Settings Bar */}
                        <div className="p-8 sm:p-10 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none flex items-center gap-2">
                                        <Settings size={12} /> Publication State
                                    </label>
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Active Visibility</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Keep published to all personnel.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.isPublished}
                                                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 relative"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none flex items-center gap-2">
                                        <Globe size={12} /> Distribution Channel
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-400 transition-all cursor-pointer shadow-sm"
                                    >
                                        <option value="HR">HR Communications</option>
                                        <option value="COMPANY_ADMIN">Executive Administration</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-8 py-8 sm:px-10 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors"
                            >
                                Discard
                            </button>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-10 py-3 bg-primary-600 text-white rounded-sm font-bold uppercase text-[10px] tracking-widest shadow-sm hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            Update Deployment
                                            <Save size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-5 bg-amber-50/30 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-800/50 rounded-sm flex gap-4">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium leading-relaxed tracking-tight">
                        Modifying a published node results in immediate parity across all active personnel dashboard streams.
                    </p>
                </div>
            </div>
        </div>
    );
}
