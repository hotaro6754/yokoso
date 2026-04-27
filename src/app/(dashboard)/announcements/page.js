"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import announcementService from "@/services/announcement.service";
import {
    Megaphone, Plus, Edit2, Trash2, Calendar,
    Loader2, AlertCircle, Search, Filter,
    ChevronRight, CheckCircle2, Clock, Info,
    UserCheck, FileText, LayoutGrid, Shield
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";

export default function AnnouncementPage() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");
    const [unreadCounts, setUnreadCounts] = useState({ HR: 0, COMPANY_ADMIN: 0 });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const isAdmin = user?.role === "HR" || user?.role === "HR_ADMIN" || user?.systemRole === "HR_ADMIN" || user?.role === "COMPANY_ADMIN" || user?.systemRole === "COMPANY_ADMIN" || user?.systemRole === "SUPER_ADMIN";

    useEffect(() => {
        const loadPage = async () => {
            await fetchAnnouncements();

            if (user?.id) {
                const storageKey = `lastViewedAnnouncements_${user.id}`;
                const lastViewedAt = localStorage.getItem(storageKey);

                if (lastViewedAt) {
                    const lastDate = new Date(lastViewedAt);
                    const response = await announcementService.getAnnouncements();
                    const items = response.data || [];

                    setUnreadCounts({
                        HR: activeTab === "HR" ? 0 : items.filter(a => a.category === "HR" && new Date(a.createdAt) > lastDate).length,
                        COMPANY_ADMIN: activeTab === "COMPANY_ADMIN" ? 0 : items.filter(a => a.category === "COMPANY_ADMIN" && new Date(a.createdAt) > lastDate).length
                    });
                }

                localStorage.setItem(storageKey, new Date().toISOString());
                window.dispatchEvent(new Event("announcementsRead"));
            }
        };

        loadPage();
    }, [user]);

    const stats = useMemo(() => {
        return {
            total: announcements.length,
            published: announcements.filter(a => a.isPublished).length,
            hr: announcements.filter(a => a.category === 'HR').length,
            admin: announcements.filter(a => a.category === 'COMPANY_ADMIN').length
        };
    }, [announcements]);

    const filteredAnnouncements = useMemo(() => {
        let items = announcements;

        if (activeTab !== "ALL") {
            items = items.filter(a => a.category === activeTab);
        }

        if (searchQuery) {
            items = items.filter(a =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return items;
    }, [announcements, activeTab, searchQuery]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await announcementService.getAnnouncements();
            setAnnouncements(response.data || []);
        } catch (error) {
            toast.error("Failed to fetch announcements");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (announcement) => {
        setAnnouncementToDelete(announcement);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!announcementToDelete) return;
        try {
            setDeleting(true);
            await announcementService.deleteAnnouncement(announcementToDelete.id);
            toast.success("Announcement deleted successfully");
            fetchAnnouncements();
            setIsDeleteModalOpen(false);
            setAnnouncementToDelete(null);
        } catch (error) {
            toast.error("Failed to delete announcement");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="bg-[#f8f9fa] dark:bg-transparent min-h-screen p-4 sm:p-8 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* Clean Professional Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Announcements</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Keep track of all official communications and company updates</p>
                    </div>

                    {isAdmin && (
                        <Link
                            href="/announcements/create"
                            className="inline-flex items-center gap-2 rounded-sm bg-primary-600 px-5 py-2.5 text-white hover:bg-primary-700 transition-all shadow-sm font-bold text-sm"
                        >
                            <Plus size={18} /> New Announcement
                        </Link>
                    )}
                </div>

                {/* Simplified Stats Cards */}
                {isAdmin && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total", value: stats.total, icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50/50" },
                            { label: "Published", value: stats.published, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                            { label: "HR Updates", value: stats.hr, icon: Info, color: "text-purple-600", bg: "bg-purple-50/50" },
                            { label: "Admin Stream", value: stats.admin, icon: Shield, color: "text-gray-600", bg: "bg-gray-50/50" },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white dark:bg-transparent p-5 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5">{stat.value}</p>
                                </div>
                                <div className={`${stat.bg} dark:bg-transparent p-3 rounded-sm ${stat.color} border border-gray-200/60 dark:border-gray-800`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs and Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center">
                        {[
                            { id: 'ALL', label: 'All Updates' },
                            { id: 'HR', label: 'HR Updates' },
                            { id: 'COMPANY_ADMIN', label: 'Admin Stream' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id
                                    ? "text-primary-600 dark:text-primary-400"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                            >
                                {tab.label}
                                {unreadCounts[tab.id] > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-[10px] text-white rounded-full">
                                        {unreadCounts[tab.id]}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="relative group w-full md:w-72 pb-2 md:pb-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find an announcement..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-sm text-sm outline-none focus:border-primary-400 transition-all"
                    />
                </div>
            </div>

                {/* List View */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                        <p className="text-xs font-medium text-gray-400">Loading announcements...</p>
                    </div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="bg-white dark:bg-transparent rounded-sm p-20 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
                        <Megaphone size={40} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No announcements found</h3>
                        <p className="text-sm text-gray-500 mt-1">There are no updates to show in this category.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAnnouncements.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-transparent rounded-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm group"
                            >
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm border uppercase tracking-wider ${item.category === 'HR' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30' : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30'}`}>
                                                {item.category === 'HR' ? 'HR' : 'Admin'}
                                            </span>
                                            {!item.isPublished && (
                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-sm border border-amber-100 uppercase tracking-wider dark:bg-amber-900/30">Draft</span>
                                            )}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                <Calendar size={14} />
                                                {format(new Date(item.createdAt), "MMM d, yyyy")}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isAdmin && (
                                            <>
                                                <Link
                                                    href={`/announcements/edit/${item.id}`}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-sm transition-all"
                                                    title="Edit announcement"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-sm transition-all"
                                                    title="Delete announcement"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Standard Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-transparent rounded-sm shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Announcement?</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{announcementToDelete?.title}"</span>? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 dark:bg-transparent border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {deleting ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
